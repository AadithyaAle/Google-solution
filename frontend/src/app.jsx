import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api/client";
import NodeStats from "./components/NodeStats";
import LiveMap from "./components/LiveMap";
import AlertFeed from "./components/AlertFeed";

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
  const [vhForm, setVhForm] = useState({ vehicle_id: "", driver: "", vehicle_type: "truck", status: "idle", risk: "safe", speed_kmh: 0, lat: "", lng: "", city: "", warehouse: "" });

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
    } catch {}
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
    const speed_kmh = num(vhForm.speed_kmh);
    const lat = num(vhForm.lat);
    const lng = num(vhForm.lng);
    if (!Number.isFinite(speed_kmh) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError("Vehicle Speed/Lat/Lng invalid. Use numeric values only.");
      return;
    }
    try {
      await api.addVehicle({ ...vhForm, speed_kmh, lat, lng });
      setVhForm({ vehicle_id: "", driver: "", vehicle_type: "truck", status: "idle", risk: "safe", speed_kmh: 0, lat: "", lng: "", city: "", warehouse: "" });
      setFlash("Vehicle added successfully.");
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to add vehicle.");
    }
  };

  return <div className="shell">{/* unchanged layout */}
    <aside className="sidebar"><div className="brand"><h1>GATI</h1><p>Autonomous Command Layer</p></div><nav className="menu"><button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>{t.dashboard}</button><button className={view === "fleet" ? "active" : ""} onClick={() => setView("fleet")}>{t.fleet}</button><button className={view === "warehouses" ? "active" : ""} onClick={() => setView("warehouses")}>{t.warehouses}</button></nav><div className="panel sidepanel"><p>{t.admin}</p><select value={role} onChange={(e) => setRole(e.target.value)}><option value="admin">Admin</option><option value="warehouse">Warehouse</option><option value="truck">Truck</option></select><div className="lang-row"><button onClick={() => setLang("en")}>English</button><button onClick={() => setLang("hi")}>हिंदी</button></div></div></aside>
    <main className="main">
      <header className="topbar"><h2>{view === "dashboard" ? "Control Tower" : view === "fleet" ? "Fleet Operations" : "Warehouse Operations"}</h2><span className="live-dot">LIVE</span></header>
      {loading && <section className="panel">{t.loading}</section>}
      {error && <section className="panel error">{error} <button onClick={loadAll}>{t.retry}</button></section>}
      {flash && <section className="panel" style={{ borderColor: "#2c7a64" }}>{flash}</section>}
      {!loading && view === "dashboard" && <><NodeStats kpis={dashboard.kpis} /><div className="dashboard-grid"><LiveMap mapData={mapData} /><AlertFeed alerts={dashboard.alerts} /></div></>}
      {!loading && view === "fleet" && <section className="panel"><h3>Add Fleet Vehicle</h3><form onSubmit={addVehicle} className="form-grid"><input placeholder="Vehicle ID" value={vhForm.vehicle_id} onChange={(e) => setVhForm({ ...vhForm, vehicle_id: e.target.value })} required /><input placeholder="Driver" value={vhForm.driver} onChange={(e) => setVhForm({ ...vhForm, driver: e.target.value })} required /><input placeholder="City" value={vhForm.city} onChange={(e) => setVhForm({ ...vhForm, city: e.target.value })} required /><input placeholder="Warehouse" value={vhForm.warehouse} onChange={(e) => setVhForm({ ...vhForm, warehouse: e.target.value })} required /><input placeholder="Lat" value={vhForm.lat} onChange={(e) => setVhForm({ ...vhForm, lat: e.target.value })} required /><input placeholder="Lng" value={vhForm.lng} onChange={(e) => setVhForm({ ...vhForm, lng: e.target.value })} required /><button type="submit">Add Vehicle</button></form>{fleet.length === 0 ? <div className="empty-state">No fleet yet. Add your first vehicle from the form above.</div> : <div className="table-wrap"><table><thead><tr><th>ID</th><th>Driver</th><th>Type</th><th>Status</th><th>Risk</th><th>Speed</th><th>City</th></tr></thead><tbody>{fleet.map((f) => <tr key={f.vehicle_id}><td>{f.vehicle_id}</td><td>{f.driver}</td><td>{f.vehicle_type}</td><td>{f.status}</td><td>{f.risk}</td><td>{f.speed_kmh} km/h</td><td>{f.city}</td></tr>)}</tbody></table></div>}</section>}
      {!loading && view === "warehouses" && <section className="panel"><h3>Add Warehouse</h3><form onSubmit={addWarehouse} className="form-grid warehouse-grid"><input placeholder="Warehouse Name" value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} required /><input placeholder="City" value={whForm.city} onChange={(e) => setWhForm({ ...whForm, city: e.target.value })} required /><input placeholder="Lat" value={whForm.lat} onChange={(e) => setWhForm({ ...whForm, lat: e.target.value })} required /><input placeholder="Lng" value={whForm.lng} onChange={(e) => setWhForm({ ...whForm, lng: e.target.value })} required /><button type="submit">Add Warehouse</button></form>{warehouses.length === 0 ? <div className="empty-state">No warehouses yet. Add your first warehouse from the form above.</div> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>City</th><th>Lat</th><th>Lng</th></tr></thead><tbody>{warehouses.map((w) => <tr key={w.name}><td>{w.name}</td><td>{w.city}</td><td>{w.lat}</td><td>{w.lng}</td></tr>)}</tbody></table></div>}</section>}
    </main>
  </div>;
}
