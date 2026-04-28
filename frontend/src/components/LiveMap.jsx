import React from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

const INDIA_CENTER = [22.9734, 78.6569];
const INDIA_BOUNDS = [
  [6.0, 67.0],
  [37.6, 98.8],
];

const riskColor = { safe: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

function markerIcon(color) {
  return L.divIcon({
    className: "fleet-pin-wrap",
    html: `<span class="fleet-pin" style="--pin:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function LiveMap({ mapData, warehouses = [] }) {
  const vehicles = mapData?.vehicles || [];
  const warehouseByName = Object.fromEntries(warehouses.map((w) => [w.name, w]));

  return (
    <section className="panel map-panel">
      <h3>India Live Vehicle Network</h3>
      <div className="india-map">
        <MapContainer center={INDIA_CENTER} zoom={5} minZoom={4} maxZoom={10} maxBounds={INDIA_BOUNDS} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
          {vehicles.map((v) => (
            <Marker key={v.id} position={[v.lat, v.lng]} icon={markerIcon(riskColor[v.risk] || "#38bdf8")}>
              <Popup>
                <strong>{v.id}</strong>
                <br />
                {v.city} | {v.status} | {v.speed_kmh || 0} km/h
              </Popup>
            </Marker>
          ))}
          {warehouses.map((w) => (
            <Marker key={`wh-${w.name}`} position={[w.lat, w.lng]} icon={markerIcon("#22d3ee")}>
              <Popup>
                <strong>{w.name}</strong>
                <br />
                {w.city}
              </Popup>
            </Marker>
          ))}
          {vehicles.map((v) => {
            const from = warehouseByName[v.from_warehouse];
            const to = warehouseByName[v.to_warehouse || v.warehouse];
            if (!from || !to) return null;
            return <Polyline key={`route-${v.id}`} positions={[[from.lat, from.lng], [to.lat, to.lng]]} pathOptions={{ color: riskColor[v.risk] || "#38bdf8", weight: 3, dashArray: "8 8" }} />;
          })}
        </MapContainer>
      </div>
    </section>
  );
}
