/**
 * UserContext — Supabase auth + profile data for the app.
 *
 * On session change, fetches profile from Supabase (profiles table, or user table fallback).
 * Exposes: user, loading, error, updateUser (async, persists to Supabase), resetUser, refreshUser.
 * Profile fields: id, name, email, description, avatarUrl.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const UserContext = createContext(null);

/** Build app profile shape from Supabase auth user; prefers profiles table then user table. */
async function fetchProfileForUser(authUser) {
  if (!authUser) return null;

  const authId = authUser.id;
  const authEmail = authUser.email || authUser.user_metadata?.email || "";
  const authName =
    authUser.user_metadata?.name ||
    authUser.user_metadata?.full_name ||
    authEmail.split("@")[0] ||
    "Account";

  // Try `profiles` table first (recommended Supabase pattern)
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authId)
      .single();

    if (error) throw error;

    return {
      id: authId,
      email: data.email || authEmail,
      name: data.full_name || data.name || authName,
      description: data.bio || "",
      avatarUrl: data.avatar_url || null,
    };
  } catch {
    // Fallback to `user` table shape described in README, if present
    try {
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("user_id", authId)
        .single();

      if (error) throw error;

      return {
        id: authId,
        email: data.email || authEmail,
        name: data.name || authName,
        description: "",
        avatarUrl: data.avatar_url || null,
      };
    } catch {
      // Graceful fallback to auth-only identity
      return {
        id: authId,
        email: authEmail,
        name: authName,
        description: "",
        avatarUrl: null,
      };
    }
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
      // eslint-disable-next-line no-console
      console.error("Failed to load user profile:", err);
      setError(err.message || "Failed to load profile");
      setUser(null);
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
