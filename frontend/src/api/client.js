/**
 * API client for On-Brella backend. Single implementation; swap for mock in tests.
 */
import { config } from "../config";

const base = config.apiBaseUrl || "";

function getSessionId() {
  try {
    let sid = sessionStorage.getItem(config.sessionStorageKey);
    if (!sid) {
      sid = `web-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem(config.sessionStorageKey, sid);
    }
    return sid;
  } catch {
    return "guest";
  }
}

async function request(method, path, body = null) {
  const url = `${base}${path}`;
  const headers = {
    "Content-Type": "application/json",
    "X-Session-Id": getSessionId(),
  };
  const options = { method, headers };
  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || "Request failed");
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

/**
 * @returns {Promise<{ stations: Array, totalStations: number }>}
 */
export async function getStations() {
  return request("GET", "/api/stations");
}

/**
 * @param {string} stationId
 * @param {number} slotNumber
 * @returns {Promise<{ success: boolean, rentalId: string, umbrellaId: string, startTime: string }>}
 */
export async function startRental(stationId, slotNumber) {
  // TODO: Remove this placeholder and use the real API call below for production.
  // Beta placeholder: return fake 200 response when valid QR is scanned so timer can be tested.
  const placeholderResponse = {
    success: true,
    rentalId: `rental-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    umbrellaId: `umbrella-${stationId}-${slotNumber}`,
    startTime: new Date().toISOString(),
  };
  return Promise.resolve(placeholderResponse);

  // return request("POST", "/api/rent", { stationId, slotNumber });
}

/**
 * @param {string} rentalId
 * @param {string} stationId
 * @param {number} slotNumber
 * @param {string} umbrellaId
 * @returns {Promise<{ success: boolean, rentalId: string, endTime: string }>}
 */
export async function endRental(rentalId, stationId, slotNumber, umbrellaId) {
  return request("POST", "/api/return", {
    rentalId,
    stationId,
    slotNumber,
    umbrellaId,
  });
}

export { getSessionId };
