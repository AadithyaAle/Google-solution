import requests
import time
import random
import json

# Configuration
BACKEND_URL = "http://localhost:8000"
SHIPMENTS = [
    {"id": "TRUCK_001", "start": "Mumbai_Hub", "end": "Delhi_Hub", "current": "Mumbai_Hub", "next": "Pune_Factory"},
    {"id": "TRUCK_002", "start": "Delhi_Hub", "end": "Bangalore_Hub", "current": "Delhi_Hub", "next": "Jaipur_Edge"},
    {"id": "TRUCK_003", "start": "Bangalore_Hub", "end": "Mumbai_Hub", "current": "Bangalore_Hub", "next": "Chennai_Hub"},
]

LOCATIONS = {
    "Mumbai_Hub": {"lat": 19.0760, "lng": 72.8777},
    "Delhi_Hub": {"lat": 28.6139, "lng": 77.2090},
    "Bangalore_Hub": {"lat": 12.9716, "lng": 77.5946},
    "Chennai_Hub": {"lat": 13.0827, "lng": 80.2707},
    "Kolkata_Hub": {"lat": 22.5726, "lng": 88.3639},
    "Pune_Factory": {"lat": 18.5204, "lng": 73.8567},
    "Ahmedabad_Warehouse": {"lat": 23.0225, "lng": 72.5714},
    "Jaipur_Edge": {"lat": 26.9124, "lng": 75.7873},
}

WEATHERS = ["CLEAR", "RAINY", "HEAVY_STORM", "FOGGY"]

def generate_telemetry(shipment):
    # Base coordinates
    base_gps = LOCATIONS.get(shipment["current"], {"lat": 20.0, "lng": 75.0})
    
    # Add a tiny bit of random jitter to simulate movement
    gps = {
        "lat": base_gps["lat"] + random.uniform(-0.01, 0.01),
        "lng": base_gps["lng"] + random.uniform(-0.01, 0.01)
    }
    
    # Decide risk factors
    weather = random.choice(WEATHERS)
    # Occasionally trigger high risk
    is_high_risk = random.random() < 0.1 
    
    if is_high_risk:
        vibration = random.uniform(8.0, 15.0) # High vibration
        temp = random.uniform(35.0, 45.0)    # High temp
        weather = "HEAVY_STORM"
    else:
        vibration = random.uniform(1.0, 4.0)
        temp = random.uniform(18.0, 25.0)

    return {
        "shipment_id": shipment["id"],
        "current_location": shipment["current"],
        "next_destination": shipment["next"],
        "weather_condition": weather,
        "vibration_level": vibration,
        "temperature": temp,
        "gps_coordinates": gps
    }

def run_simulation():
    print("🚀 Starting Supply Chain Simulator...")
    while True:
        for shipment in SHIPMENTS:
            payload = generate_telemetry(shipment)
            try:
                response = requests.post(f"{BACKEND_URL}/api/telemetry", json=payload)
                if response.status_code == 200:
                    print(f"✅ Sent telemetry for {shipment['id']}: Risk Score {response.json().get('ai_response', {}).get('risk_score')}")
                else:
                    print(f"❌ Error sending telemetry: {response.status_code}")
            except Exception as e:
                print(f"⚠️ Could not connect to backend: {e}")
            
            time.sleep(1) # Send one update per second
        
        # Periodically move shipments (simulated)
        # In a real app, this would be more complex
        time.sleep(2)

if __name__ == "__main__":
    run_simulation()
