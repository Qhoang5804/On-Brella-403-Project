/**
 * App config. Open/closed: extend with new keys without changing consumers.
 */
const devBackend = "http://localhost:5001";
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? devBackend : ""),
  sessionStorageKey: "onbrella_session_id",
  rentalStorageKey: "onbrella_active_rental",
  lastReturnStorageKey: "onbrella_last_return",
  /** UW Seattle default for map */
  defaultCenter: [47.6553, -122.3035],
  defaultZoom: 16,
  /** Pricing display (extensible: could come from API later) */
  unlockFeeCents: 100,
  centsPerMinute: 10,
};
