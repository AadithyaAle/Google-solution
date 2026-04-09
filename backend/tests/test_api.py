from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

client = TestClient(app)

@patch("main.evaluate_transit_risk", return_value={"risk_score": 8.5, "status": "WARNING", "mitigation_plan": ["Reroute truck"]})
def test_telemetry_high_risk(mock_ai_agent):
    """Tests the AI routing logic when the truck is on the highway (Outside Geo-fence)."""
    payload = {
        "shipment_id": "TEST-123",
        "current_location": "Highway_48",
        "next_destination": "Factory_Mumbai",
        "weather_condition": "Hurricane",
        "vibration_level": 9.9,
        "latitude": 20.0000, # Far away from Mumbai
        "longitude": 73.0000
    }
    
    response = client.post("/api/telemetry", json=payload)
    
    assert response.status_code == 200
    assert response.json()["status"] == "Telemetry processed"
    assert response.json()["geofence"]["status"] == "OUTSIDE"
    mock_ai_agent.assert_called_once()

def test_geofence_breach():
    """Tests that the Geo-Fence triggers properly and skips the AI check when arriving."""
    payload = {
        "shipment_id": "TEST-124",
        "current_location": "Mumbai_Outskirts",
        "next_destination": "Factory_Mumbai",
        "weather_condition": "Clear",
        "vibration_level": 1.2,
        # These coordinates are right on top of the Mumbai Factory
        "latitude": 19.0765, 
        "longitude": 72.8777
    }

    response = client.post("/api/telemetry", json=payload)

    assert response.status_code == 200
    assert response.json()["status"] == "Arrived at destination"
    assert response.json()["geofence"]["status"] == "BREACHED"
    assert "distance_km" in response.json()["geofence"]

def test_optimize_route_endpoint():
    """Tests the standard routing endpoint."""
    payload = {
        "start_node": "Supplier_Delhi",
        "end_node": "Factory_Mumbai"
    }
    response = client.post("/api/optimize-route", json=payload)
    
    assert response.status_code == 200
    assert "optimized_path" in response.json()