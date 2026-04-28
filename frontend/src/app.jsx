import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api/client";
import NodeStats from "./components/NodeStats";
import LiveMap from "./components/LiveMap";
import AlertFeed from "./components/AlertFeed";
import WarehouseCard from "./components/WarehouseCard.jsx";
import FleetCard from "./components/FleetCard.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const i18n = {
  en: { fleet: "Fleet", dashboard: "Dashboard", warehouses: "Warehouses", admin: "Admin", loading: "Syncing live control tower...", retry: "Retry" },
  hi: { fleet: "फ्लीट", dashboard: "डैशबोर्ड", warehouses: "वेयरहाउस", admin: "एडमिन", loading: "लाइव कंट्रोल टॉवर सिंक हो रहा है...", retry: "फिर से कोशिश करें" },
};

const EMPTY = { kpis: { total_vehicles: 0, moving: 0, warehouses: 0, high_risk: 0 }, alerts: [] };
const num = (v) => Number.parseFloat(String(v).replace(/[^0-9+-.]/g, ""));

export default function App() {
  const [view, setView] = useState("dashboard");
  const [role, setRole] = useState("admin");
  const [lang, setLang] = useState("en");
  const [dashboard, setDashboard] = useState(EMPTY);
  const [fleet, setFleet] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [whForm, setWhForm] = useState({ name: "", city: "", lat: "", lng: "" });
  const [vhForm, setVhForm] = useState({ vehicle_id: "", driver: "", driver_phone: "", vehicle_type: "truck", from_warehouse: "", to_warehouse: "" });

  const t = useMemo(() => i18n[lang], [lang]);

  const loadAll = async () => {
    try {
      const [d, f, m, w] = await Promise.all([api.dashboard(role), api.fleet(), api.mapIndia(), api.warehouses()]);
      setDashboard(d || EMPTY);
      setFleet(f?.items || []);
      setMapData(m || null);
      setWarehouses(w?.items || []);
      setError("");
    } catch {
      setError("Backend not reachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAll();
    let ws;
    try {
      ws = new WebSocket(api.wsUrl);
      ws.onmessage = loadAll;
    } catch { }
    return () => ws && ws.close();
  }, [role]);

  const addWarehouse = async (e) => {
    e.preventDefault();
    setFlash("");
    const lat = num(whForm.lat);
    const lng = num(whForm.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError("Latitude/Longitude invalid. Use numeric values like 12.9629 and 77.5937.");
      return;
    }
    try {
      await api.addWarehouse({ ...whForm, lat, lng });
      setWhForm({ name: "", city: "", lat: "", lng: "" });
      setFlash("Warehouse added successfully.");
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to add warehouse.");
    }
  };

  const addVehicle = async (e) => {
    e.preventDefault();
    setFlash("");
    try {
      await api.addVehicle({ ...vhForm });
      setVhForm({ vehicle_id: "", driver: "", driver_phone: "", vehicle_type: "truck", from_warehouse: "", to_warehouse: "" });
      setFlash("Vehicle added successfully.");
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to add vehicle.");
    }
  };

  return <div className="shell"><aside className="sidebar"><div className="brand"><h1>GATI</h1><p>Autonomous Command Layer</p></div><nav className="menu"><button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>{t.dashboard}</button><button className={view === "fleet" ? "active" : ""} onClick={() => setView("fleet")}>{t.fleet}</button><button className={view === "warehouses" ? "active" : ""} onClick={() => setView("warehouses")}>{t.warehouses}</button></nav><div className="panel sidepanel"><p>{t.admin}</p><select value={role} onChange={(e) => setRole(e.target.value)}><option value="admin">Admin</option><option value="warehouse">Warehouse</option><option value="truck">Truck</option></select><div className="lang-row"><button onClick={() => setLang("en")}>English</button><button onClick={() => setLang("hi")}>हिंदी</button></div></div></aside>
    <main className="main">
      <header className="topbar"><h2>{view === "dashboard" ? "Control Tower" : view === "fleet" ? "Fleet Operations" : "Warehouse Operations"}</h2><span className="live-dot">LIVE</span></header>
      {loading && <section className="panel">{t.loading}</section>}
      {error && <section className="panel error">{error} <button onClick={loadAll}>{t.retry}</button></section>}
      {flash && <section className="panel" style={{ borderColor: "#2c7a64" }}>{flash}</section>}
      {!loading && view === "dashboard" && <><NodeStats kpis={dashboard.kpis} /><div className="dashboard-grid"><LiveMap mapData={mapData} /><AlertFeed alerts={dashboard.alerts} /></div></>}
      {!loading && view === "fleet" && <>
        <section className="panel form-section">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
            Add Fleet Vehicle
          </h3>
          <form onSubmit={addVehicle} className="form-grid">
            <input placeholder="Vehicle ID" value={vhForm.vehicle_id} onChange={(e) => setVhForm({ ...vhForm, vehicle_id: e.target.value })} required />
            <input placeholder="Driver Name" value={vhForm.driver} onChange={(e) => setVhForm({ ...vhForm, driver: e.target.value })} required />
            <input placeholder="Driver Number" value={vhForm.driver_phone} onChange={(e) => setVhForm({ ...vhForm, driver_phone: e.target.value })} required />
            <select value={vhForm.vehicle_type} onChange={(e) => setVhForm({ ...vhForm, vehicle_type: e.target.value })}>
              <option value="truck">Truck</option><option value="bus">Bus</option><option value="van">Van</option>
              <option value="car">Car</option><option value="trailer">Trailer</option><option value="other">Other</option>
            </select>
            <input placeholder="From Warehouse" value={vhForm.from_warehouse} onChange={(e) => setVhForm({ ...vhForm, from_warehouse: e.target.value })} required />
            <input placeholder="To Warehouse" value={vhForm.to_warehouse} onChange={(e) => setVhForm({ ...vhForm, to_warehouse: e.target.value })} required />
            <button type="submit">Add Vehicle</button>
          </form>
        </section>
        {fleet.length === 0 ? (
          <div className="empty-state-premium">
            <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="20" width="50" height="36" rx="4" /><polygon points="54 28 68 28 76 36 76 56 54 56 54 28" /><circle cx="18" cy="60" r="7" /><circle cx="62" cy="60" r="7" /><line x1="25" y1="60" x2="55" y2="60" strokeDasharray="3 2" /></svg>
            <h4>No Fleet Vehicles Yet</h4>
            <p>Add your first vehicle using the form above to see it here.</p>
          </div>
        ) : (
          <div className="card-grid">
            {fleet.map((f) => <FleetCard key={f.vehicle_id} vehicle={f} apiBase={API_BASE} />)}
          </div>
        )}
      </>}

      {!loading && view === "warehouses" && <>
        <section className="panel form-section">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M3 10L12 3L21 10" /><rect x="9" y="16" width="6" height="6" rx="1" /></svg>
            Add Warehouse
          </h3>
          <form onSubmit={addWarehouse} className="form-grid warehouse-grid">
            <input placeholder="Warehouse Name" value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} required />
            <input placeholder="City" value={whForm.city} onChange={(e) => setWhForm({ ...whForm, city: e.target.value })} required />
            <input placeholder="Latitude" value={whForm.lat} onChange={(e) => setWhForm({ ...whForm, lat: e.target.value })} required />
            <input placeholder="Longitude" value={whForm.lng} onChange={(e) => setWhForm({ ...whForm, lng: e.target.value })} required />
            <button type="submit">Add Warehouse</button>
          </form>
        </section>
        {warehouses.length === 0 ? (
          <div className="empty-state-premium">
            <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="10" y="30" width="60" height="40" rx="4" /><path d="M10 30L40 10L70 30" /><rect x="30" y="48" width="20" height="22" rx="2" /><line x1="20" y1="44" x2="28" y2="44" /><line x1="52" y1="44" x2="60" y2="44" /><line x1="20" y1="52" x2="28" y2="52" /><line x1="52" y1="52" x2="60" y2="52" /></svg>
            <h4>No Warehouses Yet</h4>
            <p>Add your first warehouse using the form above to see it displayed as a card.</p>
          </div>
        ) : (
          <div className="card-grid">
            {warehouses.map((w) => <WarehouseCard key={w.name} warehouse={w} apiBase={API_BASE} />)}
          </div>
        )}
      </>}
    </main></div>;
}
