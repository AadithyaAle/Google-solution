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
  const [flashScope, setFlashScope] = useState("");
  const [fleetQuery, setFleetQuery] = useState("");
  const [warehouseQuery, setWarehouseQuery] = useState("");
  const [fleetStatusFilter, setFleetStatusFilter] = useState("all");
  const [warehouseStatusFilter, setWarehouseStatusFilter] = useState("all");
  const [dashVehicleFilter, setDashVehicleFilter] = useState("all");
  const [dashRiskFilter, setDashRiskFilter] = useState("all");

  const [whForm, setWhForm] = useState({ name: "", city: "", lat: "", lng: "" });
  const [vhForm, setVhForm] = useState({ vehicle_id: "", driver: "", vehicle_type: "truck", status: "in_transit", risk: "safe", speed_kmh: 0, city: "", from_warehouse: "", to_warehouse: "" });

  const t = useMemo(() => i18n[lang], [lang]);
  const fleetFiltered = useMemo(() => {
    const q = fleetQuery.trim().toLowerCase();
    if (!q) return fleet;
    return fleet.filter((f) => {
      const textMatch = [f.vehicle_id, f.driver, f.city, f.warehouse].some((v) => String(v || "").toLowerCase().includes(q));
      const statusMatch = fleetStatusFilter === "all" ? true : f.status === fleetStatusFilter;
      return textMatch && statusMatch;
    });
  }, [fleet, fleetQuery, fleetStatusFilter]);
  const warehouseFiltered = useMemo(() => {
    const q = warehouseQuery.trim().toLowerCase();
    if (!q) return warehouses;
    return warehouses.filter((w, idx) => {
      const textMatch = [w.name, w.city].some((v) => String(v || "").toLowerCase().includes(q));
      const rowStatus = idx % 3 === 2 ? "low_stock" : "active";
      const statusMatch = warehouseStatusFilter === "all" ? true : rowStatus === warehouseStatusFilter;
      return textMatch && statusMatch;
    });
  }, [warehouses, warehouseQuery, warehouseStatusFilter]);
  const dashboardVehicles = useMemo(() => {
    return fleet.filter((f) => {
      const byStatus = dashVehicleFilter === "all" ? true : f.status === dashVehicleFilter;
      const byRisk = dashRiskFilter === "all" ? true : f.risk === dashRiskFilter;
      return byStatus && byRisk;
    });
  }, [fleet, dashVehicleFilter, dashRiskFilter]);
  const dashboardCards = useMemo(() => {
    const totalSpeed = dashboardVehicles.reduce((s, v) => s + (Number(v.speed_kmh) || 0), 0);
    const avgSpeed = dashboardVehicles.length ? (totalSpeed / dashboardVehicles.length).toFixed(1) : "0.0";
    const activeDrivers = new Set(dashboardVehicles.map((v) => v.driver).filter(Boolean)).size;
    return [
      ["Avg Speed", `${avgSpeed} km/h`, "speed"],
      ["Active Drivers", activeDrivers, "drivers"],
      ["Routes Live", dashboardVehicles.filter((v) => v.from_warehouse && (v.to_warehouse || v.warehouse)).length, "routes"],
      ["Risk Vehicles", dashboardVehicles.filter((v) => v.risk === "high").length, "risk"],
    ];
  }, [dashboardVehicles]);

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

  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => {
      setFlash("");
      setFlashScope("");
    }, 2500);
    return () => clearTimeout(id);
  }, [flash]);

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
      setFlashScope("warehouses");
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to add warehouse.");
    }
  };

  const addVehicle = async (e) => {
    e.preventDefault();
    setFlash("");
    const speed_kmh = num(vhForm.speed_kmh);
    if (!Number.isFinite(speed_kmh)) {
      setError("Vehicle speed is invalid.");
      return;
    }
    const from = warehouses.find((w) => w.name === vhForm.from_warehouse);
    const to = warehouses.find((w) => w.name === vhForm.to_warehouse);
    if (!from || !to) {
      setError("Please select valid From and To warehouses.");
      return;
    }
    try {
      await api.addVehicle({ ...vhForm, warehouse: vhForm.to_warehouse, city: vhForm.city || to.city, lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2, from_warehouse: from.name, to_warehouse: to.name, speed_kmh });
      setVhForm({ vehicle_id: "", driver: "", vehicle_type: "truck", status: "in_transit", risk: "safe", speed_kmh: 0, city: "", from_warehouse: "", to_warehouse: "" });
      setFlash("Vehicle added successfully.");
      setFlashScope("fleet");
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
      {flash && flashScope === view && <section className="panel" style={{ borderColor: "#2c7a64" }}>{flash}</section>}
      {!loading && view === "dashboard" && <>
        <div className="fleet-subtitle">Real-time overview of your operations</div>
        <NodeStats kpis={dashboard.kpis} />
        <div className="dashboard-grid">
          <section className="panel fleet-map-panel dashboard-map-panel">
            <div className="fleet-panel-head"><h3>India Live Vehicle Network</h3><div className="fleet-panel-actions"><select value={dashVehicleFilter} onChange={(e) => setDashVehicleFilter(e.target.value)}><option value="all">All Vehicles</option><option value="in_transit">In Transit</option><option value="idle">Idle</option><option value="stopped">Stopped</option></select><select value={dashRiskFilter} onChange={(e) => setDashRiskFilter(e.target.value)}><option value="all">All Risk</option><option value="safe">Safe</option><option value="medium">Medium</option><option value="high">High</option></select></div></div>
            <LiveMap mapData={{ ...(mapData || {}), vehicles: dashboardVehicles }} warehouses={warehouses} />
          </section>
          <AlertFeed alerts={dashboard.alerts} />
        </div>
        <section className="dashboard-bottom-cards">
          {dashboardCards.map(([label, value, type]) => <article key={label} className={`panel bottom-card ${type}`}><p>{label}</p><h3>{value}</h3></article>)}
        </section>
      </>}
      {!loading && view === "fleet" && <section className="fleet-page">
        <div className="fleet-subtitle">Monitor and manage your fleet in real-time</div>
        <section className="panel fleet-form-panel"><h3>Add Fleet Vehicle</h3><form onSubmit={addVehicle} className="form-grid"><input placeholder="e.g. MH01 AB 1234" value={vhForm.vehicle_id} onChange={(e) => setVhForm({ ...vhForm, vehicle_id: e.target.value })} required /><input placeholder="Select driver" value={vhForm.driver} onChange={(e) => setVhForm({ ...vhForm, driver: e.target.value })} required /><input placeholder="Enter city (optional)" value={vhForm.city} onChange={(e) => setVhForm({ ...vhForm, city: e.target.value })} /><select value={vhForm.from_warehouse} onChange={(e) => setVhForm({ ...vhForm, from_warehouse: e.target.value })} required><option value="">From Warehouse</option>{warehouses.map((w) => <option key={`from-${w.name}`} value={w.name}>{w.name}</option>)}</select><select value={vhForm.to_warehouse} onChange={(e) => setVhForm({ ...vhForm, to_warehouse: e.target.value })} required><option value="">To Warehouse</option>{warehouses.map((w) => <option key={`to-${w.name}`} value={w.name}>{w.name}</option>)}</select><input type="number" placeholder="Speed (km/h)" value={vhForm.speed_kmh} onChange={(e) => setVhForm({ ...vhForm, speed_kmh: e.target.value })} required /><button type="submit" disabled={warehouses.length === 0}>+ Add Vehicle</button></form>{warehouses.length === 0 && <div className="empty-state">Add warehouses first to enable route dropdowns for fleet.</div>}</section>
        <section className="panel fleet-map-panel"><div className="fleet-panel-head"><h3>Live Fleet Map</h3><div className="fleet-panel-actions"><select value={fleetStatusFilter} onChange={(e) => setFleetStatusFilter(e.target.value)}><option value="all">All Vehicles</option><option value="in_transit">In Transit</option><option value="idle">Idle</option><option value="stopped">Stopped</option></select><button type="button">⤢</button></div></div><LiveMap mapData={{ ...(mapData || {}), vehicles: fleetFiltered }} warehouses={warehouses} /></section>
        <section className="panel fleet-table-panel"><div className="fleet-panel-head"><h3>Fleet Vehicles</h3><div className="fleet-panel-actions"><input placeholder="Search vehicle, driver..." value={fleetQuery} onChange={(e) => setFleetQuery(e.target.value)} /><select value={fleetStatusFilter} onChange={(e) => setFleetStatusFilter(e.target.value)}><option value="all">All Status</option><option value="in_transit">In Transit</option><option value="idle">Idle</option><option value="stopped">Stopped</option></select></div></div>{fleetFiltered.length === 0 ? <div className="empty-state">No fleet vehicles found.</div> : <div className="table-wrap"><table><thead><tr><th>Vehicle ID</th><th>Driver</th><th>Route</th><th>Status</th><th>Speed</th><th>Last Updated</th><th>Actions</th></tr></thead><tbody>{fleetFiltered.map((f) => <tr key={f.vehicle_id}><td>{f.vehicle_id}</td><td>{f.driver}</td><td>{f.from_warehouse || f.city} → {f.to_warehouse || f.warehouse}</td><td><span className={`status-pill ${f.status}`}>{f.status === "in_transit" ? "In Transit" : f.status}</span></td><td>{f.speed_kmh} km/h</td><td>Live</td><td><button type="button" className="ghost-btn">View</button></td></tr>)}</tbody></table></div>}<div className="table-footer"><span>Showing {Math.min(fleetFiltered.length, 5)} of {fleetFiltered.length} vehicles</span><div className="pager"><button type="button">1</button><button type="button">2</button><button type="button">3</button></div></div></section>
      </section>}
      {!loading && view === "warehouses" && <section className="warehouse-page">
        <div className="fleet-subtitle">Manage and monitor all your warehouses in real-time</div>
        <section className="warehouse-kpis">
          <article className="kpi-card premium"><p>Total Warehouses</p><h3>{warehouses.length}</h3></article>
          <article className="kpi-card premium"><p>Active Warehouses</p><h3>{Math.max(warehouses.length - 1, 0)}</h3></article>
          <article className="kpi-card premium"><p>Low Stock Alerts</p><h3>{Math.min(3, warehouses.length)}</h3></article>
          <article className="kpi-card premium"><p>Total Capacity</p><h3>{warehouses.length * 500} m³</h3></article>
        </section>
        <section className="warehouse-layout">
          <div className="warehouse-left">
            <section className="panel fleet-map-panel"><div className="fleet-panel-head"><h3>Warehouse Locations</h3><div className="fleet-panel-actions"><button type="button">⤢</button></div></div><LiveMap mapData={mapData} warehouses={warehouses} /></section>
            <section className="panel fleet-table-panel"><div className="fleet-panel-head"><h3>All Warehouses</h3><div className="fleet-panel-actions"><input placeholder="Search warehouse..." value={warehouseQuery} onChange={(e) => setWarehouseQuery(e.target.value)} /><select value={warehouseStatusFilter} onChange={(e) => setWarehouseStatusFilter(e.target.value)}><option value="all">All Status</option><option value="active">Active</option><option value="low_stock">Low Stock</option></select></div></div>{warehouseFiltered.length === 0 ? <div className="empty-state">No warehouses found.</div> : <div className="table-wrap"><table><thead><tr><th>Warehouse Name</th><th>City</th><th>Capacity</th><th>Utilization</th><th>Status</th><th>Last Updated</th><th>Actions</th></tr></thead><tbody>{warehouseFiltered.map((w, idx) => <tr key={w.name}><td>{w.name}</td><td>{w.city}</td><td>{900 + (idx * 120)} m³</td><td><div className="util-bar"><span style={{ width: `${55 + ((idx * 9) % 35)}%` }} /></div></td><td><span className={`status-pill ${idx % 3 === 2 ? "idle" : "in_transit"}`}>{idx % 3 === 2 ? "Low Stock" : "Active"}</span></td><td>{idx + 1} min ago</td><td><button type="button" className="ghost-btn">View</button></td></tr>)}</tbody></table></div>}<div className="table-footer"><span>Showing {Math.min(warehouseFiltered.length, 5)} of {warehouseFiltered.length} warehouses</span><div className="pager"><button type="button">1</button><button type="button">2</button><button type="button">3</button></div></div></section>
          </div>
          <aside className="warehouse-right">
            <section className="panel"><h3>Add Warehouse</h3><form onSubmit={addWarehouse} className="warehouse-form"><input placeholder="Warehouse Name" value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} required /><input placeholder="City" value={whForm.city} onChange={(e) => setWhForm({ ...whForm, city: e.target.value })} required /><input placeholder="Latitude" value={whForm.lat} onChange={(e) => setWhForm({ ...whForm, lat: e.target.value })} required /><input placeholder="Longitude" value={whForm.lng} onChange={(e) => setWhForm({ ...whForm, lng: e.target.value })} required /><button type="submit">+ Add Warehouse</button></form></section>
            <section className="panel"><h3>Warehouse Summary</h3><div className="summary-list"><p><span className="dot active" /> Active <strong>{Math.max(warehouses.length - 1, 0)}</strong></p><p><span className="dot warn" /> Low Stock <strong>{Math.min(3, warehouses.length)}</strong></p><p><span className="dot stop" /> Inactive <strong>{warehouses.length > 0 ? 1 : 0}</strong></p></div></section>
          </aside>
        </section>
      </section>}
    </main>
  </div>;
}
