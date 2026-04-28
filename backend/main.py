import sys
from pathlib import Path

current_dir = Path(__file__).resolve().parent
sys.path.append(str(current_dir))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal
from pathlib import Path
import asyncio
import json
import math
from schemas import OptimizeRouteRequest  # adjust filename as needed

# Team Arohan Database Imports
from database import engine, get_db
import models

# Team Arohan Custom Services
from ai_core.ai_agent import evaluate_transit_risk
from ai_core.routing import SupplyChainRouter

app = FastAPI(title="GATI Control Tower API")

# Creates the tables in PostgreSQL
models.Base.metadata.create_all(bind=engine)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

DATA_FILE = Path(__file__).parent / "data" / "network.json"
router = SupplyChainRouter()

# --- PYDANTIC MODELS ---
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

class OptimizeRouteRequest(BaseModel):
    start_node: str
    end_node: str

# --- WEBSOCKET MANAGER ---
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
                
    async def broadcast_alert(self, message: dict):
        await self.broadcast(message)

manager = ConnectionManager()

# Load static map config only (Data now lives in DB!)
state = {"config": {}}
def load_config():
    with DATA_FILE.open("r", encoding="utf-8") as f:
        state["config"] = json.load(f)

@app.on_event("startup")
async def startup_event():
    load_config()

# --- DATABASE CONNECTED ENDPOINTS ---

@app.get("/api/dashboard")
async def dashboard(role: Literal["admin", "warehouse", "truck"] = "admin", db: Session = Depends(get_db)):
    # Fetch live counts directly from PostgreSQL
    total_vehicles = db.query(models.Vehicle).count()
    moving = db.query(models.Vehicle).filter(models.Vehicle.status == "in_transit").count()
    high_risk = db.query(models.Vehicle).filter(models.Vehicle.risk == "high").count()
    total_warehouses = db.query(models.Warehouse).count()
    
    alerts = [
        {"type": "weather", "severity": "medium" if moving < 40 else "high", "message": "Live monsoon and storm risk updated.", "count": moving},
        {"type": "traffic", "severity": "high" if high_risk > 20 else "medium", "message": "Live congestion estimate updated.", "count": high_risk},
    ]
    return {"role": role, "kpis": {"total_vehicles": total_vehicles, "moving": moving, "warehouses": total_warehouses, "high_risk": high_risk}, "alerts": alerts}

@app.get("/api/fleet")
async def fleet(status: str | None = None, risk: str | None = None, warehouse: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Vehicle)
    if status: query = query.filter(models.Vehicle.status == status)
    if risk: query = query.filter(models.Vehicle.risk == risk)
    if warehouse: query = query.filter(models.Vehicle.warehouse == warehouse)
    
    rows = query.all()
    return {"items": rows, "count": len(rows)}

@app.post("/api/fleet")
async def add_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Vehicle).filter(models.Vehicle.vehicle_id == payload.vehicle_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="vehicle_id already exists")
    
    new_vehicle = models.Vehicle(**payload.model_dump())
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    
    asyncio.create_task(manager.broadcast({"type": "LIVE_STATE_UPDATED"}))
    return {"status": "created", "item": payload.model_dump()}

@app.get("/api/warehouses")
async def warehouses(db: Session = Depends(get_db)):
    items = db.query(models.Warehouse).all()
    return {"items": items}

@app.post("/api/warehouses")
async def add_warehouse(payload: WarehouseCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Warehouse).filter(models.Warehouse.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="warehouse name already exists")
    
    new_warehouse = models.Warehouse(**payload.model_dump())
    db.add(new_warehouse)
    db.commit()
    db.refresh(new_warehouse)
    
    asyncio.create_task(manager.broadcast({"type": "LIVE_STATE_UPDATED"}))
    return {"status": "created", "item": payload.model_dump()}

@app.get("/api/map/india")
async def india_map(db: Session = Depends(get_db)):
    vehicles = db.query(models.Vehicle).all()
    v_list = [{"id": f.vehicle_id, "lat": f.lat, "lng": f.lng, "status": f.status, "risk": f.risk, "city": f.city, "from_warehouse": f.from_warehouse, "to_warehouse": f.to_warehouse, "speed_kmh": f.speed_kmh} for f in vehicles]
    
    return {"center": state["config"].get("map", {}).get("center", {"lat": 22.9734, "lng": 78.6569, "zoom": 5}), "vehicles": v_list}

# --- UNIFIED TELEMETRY ENDPOINT ---
@app.post("/api/telemetry")
async def process_telemetry(data: TelemetryPayload, db: Session = Depends(get_db)):
    # 1. Grab dynamic warehouses from Database!
    db_warehouses = db.query(models.Warehouse).all()
    warehouse_coords = {w.name: {"lat": w.lat, "lng": w.lng} for w in db_warehouses}
    
    # 2. Check Geo-fence
    fence_status = check_geofence(data.latitude, data.longitude, data.next_destination, warehouse_coords)
    
    if fence_status["status"] == "BREACHED":
        arrival_payload = {"type": "GEOFENCE_ALERT", "shipment": data.shipment_id, "destination": data.next_destination, "message": fence_status["message"]}
        asyncio.create_task(manager.broadcast_alert(arrival_payload))
        return {"status": "Arrived at destination", "geofence": fence_status}

    # 3. Ask Gemini for AI evaluation
    ai_analysis = evaluate_transit_risk(data.model_dump())
    
    if ai_analysis["risk_score"] > 5.0:
        router.update_risk_penalty(data.current_location, data.next_destination, ai_analysis["risk_score"])
        alert_payload = {"type": "HIGH_RISK_ALERT", "shipment": data.shipment_id, "location": data.current_location, "ai_analysis": ai_analysis}
        asyncio.create_task(manager.broadcast_alert(alert_payload))

    asyncio.create_task(manager.broadcast({"type": "TELEMETRY", "shipment": data.shipment_id, "location": data.current_location, "geofence": fence_status}))
    return {"status": "Telemetry processed", "ai_response": ai_analysis, "geofence": fence_status}

@app.post("/api/optimize-route")
async def optimize_route(request: OptimizeRouteRequest):
    optimized_path = router.compute_route(request.start_node, request.end_node)
    if optimized_path:
        return {"optimized_path": optimized_path, "status": "success"}
    return {"optimized_path": None, "status": "failed", "message": "No route available"}

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- UNIFIED GEO-FENCE MATH ---
R = 6371.0

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def check_geofence(truck_lat: float, truck_lon: float, destination_name: str, warehouses: dict[str, dict[str, float]]) -> dict:
    dest_coords = warehouses.get(destination_name)
    if not dest_coords:
        return {"status": "UNKNOWN_DESTINATION"}

    distance = calculate_distance(truck_lat, truck_lon, dest_coords["lat"], dest_coords["lng"])
    if distance <= 2.0:
        return {
            "status": "BREACHED",
            "distance_km": round(distance, 2),
            "message": f"Vehicle has entered {destination_name} perimeter."
        }

    return {"status": "OUTSIDE", "distance_km": round(distance, 2)}