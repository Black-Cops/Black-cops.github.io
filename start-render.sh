#!/bin/bash

# Saki Browser - Render Deployment Script
# This script helps set up and test the backend for Render deployment

echo "🚀 Saki Browser - Render Setup"
echo "================================"

# Check Python version
echo "📋 Checking Python version..."
python3 --version || python --version

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv || python -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✏️  Please edit .env with your actual OPENROUTER_API_KEY"
fi

# Show configuration
echo ""
echo "📊 Current Configuration:"
echo "========================"
grep -v "^#" .env | grep -v "^$"

echo ""
echo "🧪 Testing configuration..."

# Test health endpoint locally
echo "Starting server for testing..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
SERVER_PID=$!

sleep 5

echo "Testing health endpoint..."
curl -s http://localhost:8000/health | python -m json.tool

echo ""
echo "Testing models endpoint..."
curl -s http://localhost:8000/api/models | python -m json.tool

# Kill test server
kill $SERVER_PID 2>/dev/null

echo ""
echo "✅ Configuration looks good!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Push code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Deploy Saki Browser'"
echo "   git push origin main"
echo ""
echo "2. Deploy to Render:"
echo "   - Go to https://dashboard.render.com/"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Render will use render.yaml automatically"
echo ""
echo "3. Set environment variable in Render:"
echo "   OPENROUTER_API_KEY=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"
echo ""
echo "4. After deployment, note your Render URL:"
echo "   https://your-app.onrender.com"
echo ""
echo "5. Update frontend/.env with your Render URL:"
echo "   VITE_API_BASE=https://your-app.onrender.com"
echo ""
echo "🎉 Ready for deployment!"
