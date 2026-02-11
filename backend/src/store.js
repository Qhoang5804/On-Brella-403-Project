const data = new Map();

function set(key, value) {
  if (!key) throw new Error("key is required");
  data.set(String(key), value);
  return value;
}

function get(key) {
  if (!key) throw new Error("key is required");
  return data.get(String(key));
}

function clear() {
  data.clear();
}

function rentUmbrella(stationId) {
  const n = get(stationId);
  if (n == null || n <= 0) throw new Error("no umbrellas available");
  set(stationId, n - 1);
}

module.exports = { set, get, clear, rentUmbrella };
