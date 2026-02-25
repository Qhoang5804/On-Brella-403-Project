/**
 * Rental history page. Shows completed rentals from API + last return from context.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as api from "../api/client";
import { useRental } from "../context/RentalContext";
import { getStationDisplayName } from "../utils/stationNames";
import { formatDurationShort } from "../utils/duration";
import { formatCost, computeRentalCostCents } from "../utils/cost";

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

export function HistoryPage() {
  const [historyRentals, setHistoryRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastReturnSummary } = useRental();

  useEffect(() => {
    api
      .getRentalHistory()
      .then((data) => setHistoryRentals(data.rentals || []))
      .catch(() => setHistoryRentals([]))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 pt-4 pb-28 overflow-y-auto">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary font-medium text-sm mb-4"
        >
          <span className="material-icons text-lg">arrow_back</span>
          Back to Account
        </Link>
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white px-1">
            Rental History
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm px-1 mt-0.5">
            Your past 30 days of activity
          </p>
        </header>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            Loading history…
          </div>
        ) : displayRentals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            Your rental history will appear here. Complete a rental and return an umbrella to see it here.
          </div>
        ) : (
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
                    <span className="text-sm font-bold text-primary">{formatCost(costCents)}</span>
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
        )}
      </main>
    </div>
  );
}
