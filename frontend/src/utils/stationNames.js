/**
 * Display names for stations. Extensible: can be replaced by API-driven names later.
 */
const names = {
  "station-001": "Suzzallo Library Station",
  "station-002": "The HUB",
};

export function getStationDisplayName(stationId) {
  return names[stationId] || stationId || "Station";
}

export function getStationAddress(stationId) {
  const addresses = {
    "station-001": "411 Library Way, Seattle, WA 98195",
    "station-002": "HUB, Seattle, WA 98195",
  };
  return addresses[stationId] || "";
}
