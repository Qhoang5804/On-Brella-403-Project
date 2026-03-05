import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { adminGetReports, adminResolveReport } from "../../api/adminClient";
import { getStationDisplayName } from "../../utils/stationNames";

function formatTimeAgo(ts) {
  if (ts == null) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return formatDate(ts);
}

const TAB_CRITICAL = "critical";
const TAB_PENDING = "pending";
const TAB_RESOLVED = "resolved";

export function AdminReportsPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam === TAB_CRITICAL || tabParam === TAB_PENDING || tabParam === TAB_RESOLVED
      ? tabParam
      : TAB_PENDING;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await adminGetReports();
      setReports(res.reports || []);
    } catch (e) {
      setError(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openReports = useMemo(
    () => reports.filter((r) => r.status === "open"),
    [reports]
  );
  const resolvedReports = useMemo(
    () => reports.filter((r) => r.status === "resolved"),
    [reports]
  );

  const filtered = useMemo(() => {
    if (tab === TAB_CRITICAL || tab === TAB_PENDING) return openReports;
    return resolvedReports;
  }, [tab, openReports, resolvedReports]);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await adminResolveReport(id);
      await load();
    } catch (e) {
      setError(e.message || "Failed to resolve");
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        <button
          type="button"
          onClick={() => setTab(TAB_CRITICAL)}
          className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${
            tab === TAB_CRITICAL
              ? "bg-uw-primary text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Critical Only ({openReports.length})
        </button>
        <button
          type="button"
          onClick={() => setTab(TAB_PENDING)}
          className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
            tab === TAB_PENDING
              ? "bg-uw-primary text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Pending ({openReports.length})
        </button>
        <button
          type="button"
          onClick={() => setTab(TAB_RESOLVED)}
          className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
            tab === TAB_RESOLVED
              ? "bg-uw-primary text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Resolved ({resolvedReports.length})
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {tab !== TAB_RESOLVED && openReports.length > 0 && (
        <div className="py-2">
          <p className="text-[11px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Urgent Action Required
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          {tab === TAB_RESOLVED ? "No resolved reports." : "No open reports."}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const isOpen = r.status === "open";
            const isCritical = isOpen;
            return (
              <div
                key={r.id}
                className={`rounded-2xl p-4 border flex gap-4 items-start ${
                  isCritical
                    ? "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/40 ring-1 ring-rose-200 dark:ring-rose-900/20"
                    : "bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 shadow-sm"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isCritical
                      ? "bg-rose-100 dark:bg-rose-900/50 shadow-sm"
                      : "bg-purple-100 dark:bg-purple-900/30"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined font-bold ${
                      isCritical
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {isCritical ? "report" : "build"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {typeof r.message === "string" && r.message.length > 0
                        ? r.message
                        : `Report #${r.id}`}
                    </p>
                    {isOpen ? (
                      <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                        Critical
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {formatTimeAgo(r.resolvedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {r.stationId
                      ? `Station: ${getStationDisplayName(r.stationId)}`
                      : `Alert ID: #${r.id}`}
                    {r.message && r.stationId ? ` • ${r.message}` : ""}
                  </p>
                  {isOpen && (
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        disabled={resolvingId === r.id}
                        onClick={() => handleResolve(r.id)}
                        className="text-[11px] font-bold bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 disabled:opacity-50"
                      >
                        {resolvingId === r.id ? "Resolving…" : "Resolve"}
                      </button>
                      <button
                        type="button"
                        className="text-[11px] font-bold bg-white border border-rose-200 text-rose-700 px-3 py-1.5 rounded-lg dark:bg-transparent dark:border-rose-800 dark:text-rose-300"
                      >
                        View Logs
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full z-[60]" />
    </div>
  );
}
