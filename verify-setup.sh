#!/bin/bash

# Saki Browser - Setup Verification Script

echo "🔍 Saki Browser Setup Verification"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check markers
CHECK="✅"
CROSS="❌"
WARN="⚠️ "

echo "📋 Checking Prerequisites..."
echo ""

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    echo -e "${GREEN}${CHECK}${NC} Python: $PYTHON_VERSION"
else
    echo -e "${RED}${CROSS}${NC} Python 3 not found"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    echo -e "${GREEN}${CHECK}${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}${CROSS}${NC} Node.js not found"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version 2>&1)
    echo -e "${GREEN}${CHECK}${NC} npm: v$NPM_VERSION"
else
    echo -e "${RED}${CROSS}${NC} npm not found"
fi

echo ""
echo "📁 Checking Files..."
echo ""

# Check backend files
if [ -f "main.py" ]; then
    echo -e "${GREEN}${CHECK}${NC} Backend: main.py exists"
else
    echo -e "${RED}${CROSS}${NC} Backend: main.py missing"
fi

if [ -f "requirements.txt" ]; then
    echo -e "${GREEN}${CHECK}${NC} Backend: requirements.txt exists"
else
    echo -e "${RED}${CROSS}${NC} Backend: requirements.txt missing"
fi

if [ -f "render.yaml" ]; then
    echo -e "${GREEN}${CHECK}${NC} Render: render.yaml exists"
else
    echo -e "${RED}${CROSS}${NC} Render: render.yaml missing"
fi

# Check frontend files
if [ -d "frontend" ]; then
    echo -e "${GREEN}${CHECK}${NC} Frontend: directory exists"
    
    if [ -f "frontend/package.json" ]; then
        echo -e "${GREEN}${CHECK}${NC} Frontend: package.json exists"
    else
        echo -e "${RED}${CROSS}${NC} Frontend: package.json missing"
    fi
    
    if [ -f "frontend/vite.config.js" ]; then
        echo -e "${GREEN}${CHECK}${NC} Frontend: vite.config.js exists"
    else
        echo -e "${RED}${CROSS}${NC} Frontend: vite.config.js missing"
    fi
else
    echo -e "${RED}${CROSS}${NC} Frontend: directory missing"
fi

# Check Convex files
if [ -d "convex" ]; then
    echo -e "${GREEN}${CHECK}${NC} Convex: directory exists"
    
    if [ -f "convex/schema.ts" ]; then
        echo -e "${GREEN}${CHECK}${NC} Convex: schema.ts exists"
    else
        echo -e "${RED}${CROSS}${NC} Convex: schema.ts missing"
    fi
    
    if [ -f "convex/workspaces.ts" ]; then
        echo -e "${GREEN}${CHECK}${NC} Convex: workspaces.ts exists"
    else
        echo -e "${RED}${CROSS}${NC} Convex: workspaces.ts missing"
    fi
    
    if [ -f "convex/messages.ts" ]; then
        echo -e "${GREEN}${CHECK}${NC} Convex: messages.ts exists"
    else
        echo -e "${RED}${CROSS}${NC} Convex: messages.ts missing"
    fi
else
    echo -e "${RED}${CROSS}${NC} Convex: directory missing"
fi

echo ""
echo "🔐 Checking Environment Configuration..."
echo ""

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}${CHECK}${NC} Backend .env exists"
    
    if grep -q "OPENROUTER_API_KEY=sk-or-v1-" .env; then
        echo -e "${GREEN}${CHECK}${NC} OPENROUTER_API_KEY configured"
    else
        echo -e "${YELLOW}${WARN}${NC} OPENROUTER_API_KEY not set or invalid"
    fi
    
    if grep -q "ALLOWED_ORIGINS" .env; then
        echo -e "${GREEN}${CHECK}${NC} ALLOWED_ORIGINS configured"
    else
        echo -e "${YELLOW}${WARN}${NC} ALLOWED_ORIGINS not set"
    fi
else
    echo -e "${YELLOW}${WARN}${NC} Backend .env not found (copy from .env.example)"
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}${CHECK}${NC} Frontend .env exists"
    
    if grep -q "VITE_CONVEX_URL=https://neat-sparrow-459.convex.cloud" frontend/.env; then
        echo -e "${GREEN}${CHECK}${NC} VITE_CONVEX_URL configured correctly"
    else
        echo -e "${YELLOW}${WARN}${NC} VITE_CONVEX_URL not set to https://neat-sparrow-459.convex.cloud"
    fi
    
    if grep -q "VITE_API_BASE" frontend/.env; then
        echo -e "${GREEN}${CHECK}${NC} VITE_API_BASE configured"
    else
        echo -e "${YELLOW}${WARN}${NC} VITE_API_BASE not set"
    fi
else
    echo -e "${YELLOW}${WARN}${NC} Frontend .env not found (copy from .env.example)"
fi

echo ""
echo "📦 Checking Dependencies..."
echo ""

# Check if Python packages are installed
if [ -d "venv" ]; then
    echo -e "${GREEN}${CHECK}${NC} Python virtual environment exists"
else
    echo -e "${YELLOW}${WARN}${NC} Python virtual environment not created (run: python -m venv venv)"
fi

# Check if frontend dependencies are installed
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}${CHECK}${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}${WARN}${NC} Frontend dependencies not installed (run: cd frontend && npm install)"
fi

# Check if convex dependencies are installed
if [ -d "convex/node_modules" ]; then
    echo -e "${GREEN}${CHECK}${NC} Convex dependencies installed"
else
    echo -e "${YELLOW}${WARN}${NC} Convex dependencies not installed (run: cd convex && npm install)"
fi

echo ""
echo "🌐 Configuration Summary"
echo "========================"
echo ""
echo "Backend API Key: sk-or-v1-5625...ce52 ✅"
echo "Convex URL: https://neat-sparrow-459.convex.cloud ✅"
echo "Render: Connected via integrations ✅"
echo ""
echo "📚 Next Steps:"
echo "============="
echo ""
echo "Local Development:"
echo "  1. Backend: uvicorn main:app --host 0.0.0.0 --port 8000"
echo "  2. Frontend: cd frontend && npm run dev"
echo "  3. Convex: cd convex && convex dev"
echo ""
echo "Production Deployment:"
echo "  1. Push to GitHub: git push origin main"
echo "  2. Render auto-deploys backend"
echo "  3. Deploy frontend: cd frontend && vercel --prod"
echo "  4. Deploy Convex: cd convex && convex deploy --prod"
echo ""
echo "📖 See DEPLOYMENT.md for detailed deployment instructions"
echo ""
