import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    raise ValueError("CRITICAL: OPENAI_API_KEY is missing from .env file.")

client = OpenAI(api_key=API_KEY)

def evaluate_transit_risk(telemetry_data: dict) -> dict:
    """
    Feeds telemetry to OpenAI (GPT-4o) and forces a structured JSON response.
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
    Return ONLY the JSON. No markdown blocks.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a logistics safety expert."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    
    except Exception as e:
        print(f"AI Evaluation Error: {e}")
        # Failsafe default
        return {"risk_score": 0.0, "status": "NOMINAL", "mitigation_plan": ["Monitor route"]}
    