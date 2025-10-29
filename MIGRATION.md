# Migration Guide: Python to Node.js

This guide explains the upgrade from the Python FastAPI backend to the Node.js serverless architecture.

## Overview

**What Changed:**
- Backend: Python FastAPI → Node.js Vercel Functions
- Browser: None → Puppeteer + Chromium
- Architecture: Simple chat → Full browser automation agent

**What Stayed:**
- Frontend HTML/CSS/JavaScript
- OpenRouter AI integration
- Streaming via SSE
- Dark mode UI

## Breaking Changes

### 1. Backend Language

**Before (Python):**
```python
# main.py
from fastapi import FastAPI
app = FastAPI()

@app.post("/api/chat")
async def chat(request: ChatRequest):
    # Python logic
```

**After (Node.js):**
```javascript
// api/chat.js
export default async function handler(req, res) {
  // JavaScript logic
}
```

### 2. API Endpoints

**Before:**
- `/` - API status
- `/api/models` - List models
- `/api/chat` - Chat completions

**After:**
- `/api/health` - Health check with mode info
- `/api/models` - List models (enhanced)
- `/api/chat` - Chat completions (unchanged interface)
- `/api/browser/*` - New browser control endpoints
- `/api/agent/execute` - New autonomous agent

### 3. Dependencies

**Before:**
```txt
# requirements.txt
fastapi==0.104.1
uvicorn==0.24.0
httpx==0.25.1
python-dotenv==1.0.0
```

**After:**
```json
// package.json
{
  "dependencies": {
    "@sparticuz/chromium": "^131.0.0",
    "puppeteer-core": "^23.10.4"
  }
}
```

### 4. Default Model

**Before:**
- `openai/gpt-oss-20b:free` (default)

**After:**
- `deepseek/deepseek-r1:free` (default)
- Better reasoning for browser automation

### 5. Environment Variables

**Before:**
```env
OPENROUTER_API_KEY=sk-or-v1-...
```

**After:**
```env
OPENROUTER_API_KEY=sk-or-v1-...
ALLOWED_ORIGINS=http://localhost:3000
BROWSERLESS_WS=  # Optional
```

## Migration Steps

### Step 1: Backup

```bash
# Backup old Python code
cp -r . ../saki-backup
```

### Step 2: Install Node.js

Ensure Node.js 18+ is installed:

```bash
node --version  # Should be 18.x or higher
```

Install if needed: https://nodejs.org/

### Step 3: Install Dependencies

```bash
# Remove Python dependencies
rm -rf venv/

# Install Node dependencies
npm install
```

### Step 4: Update Environment

```bash
# Update .env with new variables
echo "ALLOWED_ORIGINS=http://localhost:3000" >> .env
```

### Step 5: Test Locally

```bash
# Start development server
npm run dev

# In another terminal, run tests
npm test
```

### Step 6: Deploy

```bash
# Deploy to Vercel
vercel

# Or self-host with Docker
docker-compose up
```

## Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| Chat Interface | ✅ | ✅ |
| Streaming | ✅ | ✅ |
| Multiple Models | ✅ | ✅ (6 models) |
| Browser Control | ❌ | ✅ |
| Screenshots | ❌ | ✅ |
| Data Extraction | ❌ | ✅ |
| Agent Mode | ❌ | ✅ |
| Vercel Ready | ❌ | ✅ |
| Self-Host | ✅ | ✅ |

## API Compatibility

### Chat Endpoint (Compatible)

The `/api/chat` endpoint maintains the same interface:

**Request:**
```json
{
  "messages": [{"role": "user", "content": "Hello"}],
  "model": "deepseek/deepseek-r1:free",
  "stream": true
}
```

**Response:** Same SSE format

### Models Endpoint (Compatible)

Returns same structure with additional fields:

```json
{
  "models": [...],
  "defaultModel": {...},  // New
  "totalFree": 6          // New
}
```

## New Capabilities

### 1. Browser Automation

```javascript
// Open session
await fetch('/api/browser/open', {
  method: 'POST',
  body: JSON.stringify({ sessionId: 'my-session' })
});

// Navigate
await fetch('/api/browser/goto', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: 'my-session',
    url: 'https://example.com'
  })
});

// Extract data
await fetch('/api/browser/extract', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: 'my-session',
    selector: 'h1'
  })
});
```

### 2. Autonomous Agent

```javascript
// Execute complex task
const response = await fetch('/api/agent/execute', {
  method: 'POST',
  body: JSON.stringify({
    task: 'Go to example.com and extract all links',
    model: 'deepseek/deepseek-r1:free'
  })
});

// Stream events
const reader = response.body.getReader();
while (true) {
  const {done, value} = await reader.read();
  if (done) break;
  // Process events
}
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Before:**
- Manual server setup
- uvicorn on port 8000
- Static file serving

**After:**
- One-command deployment
- Automatic HTTPS
- Global CDN
- Serverless scaling

```bash
vercel --prod
```

### Option 2: Docker

**Before:**
```dockerfile
FROM python:3.12
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
```

**After:**
```dockerfile
FROM node:18-slim
RUN apt-get install chromium
COPY . .
RUN npm install
CMD ["npm", "run", "dev"]
```

### Option 3: Browserless.io

**New capability:**
- Remote browser service
- No local Chromium needed
- Better for serverless

```env
BROWSERLESS_WS=wss://chrome.browserless.io?token=YOUR_TOKEN
```

## Troubleshooting

### "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Cannot find puppeteer-core"

**Solution:**
```bash
npm install puppeteer-core @sparticuz/chromium
```

### Old Python code still running

**Solution:**
```bash
# Stop Python server
pkill -f "python main.py"

# Start Node server
npm run dev
```

### Frontend still points to port 8000

**Solution:** Update `API_BASE_URL` in `index.html`:

```javascript
// Old
const API_BASE_URL = 'http://localhost:8000';

// New
const API_BASE_URL = window.location.origin;
```

## Rollback Plan

If you need to revert:

```bash
# Restore backup
cp -r ../saki-backup/* .

# Reinstall Python dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start Python server
python main.py
```

## Support

For migration issues:
1. Check the [README](README.md)
2. Run tests: `npm test`
3. Check health: `curl http://localhost:3000/api/health`
4. Review logs in Vercel dashboard

## Next Steps

After migration:
1. Test all features locally
2. Run E2E tests
3. Deploy to Vercel
4. Update documentation
5. Train team on new features

---

**Migration completed?** Delete this file and `main.py`, `requirements.txt` when confident in the new system.
