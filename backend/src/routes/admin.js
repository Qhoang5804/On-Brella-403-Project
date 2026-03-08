/**
 * Admin-only API routes. Protected by requireAdmin middleware (Supabase JWT + profiles.role = 'admin').
 */
const express = require("express");
const db = require("../db");
const configDb = require("../db/config");
const reportLogic = require("../businessLogic/reportLogic");
const config = require("../config");
const getRentalStore = require("../store/getRentalStore");
const supportRequestStore = require("../store/supportRequestStoreDb");
const stationAdminService = require("../services/stationAdminService");
const rentalTrendService = require("../services/rentalTrendService");
const appContentService = require("../services/appContentService");
const { requireJsonContentType, requireBody, requireFields } = require("../middleware/validate");

const router = express.Router();

function sortReportsByCreatedAtDesc(reports) {
  const toTimestamp = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  };

  return [...reports].sort((a, b) => {
    const left = toTimestamp(a?.createdAt);
    const right = toTimestamp(b?.createdAt);
    return right - left;
  });
}

async function listAdminReports() {
  const legacyReports = reportLogic.listAll().map((report) => ({
    ...report,
    source: report.source || "legacy_report",
    type: report.type || "legacy_report",
    severity: report.severity || "critical",
  }));

  if (!config.databaseUrl) {
    return sortReportsByCreatedAtDesc(legacyReports);
  }

  try {
    const supportReports = await supportRequestStore.listAllForAdmin();
    return sortReportsByCreatedAtDesc([...supportReports, ...legacyReports]);
  } catch {
    return sortReportsByCreatedAtDesc(legacyReports);
  }
}

/**
 * GET /api/admin/stats — Dashboard counts: users, reports (total + open), active sessions, totalUmbrellas.
 * Active sessions = all unavailable umbrellas (total capacity − total available) from stations table.
 * Returns safe defaults on DB errors so the dashboard always loads (no 500).
 */
router.get("/stats", async (_req, res) => {
  let usersCount = 0;
  let activeRentalsCount = 0;
  let totalUmbrellas = null;
  let totalCapacity = 0;
  let activeSessions = 0;

  try {
    const [{ rows: profileRows }] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM profiles"),
    ]);
    usersCount = profileRows[0]?.count ?? 0;
  } catch {
    // profiles table may not exist
  }

  const reports = await listAdminReports();
  const openReportsCount = reports.filter((r) => r.status === "open").length;
  const openCriticalReportsCount = reports.filter(
    (r) => r.status === "open" && (r.severity || "critical") === "critical"
  ).length;

  if (config.databaseUrl) {
    try {
      const store = getRentalStore();
      activeRentalsCount = await store.countActiveRentals();
    } catch {
      // no db or store not available
    }
    try {
      // Total capacity and available from stations; active sessions = unavailable = capacity − available
      const { rows: sumRows } = await db.query(
        `SELECT
          COALESCE(SUM(capacity), 0)::int AS total_capacity,
          COALESCE(SUM(num_brellas), 0)::int AS total_available
         FROM stations`
      );
      const row = sumRows[0];
      totalCapacity = row?.total_capacity ?? 0;
      totalUmbrellas = row?.total_available ?? 0;
      activeSessions = Math.max(0, totalCapacity - totalUmbrellas);
    } catch {
      // stations table may not exist
    }
  }

  res.json({
    usersCount,
    reportsCount: reports.length,
    openReportsCount,
    openCriticalReportsCount,
    activeRentalsCount,
    activeSessions,
    totalUmbrellas,
  });
});

/**
 * GET /api/admin/users — List all profiles (id, email, full_name, role).
 */
router.get("/users", async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, email, full_name, role FROM profiles ORDER BY full_name, email"
    );
    const users = rows.map((r) => ({
      id: r.id,
      email: r.email || "",
      full_name: r.full_name || "",
      role: r.role || "user",
    }));
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/activity — Recent rentals for admin activity feed (with user display names).
 * Query: limit (default 50, max 100). Returns empty array when DB not configured or on error (no 500).
 */
router.get("/activity", async (req, res) => {
  const rawLimit = req.query.limit != null ? Number(req.query.limit) : undefined;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 100 ? rawLimit : 50;
  if (!config.databaseUrl) {
    return res.json({ activities: [] });
  }
  try {
    const store = getRentalStore();
    const activities = await store.listRecentForAdmin(limit);
    return res.json({ activities });
  } catch {
    return res.json({ activities: [] });
  }
});

