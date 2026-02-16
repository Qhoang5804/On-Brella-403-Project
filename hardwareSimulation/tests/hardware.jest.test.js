const BASE_URL = process.env.HARDWARE_URL || "http://localhost:3000";

describe("Mockoon hardware endpoints", () => {
  test("GET /hardware/stations returns list of stations", async () => {
    const res = await fetch(`${BASE_URL}/hardware/stations`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.stations)).toBe(true);
    expect(data.stations.length).toBeGreaterThan(0);
  });

  test("POST /hardware/unlock returns success", async () => {
    const res = await fetch(`${BASE_URL}/hardware/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId: "station-001", slotNumber: 5 }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test("POST /hardware/return returns success", async () => {
    const res = await fetch(`${BASE_URL}/hardware/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stationId: "station-001",
        slotNumber: 3,
        umbrellaId: "umbrella-123",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
