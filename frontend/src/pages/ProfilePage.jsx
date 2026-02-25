/**
 * User Account Profile page. Placeholder user data; settings actions are no-op until backend/auth.
 * Profile picture can be set locally and is persisted in localStorage.
 * Rental history is loaded from the backend (completed rentals for current session).
 */
import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { config } from "../config";
import { supabase } from "@/lib/supabase/client"
import * as api from "../api/client";
import { useRental } from "../context/RentalContext";
import { getStationDisplayName } from "../utils/stationNames";
import { formatDurationShort } from "../utils/duration";
import { formatCost, computeRentalCostCents } from "../utils/cost";


const loadStoredProfileImage = () => {
  try {
    return localStorage.getItem(config.profileImageStorageKey) || null;
  } catch {
    return null;
  }
};

/** Format rental date for history: "Today, Oct 24" or "Oct 22, 2023" */
function formatHistoryDate(endTimeIso) {
  if (!endTimeIso) return "";
  const d = new Date(endTimeIso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) {
    return `Today, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ProfilePage() {
  // Placeholder until auth/user API exists
  const user = {
    name: "Mr. Test",
    email: "test.me@email.com",
  };

  const navigate = useNavigate();

  const [profileImageUrl, setProfileImageUrl] = useState(loadStoredProfileImage);
  const fileInputRef = useRef(null);
  const [historyRentals, setHistoryRentals] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const { lastReturnSummary } = useRental();


  useEffect(() => {
    api
      .getRentalHistory()
      .then((data) => setHistoryRentals(data.rentals || []))
      .catch(() => setHistoryRentals([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleEditPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setProfileImageUrl(dataUrl);
      try {
        localStorage.setItem(config.profileImageStorageKey, dataUrl);
      } catch (_) {}
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    setProfileImageUrl(null);
    try {
      localStorage.removeItem(config.profileImageStorageKey);
    } catch (_) {}
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  const handlePersonalInfo = () => {
    // TODO: navigate to personal info or open modal
  };

  const handlePaymentMethods = () => {
    // TODO: navigate to payment methods
  };

  const handleNotificationSettings = () => {
    // TODO: navigate to notification settings
  };

  const handleHelpSupport = () => {
    // TODO: navigate to help or open link
  };

  const handleLogOut = async () => {
    try {
      // Immediate UI response: move user to login right away
      navigate("/login", { replace: true });

      // Then sign out in the background
      await supabase.auth.signOut();
    } catch (e) {
      // If something fails, at least user is off protected screens
      console.error("Logout failed:", e);
    }
  };

  const handleRentalHistory = () => {
    navigate("/profile/history");
  };

  const menuItems = [
    {
      label: "Personal Information",
      icon: "person",
      iconBg: "bg-blue-50 dark:bg-blue-900/20 text-blue-500",
      onClick: handlePersonalInfo,
    },
    {
      label: "Payment Methods",
      icon: "payments",
      iconBg: "bg-green-50 dark:bg-green-900/20 text-green-500",
      onClick: handlePaymentMethods,
    },
    {
      label: "Notification Settings",
      icon: "notifications",
      iconBg: "bg-amber-50 dark:bg-amber-900/20 text-amber-500",
      onClick: handleNotificationSettings,
    },
    {
      label: "Help & Support",
      icon: "help",
      iconBg: "bg-purple-50 dark:bg-purple-900/20 text-purple-500",
      onClick: handleHelpSupport,
    },
    {
      label: "Rental history",
      sublabel: "View past rentals",
      icon: "history",
      iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
      onClick: handleRentalHistory,
    },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <main className="flex-1 w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-28 sm:pb-32 md:pb-36 overflow-y-auto">
        {/* Back to map */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-medium text-sm mb-4"
        >
          <span className="material-icons text-lg">arrow_back</span>
          Back to map
        </Link>
        {/* Profile header */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 md:mb-10">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            aria-hidden
            onChange={handleFileChange}
          />
          <div className="relative mb-3 sm:mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border-2 sm:border-4 border-white dark:border-slate-900 shadow-lg">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-4xl sm:text-5xl md:text-6xl text-slate-400 dark:text-slate-600">
                  person
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleEditPhoto}
              className="absolute bottom-0 right-0 bg-primary text-white p-1 sm:p-1.5 rounded-full shadow-md border-2 border-white dark:border-slate-900 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              aria-label="Edit profile photo"
            >
              <span className="material-symbols-outlined text-xs sm:text-sm block">edit</span>
            </button>
          </div>
          {profileImageUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 underline mb-1 cursor-pointer"
            >
              Remove photo
            </button>
          )}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-center break-words max-w-full px-2">
            {user.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base text-center break-all max-w-full px-2 mt-0.5">
            {user.email}
          </p>
        </div>

        {/* Settings card */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center justify-between p-3 sm:p-4 md:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition-colors text-left cursor-pointer ${
                  index < menuItems.length - 1
                    ? "border-b border-slate-100 dark:border-slate-800"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 ${item.iconBg} rounded-lg sm:rounded-xl flex items-center justify-center`}
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">{item.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-white truncate text-sm sm:text-base block">
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm block truncate">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 flex-shrink-0 ml-2">chevron_right</span>
              </button>
            ))}
          </div>

          {/* Recent rentals preview — full list on History page */}
          <div className="space-y-4" id="rental-history">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent rentals</h2>
              <button
                type="button"
                onClick={handleRentalHistory}
                className="text-sm font-semibold text-primary hover:underline cursor-pointer"
              >
                See all
              </button>
            </div>
            {historyLoading ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                Loading history…
              </div>
            ) : (() => {
              // Merge last return from context (sessionStorage) so user sees it even when API is empty or DB is down
              const lastAsRental = lastReturnSummary
                ? {
                    rentalId: lastReturnSummary.rentalId,
                    startTime: new Date(
                      new Date(lastReturnSummary.endTime).getTime() - lastReturnSummary.durationMs
                    ).toISOString(),
                    endTime: lastReturnSummary.endTime,
                    stationId: lastReturnSummary.pickUpStationId,
                    returnStationId: lastReturnSummary.returnStationId,
                  }
                : null;
              const fromApi = historyRentals.filter(
                (r) => !lastReturnSummary || r.rentalId !== lastReturnSummary.rentalId
              );
              const displayRentals = lastAsRental ? [lastAsRental, ...fromApi] : fromApi;

              if (displayRentals.length === 0) {
                return (
                  <button
                    type="button"
                    onClick={handleRentalHistory}
                    className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">history</span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary">
                        Rental history
                      </h3>
                      <span className="material-symbols-outlined text-slate-400 ml-auto group-hover:text-primary">chevron_right</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Your rental history will appear here. When you have completed rentals, they will show with duration, cost, and return location.
                    </p>
                    <p className="text-primary text-sm font-semibold mt-2">View history page →</p>
                  </button>
                );
              }

              return (
              <div className="space-y-4">
                {displayRentals.map((rental) => {
                  const startMs = rental.startTime ? new Date(rental.startTime).getTime() : 0;
                  const endMs = rental.endTime ? new Date(rental.endTime).getTime() : 0;
                  const durationMs = Math.max(0, endMs - startMs);
                  const costCents = computeRentalCostCents(durationMs);
                  const pickupName = getStationDisplayName(rental.stationId);
                  const returnName = getStationDisplayName(rental.returnStationId || rental.stationId);
                  return (
                    <div
                      key={rental.rentalId}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {formatHistoryDate(rental.endTime)}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {formatCost(costCents)}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700" />
                            <div className="w-2 h-2 rounded-full border-2 border-primary" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                                Picked up
                              </p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {pickupName}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                                Returned
                              </p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {returnName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                              Duration
                            </p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {formatDurationShort(durationMs)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              );
            })()}
          </div>

          <button
            type="button"
            onClick={handleLogOut}
            className="w-full bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 text-red-500 font-bold shadow-sm hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-[0.98] transition-all text-sm sm:text-base cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">logout</span>
            Log Out
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-600 pt-2 sm:pt-4 font-medium">
            Version 2.4.0 (Build 882)
          </p>
        </div>
      </main>
    </div>
  );
}