/**
 * GET /api/admin/trends — Hourly rental trend buckets for the admin dashboard.
 * Query: hours (default 24, max 168). Always returns chart-ready buckets.
 */
router.get("/trends", async (req, res) => {
  const trend = await rentalTrendService.getRentalTrends({ hours: req.query.hours });
  res.json(trend);
});

/**
 * GET /api/admin/reports — List all reports including DB-backed support requests.
 */
router.get("/reports", async (_req, res) => {
  const reports = await listAdminReports();
  res.json({ reports });
});

/**
 * GET /api/admin/content/:contentKey — Fetch editable app content by key.
 */
router.get("/content/:contentKey", async (req, res, next) => {
  try {
    const content = await appContentService.getContent(req.params.contentKey);
    return res.json(content);
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ error: "Content type not found" });
    }
    return next(err);
  }
});

/**
 * PUT /api/admin/content/:contentKey — Save editable app content by key.
 * Body: { document }
 */
router.put(
  "/content/:contentKey",
  requireJsonContentType,
  requireBody,
  requireFields("document"),
  async (req, res, next) => {
    try {
      const content = await appContentService.updateContent(
        req.params.contentKey,
        req.body.document,
        req.adminUserId ?? null
      );
      return res.json(content);
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ error: "Content type not found" });
      }
      const isValidation =
        err.message?.includes("required") ||
        err.message?.includes("must be") ||
        err.message?.includes("At least one");
      if (isValidation) {
        return res.status(400).json({ error: err.message || "Validation failed" });
      }
      if (err.code === "42P01") {
        return res.status(503).json({
          error:
            "App content table is not set up yet. Run docs/supabase-create-app-content-table.sql.",
        });
      }
      if (err.message?.includes("Database not configured")) {
        return res.status(503).json({ error: err.message });
      }
      return next(err);
    }
  }
);

/**
 * POST /api/admin/reports/:id/resolve — Resolve a report. Body optional: { resolverId }.
 */
router.post("/reports/:id/resolve", async (req, res, next) => {
  try {
    const { id } = req.params;
    const resolverId = req.body?.resolverId ?? req.adminUserId ?? null;

    if (config.databaseUrl) {
      try {
        const supportReport = await supportRequestStore.resolve(id, resolverId);
        if (supportReport) {
          return res.json({ report: supportReport });
        }
      } catch {
        // Ignore support store errors here so legacy report resolution still works.
      }
    }

    const report = reportLogic.resolve(id, resolverId);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    return res.json({ report });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/admin/stations — List all stations from the database (no hardware dependency).
 */
router.get("/stations", async (_req, res) => {
  try {
    const stationsDb = require("../db/stations");
    const rows = await stationsDb.listStations();
    const stations = rows.map((r) => ({
      stationId: String(r.station_id ?? ""),
      name: r.name || null,
      latitude: r.latitude,
      longitude: r.longitude,
      capacity: r.capacity,
      numUmbrellas: r.num_brellas,
      status: r.status || "operational",
    }));
    return res.json({ stations });
  } catch {
    return res.json({ stations: [] });
  }
});

/**
 * POST /api/admin/stations — Create or update a station (upsert). Notifies hardware if supported.
 * Body: { stationId (string), capacity (number), name? (string), latitude? (number), longitude? (number), status? (string) }
 * status: operational | out_of_service | maintenance
 */
router.post(
  "/stations",
  requireJsonContentType,
  requireBody,
  requireFields("stationId", "capacity"),
  async (req, res, next) => {
    try {
      const row = await stationAdminService.createOrUpdateStation(req.body);
      if (!row) {
        return res.status(503).json({ error: "Database not configured" });
      }
      res.status(201).json({
        station: {
          stationId: row.station_id,
          name: row.name || null,
          latitude: row.latitude,
          longitude: row.longitude,
          capacity: row.capacity,
          numUmbrellas: row.num_brellas,
          status: row.status,
        },
      });
    } catch (err) {
      const isValidation =
        err.message?.includes("must be") ||
        err.message?.includes("cannot") ||
        err.message?.includes("required") ||
        err.message?.includes("at most");
      if (isValidation) {
        return res.status(400).json({ error: err.message || "Validation failed" });
      }
      if (err.message?.includes("Database not configured")) {
        return res.status(503).json({ error: err.message });
      }
      next(err);
    }
  }
);

/**
 * PATCH /api/admin/stations/:stationId — Update station status only.
 * Body: { status } — operational | out_of_service | maintenance
 */
router.patch(
  "/stations/:stationId",
  requireJsonContentType,
  requireBody,
  requireFields("status"),
  async (req, res, next) => {
    try {
      const { stationId } = req.params;
      const row = await stationAdminService.updateStationStatus(stationId, req.body.status);
      res.json({
        station: {
          stationId: row.station_id,
          name: row.name || null,
          capacity: row.capacity,
          numUmbrellas: row.num_brellas,
          status: row.status,
        },
      });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ error: err.message || "Station not found" });
      }
      const isValidation =
        err.message?.includes("must be") || err.message?.includes("required");
      if (isValidation) {
        return res.status(400).json({ error: err.message || "Validation failed" });
      }
      if (err.message?.includes("Database not configured")) {
        return res.status(503).json({ error: err.message });
      }
      next(err);
    }
  }
);

