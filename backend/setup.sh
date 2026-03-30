#!/bin/bash

echo "🚀 Booting up B2B Smart Supply Chain Environment..."

# 1. Check if the virtual environment exists; if not, create it
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# 2. Activate the virtual environment
echo "🔌 Activating venv..."
source venv/bin/activate

# 3. Install the required packages
echo "📦 Installing dependencies from requirements.txt..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

# 4. Check for the .env file
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: No .env file found!"
    echo "Creating a template .env file for you..."
    echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
    echo "🛑 ACTION REQUIRED: Please paste your real Gemini API key into backend/.env and run this script again."
    exit 1
fi

echo "✅ Environment configured successfully!"
echo "🌐 Starting FastAPI Server..."

# 5. Run the server
uvicorn main:app --reload