import React from "react";

const GRADIENTS = [
    "linear-gradient(135deg, #0d2847 0%, #1a4a6e 40%, #2d8ca8 100%)",
    "linear-gradient(135deg, #0f3460 0%, #16213e 40%, #533483 100%)",
    "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
    "linear-gradient(135deg, #0b3d5e 0%, #114d6e 40%, #1b8a7a 100%)",
    "linear-gradient(135deg, #1e3a5f 0%, #3a7ca5 40%, #4ecdc4 100%)",
];

function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
}

export default function WarehouseCard({ warehouse, apiBase }) {
    const { name, city, lat, lng, image_url } = warehouse;
    const grad = GRADIENTS[hashStr(name) % GRADIENTS.length];
    const imgSrc = image_url ? `${apiBase}${image_url}` : null;

    return (
        <div className="wh-card" tabIndex={0}>
            <div className="wh-card__image" style={{ background: grad }}>
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={`${name} warehouse`}
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                        }}
                    />
                ) : null}
                <div
                    className="wh-card__fallback"
                    style={{ display: imgSrc ? "none" : "flex" }}
                >
                    <span className="wh-card__initial">{name.charAt(0).toUpperCase()}</span>
                    <svg className="wh-card__icon" viewBox="0 0 64 64" fill="none">
                        <rect x="8" y="24" width="48" height="32" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                        <path d="M8 24L32 8L56 24" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                        <rect x="24" y="38" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
                    </svg>
                </div>
                <div className="wh-card__overlay" />
                <span className="wh-card__status-dot" />
            </div>
            <div className="wh-card__body">
                <h4 className="wh-card__name">{name}</h4>
                <p className="wh-card__city">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    {city}
                </p>
                <div className="wh-card__coords">
                    <span className="wh-card__badge">{Number(lat).toFixed(4)}°N</span>
                    <span className="wh-card__badge">{Number(lng).toFixed(4)}°E</span>
                </div>
            </div>
        </div>
    );
}
