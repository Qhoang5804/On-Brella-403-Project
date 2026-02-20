/**
 * Station availability in DB (Supabase stations table).
 * Tracks num_brellas per station; permanent info comes from hardware.
 */

const db = require("./index");

/**
 * Get one station's current num_brellas. Returns null if not in DB.
 */
async function getByStationId(stationId) {
  const p = db.getPool();
  if (!p) return null;
  const { rows } = await db.query(
    "SELECT station_id, capacity, num_brellas, status FROM stations WHERE station_id = $1",
    [stationId]
  );
  return rows[0] || null;
}

/**
 * Upsert station from hardware (permanent info). Sets num_brellas = capacity if new. No-op if no DB.
 */
async function upsertStation({ stationId, latitude, longitude, capacity, status = "operational" }) {
  if (!db.getPool()) return;
  await db.query(
    `INSERT INTO stations (station_id, latitude, longitude, capacity, num_brellas, status)
     VALUES ($1, $2, $3, $4, $4, $5)
     ON CONFLICT (station_id) DO UPDATE SET
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       capacity = EXCLUDED.capacity,
       status = EXCLUDED.status`,
    [stationId, latitude, longitude, capacity, status]
  );
}

/**
 * Decrement num_brellas by 1 (after rent). No-op if no DB, or not in DB, or already 0.
 */
async function decrementNumBrellas(stationId) {
  if (!db.getPool()) return;
  await db.query(
    "UPDATE stations SET num_brellas = GREATEST(0, num_brellas - 1) WHERE station_id = $1",
    [stationId]
  );
}

/**
 * Increment num_brellas by 1 (after return). No-op if no DB or not in DB.
 */
async function incrementNumBrellas(stationId) {
  if (!db.getPool()) return;
  await db.query(
    `UPDATE stations SET num_brellas = LEAST(capacity, num_brellas + 1) WHERE station_id = $1`,
    [stationId]
  );
}

module.exports = {
  getByStationId,
  upsertStation,
  decrementNumBrellas,
  incrementNumBrellas,
};
