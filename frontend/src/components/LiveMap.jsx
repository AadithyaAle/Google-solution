import React from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

const INDIA_CENTER = [22.9734, 78.6569];
const INDIA_BOUNDS = [
  [6.0, 67.0],
  [37.6, 98.8],
];

const riskColor = { safe: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

function warehouseIcon() {
  return L.divIcon({
    className: "warehouse-stop-wrap",
    html: '<span class="warehouse-stop"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function vehicleNodeIcon(color) {
  return L.divIcon({
    className: "vehicle-node-wrap",
    html: `<span class="vehicle-node" style="--vcolor:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function LiveMap({ mapData, warehouses = [] }) {
  const vehicles = mapData?.vehicles || [];
  const warehouseByName = Object.fromEntries(warehouses.map((w) => [w.name, w]));
  const statusRouteColor = {
    in_transit: "#22c55e",
    delayed: "#f59e0b",
    stopped: "#ef4444",
    idle: "#38bdf8",
  };

  const curvedRoute = (from, to) => {
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;
    const bend = Math.max(0.8, Math.min(2.2, Math.abs(to.lng - from.lng) * 0.25));
    return [
      [from.lat, from.lng],
      [midLat + bend * (from.lat > to.lat ? 1 : -1), midLng],
      [to.lat, to.lng],
    ];
  };

  return (
    <section className="panel map-panel">
      <h3>India Live Vehicle Network</h3>
      <div className="india-map">
        <MapContainer center={INDIA_CENTER} zoom={5} minZoom={4} maxZoom={10} maxBounds={INDIA_BOUNDS} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
          {warehouses.map((w) => (
            <Marker key={`wh-stop-${w.name}`} position={[w.lat, w.lng]} icon={warehouseIcon()}>
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
            const color = statusRouteColor[v.status] || riskColor[v.risk] || "#38bdf8";
            const mid = { lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2 };
            return [
              <Polyline
                key={`route-${v.id}`}
                positions={curvedRoute(from, to)}
                pathOptions={{ color, weight: 3.5, dashArray: "7 8", lineCap: "round", opacity: 0.95 }}
              />,
              <Marker key={`veh-${v.id}`} position={[mid.lat, mid.lng]} icon={vehicleNodeIcon(color)}>
                <Popup>
                  <strong>{v.id}</strong>
                  <br />
                  {v.from_warehouse} → {v.to_warehouse || v.warehouse}
                </Popup>
              </Marker>,
            ];
          })}
        </MapContainer>
      </div>
    </section>
  );
}
