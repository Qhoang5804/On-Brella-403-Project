/**
 * Client for the hardware simulation layer (Mockoon mock or physical hardware).
 * Abstracts all hardware API calls. Swap implementation for real hardware later.
 */

const config = require("../config");

const BASE_URL = config.hardwareUrl;

/**
 * @returns {Promise<{stations: Array, totalStations: number}>}
 */
async function getStations() {
  const res = await fetch(`${BASE_URL}/hardware/stations`);
  if (!res.ok) {
    throw new HardwareError(`Hardware API error: ${res.status}`, res.status);
  }
  return res.json();
}

/**
 * @param {string} stationId
 * @param {number} slotNumber
 * @returns {Promise<{success: boolean, message: string, stationId: string, slotNumber: number}>}
 */
async function unlock(stationId, slotNumber) {
  const res = await fetch(`${BASE_URL}/hardware/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stationId, slotNumber }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new HardwareError(data.message || `Unlock failed: ${res.status}`, res.status);
  }
  return data;
}

/**
 * @param {string} stationId
 * @param {number} slotNumber
 * @param {string} umbrellaId
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function returnUmbrella(stationId, slotNumber, umbrellaId) {
  const res = await fetch(`${BASE_URL}/hardware/return`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stationId, slotNumber, umbrellaId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new HardwareError(data.message || `Return failed: ${res.status}`, res.status);
  }
  return data;
}

class HardwareError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = "HardwareError";
    this.statusCode = statusCode;
  }
}

module.exports = {
  getStations,
  unlock,
  returnUmbrella,
  HardwareError,
};
