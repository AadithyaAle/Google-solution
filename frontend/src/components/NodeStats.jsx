import React from "react";
export default function NodeStats({ kpis }) {
  const cards = [
    ["Total Vehicles", kpis?.total_vehicles ?? 0, "fleet"],
    ["In Transit", kpis?.moving ?? 0, "transit"],
    ["Warehouses", kpis?.warehouses ?? 0, "warehouse"],
    ["High Risk", kpis?.high_risk ?? 0, "risk"],
  ];
  return <div className="kpi-grid">{cards.map(([label, value, type]) => <article key={label} className={`kpi-card kpi-${type}`}><div className="kpi-top"><p>{label}</p><span>{type}</span></div><h3>{value}</h3><div className="kpi-foot">Live analytics</div></article>)}</div>;
}
