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

export default function Home() {
  const { isAuthenticated, updateShipment, addAlert, setNetworkState } = useStore();
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Fetch initial network state
    axios.get('http://localhost:8000/api/network-status', { timeout: 5000 })
      .then(res => setNetworkState(res.data))
      .catch(err => console.error('Failed to fetch network state', err));

    // 2. Connect to WebSocket for live updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//localhost:8000/ws/alerts`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'TELEMETRY_UPDATE') {
          updateShipment(data);
          if (data.ai_analysis.risk_score > 5.0) {
            addAlert({
              id: Math.random().toString(36).substr(2, 9),
              shipment_id: data.shipment,
              location: data.location,
              ai_analysis: data.ai_analysis,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    return () => ws.close();
  }, [isAuthenticated, updateShipment, addAlert, setNetworkState]);

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
          <div className="flex items-center justify-center h-full opacity-20 border border-white/10 p-20">
            <h2 className="text-sm font-black uppercase tracking-[2em] text-center">Neural Archives Nominal</h2>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
