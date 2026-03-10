/**
 * requireAdmin — Verifies Supabase JWT, then allows access if user email is hardcoded admin
 * or profiles.role === 'admin'. Expects Authorization: Bearer <access_token>. Sets req.adminUserId.
 * Responds 401 when missing/invalid token, 403 when not admin.
 */
const { createClient } = require("@supabase/supabase-js");
const db = require("../db");

// Strip trailing slash so Supabase client works (dashboard copies URL with / sometimes)
const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseUrl = typeof rawUrl === "string" ? rawUrl.replace(/\/+$/, "") : "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Hardcoded admin email (backend). Override with env ADMIN_EMAIL. Case-insensitive. */
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@onbrella.com").trim().toLowerCase();

function isAdminEmail(email) {
  if (!email || typeof email !== "string") return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

let supabase = null;
function getSupabase() {
  if (!supabase && supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

  if (!token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const client = getSupabase();
  if (!client) {
    return res.status(503).json({
      error:
        "Admin auth not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env (use your Supabase project URL and Project Settings → API → service_role key). See docs/admin-setup.md.",
    });
  }

  try {
    const result = await client.auth.getUser(token);
    const user = result?.data?.user ?? null;
    const error = result?.error ?? null;

    if (error || !user?.id) {
      if (error?.message) {
        console.warn(
          "Admin token verification failed:",
          error.message,
          "— Ensure SUPABASE_SERVICE_ROLE_KEY is from the same project as SUPABASE_URL (check project ref in dashboard URL)."
        );
      }
      const message =
        error?.message?.toLowerCase().includes("expired")
          ? "Token expired. Please log in again."
          : "Invalid or expired token";
      return res.status(401).json({ error: message });
    }

    // Allow if hardcoded admin email (no DB required) or profiles.role === 'admin'
    if (isAdminEmail(user.email)) {
      req.adminUserId = user.id;
      return next();
    }

    try {
      const { rows } = await db.query(
        "SELECT role FROM profiles WHERE id = $1 LIMIT 1",
        [user.id]
      );
      if (rows[0]?.role === "admin") {
        req.adminUserId = user.id;
        return next();
      }
    } catch {
      /* ignore DB errors, fall through to 403 */
    }

    res.status(403).json({ error: "Admin access required" });
  } catch (err) {
    console.error("requireAdmin error:", err);
    res.status(500).json({ error: "Authorization check failed" });
  }
}

module.exports = { requireAdmin, getSupabase };
