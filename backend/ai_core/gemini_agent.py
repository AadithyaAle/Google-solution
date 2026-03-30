from google import genai

# Initialize the Gen AI client (ensure your API key is exported in your Ubuntu environment)
client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

def evaluate_transit_risk(telemetry_data: dict) -> float:
    """
    Sends telemetry to Gemini 2.0 Flash to get a risk score from 0.0 to 10.0.
    """
    prompt = f"""
    You are an autonomous supply chain risk agent. 
    Analyze this telemetry: {telemetry_data}
    Return ONLY a single float between 0.0 (perfectly safe) and 10.0 (critical delay predicted).
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt
        )
        return float(response.text.strip())
    except Exception as e:
        print(f"AI Agent Error: {e}")
        return 0.0 # Default to safe if API fails