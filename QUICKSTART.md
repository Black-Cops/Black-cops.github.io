# 🚀 Quick Start Guide - Saki Browser

Get up and running in 5 minutes with your pre-configured setup!

## ✅ What's Already Configured

- **OpenRouter API Key**: `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` ✅
- **Convex Deployment**: `https://neat-sparrow-459.convex.cloud` ✅
- **Render Integration**: Connected and ready ✅

## 🏃 Quick Start (3 Commands)

### 1. Start Backend

```bash
# Install dependencies and start
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Backend running at: **http://localhost:8000**

### 2. Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend running at: **http://localhost:3000**

### 3. Deploy Convex (New Terminal)

```bash
cd convex
npm install
npm install -g convex
convex deploy --prod --url https://neat-sparrow-459.convex.cloud
```

Convex deployed at: **https://neat-sparrow-459.convex.cloud**

## 🎉 You're Done!

Open http://localhost:3000 in your browser and:
1. Click "New Workspace"
2. Type a message
3. Watch it stream in real-time!

## 🌐 Deploy to Production

### Deploy to Render (Backend)

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy Saki Browser"
git push origin main

# 2. Go to Render dashboard
# https://dashboard.render.com/

# 3. Create Web Service
# - Connect GitHub repo
# - Render auto-detects render.yaml
# - Set OPENROUTER_API_KEY in environment

# 4. Deploy!
```

Your backend will be at: `https://your-app.onrender.com`

### Deploy Frontend to Vercel

```bash
cd frontend
npm install -g vercel
vercel

# Set environment variables:
# VITE_API_BASE=https://your-app.onrender.com
# VITE_CONVEX_URL=https://neat-sparrow-459.convex.cloud

vercel --prod
```

Your frontend will be at: `https://your-app.vercel.app`

## 🧪 Test Everything

### Test Backend

```bash
# Health check
curl http://localhost:8000/health

# List models
curl http://localhost:8000/api/models

# Test chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "anthropic/claude-3.5-sonnet",
    "stream": false
  }'
```

### Test Frontend

1. Open http://localhost:3000
2. Create new workspace ✅
3. Send message ✅
4. See streaming response ✅
5. Test code copy/download ✅

### Test Convex

```bash
cd convex
convex run workspaces:list
```

## 🆘 Common Issues

### Backend: "OPENROUTER_API_KEY not configured"

**Solution**: Create `.env` file:
```bash
cp .env.example .env
```

The API key is already in `.env.example`, just copy it!

### Frontend: "Backend offline"

**Solution**: Make sure backend is running:
```bash
# In backend terminal, check if running
curl http://localhost:8000/health
```

### Convex: Connection error

**Solution**: Deploy Convex functions:
```bash
cd convex
convex deploy --prod
```

## 📚 More Information

- **Full Documentation**: See [README.md](README.md)
- **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Security**: See [security.md](security.md)
- **Convex Setup**: See [convex/README.md](convex/README.md)

## 🎯 What You Get

- ✅ Real-time streaming chat
- ✅ Multiple AI models (Claude Sonnet 3.5 + 4 free models)
- ✅ Persistent workspaces via Convex
- ✅ Markdown rendering with code highlighting
- ✅ Code copy/download
- ✅ Dark mode UI
- ✅ Production-ready deployment

## 🚀 One-Command Setup

Or use our automated setup script:

```bash
./start-render.sh
```

This will:
- Create virtual environment
- Install dependencies
- Test configuration
- Show next steps

## ✨ That's It!

You're now running Saki Browser locally. To deploy to production, see [DEPLOYMENT.md](DEPLOYMENT.md).

Need help? Check the troubleshooting section in [README.md](README.md).

---

**Happy Building! 🎉**
