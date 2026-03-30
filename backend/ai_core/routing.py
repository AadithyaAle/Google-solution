import networkx as nx

class SupplyChainRouter:
    def __init__(self):
        # Initialize an empty undirected graph for our logistics network
        self.graph = nx.Graph()

    def add_path(self, node_a: str, node_b: str, weight: float):
        """Adds a bidirectional transit route between two nodes with a given risk/distance weight."""
        self.graph.add_edge(node_a, node_b, weight=weight)

    def update_risk_penalty(self, node_a: str, node_b: str, risk_score: float):
        """Dynamically increases the weight of a route based on AI risk assessment."""
        if self.graph.has_edge(node_a, node_b):
            # Grab the current distance/time weight of the road
            current_weight = self.graph[node_a][node_b]['weight']
            
            # Multiply the penalty so the algorithm actively avoids it
            # A risk score of 9.9 will massively increase the weight!
            new_weight = current_weight + (risk_score * 10)
            
            # Apply the new weight to the map
            self.graph[node_a][node_b]['weight'] = new_weight
            print(f"Risk Alert: Route {node_a} -> {node_b} penalized. New weight: {new_weight}")
        else:
            print(f"Warning: Tried to penalize non-existent route {node_a} -> {node_b}")

    def compute_route(self, start_node: str, end_node: str):
        """Calculates the safest/shortest path, gracefully handling disconnected or missing nodes."""
        try:
            # NetworkX uses Dijkstra's algorithm under the hood here
            path = nx.shortest_path(self.graph, source=start_node, target=end_node, weight="weight")
            return path
            
        except nx.NodeNotFound as e:
            print(f"Routing Warning: A requested location is missing from the network map. ({e})")
            return None
            
        except nx.NetworkXNoPath:
            print(f"Routing Warning: No physical path exists between {start_node} and {end_node}.")
            return None
            
        except Exception as e:
            print(f"Unexpected Routing Error: {e}")
            return None