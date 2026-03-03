import { useCallback, useEffect, useState, useMemo } from "react";
import { adminGetReports, adminResolveReport } from "../../api/adminClient";

function formatDate(ts) {
  if (ts == null) return "—";
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

const TAB_OPEN = "open";
const TAB_RESOLVED = "resolved";

export function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [tab, setTab] = useState(TAB_OPEN);
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(() => {
    let list = reports.filter((r) => r.status === tab);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          String(r.id).toLowerCase().includes(q) ||
          (r.message || "").toLowerCase().includes(q) ||
          (r.stationId || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [reports, tab, search]);

  const openCount = reports.filter((r) => r.status === "open").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

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
        <p className="text-slate-500 dark:text-slate-400">Loading reports…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID or message..."
          className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setTab(TAB_OPEN)}
          className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            tab === TAB_OPEN
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          }`}
        >
          Open ({openCount})
        </button>
        <button
          type="button"
          onClick={() => setTab(TAB_RESOLVED)}
          className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            tab === TAB_RESOLVED
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 pb-8">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            {tab === TAB_OPEN ? "No open reports." : "No resolved reports."}
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
                r.status === "resolved" ? "opacity-90" : ""
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Issue ID: #{r.id}
                    </p>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {typeof r.message === "string" && r.message.length > 0
                        ? r.message.slice(0, 50) + (r.message.length > 50 ? "…" : "")
                        : `Report #${r.id}`}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      r.status === "resolved"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-1">
                      Details
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {r.message || "No message provided."}
                    </p>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span className="text-[11px] font-medium">
                        Created: {formatDate(r.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {r.status === "open" && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button
                    type="button"
                    disabled={resolvingId === r.id}
                    onClick={() => handleResolve(r.id)}
                    className="flex-1 bg-primary text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide active:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    {resolvingId === r.id ? "Resolving…" : "Resolve"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
