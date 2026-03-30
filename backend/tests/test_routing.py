from ai_core.routing import SupplyChainRouter

def test_add_path_and_compute_route():
    router = SupplyChainRouter()
    
    # Setup mock network
    router.add_path("A", "B", 10.0)
    router.add_path("B", "C", 5.0)
    router.add_path("A", "C", 20.0)
    
    # The shortest path from A to C should be A -> B -> C (15.0) not A -> C (20.0)
    path = router.compute_route("A", "C")
    
    assert path == ["A", "B", "C"]
    assert len(path) == 3

def test_no_route_available():
    router = SupplyChainRouter()
    router.add_path("A", "B", 10.0)
    # Node D is disconnected
    path = router.compute_route("A", "D")
    
    assert path is None