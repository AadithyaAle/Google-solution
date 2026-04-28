import React from "react";
export default function AlertFeed({ alerts }) {
  const icon = { weather: "●", traffic: "◆", default: "•" };
  return (
    <section className="panel alerts-panel">
      <div className="fleet-panel-head"><h3>Weather & Traffic Alerts</h3><span className="alerts-badge">Live Feed</span></div>
      <div className="alert-list">
        {(alerts || []).map((a, idx) => (
          <div key={idx} className={`alert premium-alert ${a.severity}`}>
            <div className="alert-head">
              <strong>{icon[a.type] || icon.default} {a.type.toUpperCase()}</strong>
              <span className={`sev-tag ${a.severity}`}>{a.severity}</span>
            </div>
            <span>{a.message}</span>
            <em>{a.count} impacted vehicles</em>
          </div>
        ))}
      </div>
    </section>
  );
}
