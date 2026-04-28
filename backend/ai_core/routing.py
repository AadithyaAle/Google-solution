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

    def initialize_network(self):
        """Initializes a realistic backbone network for the supply chain."""
        # Nodes: Hubs and Cities
        nodes = [
            "Mumbai_Hub", "Delhi_Hub", "Bangalore_Hub", "Chennai_Hub", 
            "Kolkata_Hub", "Pune_Factory", "Ahmedabad_Warehouse", "Jaipur_Edge"
        ]
        
        # Edges with default weights (representing distance/time)
        edges = [
            ("Mumbai_Hub", "Pune_Factory", 5.0),
            ("Mumbai_Hub", "Ahmedabad_Warehouse", 15.0),
            ("Delhi_Hub", "Jaipur_Edge", 8.0),
            ("Delhi_Hub", "Ahmedabad_Warehouse", 25.0),
            ("Bangalore_Hub", "Chennai_Hub", 10.0),
            ("Mumbai_Hub", "Bangalore_Hub", 30.0),
            ("Delhi_Hub", "Kolkata_Hub", 40.0),
            ("Kolkata_Hub", "Chennai_Hub", 45.0),
            ("Pune_Factory", "Bangalore_Hub", 20.0),
        ]
        
        for u, v, w in edges:
            self.add_path(u, v, w)

    def get_network_state(self):
        """Returns the current state of the network for frontend visualization."""
        nodes = [{"id": n} for n in self.graph.nodes()]
        links = []
        for u, v, d in self.graph.edges(data=True):
            links.append({
                "source": u,
                "target": v,
                "weight": d['weight'],
                "status": "CRITICAL" if d['weight'] > 50 else ("WARNING" if d['weight'] > 20 else "NOMINAL")
            })
        return {"nodes": nodes, "links": links}