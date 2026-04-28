import React from "react";
export default function AlertFeed({ alerts }) {
  return (
    <section className="panel">
      <h3>Weather & Traffic Alerts</h3>
      <div className="alert-list">
        {(alerts || []).map((a, idx) => (
          <div key={idx} className={`alert ${a.severity}`}>
            <strong>{a.type.toUpperCase()}</strong>
            <span>{a.message}</span>
            <em>{a.count} impacted vehicles</em>
          </div>
        ))}
      </div>
    </section>
  );
}
