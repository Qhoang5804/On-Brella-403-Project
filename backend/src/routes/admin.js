/**
 * Admin-only API routes. Protected by requireAdmin middleware (Supabase JWT + profiles.role = 'admin').
 */
const express = require("express");
const db = require("../db");
const reportLogic = require("../businessLogic/reportLogic");
const config = require("../config");
const getRentalStore = require("../store/getRentalStore");

const router = express.Router();

/**
 * GET /api/admin/stats — Dashboard counts: users, reports (total + open), active rentals.
 */
router.get("/stats", async (_req, res, next) => {
  try {
    const [{ rows: profileRows }] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM profiles"),
    ]);
    const usersCount = profileRows[0]?.count ?? 0;

    const reports = reportLogic.listAll();
    const openReportsCount = reports.filter((r) => r.status === "open").length;

    let activeRentalsCount = 0;
    if (config.databaseUrl) {
      try {
        const store = getRentalStore();
        activeRentalsCount = await store.countActiveRentals();
      } catch {
        // no db or store not available
      }
    }

    res.json({
      usersCount,
      reportsCount: reports.length,
      openReportsCount,
      activeRentalsCount,
    });
  } catch (err) {
    next(err);
  }
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
 * GET /api/admin/reports — List all reports (from reportLogic).
 */
router.get("/reports", (_req, res) => {
  const reports = reportLogic.listAll();
  res.json({ reports });
});

/**
 * POST /api/admin/reports/:id/resolve — Resolve a report. Body optional: { resolverId }.
 */
router.post("/reports/:id/resolve", (req, res, next) => {
  const { id } = req.params;
  const resolverId = req.body?.resolverId ?? req.adminUserId ?? null;
  const report = reportLogic.resolve(id, resolverId);
  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }
  res.json({ report });
});

module.exports = router;
