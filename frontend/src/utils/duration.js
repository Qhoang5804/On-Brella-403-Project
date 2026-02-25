/**
 * Duration formatting. Open/closed: add other formats without changing callers.
 */
export function formatDurationMs(ms) {
  if (ms == null || ms < 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatDurationFromStart(startTimeIso) {
  const start = new Date(startTimeIso).getTime();
  const now = Date.now();
  return formatDurationMs(now - start);
}

/**
 * Short label for rental history: "1h 20m", "45m", "22m".
 */
export function formatDurationShort(ms) {
  if (ms == null || ms < 0) return "0m";
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
