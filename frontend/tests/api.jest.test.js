/**
 * API client unit tests. Mocks global fetch.
 */

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = originalFetch;
  sessionStorage.clear();
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe("API client", () => {
  describe("getStations", () => {
    test("returns parsed JSON on 200", async () => {
      const mockStations = {
        stations: [{ stationId: "station-001", location: { latitude: 47.65, longitude: -122.3 } }],
        totalStations: 1,
      };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStations),
      });

      const { getStations } = await import("../src/api/client.js");
      const result = await getStations();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/stations"),
        expect.objectContaining({ method: "GET" })
      );
      expect(result).toEqual(mockStations);
      expect(result.stations).toHaveLength(1);
      expect(result.stations[0].stationId).toBe("station-001");
    });

    test("throws on non-ok response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      const { getStations } = await import("../src/api/client.js");

      await expect(getStations()).rejects.toThrow();
    });
  });

  describe("startRental", () => {
    test("returns success, rentalId, umbrellaId, startTime", async () => {
      const { startRental } = await import("../src/api/client.js");
      const result = await startRental("station-001", 5);

      expect(result.success).toBe(true);
      expect(result.rentalId).toBeDefined();
      expect(result.rentalId).toMatch(/^rental-/);
      expect(result.umbrellaId).toBe("umbrella-station-001-5");
      expect(result.startTime).toBeDefined();
      expect(new Date(result.startTime).getTime()).not.toBeNaN();
    });
  });

  describe("endRental", () => {
    test("sends POST with rentalId, stationId, slotNumber, umbrellaId", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            rentalId: "rental-1",
            endTime: new Date().toISOString(),
          }),
      });

      const { endRental } = await import("../src/api/client.js");
      await endRental("rental-1", "station-002", 3, "umbrella-station-001-5");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/return"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            rentalId: "rental-1",
            stationId: "station-002",
            slotNumber: 3,
            umbrellaId: "umbrella-station-001-5",
          }),
        })
      );
    });

    test("throws on non-ok response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "Rental not found" }),
      });

      const { endRental } = await import("../src/api/client.js");

      await expect(
        endRental("rental-fake", "station-001", 1, "umbrella-1")
      ).rejects.toThrow();
    });
  });

  describe("getSessionId", () => {
    test("returns string from sessionStorage or generates new", async () => {
      const { getSessionId } = await import("../src/api/client.js");
      const sid = getSessionId();
      expect(typeof sid).toBe("string");
      expect(sid.length).toBeGreaterThan(0);
    });
  });
});
