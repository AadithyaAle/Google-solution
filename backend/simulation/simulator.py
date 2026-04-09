import requests
import time
import random

BACKEND_URL = "http://localhost:8000"

LOCATIONS = {
    "Mumbai_Hub":          {"lat": 19.0760, "lng": 72.8777},
    "Delhi_Hub":           {"lat": 28.6139, "lng": 77.2090},
    "Bangalore_Hub":       {"lat": 12.9716, "lng": 77.5946},
    "Chennai_Hub":         {"lat": 13.0827, "lng": 80.2707},
    "Kolkata_Hub":         {"lat": 22.5726, "lng": 88.3639},
    "Pune_Factory":        {"lat": 18.5204, "lng": 73.8567},
    "Ahmedabad_Warehouse": {"lat": 23.0225, "lng": 72.5714},
    "Jaipur_Edge":         {"lat": 26.9124, "lng": 75.7873},
}

LOCATION_KEYS = list(LOCATIONS.keys())
WEATHERS = ["CLEAR", "RAINY", "HEAVY_STORM", "FOGGY", "HEATWAVE"]

def fetch_registered_vehicles():
    try:
        res = requests.get(f"{BACKEND_URL}/api/vehicles", timeout=5)
        if res.status_code == 200:
            vehicles = res.json().get("vehicles", [])
            if vehicles:
                return [{"id": v["id"], "current": random.choice(LOCATION_KEYS), "next": random.choice(LOCATION_KEYS)} for v in vehicles]
    except: pass
    return [{"id": "ZENITH_TRUCK_X", "current": "Mumbai_Hub", "next": "Delhi_Hub"}]

def generate_telemetry(shipment: dict):
    # Introduce "Failure Modes" for Predictive Maintenance demonstration
    is_failing = random.random() < 0.15 # 15% chance of health dip
    
    vibration = random.uniform(12.0, 20.0) if is_failing else random.uniform(0.5, 4.0)
    temperature = random.uniform(42.0, 55.0) if is_failing else random.uniform(20.0, 30.0)
    
    return {
        "shipment_id": shipment["id"],
        "current_location": shipment["current"],
        "next_destination": shipment["next"],
        "weather_condition": random.choice(WEATHERS),
        "vibration_level": round(vibration, 2),
        "temperature": round(temperature, 2),
        "gps_coordinates": {
            "lat": LOCATIONS[shipment["current"]]["lat"] + random.uniform(-0.02, 0.02),
            "lng": LOCATIONS[shipment["current"]]["lng"] + random.uniform(-0.02, 0.02),
        }
    }

def run():
    print("🚀 ZENITH OS: Tactical Simulator Online")
    shipments = fetch_registered_vehicles()
    
    while True:
        for s in shipments:
            # Maybe move
            if random.random() < 0.05:
                s["current"] = s["next"]
                s["next"] = random.choice([l for l in LOCATION_KEYS if l != s["current"]])
            
            payload = generate_telemetry(s)
            try:
                requests.post(f"{BACKEND_URL}/api/telemetry", json=payload, timeout=5)
                print(f"  [TX] {s['id']} SYNCED")
            except:
                print(f"  [ERR] Backend Link Dropped")
            
            time.sleep(1.5)
        time.sleep(2)

if __name__ == "__main__":
    run()
