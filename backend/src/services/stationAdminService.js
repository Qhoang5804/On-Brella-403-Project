/**
 * Admin-only station operations: create/update station in DB and optionally notify hardware.
 * Keeps route thin; validation and orchestration live here.
 */

const stationsDb = require("../db/stations");
const {
  validateStationPayload,
  validateStatus,
  validateStationId,
  validateStationUpdatePayload,
} = require("../lib/stationValidation");
const hardwareClient = require("./hardwareClient");
const db = require("../db");

/**
 * Create or update a station. Persists to DB; optionally notifies hardware (best-effort).
 * @param {object} payload - { stationId, capacity, latitude?, longitude?, status? }
 * @returns {Promise<object>} The upserted station row (station_id, capacity, num_brellas, status, etc.)
 * @throws {Error} When validation fails or DB is not configured
 */
async function createOrUpdateStation(payload) {
  const normalized = validateStationPayload(payload);

  if (!db.getPool()) {
    throw new Error("Database not configured. Set DATABASE_URL in backend/.env");
  }

  const row = await stationsDb.upsertStation(normalized);

  // Best-effort: notify hardware layer so it can register the station if supported.
  try {
    await hardwareClient.registerStation({
      stationId: normalized.stationId,
      location:
        normalized.latitude != null && normalized.longitude != null
          ? { latitude: normalized.latitude, longitude: normalized.longitude }
          : undefined,
      capacity: normalized.capacity,
      status: normalized.status,
    });
  } catch {
    // Hardware may not support POST /hardware/stations; station is already in DB.
  }

  return row;
}

/**
 * Update a station's status only (operational | out_of_service | maintenance).
 * @param {string} stationId
 * @param {string} status
 * @returns {Promise<object>} Updated row
 * @throws {Error} When validation fails or DB not configured or station not found
 */
async function updateStationStatus(stationId, status) {
  const normalizedStatus = validateStatus(status);

  if (!db.getPool()) {
    throw new Error("Database not configured. Set DATABASE_URL in backend/.env");
  }

  const row = await stationsDb.updateStatus(stationId, normalizedStatus);
  if (!row) {
    const err = new Error("Station not found");
    err.statusCode = 404;
    throw err;
  }

  return row;
}

/**
 * Partially update a station (name, latitude, longitude, capacity, status).
 * @param {string} stationId
 * @param {object} body - { name?, latitude?, longitude?, capacity?, status? }
 * @returns {Promise<object>} Updated row
 * @throws {Error} When validation fails or station not found
 */
async function updateStation(stationId, body) {
  const id = validateStationId(String(stationId ?? "").trim());
  const normalized = validateStationUpdatePayload(body);

  if (!db.getPool()) {
    throw new Error("Database not configured. Set DATABASE_URL in backend/.env");
  }

  const row = await stationsDb.updateStation(id, normalized);
  if (!row) {
    const err = new Error("Station not found");
    err.statusCode = 404;
    throw err;
  }

  return row;
}

/**
 * Delete a station from the database (removes from map and admin lists).
 * @param {string} stationId
 * @returns {Promise<{ deleted: boolean }>}
 * @throws {Error} When stationId invalid or DB not configured
 */
async function deleteStation(stationId) {
  const id = validateStationId(String(stationId ?? "").trim());

  if (!db.getPool()) {
    throw new Error("Database not configured. Set DATABASE_URL in backend/.env");
  }

  const deleted = await stationsDb.deleteStation(id);
  if (!deleted) {
    const err = new Error("Station not found");
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true };
}

module.exports = {
  createOrUpdateStation,
  updateStationStatus,
  updateStation,
  deleteStation,
};
