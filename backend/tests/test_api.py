from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch

# Create a mock client that talks to your FastAPI app
client = TestClient(app)

def test_optimize_route_endpoint():
    # Test valid route
    response = client.post(
        "/api/optimize-route", 
        json={"start_node": "Supplier_Delhi", "end_node": "Factory_Mumbai"}
    )
    assert response.status_code == 200
    assert "optimized_path" in response.json()

# We use @patch to intercept the AI call and force it to return a fake score (e.g., 8.5)
@patch("main.evaluate_transit_risk", return_value=8.5)
def test_telemetry_high_risk(mock_ai_agent):
    payload = {
        "shipment_id": "TEST-123",
        "current_location": "Supplier_Delhi",
        "next_destination": "Factory_Mumbai",
        "weather_condition": "Hurricane",
        "vibration_level": 9.9
    }
    
    response = client.post("/api/telemetry", json=payload)
    
    assert response.status_code == 200
    # Because our fake AI returned 8.5 (> 5.0), the system should issue a Warning
    assert response.json()["status"] == "Warning"
    mock_ai_agent.assert_called_once() # Verify our fake AI was actually triggered