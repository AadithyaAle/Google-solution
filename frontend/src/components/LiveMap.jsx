import React from "react";

const INDIA_BOUNDS = { minLat: 6.5, maxLat: 37.5, minLng: 68.0, maxLng: 97.5 };

function toPercent(lat, lng) {
  const x = ((lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) * 100;
  const y = 100 - ((lat - INDIA_BOUNDS.minLat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * 100;
  return { x: Math.min(98, Math.max(2, x)), y: Math.min(98, Math.max(2, y)) };
}

const riskColor = { safe: "#22c55e", medium: "#eab308", high: "#ef4444" };

export default function LiveMap({ mapData }) {
  const vehicles = mapData?.vehicles || [];
  const warehouses = mapData?.warehouses || [];

  return (
    <section className="panel map-panel">
      <h3>India Live Vehicle Network</h3>
      <div className="india-map">
        <div className="india-grid" />
        <div className="india-shape" />
        {warehouses.map((w) => {
          const p = toPercent(w.lat, w.lng);
          return <span key={w.name} className="warehouse-dot" style={{ left: `${p.x}%`, top: `${p.y}%` }} title={`${w.name} | ${w.city}`} />;
        })}
        {vehicles.map((v) => {
          const p = toPercent(v.lat, v.lng);
          return <span key={v.id} className="vehicle-dot" title={`${v.id} | ${v.city} | ${v.status} | ${v.risk}`} style={{ left: `${p.x}%`, top: `${p.y}%`, background: riskColor[v.risk] || "#38bdf8" }} />;
        })}
      </div>
    </section>
  );
}
