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

    return R * c

def check_geofence(truck_lat: float, truck_lon: float, destination_name: str, warehouses: dict[str, dict[str, float]]) -> dict:
    """
    Checks if a truck has breached the 2km geo-fence of its destination.
    Dynamically fetches warehouse coordinates from the active network configuration.
    """
    dest_coords = warehouses.get(destination_name)
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
            "message": f"Vehicle has entered the {destination_name} perimeter."
        }
    
    return {
        "status": "OUTSIDE",
        "distance_km": round(distance, 2)
    }