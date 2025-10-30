#!/bin/bash

echo "Starting Saki Browser..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file with your OPENROUTER_API_KEY"
    echo "You can copy .env.example and add your API key"
    exit 1
fi

# Start the backend
echo "Starting backend server on http://localhost:8000"
python main.py
