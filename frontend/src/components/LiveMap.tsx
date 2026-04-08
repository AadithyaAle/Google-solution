'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Activity, Globe, Zap, Target } from 'lucide-react';

// Fix for default Leaflet icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom monochrome style for markers
const AssetIcon = (isCritical: boolean) => L.divIcon({
    className: 'custom-asset-icon',
    html: `<div style="
    width: 12px; 
    height: 12px; 
    background: ${isCritical ? 'white' : '#777'}; 
    border: 2px solid black; 
    box-shadow: 0 0 10px ${isCritical ? 'rgba(255,255,255,0.8)' : 'transparent'};
    ${isCritical ? 'animation: pulse 1.5s infinite;' : ''}
  "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

function MapEffects() {
    const map = useMap();
    useEffect(() => {
        // Apply grayscale filter to map tiles for monochrome look
        const container = map.getContainer();
        container.style.filter = 'grayscale(100%) invert(100%) contrast(90%) brightness(1.1)';
        container.style.background = '#000';
    }, [map]);
    return null;
}

export default function LiveMap() {
    const shipments = useStore((state) => state.shipments);
    const shipmentList = useMemo(() => Object.values(shipments), [shipments]);

    // Center of India as initial view
    const center: [number, number] = [20.5937, 78.9629];

    return (
        <div className="w-full h-full bg-black relative overflow-hidden border border-white/10 group z-10">
            <MapContainer
                center={center}
                zoom={5}
                className="w-full h-full bg-black"
                zoomControl={false}
            >
                <MapEffects />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Shipments (Nodes) */}
                {shipmentList.map((s: any) => {
                    const isCritical = s.ai_analysis.risk_score > 7;
                    return (
                        <React.Fragment key={s.shipment_id}>
                            <Marker
                                position={[s.gps.lat, s.gps.lng]}
                                icon={AssetIcon(isCritical)}
                            >
                                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                                    <div className="bg-black text-white p-2 border border-white/20 text-[10px] uppercase font-black tracking-widest leading-none">
                                        <p className="mb-1 text-white/50">{s.shipment_id}</p>
                                        <p>SCORE: {s.ai_analysis.risk_score}</p>
                                    </div>
                                </Tooltip>
                            </Marker>

                            {/* If shipment has a path, render the route graph edge */}
                            {s.history && s.history.length > 1 && (
                                <Polyline
                                    positions={s.history.map((h: any) => [h.lat, h.lng])}
                                    color="white"
                                    weight={1}
                                    opacity={0.2}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </MapContainer>

            {/* Overlay Technical Elements */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-bottom from-black to-transparent z-[1000] p-10 flex items-start justify-between pointer-events-none">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-white/40">
                        <Globe size={12} className="animate-spin-slow" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Map_Telemetry_Active</span>
                    </div>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest tabular-nums">SOURCE: OPENSTREETMAP // NEURAL_LAYER</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Live_Nodes: {shipmentList.length}</span>
                    <div className="w-48 h-1 bg-white/5 relative">
                        <div className="absolute inset-y-0 w-8 bg-white/40 animate-pan" />
                    </div>
                </div>
            </div>

            {/* Decorative Overlays */}
            <div className="absolute bottom-10 left-10 z-[1000] pointer-events-none flex flex-col gap-4">
                <div className="flex items-center gap-4 text-white/10 uppercase font-black text-[9px] tracking-[0.8em]">
                    <Target size={14} />
                    Geospatial_Topology_v4.2
                </div>
            </div>

            {/* Visual Brackets */}
            <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-white/20 z-[1000] pointer-events-none" />
            <div className="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-white/20 z-[1000] pointer-events-none" />
            <div className="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-white/20 z-[1000] pointer-events-none" />
            <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-white/20 z-[1000] pointer-events-none" />

            <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes pan {
          0% { left: 0; }
          100% { left: 160px; }
        }
        .animate-pan {
          animation: pan 3s linear infinite;
        }
        .leaflet-container {
          background: #000 !important;
        }
        .leaflet-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: rgba(255,255,255,0.2) !important;
        }
      `}</style>
        </div>
    );
}
