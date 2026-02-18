import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api/client";
import { config } from "../config";
import { getStationDisplayName } from "../utils/stationNames";
import { StationMap } from "../components/StationMap";
import { StationBottomSheet } from "../components/StationBottomSheet";

export function MapPage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const mapRef = useRef(null);

  const loadStations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStations();
      setStations(data.stations || []);
    } catch (e) {
      setError(e.message || "Failed to load stations");
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  useEffect(() => {
    if (searchExpanded) searchInputRef.current?.focus();
  }, [searchExpanded]);

  const filteredStations = searchQuery.trim()
    ? stations.filter(
        (s) =>
          getStationDisplayName(s.stationId).toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.stationId || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stations;

  const goToScan = () => navigate("/scan", { state: { mode: "rent" } });
  const goToMyLocation = () => mapRef.current?.goToUser?.();
  const centerNearestStation = () => {
    if (!navigator.geolocation || !stations || stations.length === 0) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let best = null;
        let bestD = Infinity;
        for (const s of stations) {
          const slat = s.location?.latitude;
          const slng = s.location?.longitude;
          if (slat == null || slng == null) continue;
          const d = (slat - lat) * (slat - lat) + (slng - lng) * (slng - lng);
          if (d < bestD) {
            bestD = d;
            best = [slat, slng];
          }
        }
        if (best) mapRef.current?.setView?.(best);
      },
      () => {}
    );
  };

  return (
    <div className="map-container relative h-[100dvh] bg-background-dark">
      <StationMap
        stations={filteredStations}
        selectedStationId={selectedStation?.stationId}
        onSelectStation={setSelectedStation}
        mapRef={mapRef}
      />

      <div className="absolute top-4 right-4 z-10">
        <div
          className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center border border-slate-100 dark:border-slate-700 transition-all duration-300 origin-right overflow-hidden ${
            searchExpanded ? "w-80 px-3 py-2" : "w-12 h-12 p-2"
          }`}
        >
          <button
            type="button"
            onClick={() => setSearchExpanded((s) => !s)}
            className="flex items-center justify-center w-8 h-8 rounded-md"
            aria-label="Open search"
          >
            <span className="material-icons text-slate-700 dark:text-white">search</span>
          </button>

          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search nearby..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              if (!searchQuery) setSearchExpanded(false);
            }}
            className={`bg-transparent border-none focus:outline-none focus:ring-0 ml-2 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 ${
              searchExpanded ? "block w-full" : "hidden"
            }`}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2 bg-white/90 dark:bg-slate-800/90 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
      </div>

      {/* Scan and Find station (GPS) buttons above navbar; small padding between row and nav */}
      <div className="fixed bottom-24 left-0 right-0 z-20 px-4 pb-3 flex gap-3">
        <button
          type="button"
          onClick={centerNearestStation}
          className="flex-1 bg-white dark:bg-slate-800 py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform border border-slate-100 dark:border-slate-700"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
          <span className="font-bold text-slate-800 dark:text-white text-[14px]">
            Find station
          </span>
        </button>
        <button
          type="button"
          onClick={goToScan}
          className="flex-1 bg-white dark:bg-slate-800 py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform border border-slate-100 dark:border-slate-700"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">qr_code_scanner</span>
          <span className="font-bold text-slate-800 dark:text-white text-[14px]">Scan</span>
        </button>
      </div>

      {/* Navigation arrow button below the search button (top-right) */}
      <div className="absolute top-20 right-4 z-30">
        <button
          type="button"
          onClick={goToMyLocation}
          className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform border border-slate-100 dark:border-slate-700"
          aria-label="Center on my location"
        >
          <span className="material-icons text-primary">navigation</span>
        </button>
      </div>

      {selectedStation && (
        <div className="pointer-events-auto">
          <StationBottomSheet
            station={selectedStation}
            onRent={() => {}}
            onClose={() => setSelectedStation(null)}
          />
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30">
          <div className="bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 font-semibold">
            Loading stations…
          </div>
        </div>
      )}
    </div>
  );
}
