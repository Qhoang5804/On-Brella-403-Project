/**
 * Rental store unit tests.
 */

const rentalStore = require("../src/store/rentalStore");

beforeEach(() => {
  rentalStore.clear();
});

describe("rentalStore.create", () => {
  test("creates rental with correct structure", () => {
    const result = rentalStore.create("session-1", "station-001", 5);

    expect(result).toHaveProperty("rentalId");
    expect(result).toHaveProperty("umbrellaId");
    expect(result).toHaveProperty("startTime");
    expect(result.rentalId).toMatch(/^rental-/);
    expect(result.umbrellaId).toBe("umbrella-station-001-5");
    expect(result.startTime).toBeDefined();
  });

  test("generates unique rentalIds", () => {
    const r1 = rentalStore.create("s1", "station-001", 1);
    const r2 = rentalStore.create("s2", "station-001", 2);
    expect(r1.rentalId).not.toBe(r2.rentalId);
  });

  test("umbrellaId format is stationId-slotNumber", () => {
    const result = rentalStore.create("s1", "station-002", 10);
    expect(result.umbrellaId).toBe("umbrella-station-002-10");
  });

  test("rental is retrievable by getById after create", () => {
    const { rentalId } = rentalStore.create("s1", "station-001", 3);
    const rental = rentalStore.getById(rentalId);
    expect(rental).toBeDefined();
    expect(rental.stationId).toBe("station-001");
    expect(rental.slotNumber).toBe(3);
    expect(rental.status).toBe("ACTIVE");
    expect(rental.sessionId).toBe("s1");
  });

  test("rental is active by session after create", () => {
    rentalStore.create("session-abc", "station-001", 1);
    const active = rentalStore.getActiveBySession("session-abc");
    expect(active).toBeDefined();
    expect(active.status).toBe("ACTIVE");
  });
});

describe("rentalStore.complete", () => {
  test("marks rental as COMPLETED", () => {
    const { rentalId } = rentalStore.create("s1", "station-001", 5);
    const updated = rentalStore.complete(rentalId, "station-002", 3);

    expect(updated).toBeDefined();
    expect(updated.status).toBe("COMPLETED");
    expect(updated.endTime).toBeDefined();
    expect(updated.returnStationId).toBe("station-002");
    expect(updated.returnSlotNumber).toBe(3);
  });

  test("removes from activeBySession", () => {
    const { rentalId } = rentalStore.create("s1", "station-001", 1);
    rentalStore.complete(rentalId, "station-002", 2);

    const active = rentalStore.getActiveBySession("s1");
    expect(active).toBeNull();
  });

  test("returns null for non-existent rentalId", () => {
    const result = rentalStore.complete("rental-fake", "station-001", 1);
    expect(result).toBeNull();
  });

  test("returns null when rental already completed", () => {
    const { rentalId } = rentalStore.create("s1", "station-001", 1);
    rentalStore.complete(rentalId, "station-002", 1);
    const secondComplete = rentalStore.complete(rentalId, "station-002", 2);
    expect(secondComplete).toBeNull();
  });
});

describe("rentalStore.getActiveBySession", () => {
  test("returns null when session has no active rental", () => {
    expect(rentalStore.getActiveBySession("no-such-session")).toBeNull();
  });

  test("returns active rental for session", () => {
    const { rentalId } = rentalStore.create("my-session", "station-001", 2);
    const active = rentalStore.getActiveBySession("my-session");
    expect(active.rentalId).toBe(rentalId);
  });
});

describe("rentalStore.getById", () => {
  test("returns null for unknown rentalId", () => {
    expect(rentalStore.getById("rental-unknown")).toBeNull();
  });
});

describe("rentalStore.clear", () => {
  test("removes all rentals", () => {
    const { rentalId } = rentalStore.create("s1", "station-001", 1);
    rentalStore.clear();
    expect(rentalStore.getById(rentalId)).toBeNull();
    expect(rentalStore.getActiveBySession("s1")).toBeNull();
  });
});
