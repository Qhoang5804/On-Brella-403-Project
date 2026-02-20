/**
 * Business logic for umbrella rentals.
 * Enforces rules: one active rental per session, availability checks, etc.
 */

const hardwareClient = require("./hardwareClient");
const getRentalStore = require("../store/getRentalStore");
const stationsDb = require("../db/stations");

class RentalError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "RentalError";
    this.statusCode = statusCode;
  }
}

/**
 * @returns {Promise<{stations: Array, totalStations: number}>}
 * Permanent station info from hardware; availability (numUmbrellas, availableSlots) from DB.
 */
async function getStations() {
  const { stations: rawStations, totalStations } = await hardwareClient.getStations();
  const hasDb = !!require("../db").getPool();

  const stations = await Promise.all(
    rawStations.map(async (s) => {
      const capacity = s.capacity ?? 10;
      let numUmbrellas = capacity;
      if (hasDb) {
        await stationsDb.upsertStation({
          stationId: s.stationId,
          latitude: s.location?.latitude,
          longitude: s.location?.longitude,
          capacity,
          status: s.status ?? "operational",
        });
        const row = await stationsDb.getByStationId(s.stationId);
        if (row) numUmbrellas = row.num_brellas ?? capacity;
      }
      const availableSlots = Math.max(0, capacity - numUmbrellas);
      return {
        ...s,
        numUmbrellas,
        availableSlots,
      };
    })
  );

  return { stations, totalStations };
}

/**
 * Start a rental. Validates: no active rental for session; slot available.
 * @param {string} sessionId
 * @param {string} stationId
 * @param {number} slotNumber
 * @returns {Promise<{success: boolean, rentalId: string, umbrellaId: string, startTime: string}>}
 */
async function startRental(sessionId, stationId, slotNumber) {
  const store = getRentalStore();
  const existing = await store.getActiveBySession(sessionId);
  if (existing) {
    throw new RentalError("Session already has an active rental", 409);
  }

  const { unlock } = hardwareClient;

  try {
    await unlock(stationId, slotNumber);
  } catch (err) {
    if (err.statusCode === 502 || err.message?.includes("fetch failed")) {
      throw new RentalError("Hardware unavailable", 503);
    }
    throw new RentalError(err.message || "Unlock failed", err.statusCode || 409);
  }

  const { rentalId, umbrellaId, startTime } = await store.create(sessionId, stationId, slotNumber);

  await stationsDb.decrementNumBrellas(stationId);

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
  const store = getRentalStore();
  const rental = await store.getById(rentalId);
  if (!rental) {
    throw new RentalError("Rental not found", 404);
  }
  if (rental.status !== "ACTIVE") {
    throw new RentalError("Rental is not active", 409);
  }
  if (rental.sessionId !== sessionId) {
    throw new RentalError("Rental does not belong to this session", 403);
  }

  const { returnUmbrella } = hardwareClient;

  try {
    await returnUmbrella(stationId, slotNumber, umbrellaId);
  } catch (err) {
    if (err.statusCode === 502 || err.message?.includes("fetch failed")) {
      throw new RentalError("Hardware unavailable", 503);
    }
    throw new RentalError(err.message || "Return failed", err.statusCode || 409);
  }

  const updated = await store.complete(rentalId, stationId, slotNumber);
  if (!updated) {
    throw new RentalError("Failed to complete rental", 500);
  }

  await stationsDb.incrementNumBrellas(stationId);

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
