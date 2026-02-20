import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRental } from "../context/RentalContext";
import { formatDurationFromStart } from "../utils/duration";
import { getStationDisplayName } from "../utils/stationNames";

export function ActivePage() {
  const navigate = useNavigate();
  const { activeRental, endRental } = useRental();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState("00:00:00");

  const hasValidRental = activeRental && typeof activeRental === "object" && activeRental.startTime;

  useEffect(() => {
    if (!hasValidRental) return;
    const tick = () => setDuration(formatDurationFromStart(activeRental.startTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hasValidRental, activeRental?.startTime]);

  if (!hasValidRental) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-icons text-4xl text-slate-400">umbrella</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white text-center">
            No active rental
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center max-w-xs">
            Scan a QR code at a station to rent an umbrella, or go back to the map.
          </p>
          <div className="w-full max-w-sm mt-10 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-icons text-xl">map</span>
              View Map
            </button>
            <button
              type="button"
              onClick={() => navigate("/scan")}
              className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/5 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
              Scan to Rent
            </button>
          </div>
        </main>
      </div>
    );
  }

  const pickUpName = getStationDisplayName(activeRental.stationId);
  const circumference = 2 * Math.PI * 90;
  const elapsed = (Date.now() - new Date(activeRental.startTime).getTime()) / 1000;
  const maxSeconds = 24 * 3600;
  const progress = Math.min(1, elapsed / maxSeconds);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <main className="flex-1 flex flex-col items-center px-6 pt-12 pb-32">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Rental Active
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Enjoy your journey!
          </h1>
        </div>

        <div className="relative w-72 h-72 flex items-center justify-center mb-12">
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              className="text-slate-100 dark:text-slate-800"
              cx="100"
              cy="100"
              fill="none"
              r="90"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle
              className="transition-all duration-1000 text-primary"
              cx="100"
              cy="100"
              fill="none"
              r="90"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transformOrigin: "50% 50%" }}
            />
          </svg>
          <div className="flex flex-col items-center z-10">
            <span className="text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {duration}
            </span>
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">
              Duration
            </span>
          </div>
          <div className="absolute inset-4 rounded-full bg-primary/5 -z-10" />
        </div>

        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">tag</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Umbrella ID
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  #{activeRental.umbrellaId?.replace("umbrella-", "") || "—"}
                </p>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">location_on</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Pick-up
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{pickUpName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm mt-auto pb-6 pt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-icons text-xl">map</span>
            View Map
          </button>
          <button
            type="button"
            onClick={async () => {
              if (status === "loading") return;
              if (!activeRental) return;
              setError(null);
              setStatus("loading");
              try {
                // End rental using original pickup station as fallback.
                await endRental(activeRental.stationId, 0);
                navigate("/thank-you", { replace: true });
              } catch (e) {
                setError(e?.message || "Failed to end rental");
                setStatus("idle");
              }
            }}
            disabled={status === "loading"}
            className={`w-full ${status === "loading" ? "opacity-70 pointer-events-none" : ""} bg-transparent border-2 border-primary text-primary hover:bg-primary/5 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
          >
            <span className="material-symbols-outlined text-xl">keyboard_return</span>
            {status === "loading" ? "Returning…" : "Return Umbrella"}
          </button>
          {error && (
            <p className="text-sm text-center text-red-500 mt-2">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
