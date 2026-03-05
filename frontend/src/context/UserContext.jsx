/**
 * UserContext — Supabase auth + profile data for the app.
 *
 * On session change, fetches profile from Supabase (profiles table, or user table fallback).
 * Exposes: user, loading, error, updateUser (async, persists to Supabase), resetUser, refreshUser.
 * Profile fields: id, name, email, description, avatarUrl, role ('user' | 'admin').
 * Admin role: from profiles.role === 'admin' OR hardcoded admin email (config.adminEmail).
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { config } from "@/config";

const UserContext = createContext(null);

/** If profiles fetch failed for this user id, skip calling the API again (reduces 404 noise when table is missing). */
let skipProfilesForUserId = null;

/** True if email is the hardcoded admin email (case-insensitive). */
function isAdminEmail(email) {
  if (!email || !config.adminEmail) return false;
  return email.trim().toLowerCase() === config.adminEmail.trim().toLowerCase();
}

/** Build app profile shape from Supabase auth user; prefers profiles table then auth-only. */
async function fetchProfileForUser(authUser) {
  if (!authUser) return null;

  const authId = authUser.id;
  const authEmail = authUser.email || authUser.user_metadata?.email || "";
  const authName =
    authUser.user_metadata?.name ||
    authUser.user_metadata?.full_name ||
    authEmail.split("@")[0] ||
    "Account";

  const fallbackProfile = () => {
    const role = isAdminEmail(authEmail) ? "admin" : "user";
    return {
      id: authId,
      email: authEmail,
      name: authName,
      description: "",
      avatarUrl: null,
      role,
    };
  };

  // Skip profiles API if we already failed once (e.g. table missing) to avoid repeated 404s
  if (skipProfilesForUserId === authId) {
    return fallbackProfile();
  }

  // Try `profiles` table. maybeSingle() avoids 404 when table exists but no row.
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error("No profile row");
    }

    return {
      id: authId,
      email: data.email || authEmail,
      name: data.full_name || data.name || authName,
      description: data.bio || "",
      avatarUrl: data.avatar_url || null,
      role: data.role === "admin" || isAdminEmail(data.email || authEmail) ? "admin" : "user",
    };
  } catch {
    skipProfilesForUserId = authId;
    return fallbackProfile();
  }
}

/** Upsert current user profile to Supabase profiles table (id, full_name, email, bio, avatar_url). */
async function persistProfile(profile) {
  if (!profile?.id) return;

  const payload = {
    id: profile.id,
    email: profile.email || null,
    full_name: profile.name || null,
    bio: profile.description || null,
    avatar_url: profile.avatarUrl || null,
  };

  // Upsert into `profiles` table; ignore errors for now (caller handles)
  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) {
    throw error;
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        skipProfilesForUserId = null;
        setUser(null);
        setLoading(false);
        return;
      }

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;

      const profile = await fetchProfileForUser(authUser);
      setUser(profile);
    } catch (err) {
      const isSessionMissing =
        err?.name === "AuthSessionMissingError" ||
        err?.message?.includes("Auth session missing");
      if (isSessionMissing) {
        setUser(null);
        setError(null);
      } else {
        // eslint-disable-next-line no-console
        console.error("Failed to load user profile:", err);
        setError(err.message || "Failed to load profile");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadUser();
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (cancelled) return;
        if (!session) {
          setUser(null);
          setError(null);
          setLoading(false);
        } else {
          loadUser();
        }
      }
    );

    return () => {
      cancelled = true;
      if (subscription?.subscription) {
        subscription.subscription.unsubscribe();
      }
    };
  }, [loadUser]);

  const updateUser = useCallback(
    async (partial) => {
      if (!user) {
        throw new Error("No authenticated user");
      }

      const next = { ...user, ...partial };

      // Optimistic update
      setUser(next);
      try {
        await persistProfile(next);
      } catch (err) {
        // Roll back on failure
        setUser(user);
        // eslint-disable-next-line no-console
        console.error("Failed to save user profile:", err);
        throw err;
      }
    },
    [user]
  );

  const resetUser = useCallback(() => {
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    error,
    updateUser,
    resetUser,
    refreshUser: loadUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
