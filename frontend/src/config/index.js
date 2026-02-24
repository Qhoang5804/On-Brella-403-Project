/**
 * App config. Open/closed: extend with new keys without changing consumers.
 */
const devBackend = "http://localhost:5001";
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? devBackend : ""),
  sessionStorageKey: "onbrella_session_id",
  rentalStorageKey: "onbrella_active_rental",
  lastReturnStorageKey: "onbrella_last_return",
  profileImageStorageKey: "onbrella_profile_image",
  /** UW Seattle default for map */
  defaultCenter: [47.6553, -122.3035],
  defaultZoom: 16,
  /**
   * Map tile theme: 'dark' | 'grayscale' | 'light'
   * - dark: CartoDB Dark Matter (dark theme, matches app)
   * - grayscale: OpenStreetMap with B&W filter
   * - light: CartoDB Positron (minimal light)
   */
  mapTheme: "dark",
  /** Pricing display (extensible: could come from API later) */
  unlockFeeCents: 100,
  centsPerMinute: 10,
};
