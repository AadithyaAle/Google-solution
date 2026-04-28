<div align="center">

<img src="https://img.shields.io/badge/Google%20Solution%20Challenge-2025-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
<img src="https://img.shields.io/badge/OpenAI_GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white"/>
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white"/>

<br/>

# 🛰️ GATI Control Tower

**Real-time AI-Powered Logistics Intelligence for India's Supply Chain**

*Fleet tracking · Geofencing · Predictive risk assessment · Neural route optimization*

[**🌐 Live Showcase**](./showcase.html) · [**📡 API Docs**](http://localhost:8000/docs) · [**🚀 Quick Start**](#-quick-start)

</div>

---

## ✨ What is GATI?

**GATI Control Tower** is a full-stack, production-grade logistics command platform built for India's complex supply chain landscape. It fuses a **GPT-4o Neural Engine**, **Dijkstra-based route optimization**, **Haversine geofencing**, and a **WebSocket live-state bus** into a single, beautiful React dashboard.

> Built as a submission for the **Google Solution Challenge 2025** — addressing real-world logistics inefficiency, predictive maintenance gaps, and route safety across India.

---

## 🏗️ 3D System Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                    GATI  CONTROL  TOWER  v1.0                       ║
║                    ─────────────────────────                        ║
║                                                                      ║
║   ┌──────────────────────────────────────────────────────────────┐  ║
║   │  🖥️  REACT / TYPESCRIPT FRONTEND  (port 5173)               │  ║
║   │                                                              │  ║
║   │   ┌───────────┐  ┌───────────┐  ┌────────────┐             │  ║
║   │   │Dashboard  │  │FleetView  │  │RiskMonitor │             │  ║
║   │   │View.tsx   │  │.tsx       │  │View.tsx    │             │  ║
║   │   └─────┬─────┘  └─────┬─────┘  └─────┬──────┘             │  ║
║   │         └──────────────┼──────────────┘                     │  ║
║   │                        │                                     │  ║
║   │   ┌────────────────────┼────────────────────────┐           │  ║
║   │   │         CopilotPanel.tsx  +  LiveMap.tsx     │           │  ║
║   │   │         OrchestrationView.tsx                │           │  ║
║   │   └────────────────────┬────────────────────────┘           │  ║
║   └────────────────────────┼────────────────────────────────────┘  ║
║                  HTTP REST  │  WebSocket (/ws/alerts)               ║
║   ╔════════════════════════╪════════════════════════════════════╗   ║
║   ║  ⚡  FASTAPI BACKEND   │  (port 8000)                      ║   ║
║   ║                        │                                    ║   ║
║   ║   ┌────────────────────▼──────────────────────┐            ║   ║
║   ║   │           main.py  (API Router)            │            ║   ║
║   ║   │  GET /dashboard  POST /fleet  GET /map     │            ║   ║
║   ║   │  POST /telemetry  WS /ws/alerts            │            ║   ║
║   ║   └──────┬────────────────┬───────────────┬───┘            ║   ║
║   ║          │                │               │                 ║   ║
║   ║   ┌──────▼──────┐  ┌──────▼──────┐  ┌────▼──────┐        ║   ║
║   ║   │  ai_core/   │  │  services/  │  │simulation/│        ║   ║
║   ║   │             │  │             │  │           │        ║   ║
║   ║   │ ai_agent.py │  │geofencing.py│  │simulator  │        ║   ║
║   ║   │ GPT-4o Risk │  │Haversine    │  │.py        │        ║   ║
║   ║   │ Evaluation  │  │sub-2km fence│  │15% failure│        ║   ║
║   ║   │             │  │             │  │mode inject│        ║   ║
║   ║   │ routing.py  │  │image_svc.py │  │           │        ║   ║
║   ║   │ NetworkX    │  │DALL·E 3     │  │           │        ║   ║
║   ║   │ Dijkstra    │  │image cache  │  │           │        ║   ║
║   ║   └─────────────┘  └─────────────┘  └───────────┘        ║   ║
║   ╚════════════════════════════════════════════════════════════╝   ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 🗺️ India Logistics Network Graph

```
        Jaipur_Edge ────────────── Delhi_Hub
           (8.0)                /     |      \
                               /    (40.0)  (25.0)
          Ahmedabad_Warehouse /       |       \
                  |          /    Kolkata_Hub  Ahmedabad_Warehouse
               (15.0)       /         |
                  |         /       (45.0)
              Mumbai_Hub ──(30.0)── Bangalore_Hub
                  |                    |
               (5.0)               (10.0)
                  |                    |
              Pune_Factory ──(20.0)── Chennai_Hub

  Edge Status:  ● NOMINAL (≤20)   ● WARNING (≤50)   ● CRITICAL (>50)
```

> The **`SupplyChainRouter`** dynamically re-weights edges based on AI risk scores, then runs **Dijkstra's algorithm** (via NetworkX) to find the safest re-route in milliseconds.

---

## 🚀 Core Features

| Feature | Description | Technology |
|---|---|---|
| 🗺️ **Live India Map** | Real-time vehicle positions, color-coded by risk | React + Leaflet |
| 🧠 **Neural Copilot** | GPT-4o powered fleet Q&A and route optimization | OpenAI API |
| 🛣️ **Route Optimizer** | Dijkstra shortest-path with live risk re-weighting | NetworkX |
| 📡 **Geofencing** | Sub-2km warehouse perimeter detection | Haversine formula |
| ⚡ **Live Telemetry** | WebSocket broadcast <100ms latency | FastAPI + WS |
| 🔧 **Predictive Maintenance** | 15% failure-mode simulation (vibration/temp) | Python simulator |
| 📊 **Risk Dashboard** | NOMINAL / WARNING / CRITICAL live scoring | React + Chart.js |
| 🏢 **Warehouse Cards** | DALL·E 3 generated imagery with glassmorphic UI | OpenAI Images API |
| 🚛 **Fleet Cards** | AI-generated vehicle imagery, driver & status info | OpenAI Images API |
| 🔒 **Role-Based Views** | Admin / Warehouse / Truck manager roles | FastAPI query param |

---

## 📁 Project Structure

```
Google-solution/
├── backend/
│   ├── main.py                  # FastAPI app, all REST + WebSocket routes
│   ├── requirements.txt         # Python deps
│   ├── .env.example             # Environment variable template
│   ├── ai_core/
│   │   ├── ai_agent.py          # GPT-4o risk evaluation + Neural Copilot chat
│   │   └── routing.py           # NetworkX SupplyChainRouter (Dijkstra)
│   ├── services/
│   │   ├── geofencing.py        # Haversine geofence check
│   │   ├── image_service.py     # DALL·E 3 image generation & caching
│   │   └── telemetry_svc.py     # Telemetry processing helpers
│   ├── simulation/
│   │   └── simulator.py         # Live telemetry generator (15% failure injection)
│   ├── models/
│   │   ├── orm_models.py        # Data models
│   │   └── schemas.py           # Pydantic schemas
│   ├── data/
│   │   └── network.json         # Initial network config
│   └── tests/                   # pytest test suite
│
├── frontend/
│   └── src/
│       ├── app.jsx              # React root, routing, global state
│       ├── main.jsx             # Vite entry point
│       ├── styles.css           # Global glassmorphic design system
│       └── components/
│           ├── DashboardLayout.tsx    # Sidebar + nav shell
│           ├── DashboardView.tsx      # KPI cards + alert feed
│           ├── FleetView.tsx          # Fleet cards grid
│           ├── FleetCard.jsx          # Individual vehicle card
│           ├── WarehouseCard.jsx      # Individual warehouse card
│           ├── LiveMap.tsx            # India map with vehicle pins
│           ├── RiskMonitoringView.tsx # Risk scores + health index
│           ├── CopilotPanel.tsx       # GPT-4o chat interface
│           ├── OrchestrationView.tsx  # Network graph visualization
│           ├── AlertFeed.jsx          # Live alert ticker
│           ├── AlertPanel.tsx         # Alert history panel
│           ├── ConfigView.tsx         # Warehouse/vehicle configuration
│           └── AuthPage.tsx           # Login / role selection
│
├── showcase.html                # 🌟 Interactive 3D showcase page
├── package.json                 # Root npm scripts
└── README.md                    # This file
```

---

## ⚡ Data Flow

```
GPS Sensor / Simulator
        │
        ▼ POST /api/telemetry
┌───────────────────┐
│   FastAPI Router  │  ← validates TelemetryPayload (Pydantic)
└────────┬──────────┘
         │
         ├── services/geofencing.py
         │        └── Haversine check → BREACHED / OUTSIDE
         │
         ├── ai_core/ai_agent.py
         │        └── GPT-4o → risk_score, health_index, maintenance_alert
         │
         └── ConnectionManager.broadcast()
                  └── WebSocket push → all React dashboard clients
                            └── UI state update (map pin, risk panel, alerts)
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | KPI summary + alert feed (role: admin/warehouse/truck) |
| `GET` | `/api/fleet` | List vehicles — filterable by `status`, `risk`, `warehouse` |
| `POST` | `/api/fleet` | Register a new vehicle |
| `GET` | `/api/warehouses` | List all warehouses |
| `POST` | `/api/warehouses` | Register a new warehouse |
| `GET` | `/api/map/india` | Live vehicle coordinates for map rendering |
| `POST` | `/api/telemetry` | Ingest telemetry → geofence → broadcast |
| `GET` | `/docs` | Swagger interactive API documentation |
| `WS` | `/ws/alerts` | Persistent real-time alert + state broadcast |

---

## 🤖 AI Intelligence Layer

### GPT-4o Risk Evaluation (`ai_agent.py`)

```python
# Evaluates every telemetry burst for dual-axis risk
evaluate_transit_risk(telemetry_data)
# Returns:
{
  "risk_score": float,          # 0–10
  "health_index": int,          # 0–100 (100 = perfect)
  "status": "NOMINAL|WARNING|CRITICAL",
  "maintenance_alert": str,     # null if healthy
  "mitigation_plan": [str],
  "technical_summary": str
}
```

### Neural Copilot Chat (`ai_agent.py`)

```python
neural_copilot_chat(user_query, system_state)
# Returns:
{
  "message": str,               # markdown-formatted response
  "action_suggested": str,      # null if no action needed
  "sentiment": "NEUTRAL|ALERT|SUCCESS"
}
```

> **Simulation Fallback**: When `OPENAI_API_KEY` is absent, a professional dynamic simulation engine generates realistic, context-aware responses — fleet queries, routing analysis, and status reports all respond professionally.

---

## 🛣️ Route Optimizer (`routing.py`)

```python
router = SupplyChainRouter()
router.initialize_network()           # 8 nodes, 9 edges
router.update_risk_penalty(           # AI penalizes unsafe edges
    "Delhi_Hub", "Kolkata_Hub",
    risk_score=8.5                    # weight +85 → Dijkstra avoids it
)
path = router.compute_route(          # Safest path found instantly
    "Mumbai_Hub", "Chennai_Hub"
)
# → ['Mumbai_Hub', 'Bangalore_Hub', 'Chennai_Hub']
```

---

## 📍 Geofencing (`geofencing.py`)

```python
# Haversine distance from truck GPS to warehouse centroid
fence = check_geofence(
    truck_lat=19.08, truck_lon=72.88,
    destination_name="Mumbai_Hub",
    warehouses={"Mumbai_Hub": {"lat": 19.076, "lng": 72.877}}
)
# → {"status": "BREACHED", "distance_km": 0.41, "message": "..."}
# → {"status": "OUTSIDE",  "distance_km": 12.3}
```

Precision: **< 2 km** radius; triggers instant WebSocket broadcast to all listening dashboards.

---

## 🛠️ Tech Stack

### Backend
| Library | Version | Role |
|---|---|---|
| **FastAPI** | latest | REST API + WebSocket server |
| **Uvicorn** | latest | ASGI production server |
| **NetworkX** | latest | Graph-based Dijkstra routing |
| **OpenAI** | latest | GPT-4o risk evaluation + DALL·E 3 images |
| **Pydantic** | latest | Request/response validation |
| **python-dotenv** | latest | Environment configuration |
| **pytest + httpx** | latest | Test suite |

### Frontend
| Library | Version | Role |
|---|---|---|
| **React 18** | 18.x | UI component framework |
| **TypeScript** | 5.x | Type-safe development |
| **Vite** | latest | Ultra-fast dev server + bundler |
| **Leaflet / react-leaflet** | latest | Interactive India map |
| **Chart.js** | latest | Risk + performance charts |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- (Optional) OpenAI API key for GPT-4o + DALL·E 3

### 1 — Clone & install backend

```bash
git clone https://github.com/your-org/Google-solution.git
cd Google-solution
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 2 — Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env:
# OPENAI_API_KEY=sk-...   ← required for live AI; omit for simulation mode
```

### 3 — Start backend

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
# API → http://localhost:8000
# Docs → http://localhost:8000/docs
```

### 4 — Start frontend

```bash
# In a new terminal:
npm run frontend:install   # installs frontend node_modules
npm run dev                # starts Vite on http://localhost:5173
```

### 5 — (Optional) Run live telemetry simulator

```bash
python -m backend.simulation.simulator
# Generates GPS drift, weather events, and 15% vehicle failure scenarios
```

### 6 — Open the 3D Showcase

```bash
open showcase.html   # or drag into any browser
```

---

## 🎭 Simulation Mode

When no OpenAI API key is configured, GATI activates its **Professional Simulation Engine**:

- **Risk Evaluator** returns canned NOMINAL telemetry with realistic health scores
- **Neural Copilot** generates context-aware fleet status, routing optimization, and protocol reports from dynamic templates
- **All WebSocket events** still fire in real-time through the Python simulator

This ensures a fully functional demo environment with zero external dependencies.

---

## 🧪 Running Tests

```bash
source .venv/bin/activate
pytest backend/tests/ -v
```

---

## 📦 Root Scripts

```bash
npm run dev              # Start Vite frontend dev server
npm run build            # Build production bundle
npm run preview          # Preview production build
npm run frontend:install # Install frontend dependencies
```

---

## 📸 Interactive 3D Showcase

Open **`showcase.html`** in any browser for:

- **Three.js particle hero** with animated star field
- **3D architecture layer diagram** — auto-rotating camera orbit through all system tiers
- **Live supply-chain network graph** — 8 nodes, 9 edges, pulsing risk-colored connections
- **Chart.js analytics** — Risk donut, hub throughput bar, weather line chart, route weight radar
- **Full feature gallery, API reference, and setup walkthrough**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Built with ❤️ for the **Google Solution Challenge 2025**

**FastAPI · React · GPT-4o · NetworkX · WebSocket · Three.js**

</div>
