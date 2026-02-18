/**
 * Rental service unit tests. Mocks hardwareClient and getRentalStore (no DB).
 */

const mockUnlock = jest.fn();
const mockReturnUmbrella = jest.fn();
const mockGetStations = jest.fn();

const { createMockRentalStore } = require("./mockRentalStore");
const mockStore = createMockRentalStore();
jest.mock("../src/store/getRentalStore", () => () => mockStore);

jest.mock("../src/services/hardwareClient", () => ({
  getStations: (...args) => mockGetStations(...args),
  unlock: (...args) => mockUnlock(...args),
  returnUmbrella: (...args) => mockReturnUmbrella(...args),
  HardwareError: class HardwareError extends Error {
    constructor(msg, code = 502) {
      super(msg);
      this.statusCode = code;
    }
  },
}));

jest.resetModules();
const rentalService = require("../src/services/rentalService");
const { RentalError } = rentalService;

beforeEach(() => {
  mockStore.clear();
  mockGetStations.mockResolvedValue({
    stations: [{ stationId: "station-001" }],
    totalStations: 1,
  });
  mockUnlock.mockResolvedValue({ success: true });
  mockReturnUmbrella.mockResolvedValue({ success: true });
});

describe("rentalService.getStations", () => {
  test("returns stations from hardware client", async () => {
    const result = await rentalService.getStations();
    expect(mockGetStations).toHaveBeenCalled();
    expect(result.stations).toHaveLength(1);
    expect(result.stations[0].stationId).toBe("station-001");
  });
});

describe("rentalService.startRental", () => {
  test("calls unlock with stationId and slotNumber", async () => {
    await rentalService.startRental("s1", "station-001", 5);
    expect(mockUnlock).toHaveBeenCalledWith("station-001", 5);
  });

  test("returns success with rentalId, umbrellaId, startTime", async () => {
    const result = await rentalService.startRental("s1", "station-001", 3);
    expect(result.success).toBe(true);
    expect(result.rentalId).toMatch(/^rental-/);
    expect(result.umbrellaId).toBe("umbrella-station-001-3");
    expect(result.startTime).toBeDefined();
  });

  test("throws 409 when session already has active rental", async () => {
    await rentalService.startRental("s1", "station-001", 5);
    await expect(rentalService.startRental("s1", "station-001", 3)).rejects.toThrow(RentalError);
    await expect(rentalService.startRental("s1", "station-001", 3)).rejects.toMatchObject({
      statusCode: 409,
      message: "Session already has an active rental",
    });
  });

  test("different sessions can have simultaneous rentals", async () => {
    const r1 = await rentalService.startRental("s1", "station-001", 1);
    const r2 = await rentalService.startRental("s2", "station-001", 2);
    expect(r1.rentalId).not.toBe(r2.rentalId);
  });

  test("throws 503 when hardware unlock fails with fetch error", async () => {
    mockUnlock.mockRejectedValue(new Error("fetch failed"));
    await expect(rentalService.startRental("s1", "station-001", 5)).rejects.toMatchObject({
      statusCode: 503,
      message: "Hardware unavailable",
    });
  });

  test("rethrows hardware error with statusCode", async () => {
    const err = new Error("Slot occupied");
    err.statusCode = 409;
    mockUnlock.mockRejectedValue(err);
    await expect(rentalService.startRental("s1", "station-001", 5)).rejects.toMatchObject({
      statusCode: 409,
      message: "Slot occupied",
    });
  });
});

describe("rentalService.endRental", () => {
  test("calls returnUmbrella and completes rental", async () => {
    const start = await rentalService.startRental("s1", "station-001", 5);
    const result = await rentalService.endRental(
      "s1",
      start.rentalId,
      "station-002",
      3,
      start.umbrellaId
    );

    expect(mockReturnUmbrella).toHaveBeenCalledWith("station-002", 3, start.umbrellaId);
    expect(result.success).toBe(true);
    expect(result.endTime).toBeDefined();
  });

  test("throws 404 when rental not found", async () => {
    mockReturnUmbrella.mockClear();
    await expect(
      rentalService.endRental("s1", "rental-fake", "station-001", 1, "umbrella-1")
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Rental not found",
    });
    expect(mockReturnUmbrella).not.toHaveBeenCalled();
  });

  test("throws 409 when rental already completed", async () => {
    const start = await rentalService.startRental("s1", "station-001", 5);
    await rentalService.endRental("s1", start.rentalId, "station-002", 1, start.umbrellaId);

    await expect(
      rentalService.endRental("s1", start.rentalId, "station-002", 2, start.umbrellaId)
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Rental is not active",
    });
  });

  test("throws 403 when session does not own rental", async () => {
    const start = await rentalService.startRental("session-owner", "station-001", 5);
    mockReturnUmbrella.mockClear();

    await expect(
      rentalService.endRental("other-session", start.rentalId, "station-002", 1, start.umbrellaId)
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "Rental does not belong to this session",
    });
    expect(mockReturnUmbrella).not.toHaveBeenCalled();
  });

  test("throws 503 when hardware return fails with fetch error", async () => {
    const start = await rentalService.startRental("s1", "station-001", 5);
    mockReturnUmbrella.mockRejectedValue(new Error("fetch failed"));

    await expect(
      rentalService.endRental("s1", start.rentalId, "station-002", 1, start.umbrellaId)
    ).rejects.toMatchObject({
      statusCode: 503,
      message: "Hardware unavailable",
    });
  });
});
