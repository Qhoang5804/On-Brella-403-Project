/**
 * Station availability in DB (Supabase stations table).
 * Tracks num_brellas per station; permanent info comes from hardware.
 */

const db = require("./index");

/**
 * Get one station's current num_brellas and name. Returns null if not in DB.
 */
async function getByStationId(stationId) {
  const p = db.getPool();
  if (!p) return null;
  const { rows } = await db.query(
    "SELECT station_id, station_name, capacity, num_brellas, status, latitude, longitude FROM stations WHERE station_id = $1",
    [stationId]
  );
  const row = rows[0];
  if (row) row.name = row.station_name;
  return row || null;
}

/**
 * List all stations from DB (for admin). Returns [] if no DB or no rows.
 */
async function listStations() {
  const p = db.getPool();
  if (!p) return [];
  const { rows } = await db.query(
    "SELECT station_id, station_name, latitude, longitude, capacity, num_brellas, status FROM stations ORDER BY station_id"
  );
  return rows.map((r) => ({ ...r, name: r.station_name }));
}

/**
 * Upsert station. New rows get num_brellas = capacity. On conflict, cap num_brellas to new capacity.
 * @param {object} opts - { stationId, name?, latitude?, longitude?, capacity, status? }
 * @returns {Promise<object|null>} Upserted row or null if no DB
 */
async function upsertStation({ stationId, name, latitude, longitude, capacity, status = "operational" }) {
  const pool = db.getPool();
  if (!pool) return null;

  const { rows } = await db.query(
    `INSERT INTO stations (station_id, station_name, latitude, longitude, capacity, num_brellas, status)
     VALUES ($1, $2, $3, $4, $5, $5, $6)
     ON CONFLICT (station_id) DO UPDATE SET
       station_name = COALESCE(NULLIF(EXCLUDED.station_name, ''), stations.station_name),
       latitude = COALESCE(EXCLUDED.latitude, stations.latitude),
       longitude = COALESCE(EXCLUDED.longitude, stations.longitude),
       capacity = EXCLUDED.capacity,
       num_brellas = LEAST(stations.num_brellas, EXCLUDED.capacity),
       status = EXCLUDED.status
     RETURNING station_id, station_name, latitude, longitude, capacity, num_brellas, status`,
    [stationId, name && String(name).trim() || null, latitude ?? null, longitude ?? null, capacity, status]
  );

  const row = rows[0];
  if (row) row.name = row.station_name;
  return row || null;
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

/**
 * Update station status only.
 * @param {string} stationId
 * @param {string} status - operational | out_of_service | maintenance
 * @returns {Promise<object|null>} Updated row or null
 */
async function updateStatus(stationId, status) {
  const pool = db.getPool();
  if (!pool) return null;
  const { rows } = await db.query(
    "UPDATE stations SET status = $1 WHERE station_id = $2 RETURNING station_id, station_name, capacity, num_brellas, status",
    [status, stationId]
  );
  const row = rows[0];
  if (row) row.name = row.station_name;
  return row || null;
}

/**
 * Partial update of a station. Only provided fields are updated.
 * @param {string} stationId
 * @param {object} opts - { name?, latitude?, longitude?, capacity?, status? }
 * @returns {Promise<object|null>} Updated row or null if not found
 */
async function updateStation(stationId, opts) {
  const pool = db.getPool();
  if (!pool) return null;
  const updates = [];
  const values = [];
  let i = 1;
  if (opts.name !== undefined) {
    updates.push(`station_name = $${i++}`);
    values.push(opts.name && String(opts.name).trim() || null);
  }
  if (opts.latitude !== undefined) {
    updates.push(`latitude = $${i++}`);
    values.push(opts.latitude);
  }
  if (opts.longitude !== undefined) {
    updates.push(`longitude = $${i++}`);
    values.push(opts.longitude);
  }
  if (opts.capacity !== undefined) {
    updates.push(`capacity = $${i++}`);
    values.push(opts.capacity);
    updates.push(`num_brellas = LEAST(num_brellas, $${i})`);
    values.push(opts.capacity);
    i++;
  }
  if (opts.status !== undefined) {
    updates.push(`status = $${i++}`);
    values.push(opts.status);
  }
  if (updates.length === 0) return getByStationId(stationId);
  values.push(stationId);
  const { rows } = await db.query(
    `UPDATE stations SET ${updates.join(", ")} WHERE station_id = $${i} RETURNING station_id, station_name, latitude, longitude, capacity, num_brellas, status`,
    values
  );
  const row = rows[0];
  if (row) row.name = row.station_name;
  return row || null;
}

/**
 * Delete a station by id. Removes it from the map and DB.
 * @param {string} stationId
 * @returns {Promise<boolean>} true if a row was deleted
 */
async function deleteStation(stationId) {
  const pool = db.getPool();
  if (!pool) return false;
  const { rowCount } = await db.query("DELETE FROM stations WHERE station_id = $1", [stationId]);
  return (rowCount ?? 0) > 0;
}

module.exports = {
  getByStationId,
  listStations,
  upsertStation,
  decrementNumBrellas,
  incrementNumBrellas,
  updateStatus,
  updateStation,
  deleteStation,
};
