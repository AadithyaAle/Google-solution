'use client';

import React, { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Globe, Target, Cpu, ShieldAlert } from 'lucide-react';

// Fix Leaflet default icons for Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const criticalIcon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:white;border:2px solid black;box-shadow:0 0 15px rgba(255,255,255,1);animation:livepulse 0.8s infinite"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const normalIcon = L.divIcon({
    className: '',
    html: `<div style="width:10px;height:10px;background:#666;border:2px solid black;box-shadow:0 0 5px rgba(255,255,255,0.2)"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
});

export default function LiveMap() {
    const shipments = useStore((state) => state.shipments);
    const nodes = useMemo(() => Object.values(shipments), [shipments]);

    return (
        <div className="w-full h-full bg-black relative overflow-hidden group">
            <style>{`
                @keyframes livepulse {
                    0%,100%{transform:scale(1);opacity:1}
                    50%{transform:scale(2);opacity:0.5}
                }
                @keyframes scanline {
                    0%{top:-10%}
                    100%{top:110%}
                }
                .leaflet-container {
                    background:#000!important;
                    filter:grayscale(100%) invert(95%) contrast(85%) brightness(0.8);
                }
                .leaflet-tooltip {
                    background:#000!important;
                    border:1px solid rgba(255,255,255,0.3)!important;
                    color:#fff!important;
                    border-radius:0!important;
                    font-family:monospace;
                    font-size:10px;
                    text-transform:uppercase;
                    letter-spacing:0.15em;
                    padding:8px 12px;
                    box-shadow:0 10px 30px rgba(0,0,0,0.5)!important;
                }
                .leaflet-tooltip::before { display:none; }
                .scanning-ray {
                    position:absolute;
                    left:0;
                    width:100%;
                    height:80px;
                    background:linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent);
                    z-index:2000;
                    pointer-events:none;
                    animation:scanline 4s linear infinite;
                }
            `}</style>

            <div className="scanning-ray" />

            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                className="w-full h-full"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />

                {nodes.map((s: any) => {
                    const isCritical = s.ai_analysis.risk_score > 6 || s.ai_analysis.health_index < 60;
                    const positions: [number, number][] = s.history?.map((h: any) => [h.lat, h.lng]) ?? [];

                    return (
                        <React.Fragment key={s.shipment_id}>
                            {positions.length > 1 && (
                                <Polyline
                                    positions={positions}
                                    color={isCritical ? '#ffffff' : '#444444'}
                                    weight={isCritical ? 3 : 1}
                                    opacity={isCritical ? 0.8 : 0.4}
                                    dashArray={isCritical ? undefined : '5 8'}
                                />
                            )}

                            <Marker
                                position={[s.gps.lat, s.gps.lng]}
                                icon={isCritical ? criticalIcon : normalIcon}
                            >
                                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={isCritical}>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="font-black text-white">{s.shipment_id}</span>
                                            {isCritical && <ShieldAlert size={10} className="text-white animate-pulse" />}
                                        </div>
                                        <div className="h-px bg-white/20 my-1" />
                                        <span>LOC: {s.location}</span>
                                        <span className={isCritical ? 'text-white font-black' : 'text-white/40'}>
                                            HEALTH: {s.ai_analysis.health_index}%
                                        </span>
                                        <span className="text-[8px] opacity-60 italic">{s.telemetry?.weather ?? 'SCANNING...'}</span>
                                    </div>
                                </Tooltip>
                            </Marker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>

            {/* Tactical HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[1000] border-[20px] border-black/10 shadow-[inset_0_0_100px_rgba(255,255,255,0.02)]" />

            <div className="absolute top-8 left-10 flex flex-col gap-4 z-[1000]">
                <div className="flex items-center gap-3 bg-black/80 border border-white/10 px-4 py-2">
                    <Target size={12} className="text-white/40" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">NEURAL_GEO_TARGETING_ACTIVE</span>
                </div>
                <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest pl-2">
                    LAT: 20.5937 // LNG: 78.9629 // ALT: 450KM
                </div>
            </div>

            <div className="absolute top-8 right-10 z-[1000] space-y-2">
                <div className="flex items-center gap-3 bg-black/80 border border-white/10 px-4 py-2">
                    <Cpu size={12} className="text-white/40" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">NODES_ONLINE: {nodes.length}</span>
                </div>
            </div>

            <div className="absolute bottom-10 left-10 z-[1000]">
                <div className="flex items-center gap-4 bg-black/80 border border-white/10 px-6 py-3">
                    <div className="w-2 h-2 bg-white animate-ping" />
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase">LINK_SYNC_ESTABLISHED</span>
                </div>
            </div>

            {/* Map Frame Brackets */}
            {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((cls, i) => (
                <div key={i} className={`absolute ${cls} border-white/20 w-12 h-12 z-[1001] pointer-events-none`} />
            ))}
        </div>
    );
}
