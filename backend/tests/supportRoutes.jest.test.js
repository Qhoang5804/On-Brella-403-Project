const express = require("express");
const request = require("supertest");

jest.mock("../src/middleware/requireAuth", () => ({
  requireAuth: (req, _res, next) => {
    req.user = { id: "user-123", email: "user@example.com" };
    next();
  },
}));

jest.mock("../src/store/supportRequestStoreDb", () => ({
  create: jest.fn(),
}));

const supportRequestStore = require("../src/store/supportRequestStoreDb");
const supportRouter = require("../src/routes/support");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/support", supportRouter);
  return app;
}

describe("support routes", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/support/requests creates a critical support request", async () => {
    supportRequestStore.create.mockResolvedValue({
      id: "support-1",
      reason: "app_issue",
      reasonLabel: "App Issue",
      details: "Submit button is stuck",
      severity: "critical",
      status: "open",
      userId: "user-123",
    });

    const res = await request(app)
      .post("/api/support/requests")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer fake-token")
      .set("X-Session-Id", "web-session-1")
      .send({
        reason: "app_issue",
        details: "Submit button is stuck",
      });

    expect(res.status).toBe(201);
    expect(supportRequestStore.create).toHaveBeenCalledWith({
      userId: "user-123",
      userEmail: "user@example.com",
      sessionId: "web-session-1",
      reason: "app_issue",
      details: "Submit button is stuck",
    });
    expect(res.body.supportRequest.severity).toBe("critical");
  });

  test("POST /api/support/requests marks 'other' as non-critical", async () => {
    supportRequestStore.create.mockResolvedValue({
      id: "support-2",
      reason: "other",
      reasonLabel: "Other",
      details: "A general suggestion",
      severity: "non_critical",
      status: "open",
      userId: "user-123",
    });

    const res = await request(app)
      .post("/api/support/requests")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer fake-token")
      .set("X-Session-Id", "web-session-2")
      .send({
        reason: "other",
        details: "A general suggestion",
      });

    expect(res.status).toBe(201);
    expect(supportRequestStore.create).toHaveBeenCalledWith({
      userId: "user-123",
      userEmail: "user@example.com",
      sessionId: "web-session-2",
      reason: "other",
      details: "A general suggestion",
    });
    expect(res.body.supportRequest.severity).toBe("non_critical");
  });

  test("POST /api/support/requests requires details when reason is other", async () => {
    const res = await request(app)
      .post("/api/support/requests")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer fake-token")
      .send({
        reason: "other",
        details: "   ",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/provide more details/i);
    expect(supportRequestStore.create).not.toHaveBeenCalled();
  });
});
