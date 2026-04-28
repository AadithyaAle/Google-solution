from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
from pathlib import Path
import asyncio
import json

from backend.services.geofencing import check_geofence

app = FastAPI(title="GATI Control Tower API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

DATA_FILE = Path(__file__).parent / "data" / "network.json"

class TelemetryPayload(BaseModel):
    shipment_id: str
    current_location: str
    next_destination: str
    weather_condition: str
    vibration_level: float
    latitude: float
    longitude: float

class WarehouseCreate(BaseModel):
    name: str
    city: str
    lat: float
    lng: float

class VehicleCreate(BaseModel):
    vehicle_id: str
    driver: str
    vehicle_type: str
    status: str
    risk: str
    speed_kmh: int
    lat: float
    lng: float
    city: str
    warehouse: str
    from_warehouse: str | None = None
    to_warehouse: str | None = None

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for c in list(self.active_connections):
            try:
                await c.send_json(message)
            except Exception:
                self.disconnect(c)

manager = ConnectionManager()
state = {"config": {}, "fleet": []}


def load_config():
    with DATA_FILE.open("r", encoding="utf-8") as f:
        state["config"] = json.load(f)


def build_alerts():
    fleet = state["fleet"]
    high_risk = sum(1 for f in fleet if f["risk"] == "high")
    in_transit = sum(1 for f in fleet if f["status"] == "in_transit")
    return [
        {"type": "weather", "severity": "medium" if in_transit < 40 else "high", "message": "Live monsoon and storm risk updated.", "count": in_transit},
        {"type": "traffic", "severity": "high" if high_risk > 20 else "medium", "message": "Live congestion estimate updated.", "count": high_risk},
    ]


@app.on_event("startup")
async def startup_event():
    load_config()
    state["config"]["warehouses"] = []
    state["fleet"] = []


@app.get("/api/dashboard")
async def dashboard(role: Literal["admin", "warehouse", "truck"] = "admin"):
    fleet = state["fleet"]
    return {"role": role, "kpis": {"total_vehicles": len(fleet), "moving": sum(1 for f in fleet if f["status"] == "in_transit"), "warehouses": len(state["config"].get("warehouses", [])), "high_risk": sum(1 for f in fleet if f["risk"] == "high")}, "alerts": build_alerts()}


@app.get("/api/fleet")
async def fleet(status: str | None = None, risk: str | None = None, warehouse: str | None = None):
    rows = state["fleet"]
    if status:
        rows = [f for f in rows if f["status"] == status]
    if risk:
        rows = [f for f in rows if f["risk"] == risk]
    if warehouse:
        rows = [f for f in rows if f["warehouse"] == warehouse]
    return {"items": rows, "count": len(rows)}


@app.post("/api/fleet")
async def add_vehicle(payload: VehicleCreate):
    if any(v["vehicle_id"] == payload.vehicle_id for v in state["fleet"]):
        raise HTTPException(status_code=409, detail="vehicle_id already exists")
    state["fleet"].append(payload.model_dump())
    asyncio.create_task(manager.broadcast({"type": "LIVE_STATE_UPDATED"}))
    return {"status": "created", "item": payload.model_dump()}


@app.get("/api/warehouses")
async def warehouses():
    return {"items": state["config"].get("warehouses", [])}


@app.post("/api/warehouses")
async def add_warehouse(payload: WarehouseCreate):
    items = state["config"].setdefault("warehouses", [])
    if any(w["name"] == payload.name for w in items):
        raise HTTPException(status_code=409, detail="warehouse name already exists")
    items.append(payload.model_dump())
    asyncio.create_task(manager.broadcast({"type": "LIVE_STATE_UPDATED"}))
    return {"status": "created", "item": payload.model_dump()}


@app.get("/api/map/india")
async def india_map():
    return {"center": state["config"].get("map", {}).get("center", {"lat": 22.9734, "lng": 78.6569, "zoom": 5}), "vehicles": [{"id": f["vehicle_id"], "lat": f["lat"], "lng": f["lng"], "status": f["status"], "risk": f["risk"], "city": f["city"], "from_warehouse": f.get("from_warehouse"), "to_warehouse": f.get("to_warehouse"), "speed_kmh": f.get("speed_kmh", 0)} for f in state["fleet"]]}


@app.post("/api/telemetry")
async def process_telemetry(data: TelemetryPayload):
    warehouse_coords = {w["name"]: {"lat": w["lat"], "lng": w["lng"]} for w in state["config"].get("warehouses", [])}
    fence_status = check_geofence(data.latitude, data.longitude, data.next_destination, warehouse_coords)
    asyncio.create_task(manager.broadcast({"type": "TELEMETRY", "shipment": data.shipment_id, "location": data.current_location, "geofence": fence_status}))
    return {"status": "Telemetry processed", "geofence": fence_status}


@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
