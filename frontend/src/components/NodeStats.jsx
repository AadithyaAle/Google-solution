import React from "react";
export default function NodeStats({ kpis }) {
  const cards = [
    ["Total Vehicles", kpis?.total_vehicles ?? 0],
    ["In Transit", kpis?.moving ?? 0],
    ["Warehouses", kpis?.warehouses ?? 0],
    ["High Risk", kpis?.high_risk ?? 0],
  ];
  return <div className="kpi-grid">{cards.map(([label, value]) => <article key={label} className="kpi-card"><p>{label}</p><h3>{value}</h3></article>)}</div>;
}
