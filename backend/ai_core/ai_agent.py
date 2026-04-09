import os
from openai import OpenAI
import json

# Initialize OpenAI client (GPT-4o)
# The user's system should already have OPENAI_API_KEY set
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def evaluate_transit_risk(telemetry_data):
    """
    Analyzes telemetry using GPT-4o to provide a structured risk and maintenance report.
    This is the core 'Neural Engine' of the platform.
    """
    
    prompt = f"""
    You are the Zenith OS Neural Engine. Analyze this supply chain telemetry:
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
    Agentic Copilot logic. AI has access to the full system state.
    """
    prompt = f"""
    You are the Zenith Neural Copilot. You oversee an elite supply chain.
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
            messages=[{"role": "system", "content": "You are the Zenith AI Copilot."}, 
                       {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {"message": "Neural link failure.", "action_suggested": None, "sentiment": "ALERT"}