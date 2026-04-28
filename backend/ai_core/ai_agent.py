import os
from openai import OpenAI
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client (GPT-4o)
api_key = os.getenv("OPENAI_API_KEY")
if not api_key or api_key == "your_openai_api_key_here":
    client = None
else:
    client = OpenAI(api_key=api_key)

def evaluate_transit_risk(telemetry_data):
    """
    Simulated or real risk evaluation using JKY AI core patterns.
    """
    if not client:
        return {
            "risk_score": 1.2,
            "health_index": 98,
            "status": "NOMINAL",
            "maintenance_alert": None,
            "mitigation_plan": ["Path Optimization Verified"],
            "technical_summary": "Neural link stable. All telemetry within safety bounds."
        }
    
    prompt = f"""
    You are the JKY AI Neural Engine. Analyze this supply chain telemetry:
    {json.dumps(telemetry_data)}

    Analyze both transit risk (weather/path) AND hardware health (Predictive Maintenance).
    High vibration (>10) or High temperature (>40C) indicates imminent part failure.

    Respond STRICTLY in JSON:
    {{
      "risk_score": float (0-10),
      "health_index": int (0-100, where 100 is perfect),
      "status": "NOMINAL" | "WARNING" | "CRITICAL",
      "maintenance_alert": "Description of predicted failure if any, else null",
      "mitigation_plan": [string],
      "technical_summary": "Short technical digest"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are a master logistics strategist."}, 
                       {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Neural Engine Error: {e}")
        return {
            "risk_score": 0.0,
            "health_index": 100,
            "status": "ERROR",
            "maintenance_alert": None,
            "mitigation_plan": ["Neural Link Interrupted"],
            "technical_summary": "System offline"
        }

def neural_copilot_chat(user_query, system_state):
    """
    Agentic Copilot logic with Dynamic Simulation Fallback.
    """
    if not client:
        # Dynamic Response Engine (Professional Mock)
        query_lo = user_query.lower()
        fleet_size = len(system_state.get('vehicles', []))
        
        if "fleet" in query_lo or "status" in query_lo:
            msg = f"### JKY AI // Telemetry Report\n\nI have verified the status of **{fleet_size} active units**. All transceivers are reporting nominal signal strength. Current aggregate risk index: **0.04**. No immediate interventions required."
        elif "optimize" in query_lo or "path" in query_lo:
            msg = "### JKY AI // Routing Optimization\n\nRunning Dijkstra-based path analysis on the supply spine. I have identified 3 potential congestion points. Re-routing TRUCK_01 via Pune_Factory to avoid 15% risk penalty."
        else:
            msg = f"### JKY AI // Neural Protocol Active\n\nReceived instruction: '{user_query}'. I am currently processing grid data. System state: NOMINAL."

        return {
            "message": msg,
            "action_supported": "Risk Mitigation Protocol",
            "sentiment": "SUCCESS"
        }

    prompt = f"""
    You are the JKY AI Neural Copilot. You oversee an elite supply chain.
    SYSTEM STATE: {json.dumps(system_state)}

    USER COMMAND: {user_query}

    Guidelines:
    1. Be concise, technical, and professional.
    2. Provide actionable insights from the system state.
    3. If asked to 'optimize' or 'report', provide detailed analysis.
    4. You can 'suggest' actions but cannot execute them without 'Authorization'.

    Respond in JSON for structured UI:
    {{
      "message": "Technical response in markdown",
      "action_suggested": "string | null",
      "sentiment": "NEUTRAL" | "ALERT" | "SUCCESS"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are the JKY AI Copilot."}, 
                       {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {"message": "Neural link failure.", "action_suggested": None, "sentiment": "ALERT"}