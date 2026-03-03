import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminGetStats } from "../../api/adminClient";
import { getStations } from "../../api/client";
import { getStationDisplayName } from "../../utils/stationNames";

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    usersCount: null,
    openReportsCount: null,
    activeRentalsCount: null,
  });
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, stationsRes] = await Promise.all([
          adminGetStats(),
          getStations().catch(() => ({ stations: [] })),
        ]);
        if (cancelled) return;
        setStats({
          usersCount: statsRes.usersCount ?? 0,
          openReportsCount: statsRes.openReportsCount ?? 0,
          activeRentalsCount: statsRes.activeRentalsCount ?? 0,
        });
        setStations(stationsRes.stations || []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-800 p-4 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-primary/30 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Total Users
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.usersCount !== null ? stats.usersCount.toLocaleString() : "…"}
            </h2>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center">
              <span className="material-symbols-outlined text-[12px] mr-1">group</span>
              View directory
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">group</span>
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-primary/30 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Open Reports
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.openReportsCount !== null ? stats.openReportsCount : "…"}
            </h2>
            <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium mt-1">
              {stats.openReportsCount > 0 ? "Requires attention" : "All clear"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 dark:text-rose-400">
            <span className="material-symbols-outlined">report</span>
          </div>
        </Link>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Active Rentals
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.activeRentalsCount !== null ? stats.activeRentalsCount : "…"}
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              Across {stations.length} station(s)
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">umbrella</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white">Recent Activity</h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Live feed coming soon
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="text-xs">
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  No recent activity to display.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white px-1">
          UW Managed Locations
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {stations.length === 0 ? (
            <p className="col-span-full text-sm text-slate-500 dark:text-slate-400 py-4">
              No stations loaded. Start the backend and hardware mock to see stations.
            </p>
          ) : (
            stations.slice(0, 8).map((s) => (
              <div
                key={s.stationId}
                className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">
                  {getStationDisplayName(s.stationId)}
                </p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {s.numUmbrellas != null
                    ? `${s.numUmbrellas} available`
                    : s.capacity != null
                      ? `Capacity ${s.capacity}`
                      : "—"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
