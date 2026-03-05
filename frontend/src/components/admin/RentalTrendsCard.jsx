/**
 * Rental trends graph card. Accepts rental times and shows trend (e.g. by hour).
 * No fetching — data passed via props.
 * @param {Array<string|number|Date>} rentalTimes - Array of rental timestamps (start times)
 * @param {string} [title] - Card title
 * @param {string} [periodLabel] - e.g. "Last 24 Hours"
 */
export function RentalTrendsCard({ rentalTimes = [], title = "Rental Trends", periodLabel = "Last 24 Hours" }) {
  const HOURS = 24;
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Bucket rental times by hour (0–23) for the last 24h
  const buckets = Array.from({ length: HOURS }, () => 0);
  rentalTimes.forEach((t) => {
    const d = t instanceof Date ? t : new Date(t);
    if (Number.isNaN(d.getTime())) return;
    const ts = d.getTime();
    if (ts < oneDayAgo || ts > now) return;
    const hourIndex = Math.floor((ts - oneDayAgo) / (60 * 60 * 1000));
    if (hourIndex >= 0 && hourIndex < HOURS) buckets[hourIndex]++;
  });

  const max = Math.max(1, ...buckets);

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-sm">{title}</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
          {periodLabel}
        </span>
      </div>
      <div className="flex items-end justify-between h-32 gap-0.5 px-1">
        {buckets.map((count, i) => (
          <div
            key={i}
            className="flex-1 min-w-0 rounded-t-sm bg-uw-primary/80 hover:bg-uw-primary transition-colors"
            style={{ height: `${(count / max) * 100}%`, minHeight: count ? "4px" : "0" }}
            title={`${count} rental(s)`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 px-1 text-[9px] text-slate-400 font-medium">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}
