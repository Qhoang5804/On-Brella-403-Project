import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { config } from "../config";

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function UserLocationMarker() {
  const map = useMap();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => setPosition(null),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, []);

  if (!position) return null;
  const userIcon = L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
        <div class="pulse-ring" style="position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(13,166,242,0.35);"></div>
        <div style="width:16px;height:16px;border-radius:50%;background:#0da6f2;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);position:relative;z-index:2;"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
  return <Marker position={position} icon={userIcon} />;
}

function CenterOnUser({ mapRef }) {
  const map = useMap();
  const goToUser = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], map.getZoom()),
      () => {}
    );
  }, [map]);
  useEffect(() => {
    if (mapRef)
      mapRef.current = {
        goToUser,
        setView: (latlng) => map.setView(latlng, map.getZoom()),
      };
  }, [mapRef, goToUser]);
  return null;
}

export function StationMap({
  stations = [],
  selectedStationId,
  onSelectStation,
  mapRef,
  /** When true: markers are simple dots only (no availability badge, no popup). For active-rental map background. */
  simplified = false,
}) {
  const center = useMemo(
    () =>
      stations.length
        ? [
            stations.reduce((s, st) => s + (st.location?.latitude ?? 0), 0) / stations.length,
            stations.reduce((s, st) => s + (st.location?.longitude ?? 0), 0) / stations.length,
          ]
        : config.defaultCenter,
    [stations]
  );

  const tileConfig =
    config.mapTheme === "dark"
      ? {
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      : config.mapTheme === "grayscale"
        ? {
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }
        : {
            url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          };

  const mapContainerClass =
    config.mapTheme === "grayscale"
      ? "absolute inset-0 z-0 map-theme-grayscale"
      : "absolute inset-0 z-0";

  return (
    <div className={mapContainerClass}>
      <MapContainer
        center={center}
        zoom={config.defaultZoom}
        className="h-full w-full"
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer attribution={tileConfig.attribution} url={tileConfig.url} />
        {!simplified && <UserLocationMarker />}
        <CenterOnUser mapRef={mapRef} />
        {stations.map((station) => {
          const lat = station.location?.latitude;
          const lng = station.location?.longitude;
          if (lat == null || lng == null) return null;
          const available = station.numUmbrellas ?? 0;
          const capacity = station.capacity ?? 0;
          const isSelected = selectedStationId === station.stationId;
          const dotSize = simplified ? 24 : 18;
          const markerIcon = L.divIcon({
            className: "station-marker border-0 bg-transparent",
            html: simplified
              ? `
              <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
                <div style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:#fff;border:3px solid #0da6f2;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>
              </div>
            `
              : `
              <div style="display:flex;flex-direction:column;align-items:center;">
                <div style="background:#fff;color:#0f172a;font-weight:700;font-size:12px;padding:5px 10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);margin-bottom:5px;border:1px solid #e2e8f0;">
                  ${available}/${capacity}
                </div>
                <div style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${isSelected ? "#0da6f2" : "#fff"};border:3px solid #0da6f2;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>
              </div>
            `,
            iconSize: simplified ? [dotSize, dotSize] : [60, 42],
            iconAnchor: simplified ? [dotSize / 2, dotSize / 2] : [30, 42],
          });
          return (
            <Marker
              key={station.stationId}
              position={[lat, lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onSelectStation?.(station),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}