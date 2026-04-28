const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).detail || `API error: ${res.status}`);
  return res.json();
}

export const api = {
  dashboard: (role) => getJSON(`/api/dashboard?role=${role}`),
  fleet: () => getJSON(`/api/fleet`),
  mapIndia: () => getJSON("/api/map/india"),
  warehouses: () => getJSON("/api/warehouses"),
  addWarehouse: (payload) => postJSON("/api/warehouses", payload),
  addVehicle: (payload) => postJSON("/api/fleet", payload),
  wsUrl: API_BASE.replace("http", "ws") + "/ws/alerts",
};
