import React from "react";

const TYPE_ICONS = {
    truck: "🚛",
    bus: "🚌",
    van: "🚐",
    car: "🚗",
    trailer: "🚚",
    other: "🚙",
};

const STATUS_COLORS = {
    in_transit: { bg: "rgba(75, 244, 206, 0.15)", color: "#4bf4ce", label: "In Transit" },
    idle: { bg: "rgba(255, 190, 85, 0.15)", color: "#ffbe55", label: "Idle" },
    delivered: { bg: "rgba(100, 200, 120, 0.15)", color: "#64c878", label: "Delivered" },
};

const RISK_COLORS = {
    safe: { bg: "rgba(75, 244, 206, 0.12)", color: "#4bf4ce" },
    medium: { bg: "rgba(255, 190, 85, 0.12)", color: "#ffbe55" },
    high: { bg: "rgba(255, 106, 126, 0.12)", color: "#ff6a7e" },
};

export default function FleetCard({ vehicle, apiBase }) {
    const {
        vehicle_id,
        driver,
        driver_phone,
        vehicle_type,
        from_warehouse,
        to_warehouse,
        status,
        risk,
        speed_kmh,
        image_url,
    } = vehicle;

    const icon = TYPE_ICONS[vehicle_type] || TYPE_ICONS.other;
    const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.in_transit;
    const riskStyle = RISK_COLORS[risk] || RISK_COLORS.safe;
    const imgSrc = image_url ? `${apiBase}${image_url}` : null;

    return (
        <div className="fleet-card" tabIndex={0}>
            {/* Header strip */}
            <div className="fleet-card__header">
                <div className="fleet-card__icon-wrap">
                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={vehicle_type}
                            className="fleet-card__vehicle-img"
                            loading="lazy"
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.querySelector(".fleet-card__emoji").style.display = "flex";
                            }}
                        />
                    ) : null}
                    <span className="fleet-card__emoji" style={{ display: imgSrc ? "none" : "flex" }}>
                        {icon}
                    </span>
                </div>
                <div className="fleet-card__id-block">
                    <span className="fleet-card__vid">{vehicle_id}</span>
                    <span className="fleet-card__type">{vehicle_type}</span>
                </div>
                <span
                    className="fleet-card__status-chip"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                    {statusStyle.label}
                </span>
            </div>

            {/* Body */}
            <div className="fleet-card__body">
                <div className="fleet-card__driver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>{driver}</span>
                </div>
                <div className="fleet-card__phone">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013.09 5.18 2 2 0 015.11 3h3a2 2 0 012 1.72c.12.96.35 1.9.68 2.81a2 2 0 01-.45 2.11L8.09 11.9a16 16 0 006.01 6.01l2.27-2.27a2 2 0 012.11-.45c.9.33 1.85.56 2.81.68a2 2 0 011.72 2z" />
                    </svg>
                    <span>{driver_phone}</span>
                </div>
            </div>

            {/* Route */}
            <div className="fleet-card__route">
                <div className="fleet-card__route-node">
                    <span className="fleet-card__route-dot fleet-card__route-dot--from" />
                    <span>{from_warehouse}</span>
                </div>
                <div className="fleet-card__route-line">
                    <svg width="24" height="12" viewBox="0 0 24 12">
                        <line x1="0" y1="6" x2="18" y2="6" stroke="#4bf4ce" strokeWidth="1.5" strokeDasharray="3 2" />
                        <polygon points="18,2 24,6 18,10" fill="#4bf4ce" />
                    </svg>
                </div>
                <div className="fleet-card__route-node">
                    <span className="fleet-card__route-dot fleet-card__route-dot--to" />
                    <span>{to_warehouse}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="fleet-card__footer">
                <span
                    className="fleet-card__risk-badge"
                    style={{ background: riskStyle.bg, color: riskStyle.color }}
                >
                    {risk === "safe" ? "✓ Safe" : risk === "high" ? "⚠ High Risk" : "⚡ Medium"}
                </span>
                <span className="fleet-card__speed">{speed_kmh} km/h</span>
            </div>
        </div>
    );
}
