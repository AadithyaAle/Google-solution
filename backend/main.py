from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ai_core.ai_agent import evaluate_transit_risk, neural_copilot_chat
from ai_core.routing import SupplyChainRouter
import asyncio
import time

app = FastAPI(title="JKY AI - Command Center")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
router = SupplyChainRouter()
router.initialize_network()
vehicles_db: dict = {}
recent_risk_scores: list = []

# --- WEBSOCKET ---
class ConnectionManager:
    def __init__(self): self.active_connections = []
    async def connect(self, ws): await ws.accept(); self.active_connections.append(ws)
    def disconnect(self, ws): 
        if ws in self.active_connections: self.active_connections.remove(ws)
    async def broadcast(self, msg):
        for c in self.active_connections:
            try: await c.send_json(msg)
            except: self.active_connections.remove(c)

manager = ConnectionManager()

# --- MODELS ---
class TelemetryPayload(BaseModel):
    shipment_id: str
    current_location: str
    next_destination: str
    weather_condition: str
    vibration_level: float
    temperature: float
    gps_coordinates: dict

class CopilotQuery(BaseModel):
    query: str
    context: dict = {}

# --- ENDPOINTS ---
@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect: manager.disconnect(websocket)

@app.get("/api/vehicles")
async def get_vehicles(): return {"vehicles": list(vehicles_db.values())}

@app.post("/api/vehicles")
async def add_vehicle(v: dict): 
    vehicles_db[v["id"]] = v
    return {"status": "ok"}

@app.delete("/api/vehicles/{vid}")
async def del_vehicle(vid: str):
    if vid in vehicles_db: del vehicles_db[vid]
    return {"status": "ok"}

@app.post("/api/telemetry")
async def process_telemetry(data: TelemetryPayload):
    # Enhanced AI analysis including Health Index
    analysis = evaluate_transit_risk(data.model_dump())
    
    recent_risk_scores.append(analysis["risk_score"])
    if len(recent_risk_scores) > 50: recent_risk_scores.pop(0)

    # Broadcast enriched data
    update = {
        "type": "TELEMETRY_UPDATE",
        "shipment": data.shipment_id,
        "location": data.current_location,
        "gps": data.gps_coordinates,
        "ai_analysis": analysis,
        "telemetry": {
            "vibration": data.vibration_level,
            "temperature": data.temperature,
            "weather": data.weather_condition,
        },
        "timestamp": time.time()
    }
    asyncio.create_task(manager.broadcast(update))
    return {"status": "ok", "ai": analysis}

@app.post("/api/copilot")
async def copilot_chat(q: CopilotQuery):
    # Give the AI context of the whole system
    full_state = {
        "vehicles": list(vehicles_db.values()),
        "risk_trends": recent_risk_scores,
        "network": router.get_network_state()
    }
    response = neural_copilot_chat(q.query, full_state)
    return response

@app.get("/api/stats")
async def get_stats():
    net = router.get_network_state()
    avg_risk = sum(recent_risk_scores)/len(recent_risk_scores) if recent_risk_scores else 0
    return {
        "node_count": len(net["nodes"]),
        "link_count": len(net["links"]),
        "avg_risk": round(avg_risk, 2),
        "fleet_size": len(vehicles_db)
    }

@app.get("/api/network-status")
async def get_net(): return router.get_network_state()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)