/**
 * PUT /api/admin/stations/:stationId — Update station details (name, location, capacity, status).
 * Body: { name?, latitude?, longitude?, capacity?, status? } — at least one field required.
 */
router.put(
  "/stations/:stationId",
  requireJsonContentType,
  requireBody,
  async (req, res, next) => {
    try {
      const stationId = String(req.params.stationId ?? "").trim();
      const row = await stationAdminService.updateStation(stationId, req.body);
      res.json({
        station: {
          stationId: row.station_id,
          name: row.name || null,
          latitude: row.latitude,
          longitude: row.longitude,
          capacity: row.capacity,
          numUmbrellas: row.num_brellas,
          status: row.status,
        },
      });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({
          error: err.message || "Station not found",
          stationId: req.params.stationId,
        });
      }
      const isValidation =
        err.message?.includes("must be") ||
        err.message?.includes("required") ||
        err.message?.includes("Provide at least one");
      if (isValidation) {
        return res.status(400).json({ error: err.message || "Validation failed" });
      }
      if (err.message?.includes("Database not configured")) {
        return res.status(503).json({ error: err.message });
      }
      next(err);
    }
  }
);

/**
 * DELETE /api/admin/stations/:stationId — Remove station from database (and map).
 */
router.delete("/stations/:stationId", async (req, res, next) => {
  try {
    const stationId = String(req.params.stationId ?? "").trim();
    await stationAdminService.deleteStation(stationId);
    res.status(204).send();
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({
        error: err.message || "Station not found",
        stationId: req.params.stationId,
      });
    }
    const isValidation = err.message?.includes("must be") || err.message?.includes("cannot");
    if (isValidation) {
      return res.status(400).json({ error: err.message || "Validation failed" });
    }
    if (err.message?.includes("Database not configured")) {
      return res.status(503).json({ error: err.message });
    }
    return next(err);
  }
});

/**
 * GET /api/admin/pricing — Get current pricing settings.
 */
router.get("/pricing", async (req, res, next) => {
  try {
    const unlockFeeCents = await configDb.get("unlockFeeCents") || "100";
    const centsPerMinute = await configDb.get("centsPerMinute") || "10";
    res.json({
      unlockFeeCents: parseInt(unlockFeeCents, 10),
      centsPerMinute: parseInt(centsPerMinute, 10),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/pricing — Update pricing settings.
 * Body: { unlockFeeCents (number), centsPerMinute (number) }
 */
router.put(
  "/pricing",
  requireJsonContentType,
  requireBody,
  requireFields("unlockFeeCents", "centsPerMinute"),
  async (req, res, next) => {
    try {
      const { unlockFeeCents, centsPerMinute } = req.body;
      if (!Number.isInteger(unlockFeeCents) || unlockFeeCents < 0) {
        return res.status(400).json({ error: "unlockFeeCents must be a non-negative integer" });
      }
      if (!Number.isInteger(centsPerMinute) || centsPerMinute < 0) {
        return res.status(400).json({ error: "centsPerMinute must be a non-negative integer" });
      }
      await configDb.set("unlockFeeCents", String(unlockFeeCents));
      await configDb.set("centsPerMinute", String(centsPerMinute));
      res.json({
        unlockFeeCents,
        centsPerMinute,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
