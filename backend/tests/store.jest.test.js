const store = require("../src/store.js");

describe("Umbrella station inventory", () => {
  beforeEach(() => {
    store.clear();
  });

  test("admin can set umbrella count for a station", () => {
    store.set("stationA", 5);

    expect(store.get("stationA")).toBe(5);
  });

  test("station with zero umbrellas returns 0", () => {
    store.set("stationB", 0);

    expect(store.get("stationB")).toBe(0);
  });

  test("unknown station returns undefined", () => {
    expect(store.get("stationX")).toBeUndefined();
  });

  test("setting umbrellas without station ID throws error", () => {
    expect(() => store.set("", 5)).toThrow("key is required");
  });

  test("clear removes all station data", () => {
    store.set("stationA", 3);
    store.clear();

    expect(store.get("stationA")).toBeUndefined();
  });

  test("renting umbrella reduces station count", () => {
    store.set("stationA", 3);

    store.rentUmbrella("stationA");

    expect(store.get("stationA")).toBe(2);
  });
});
