import math

# Earth's radius in kilometers
R = 6371.0 

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the distance in kilometers between two GPS points 
    on the Earth's surface using the Haversine formula.
    """
    # Convert latitude and longitude from degrees to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    # Haversine mathematics
    a = math.sin(delta_phi / 2.0)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0)**2
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance_km = R * c
    return distance_km

def check_geofence(truck_lat: float, truck_lon: float, destination_name: str) -> dict:
    """
    Checks if a truck has breached the 2km geo-fence of its destination.
    (Mocking the database with a static dictionary for now).
    """
    # Hardcoded warehouse coordinates (We will move this to a DB later)
    WAREHOUSES = {
        "Factory_Mumbai": {"lat": 19.0760, "lng": 72.8777},
        "Hub_Pune": {"lat": 18.5204, "lng": 73.8567}
    }

    dest_coords = WAREHOUSES.get(destination_name)
    if not dest_coords:
        return {"status": "UNKNOWN_DESTINATION"}

    distance = calculate_distance(
        truck_lat, truck_lon, 
        dest_coords["lat"], dest_coords["lng"]
    )

    # If the truck is within 2 kilometers (2.0), trigger the geofence!
    if distance <= 2.0:
        return {
            "status": "BREACHED",
            "distance_km": round(distance, 2),
            "message": f"Truck has entered the {destination_name} perimeter."
        }
    
    return {
        "status": "OUTSIDE",
        "distance_km": round(distance, 2)
    }