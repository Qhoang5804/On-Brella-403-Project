/**
 * In-memory rental store. Extensible: replace with DB adapter later.
 * Tracks active and completed rentals by session.
 */

const rentals = new Map(); // rentalId -> rental
const activeBySession = new Map(); // sessionId -> rentalId

function _generateId() {
  return `rental-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function _generateUmbrellaId(stationId, slotNumber) {
  return `umbrella-${stationId}-${slotNumber}`;
}

/**
 * @param {string} sessionId
 * @param {string} stationId
 * @param {number} slotNumber
 * @returns {{ rentalId: string, umbrellaId: string, startTime: string }}
 */
function create(sessionId, stationId, slotNumber) {
  const rentalId = _generateId();
  const umbrellaId = _generateUmbrellaId(stationId, slotNumber);
  const startTime = new Date().toISOString();

  const rental = {
    rentalId,
    sessionId,
    umbrellaId,
    stationId,
    slotNumber,
    startTime,
    endTime: null,
    returnStationId: null,
    status: "ACTIVE",
  };

  rentals.set(rentalId, rental);
  activeBySession.set(sessionId, rentalId);

  return { rentalId, umbrellaId, startTime };
}

/**
 * @param {string} rentalId
 * @param {string} returnStationId
 * @param {number} slotNumber
 */
function complete(rentalId, returnStationId, slotNumber) {
  const rental = rentals.get(rentalId);
  if (!rental) return null;
  if (rental.status !== "ACTIVE") return null;

  rental.endTime = new Date().toISOString();
  rental.returnStationId = returnStationId;
  rental.returnSlotNumber = slotNumber;
  rental.status = "COMPLETED";

  activeBySession.delete(rental.sessionId);

  return rental;
}

/**
 * @param {string} sessionId
 * @returns {object|null} Active rental or null
 */
function getActiveBySession(sessionId) {
  const rentalId = activeBySession.get(sessionId);
  if (!rentalId) return null;
  return rentals.get(rentalId) || null;
}

/**
 * @param {string} rentalId
 * @returns {object|null}
 */
function getById(rentalId) {
  return rentals.get(rentalId) || null;
}

/** Clear all rentals (for testing). */
function clear() {
  rentals.clear();
  activeBySession.clear();
}

module.exports = {
  create,
  complete,
  getActiveBySession,
  getById,
  clear,
};
