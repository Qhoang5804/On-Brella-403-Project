/**
 * Database-backed rental store. Uses the `rentals` table in Supabase.
 * Same interface as rentalStore but async; used when DATABASE_URL is set.
 */

const db = require("../db");

function _umbrellaId(stationId, slotNumber) {
  return `umbrella-${stationId}-${slotNumber}`;
}

function _rentalId() {
  return `rental-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function _rowToRental(row) {
  if (!row) return null;
  return {
    rentalId: row.rental_id,
    sessionId: row.session_id,
    umbrellaId: row.umbrella_id,
    stationId: row.station_id,
    slotNumber: row.slot_number ?? row.start_slot_number,
    startTime: row.start_time ? new Date(row.start_time).toISOString() : null,
    endTime: row.end_time ? new Date(row.end_time).toISOString() : null,
    returnStationId: row.return_station_id,
    returnSlotNumber: row.return_slot_number ?? row.return_slot_num,
    status: row.status,
  };
}

/**
 * @param {string} sessionId
 * @param {string} stationId
 * @param {number} slotNumber
 * @returns {Promise<{ rentalId: string, umbrellaId: string, startTime: string }>}
 */
async function create(sessionId, stationId, slotNumber) {
  const rentalId = _rentalId();
  const umbrellaId = _umbrellaId(stationId, slotNumber);
  await db.query(
    `INSERT INTO rentals (rental_id, session_id, umbrella_id, station_id, slot_number, start_time, status)
     VALUES ($1, $2, $3, $4, $5, now(), 'ACTIVE')`,
    [rentalId, sessionId, umbrellaId, stationId, slotNumber]
  );
  const startTime = new Date().toISOString();
  return {
    rentalId,
    umbrellaId,
    startTime,
  };
}

/**
 * @param {string} rentalId UUID
 * @param {string} returnStationId
 * @param {number} slotNumber
 * @returns {Promise<object|null>} Updated rental or null
 */
async function complete(rentalId, returnStationId, slotNumber) {
  const { rows } = await db.query(
    `UPDATE rentals
     SET end_time = now(), return_station_id = $2, return_slot_number = $3, status = 'COMPLETED'
     WHERE rental_id = $1 AND status = 'ACTIVE'
     RETURNING *`,
    [rentalId, returnStationId, slotNumber]
  );
  return rows[0] ? _rowToRental(rows[0]) : null;
}

/**
 * @param {string} sessionId
 * @returns {Promise<object|null>} Active rental or null
 */
async function getActiveBySession(sessionId) {
  const { rows } = await db.query(
    `SELECT * FROM rentals WHERE session_id = $1 AND status = 'ACTIVE' LIMIT 1`,
    [sessionId]
  );
  return rows[0] ? _rowToRental(rows[0]) : null;
}

/**
 * @param {string} rentalId
 * @returns {Promise<object|null>}
 */
async function getById(rentalId) {
  const { rows } = await db.query(`SELECT * FROM rentals WHERE rental_id = $1`, [rentalId]);
  return rows[0] ? _rowToRental(rows[0]) : null;
}

/**
 * List completed rentals for a session (for history). Most recent first.
 * @param {string} sessionId
 * @param {number} [limit=50]
 * @returns {Promise<Array<object>>}
 */
async function getCompletedBySession(sessionId, limit = 50) {
  const { rows } = await db.query(
    `SELECT * FROM rentals
     WHERE session_id = $1 AND status = 'COMPLETED'
     ORDER BY end_time DESC NULLS LAST
     LIMIT $2`,
    [sessionId, limit]
  );
  return rows.map((row) => _rowToRental(row));
}

module.exports = {
  create,
  complete,
  getActiveBySession,
  getById,
  getCompletedBySession,
};
