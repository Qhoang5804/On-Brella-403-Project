/**
 * Business logic for umbrella rentals.
 * Enforces rules: one active rental per session, availability checks, etc.
 */

const hardwareClient = require("./hardwareClient");
const rentalStore = require("../store/rentalStore");

class RentalError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "RentalError";
    this.statusCode = statusCode;
  }
}

/**
 * @returns {Promise<{stations: Array, totalStations: number}>}
 */
async function getStations() {
  return hardwareClient.getStations();
}

/**
 * Start a rental. Validates: no active rental for session; slot available.
 * @param {string} sessionId
 * @param {string} stationId
 * @param {number} slotNumber
 * @returns {Promise<{success: boolean, rentalId: string, umbrellaId: string, startTime: string}>}
 */
async function startRental(sessionId, stationId, slotNumber) {
  const existing = rentalStore.getActiveBySession(sessionId);
  if (existing) {
    throw new RentalError("Session already has an active rental", 409);
  }

  const { create } = rentalStore;
  const { unlock } = hardwareClient;

  try {
    await unlock(stationId, slotNumber);
  } catch (err) {
    if (err.statusCode === 502 || err.message?.includes("fetch failed")) {
      throw new RentalError("Hardware unavailable", 503);
    }
    throw new RentalError(err.message || "Unlock failed", err.statusCode || 409);
  }

  const { rentalId, umbrellaId, startTime } = create(sessionId, stationId, slotNumber);

  return {
    success: true,
    rentalId,
    umbrellaId,
    startTime,
  };
}

/**
 * End a rental. Validates: rental exists, is ACTIVE, station has capacity.
 * @param {string} sessionId
 * @param {string} rentalId
 * @param {string} stationId
 * @param {number} slotNumber
 * @param {string} umbrellaId
 * @returns {Promise<{success: boolean, rentalId: string, endTime: string}>}
 */
async function endRental(sessionId, rentalId, stationId, slotNumber, umbrellaId) {
  const rental = rentalStore.getById(rentalId);
  if (!rental) {
    throw new RentalError("Rental not found", 404);
  }
  if (rental.status !== "ACTIVE") {
    throw new RentalError("Rental is not active", 409);
  }
  if (rental.sessionId !== sessionId) {
    throw new RentalError("Rental does not belong to this session", 403);
  }

  const { complete } = rentalStore;
  const { returnUmbrella } = hardwareClient;

  try {
    await returnUmbrella(stationId, slotNumber, umbrellaId);
  } catch (err) {
    if (err.statusCode === 502 || err.message?.includes("fetch failed")) {
      throw new RentalError("Hardware unavailable", 503);
    }
    throw new RentalError(err.message || "Return failed", err.statusCode || 409);
  }

  const updated = complete(rentalId, stationId, slotNumber);
  if (!updated) {
    throw new RentalError("Failed to complete rental", 500);
  }

  return {
    success: true,
    rentalId,
    endTime: updated.endTime,
  };
}

module.exports = {
  getStations,
  startRental,
  endRental,
  RentalError,
};
