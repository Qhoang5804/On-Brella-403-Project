import { describe, it, expect, vi, beforeEach } from "vitest";
import * as adminClient from "../src/api/adminClient";

// we will mock global fetch

describe("adminClient", () => {
  beforeEach(() => {
    // stub adminRequest directly to avoid auth logic
    vi.spyOn(adminClient, "adminRequest").mockResolvedValue(null);
  });

  it("adminGetPricing proxies to adminRequest and returns data", async () => {
    const fake = { unlockFeeCents: 123, centsPerMinute: 45 };
    adminClient.adminRequest.mockResolvedValueOnce(fake);
    const result = await adminClient.adminGetPricing();
    expect(adminClient.adminRequest).toHaveBeenCalledWith("GET", "/api/admin/pricing");
    expect(result).toEqual(fake);
  });

  it("adminUpdatePricing proxies to adminRequest with body", async () => {
    const fake = { unlockFeeCents: 222, centsPerMinute: 33 };
    adminClient.adminRequest.mockResolvedValueOnce(fake);
    const result = await adminClient.adminUpdatePricing(222, 33);
    expect(adminClient.adminRequest).toHaveBeenCalledWith("PUT", "/api/admin/pricing", { unlockFeeCents: 222, centsPerMinute: 33 });
    expect(result).toEqual(fake);
  });
});