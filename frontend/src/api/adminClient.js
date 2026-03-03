/**
 * Admin API client. Sends Supabase session as Bearer token; backend verifies and checks admin role.
 */
import { supabase } from "@/lib/supabase/client";
import { config } from "../config";

const base = config.apiBaseUrl || "";

async function getAccessToken() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error("Not authenticated");
  }
  return session.access_token;
}

/**
 * Request to an admin-only endpoint. Adds Authorization: Bearer <access_token>.
 * Throws on non-OK or when not authenticated.
 */
async function adminRequest(method, path, body = null) {
  const token = await getAccessToken();
  const url = `${base}${path}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const options = { method, headers };
  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || "Request failed");
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

/**
 * @returns {Promise<{ usersCount: number, reportsCount: number, openReportsCount: number, activeRentalsCount: number }>}
 */
export async function adminGetStats() {
  return adminRequest("GET", "/api/admin/stats");
}

/**
 * @returns {Promise<{ users: Array<{ id: string, email: string, full_name: string, role: string }> }>}
 */
export async function adminGetUsers() {
  return adminRequest("GET", "/api/admin/users");
}

/**
 * @returns {Promise<{ reports: Array }>}
 */
export async function adminGetReports() {
  return adminRequest("GET", "/api/admin/reports");
}

/**
 * @param {string} reportId
 * @returns {Promise<{ report: object }>}
 */
export async function adminResolveReport(reportId) {
  return adminRequest("POST", `/api/admin/reports/${encodeURIComponent(reportId)}/resolve`);
}
