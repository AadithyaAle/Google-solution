import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("CRITICAL: GEMINI_API_KEY is missing from .env file.")

# THE NEW WAY: Initialize a secure client instance
client = genai.Client(api_key=API_KEY)

def evaluate_transit_risk(telemetry_data: dict) -> dict:
    """
    Feeds telemetry to Gemini using the modern Client SDK and 
    forces a structured JSON response.
    """
    prompt = f"""
    You are an expert Supply Chain AI. Analyze this live truck telemetry:
    {json.dumps(telemetry_data, indent=2)}

    Determine the risk of severe delay or cargo damage. 
    You MUST respond with a valid JSON object using exactly this schema:
    {{
        "risk_score": float (0.0 to 10.0),
        "status": string ("NOMINAL", "WARNING", or "CRITICAL"),
        "mitigation_plan": [
            "Action step 1",
            "Action step 2"
        ]
    }}
    Do not include markdown blocks or any other text. Return ONLY the JSON.
    """

    try:
        # Use the client to call Gemini 1.5 Flash
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        # Parse the string response into a Python dictionary
        return json.loads(response.text)
    
    except Exception as e:
        print(f"AI Evaluation Error: {e}")
        # Failsafe default if the AI times out
        return {"risk_score": 0.0, "status": "NOMINAL", "mitigation_plan": ["Monitor route"]}
    