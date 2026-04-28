from sqlalchemy import Column, Integer, String, Float
from database import Base

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    city = Column(String)
    lat = Column(Float)
    lng = Column(Float)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, unique=True, index=True)
    driver = Column(String)
    vehicle_type = Column(String)
    status = Column(String)  
    risk = Column(String)    
    speed_kmh = Column(Integer)
    lat = Column(Float)
    lng = Column(Float)
    city = Column(String)
    warehouse = Column(String)
    from_warehouse = Column(String, nullable=True) # Added for Kartikeya's Map
    to_warehouse = Column(String, nullable=True)   # Added for Kartikeya's Map