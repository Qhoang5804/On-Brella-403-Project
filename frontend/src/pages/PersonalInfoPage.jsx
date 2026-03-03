import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { config } from "../config";
import { supabase } from "@/lib/supabase/client";

const AVATAR_BUCKET = "avatars";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email }) {
  const errors = {};
  if (!name || !String(name).trim()) errors.name = "Name is required.";
  if (!email || !String(email).trim()) errors.email = "Email is required.";
  else if (!emailRegex.test(String(email).trim())) errors.email = "Please enter a valid email address.";
  return errors;
}

/**
 * Personal Information page — edit name, bio, email. Persists via UserContext (Supabase profiles).
 *
 * Layout: Back to account link, avatar (upload to Supabase Storage), About card (name, bio),
 * Contact card (email), Save Changes. Validation on name and email before save.
 */
export function PersonalInfoPage() {
  const { user, loading, updateUser } = useUser();
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    description: "",
  });

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name ?? "",
        email: user.email ?? "",
        description: user.description ?? "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    const errors = validate(editData);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      await updateUser({
        name: String(editData.name).trim(),
        email: String(editData.email).trim(),
        description: String(editData.description ?? "").trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save personal info:", err);
      setSaveError(err.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setSaveError(null);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user?.id) return;
    if (!file.type.startsWith("image/")) return;
    const allowed = config.allowedAvatarTypes || ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) return;
    const maxBytes = config.maxAvatarSizeBytes ?? 5 * 1024 * 1024;
    if (file.size > maxBytes) return;

    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { cacheControl: "3600", upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      await updateUser({ avatarUrl: urlData.publicUrl });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setSaveError(err.message || "Failed to upload photo.");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
        <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-12">
          <div className="h-6 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mb-6" />
          <div className="flex flex-col items-center mb-8">
            <div className="w-28 h-28 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="h-12 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </main>
      </div>
    );
  }

  const avatarUrl = user.avatarUrl || null;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden">
      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-12 overflow-y-auto">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-medium text-sm mb-4 -ml-1 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">chevron_left</span>
          Back to account
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 px-1">Personal Information</h1>

        <div className="flex flex-col items-center mb-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-hidden
            onChange={handleAvatarFile}
          />
          <div className="relative">
            <div className="w-28 h-28 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-900 shadow-sm">
              {avatarUploading ? (
                <span className="material-symbols-outlined text-5xl text-slate-400 animate-pulse">cloud_upload</span>
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-600">person</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={avatarUploading}
              className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-900 flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60"
              aria-label="Change photo"
            >
              <span className="material-symbols-outlined text-base">photo_camera</span>
            </button>
          </div>
        </div>

        {saveError && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{saveError}</p>
          </div>
        )}
        {saveSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">Saved.</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 px-1 text-slate-900 dark:text-slate-100">About</h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center px-4 py-4 border-b border-slate-50 dark:border-slate-800">
              <span className="material-symbols-outlined text-slate-900 dark:text-slate-100 mr-4">person</span>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Full name"
                className="flex-1 bg-transparent border-none p-0 text-[17px] font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 focus:outline-none min-w-0"
              />
            </div>
            <div className="flex items-center px-4 py-4">
              <span className="material-symbols-outlined text-slate-900 dark:text-slate-100 mr-4 shrink-0">home</span>
              <input
                type="text"
                value={editData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Short bio or location"
                className="flex-1 bg-transparent border-none p-0 text-[17px] font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 focus:outline-none min-w-0"
              />
            </div>
          </div>
          {fieldErrors.name && <p className="text-sm text-red-500 mt-1 px-1">{fieldErrors.name}</p>}
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 px-1 text-slate-900 dark:text-slate-100">Contact</h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center px-4 py-4">
              <span className="material-symbols-outlined text-slate-900 dark:text-slate-100 mr-4 shrink-0">mail</span>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Email address"
                className="flex-1 bg-transparent border-none p-0 text-[17px] font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 focus:outline-none min-w-0"
              />
            </div>
          </div>
          {fieldErrors.email && <p className="text-sm text-red-500 mt-1 px-1">{fieldErrors.email}</p>}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </button>

        <div className="h-8" />
      </main>

      <div className="w-full max-w-md mx-auto flex justify-center pb-2 bg-background-light dark:bg-background-dark pt-2">
        <div className="w-32 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
      </div>
    </div>
  );
}
