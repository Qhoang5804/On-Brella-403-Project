import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

/**
 * Personal Information page - allows users to view and edit their name, email, and description.
 */
export function PersonalInfoPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState(user);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Send updated user data to backend API
      // await api.updateUserProfile(editData);
      updateUser(editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save personal info:", error);
      // TODO: Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(user);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <main className="flex-1 w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-medium text-sm"
          >
            <span className="material-icons text-lg">arrow_back</span>
            Back
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-primary font-semibold text-sm hover:opacity-80 active:scale-95 transition-all"
            >
              Edit
            </button>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6 sm:mb-8">
          Personal Information
        </h1>

        {/* Information Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 md:p-7 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., John Smith"
                />
              ) : (
                <p className="text-slate-900 dark:text-white text-base font-medium">{user.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., john@example.com"
                />
              ) : (
                <p className="text-slate-900 dark:text-white text-base font-medium break-all">{user.email}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Bio / Description
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="e.g., Frequent commuter, umbrella enthusiast, bike rider"
                  rows="4"
                />
              ) : (
                <p className="text-slate-900 dark:text-white text-base font-medium whitespace-pre-wrap">
                  {user.description || "No description added yet"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg sm:rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg sm:rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
