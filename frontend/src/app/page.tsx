'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthPage from '@/components/AuthPage';
import DashboardView from '@/components/DashboardView';
import FleetView from '@/components/FleetView';
import RiskMonitoringView from '@/components/RiskMonitoringView';
import OrchestrationView from '@/components/OrchestrationView';
import { useStore } from '@/store/useStore';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function Home() {
  const { isAuthenticated, updateShipment, addAlert, setNetworkState, setNetworkStats, setVehicles } = useStore();
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  useEffect(() => {
    if (!isAuthenticated) return;

    // Load initial data
    const load = async () => {
      try {
        const [network, stats, vehicles] = await Promise.all([
          axios.get(`${API}/api/network-status`),
          axios.get(`${API}/api/stats`),
          axios.get(`${API}/api/vehicles`),
        ]);
        setNetworkState(network.data);
        setNetworkStats(stats.data);
        setVehicles(vehicles.data.vehicles);
      } catch (e) {
        console.warn('[INIT] Could not load backend data:', e);
      }
    };
    load();

    // Refresh stats every 5 seconds
    const statsInterval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/stats`);
        setNetworkStats(res.data);
        const net = await axios.get(`${API}/api/network-status`);
        setNetworkState(net.data);
      } catch (_) { }
    }, 5000);

    // WebSocket for live telemetry
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//localhost:8000/ws/alerts`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'TELEMETRY_UPDATE') {
          updateShipment(data);
          if (data.ai_analysis.risk_score > 5.0) {
            addAlert({
              id: `${data.shipment}-${Date.now()}`,
              shipment_id: data.shipment,
              location: data.location,
              ai_analysis: data.ai_analysis,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    return () => {
      clearInterval(statsInterval);
      ws.close();
    };
  }, [isAuthenticated, updateShipment, addAlert, setNetworkState, setNetworkStats, setVehicles]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <DashboardLayout onTabChange={(tab: string) => setActiveTab(tab)} currentTab={activeTab}>
      <div className="h-full">
        {activeTab === 'DASHBOARD' && <DashboardView />}
        {activeTab === 'ACTIVE FLEET' && <FleetView />}
        {activeTab === 'RISK MONITORING' && <RiskMonitoringView />}
        {activeTab === 'ORCHESTRATION' && <OrchestrationView />}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="flex flex-col items-center justify-center h-full opacity-20 border border-white/10 p-20">
            <h2 className="text-sm font-black uppercase tracking-[2em] text-center">Neural Archives Nominal</h2>
            <p className="text-[9px] font-black uppercase tracking-widest mt-4">All Disruption Events Cleared</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
