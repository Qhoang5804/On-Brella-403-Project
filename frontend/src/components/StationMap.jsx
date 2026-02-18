import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { config } from "../config";
import { getStationDisplayName } from "../utils/stationNames";

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
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#0da6f2;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
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
    if (mapRef) mapRef.current = { goToUser };
  }, [mapRef, goToUser]);
  return null;
}

export function StationMap({
  stations = [],
  selectedStationId,
  onSelectStation,
  mapRef,
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

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={center}
        zoom={config.defaultZoom}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <UserLocationMarker />
        <CenterOnUser mapRef={mapRef} />
        {stations.map((station) => {
          const lat = station.location?.latitude;
          const lng = station.location?.longitude;
          if (lat == null || lng == null) return null;
          const name = getStationDisplayName(station.stationId);
          const available = station.numUmbrellas ?? 0;
          const capacity = station.capacity ?? 0;
          const emptySlots = (station.availableSlots ?? capacity) - available + (capacity - (station.numUmbrellas ?? 0));
          const isSelected = selectedStationId === station.stationId;
          const markerIcon = L.divIcon({
            className: "station-marker border-0 bg-transparent",
            html: `
              <div style="display:flex;flex-direction:column;align-items:center;">
                <div style="background:#fff;color:#0f172a;font-weight:700;font-size:11px;padding:4px 8px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);margin-bottom:4px;border:1px solid #e2e8f0;">
                  ${available}/${capacity}
                </div>
                <div style="width:12px;height:12px;border-radius:50%;background:${isSelected ? "#0da6f2" : "#fff"};border:2px solid #0da6f2;box-shadow:0 2px 6px rgba(0,0,0,0.2);"></div>
              </div>
            `,
            iconSize: [60, 36],
            iconAnchor: [30, 36],
          });
          return (
            <Marker
              key={station.stationId}
              position={[lat, lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onSelectStation?.(station),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{name}</div>
                  <div className="text-slate-500">
                    {available} available / {capacity} total · {station.availableSlots ?? 0} empty slots
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-primary font-semibold"
                    onClick={() => onSelectStation?.(station)}
                  >
                    Rent here
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
