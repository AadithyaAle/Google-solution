import networkx as nx
from typing import List, Optional

class SupplyChainRouter:
    def __init__(self):
        # Initialize a Directed Graph for our logistics network
        self.graph = nx.DiGraph()

    def add_path(self, origin: str, destination: str, base_time: float):
        """Adds a transit route between two nodes."""
        # We use 'weight' to represent time + risk
        self.graph.add_edge(origin, destination, weight=base_time)

    def update_risk_penalty(self, origin: str, destination: str, ai_risk_score: float):
        """Dynamically increases the weight of a path if the AI predicts disruption."""
        if self.graph.has_edge(origin, destination):
            # Example logic: multiply the AI risk score to penalize the route
            penalty = ai_risk_score * 2.5 
            self.graph[origin][destination]['weight'] += penalty

    def compute_route(self, start: str, end: str) -> Optional[List[str]]:
        """Executes Dijkstra's algorithm to find the optimal path."""
        try:
            # NetworkX handles the O(E log V) priority queue traversal automatically
            path = nx.shortest_path(self.graph, source=start, target=end, weight='weight')
            return path
        except nx.NetworkXNoPath:
            return None