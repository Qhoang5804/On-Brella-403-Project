/**
 * API integration tests. Uses supertest; mocks hardware client and rental store (no DB).
 */

const request = require("supertest");
const { createMockRentalStore } = require("./mockRentalStore");

const mockStore = createMockRentalStore();
jest.mock("../src/store/getRentalStore", () => () => mockStore);

jest.mock("../src/services/hardwareClient", () => ({
  getStations: jest.fn().mockResolvedValue({
    stations: [
      {
        stationId: "station-001",
        location: { latitude: 47.6553, longitude: -122.3035 },
        status: "operational",
        capacity: 10,
        numUmbrellas: 7,
        availableSlots: 3,
      },
    ],
    totalStations: 1,
  }),
  unlock: jest.fn().mockResolvedValue({
    success: true,
    message: "Umbrella unlocked successfully",
    stationId: "station-001",
    slotNumber: 5,
  }),
  returnUmbrella: jest.fn().mockResolvedValue({
    success: true,
    message: "Umbrella returned successfully",
  }),
  HardwareError: class HardwareError extends Error {
    constructor(msg, code = 502) {
      super(msg);
      this.statusCode = code;
    }
  },
}));

jest.resetModules();
const { backendInitialized, app } = require("../src/server");

beforeEach(() => {
  mockStore.clear();
  jest.clearAllMocks();
});

describe("Backend", () => {
  test("backendInitialized returns expected string", () => {
    expect(backendInitialized()).toBe("backend initialized");
  });
});

describe("API endpoints", () => {
  test("GET /api/stations returns stations from hardware", async () => {
    const res = await request(app).get("/api/stations");

    expect(res.status).toBe(200);
    expect(res.body.stations).toHaveLength(1);
    expect(res.body.stations[0].stationId).toBe("station-001");
  });

  test("POST /api/rent creates rental and returns success", async () => {
    const res = await request(app)
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .send({ stationId: "station-001", slotNumber: 5 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.rentalId).toBeDefined();
    expect(res.body.umbrellaId).toContain("station-001");
    expect(res.body.startTime).toBeDefined();
  });

  test("POST /api/rent without body returns 400", async () => {
    const res = await request(app).post("/api/rent");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/rent duplicate for same session returns 409", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .set("X-Session-Id", "session-123")
      .send({ stationId: "station-001", slotNumber: 5 });

    const res = await agent
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .set("X-Session-Id", "session-123")
      .send({ stationId: "station-001", slotNumber: 3 });

    expect(res.status).toBe(409);
  });

  test("POST /api/return completes rental", async () => {
    const rentRes = await request(app)
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .set("X-Session-Id", "session-456")
      .send({ stationId: "station-001", slotNumber: 5 });

    const { rentalId, umbrellaId } = rentRes.body;

    const returnRes = await request(app)
      .post("/api/return")
      .set("Content-Type", "application/json")
      .set("X-Session-Id", "session-456")
      .send({
        rentalId,
        stationId: "station-002",
        slotNumber: 3,
        umbrellaId,
      });

    expect(returnRes.status).toBe(200);
    expect(returnRes.body.success).toBe(true);
    expect(returnRes.body.endTime).toBeDefined();
  });

  test("POST /api/return with invalid rental returns 404", async () => {
    const res = await request(app)
      .post("/api/return")
      .set("Content-Type", "application/json")
      .send({
        rentalId: "rental-fake",
        stationId: "station-001",
        slotNumber: 3,
        umbrellaId: "umbrella-123",
      });

    expect(res.status).toBe(404);
  });

  test("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /api/rent missing stationId returns 400", async () => {
    const res = await request(app)
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .send({ slotNumber: 5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("stationId");
  });

  test("POST /api/rent missing slotNumber returns 400", async () => {
    const res = await request(app)
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .send({ stationId: "station-001" });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("slotNumber");
  });

  test("POST /api/rent invalid slotNumber returns 400", async () => {
    const res = await request(app)
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .send({ stationId: "station-001", slotNumber: "not-a-number" });
    expect(res.status).toBe(400);
  });

  test("POST /api/rent negative slotNumber returns 400", async () => {
    const res = await request(app)
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .send({ stationId: "station-001", slotNumber: -1 });
    expect(res.status).toBe(400);
  });

  test("POST /api/return missing required fields returns 400", async () => {
    const res = await request(app)
      .post("/api/return")
      .set("Content-Type", "application/json")
      .send({ rentalId: "r1", stationId: "s1" }); // missing slotNumber, umbrellaId
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("slotNumber");
  });

  test("POST /api/return wrong session returns 403", async () => {
    const rentRes = await request(app)
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .set("X-Session-Id", "owner-session")
      .send({ stationId: "station-001", slotNumber: 5 });

    const res = await request(app)
      .post("/api/return")
      .set("Content-Type", "application/json")
      .set("X-Session-Id", "wrong-session")
      .send({
        rentalId: rentRes.body.rentalId,
        stationId: "station-002",
        slotNumber: 1,
        umbrellaId: rentRes.body.umbrellaId,
      });
    expect(res.status).toBe(403);
  });

  test("POST /api/return invalid slotNumber returns 400", async () => {
    const rentRes = await request(app)
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .send({ stationId: "station-001", slotNumber: 5 });

    const res = await request(app)
      .post("/api/return")
      .set("Content-Type", "application/json")
      .send({
        rentalId: rentRes.body.rentalId,
        stationId: "station-002",
        slotNumber: "invalid",
        umbrellaId: rentRes.body.umbrellaId,
      });
    expect(res.status).toBe(400);
  });

  test("sessionId from body when header not set", async () => {
    const res = await request(app)
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .send({ stationId: "station-001", slotNumber: 5, sessionId: "body-session" });
    expect(res.status).toBe(201);
    // Second rent with same sessionId should fail
    const res2 = await request(app)
      .post("/api/rent")
      .set("Content-Type", "application/json")
      .send({ stationId: "station-001", slotNumber: 3, sessionId: "body-session" });
    expect(res2.status).toBe(409);
  });
});
