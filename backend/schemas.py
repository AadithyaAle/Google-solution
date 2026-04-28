from pydantic import BaseModel

class OptimizeRouteRequest(BaseModel):
    start_node: str
    end_node: str