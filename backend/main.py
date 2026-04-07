from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ai_core.gemini_agent import evaluate_transit_risk
from ai_core.routing import SupplyChainRouter
import asyncio

app = FastAPI(title="Supply Chain Control Tower")

# Allow the React frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize our Graph Router
router = SupplyChainRouter()
router.add_path("Supplier_Delhi", "Factory_Mumbai", weight=10.0)

# --- WEBSOCKET MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_alert(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()
# -------------------------

class TelemetryPayload(BaseModel):
    shipment_id: str
    current_location: str
    next_destination: str
    weather_condition: str
    vibration_level: float

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    """The frontend will connect to this endpoint to listen for live AI alerts."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/telemetry")
async def process_telemetry(data: TelemetryPayload):
    """Ingests mock data from the simulator and asks AI to evaluate risk."""
    
    # 1. Ask Gemini for the structured JSON response
    ai_analysis = evaluate_transit_risk(data.model_dump())
    
    # 2. If the AI predicts a major disruption, update the graph
    if ai_analysis["risk_score"] > 5.0:
        router.update_risk_penalty(data.current_location, data.next_destination, ai_analysis["risk_score"])
        
        # 3. Broadcast the exact AI mitigation plan to the React frontend LIVE
        alert_payload = {
            "type": "HIGH_RISK_ALERT",
            "shipment": data.shipment_id,
            "location": data.current_location,
            "ai_analysis": ai_analysis
        }
        # Fire and forget the broadcast in the background
        asyncio.create_task(manager.broadcast_alert(alert_payload))

    return {"status": "Telemetry processed", "ai_response": ai_analysis}

class OptimizeRouteRequest(BaseModel):
    start_node: str
    end_node: str

@app.post("/api/optimize-route")
async def optimize_route(request: OptimizeRouteRequest):
    """Optimizes the supply chain route between two nodes."""
    
    # Notice we use 'compute_route' here to match our SupplyChainRouter class
    optimized_path = router.compute_route(request.start_node, request.end_node)
    
    if optimized_path:
        return {"optimized_path": optimized_path, "status": "success"}
    else:
        return {"optimized_path": None, "status": "failed", "message": "No route available"}