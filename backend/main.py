from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ai_core.routing import SupplyChainRouter
from ai_core.gemini_agent import evaluate_transit_risk

# Initialize the API
app = FastAPI(title="B2B Smart Supply Chain API")
router = SupplyChainRouter()

# Pre-populate our B2B Graph (You would normally load this from a database)
router.add_path("Supplier_Delhi", "Factory_Mumbai", 14.0)
router.add_path("Supplier_Delhi", "Hub_Jaipur", 5.0)
router.add_path("Hub_Jaipur", "Factory_Mumbai", 8.0)

# Data Models for our API
class TelemetryPayload(BaseModel):
    shipment_id: str
    current_location: str
    next_destination: str
    weather_condition: str
    vibration_level: float

class RouteRequest(BaseModel):
    start_node: str
    end_node: str

@app.post("/api/telemetry")
async def process_telemetry(data: TelemetryPayload):
    """Ingests mock data from the simulator and asks AI to evaluate risk."""
    risk_score = evaluate_transit_risk(data.model_dump())
    
    # If the AI predicts a major disruption, update the graph
    if risk_score > 5.0:
        router.update_risk_penalty(data.current_location, data.next_destination, risk_score)
        return {"status": "Warning", "message": f"High risk ({risk_score}) detected. Graph updated."}
        
    return {"status": "OK", "message": "Telemetry processed."}

@app.post("/api/optimize-route")
async def optimize_route(request: RouteRequest):
    """The React dashboard calls this to get the fastest live route."""
    path = router.compute_route(request.start_node, request.end_node)
    
    if not path:
        raise HTTPException(status_code=404, detail="No viable route found")
        
    return {"optimized_path": path}