from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Literal
from pathlib import Path
import asyncio
import json

from backend.services.geofencing import check_geofence
from backend.services.image_service import generate_warehouse_image, generate_vehicle_image

app = FastAPI(title="GATI Control Tower API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Serve cached AI-generated images
STATIC_PATH = Path(__file__).parent / "static"
STATIC_PATH.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_PATH)), name="static")

CONFIG_FILE = Path(__file__).parent / "data" / "network.json"
STATE_FILE = Path(__file__).parent / "data" / "runtime_state.json"

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
    driver_phone: str
    vehicle_type: str
    from_warehouse: str
    to_warehouse: str

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
state = {"config": {}, "fleet": [], "warehouses": []}


def save_state():
    STATE_FILE.write_text(json.dumps({"fleet": state["fleet"], "warehouses": state["warehouses"]}, indent=2), encoding="utf-8")


def load_all():
    state["config"] = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    if STATE_FILE.exists():
        persisted = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        state["fleet"] = persisted.get("fleet", [])
        state["warehouses"] = persisted.get("warehouses", [])
    else:
        state["fleet"] = []
        state["warehouses"] = []
        save_state()




def find_warehouse(ref: str):
    key = (ref or "").strip().lower()
    for w in state["warehouses"]:
        if w["name"].strip().lower() == key or w["city"].strip().lower() == key:
            return w
    return None

def build_alerts():
    fleet = state["fleet"]
    high_risk = sum(1 for f in fleet if f.get("risk") == "high")
    in_transit = sum(1 for f in fleet if f.get("status") == "in_transit")
    return [
        {"type": "weather", "severity": "medium" if in_transit < 40 else "high", "message": "Live monsoon and storm risk updated.", "count": in_transit},
        {"type": "traffic", "severity": "high" if high_risk > 20 else "medium", "message": "Live congestion estimate updated.", "count": high_risk},
    ]


@app.on_event("startup")
async def startup_event():
    load_all()


@app.get("/api/dashboard")
async def dashboard(role: Literal["admin", "warehouse", "truck"] = "admin"):
    fleet = state["fleet"]
    return {"role": role, "kpis": {"total_vehicles": len(fleet), "moving": sum(1 for f in fleet if f.get("status") == "in_transit"), "warehouses": len(state["warehouses"]), "high_risk": sum(1 for f in fleet if f.get("risk") == "high")}, "alerts": build_alerts()}


@app.get("/api/fleet")
async def fleet():
    return {"items": state["fleet"], "count": len(state["fleet"])}


@app.post("/api/fleet")
async def add_vehicle(payload: VehicleCreate):
    if any(v["vehicle_id"] == payload.vehicle_id for v in state["fleet"]):
        raise HTTPException(status_code=409, detail="vehicle_id already exists")

    src = find_warehouse(payload.from_warehouse)
    dst = find_warehouse(payload.to_warehouse)
    if not src or not dst:
        raise HTTPException(status_code=400, detail="from/to warehouse not found (use existing warehouse name or city)")

    # Generate AI vehicle image (async)
    try:
        vehicle_image = await generate_vehicle_image(payload.vehicle_type)
    except Exception:
        vehicle_image = None

    item = {
        "vehicle_id": payload.vehicle_id,
        "driver": payload.driver,
        "driver_phone": payload.driver_phone,
        "vehicle_type": payload.vehicle_type,
        "from_warehouse": payload.from_warehouse,
        "to_warehouse": payload.to_warehouse,
        "city": src["city"],
        "warehouse": src["name"],
        "lat": src["lat"],
        "lng": src["lng"],
        "status": "in_transit",
        "risk": "safe",
        "speed_kmh": 35,
        "image_url": vehicle_image,
    }
    state["fleet"].append(item)
    save_state()
    asyncio.create_task(manager.broadcast({"type": "LIVE_STATE_UPDATED"}))
    return {"status": "created", "item": item}


@app.get("/api/warehouses")
async def warehouses():
    return {"items": state["warehouses"]}


@app.post("/api/warehouses")
async def add_warehouse(payload: WarehouseCreate):
    if any(w["name"] == payload.name for w in state["warehouses"]):
        raise HTTPException(status_code=409, detail="warehouse name already exists")
    item = payload.model_dump()
    # Generate AI warehouse image (async, non-blocking)
    try:
        image_url = await generate_warehouse_image(payload.name, payload.city)
        item["image_url"] = image_url
    except Exception:
        item["image_url"] = None
    state["warehouses"].append(item)
    save_state()
    asyncio.create_task(manager.broadcast({"type": "LIVE_STATE_UPDATED"}))
    return {"status": "created", "item": item}


@app.get("/api/warehouses/{name}/image")
async def warehouse_image(name: str):
    """On-demand image regeneration for a warehouse."""
    wh = next((w for w in state["warehouses"] if w["name"] == name), None)
    if not wh:
        raise HTTPException(status_code=404, detail="warehouse not found")
    image_url = await generate_warehouse_image(wh["name"], wh["city"])
    if image_url:
        wh["image_url"] = image_url
        save_state()
    return {"image_url": image_url}


@app.get("/api/map/india")
async def india_map():
    center = state["config"].get("map", {}).get("center", {"lat": 22.9734, "lng": 78.6569, "zoom": 5})
    return {
        "center": center,
        "warehouses": state["warehouses"],
        "vehicles": [{"id": f["vehicle_id"], "lat": f["lat"], "lng": f["lng"], "status": f["status"], "risk": f["risk"], "city": f["city"]} for f in state["fleet"]],
    }


@app.post("/api/telemetry")
async def process_telemetry(data: TelemetryPayload):
    warehouse_coords = {w["name"]: {"lat": w["lat"], "lng": w["lng"]} for w in state["warehouses"]}
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
