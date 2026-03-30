import networkx as nx

class SupplyChainRouter:
    def __init__(self):
        # Initialize an empty undirected graph for our logistics network
        self.graph = nx.Graph()

    def add_path(self, node_a: str, node_b: str, weight: float):
        """Adds a bidirectional transit route between two nodes with a given risk/distance weight."""
        self.graph.add_edge(node_a, node_b, weight=weight)

    def compute_route(self, start_node: str, end_node: str):
        """Calculates the safest/shortest path, gracefully handling disconnected or missing nodes."""
        try:
            # NetworkX uses Dijkstra's algorithm under the hood here
            path = nx.shortest_path(self.graph, source=start_node, target=end_node, weight="weight")
            return path
            
        except nx.NodeNotFound as e:
            # Safely catches: "networkx.exception.NodeNotFound: Target D is not in G"
            print(f"Routing Warning: A requested location is missing from the network map. ({e})")
            return None
            
        except nx.NetworkXNoPath:
            # Safely catches scenarios where a bridge is out and no detour exists
            print(f"Routing Warning: No physical path exists between {start_node} and {end_node}.")
            return None
            
        except Exception as e:
            # Catch-all for any other weird math or graph errors
            print(f"Unexpected Routing Error: {e}")
            return None