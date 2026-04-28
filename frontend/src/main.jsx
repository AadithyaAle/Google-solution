import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app.jsx";
import "leaflet/dist/leaflet.css";
import "./styles.css";

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.stack || String(error) };
  }

  componentDidCatch(error) {
    console.error("Frontend runtime error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#08162a", color: "#d9e8ff", fontFamily: "Segoe UI, system-ui, sans-serif", padding: 24 }}>
          <div style={{ maxWidth: 760, border: "1px solid #7f1d1d", background: "#1b2438", borderRadius: 12, padding: 16 }}>
            <h2 style={{ margin: "0 0 8px 0" }}>Frontend Error</h2>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root element not found in index.html");
}

createRoot(rootEl).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
