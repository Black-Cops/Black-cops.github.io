# Deployment Guide for Saki Browser

Complete step-by-step guide to deploy Saki Browser to production.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ Render account (already connected based on your integrations)
- ✅ Convex deployment at `https://neat-sparrow-459.convex.cloud`
- ✅ OpenRouter API key: `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`
- ✅ Vercel account (for frontend)
- ✅ Git repository

## 🚀 Step 1: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. **Push code to GitHub** (if not already):
```bash
git add .
git commit -m "Initial Saki Browser deployment"
git push origin main
```

2. **Create new Web Service in Render**:
   - Go to https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`

3. **Configure environment variables** (if not in render.yaml):
   - Go to Environment tab
   - Add:
     ```
     OPENROUTER_API_KEY=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
     ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
     APP_URL=https://your-app.vercel.app
     ```

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for build to complete (2-3 minutes)
   - Note your Render URL: `https://saki-browser-backend.onrender.com`

### Option B: Manual Configuration

1. **Create new Web Service**:
   - Name: `saki-browser-backend`
   - Environment: `Python 3`
   - Region: `Oregon (US West)` or closest to you
   - Branch: `main`

2. **Build & Deploy**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables** (see above)

4. **Advanced Settings**:
   - Health Check Path: `/health`
   - Auto-Deploy: `Yes`

### Verify Backend Deployment

```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Should return:
# {"status":"healthy","api_key_configured":true}

# Test models endpoint
curl https://your-backend.onrender.com/api/models
```

## 📦 Step 2: Deploy Convex Functions

Your Convex is already deployed at: `https://neat-sparrow-459.convex.cloud`

### Update Convex Functions (if needed)

1. **Install Convex CLI**:
```bash
npm install -g convex
```

2. **Navigate to convex directory**:
```bash
cd convex
npm install
```

3. **Deploy to your existing Convex project**:
```bash
convex deploy --prod
```

4. **Verify deployment**:
   - Visit https://dashboard.convex.dev/
   - Select project "neat-sparrow-459"
   - Check Functions tab to see deployed functions:
     - `workspaces:list`
     - `workspaces:get`
     - `workspaces:create`
     - `messages:list`
     - `messages:add`

### Configure Convex Project

If you need to link to existing project:

```bash
cd convex
convex dev --url https://neat-sparrow-459.convex.cloud
```

## 🎨 Step 3: Deploy Frontend to Vercel

### Automatic Deployment

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Navigate to frontend**:
```bash
cd frontend
npm install
```

3. **Deploy**:
```bash
vercel
```

4. **Follow prompts**:
   - Setup and deploy: `Y`
   - Scope: Choose your account
   - Link to existing project: `N` (first time)
   - Project name: `saki-browser`
   - Directory: `./` (already in frontend/)
   - Override settings: `N`

5. **Add environment variables**:
```bash
vercel env add VITE_API_BASE
# Enter: https://your-backend.onrender.com

vercel env add VITE_CONVEX_URL
# Enter: https://neat-sparrow-459.convex.cloud
```

6. **Deploy to production**:
```bash
vercel --prod
```

### Manual Deployment via Vercel Dashboard

1. **Import project**:
   - Go to https://vercel.com/new
   - Import your Git repository
   - Root Directory: `frontend`

2. **Configure Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**:
   - `VITE_API_BASE`: `https://your-backend.onrender.com`
   - `VITE_CONVEX_URL`: `https://neat-sparrow-459.convex.cloud`

4. **Deploy**:
   - Click "Deploy"
   - Wait for build (1-2 minutes)
   - Note your Vercel URL: `https://saki-browser.vercel.app`

### Verify Frontend Deployment

1. Visit your Vercel URL
2. You should see the Saki Browser UI
3. Try creating a workspace
4. Send a test message
5. Verify streaming works

## 🔄 Step 4: Update CORS Settings

After deploying frontend, update backend CORS:

1. **Go to Render Dashboard** → Your backend service → Environment

2. **Update ALLOWED_ORIGINS**:
```
ALLOWED_ORIGINS=https://saki-browser.vercel.app,https://saki-browser-git-main.vercel.app,http://localhost:3000
```

3. **Redeploy backend** (or it will auto-redeploy on env change)

## ✅ Step 5: Verify Complete Setup

### Backend Checklist

```bash
# Health check
curl https://your-backend.onrender.com/health
# Expected: {"status":"healthy","api_key_configured":true}

# Models endpoint
curl https://your-backend.onrender.com/api/models
# Expected: JSON with 5 models including Claude Sonnet 3.5

# Chat endpoint (streaming)
curl -X POST https://your-backend.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "anthropic/claude-3.5-sonnet",
    "stream": true
  }'
# Expected: SSE stream with JSON chunks
```

### Frontend Checklist

1. ✅ Page loads without errors
2. ✅ "Backend offline" warning is NOT showing
3. ✅ Can create new workspace
4. ✅ Can send messages
5. ✅ Messages stream in real-time
6. ✅ Code blocks have copy/download buttons
7. ✅ Can switch models
8. ✅ Can switch personas
9. ✅ Messages persist on refresh

### Convex Checklist

Open browser console on your app and verify:
1. ✅ No Convex connection errors
2. ✅ Workspaces load from Convex
3. ✅ Messages persist after sending
4. ✅ Data syncs in real-time

## 🔧 Troubleshooting

### Backend Issues

**"OPENROUTER_API_KEY not configured"**
```bash
# Verify env var in Render dashboard
# Should be: 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
```

**CORS errors**
```bash
# Update ALLOWED_ORIGINS to include your Vercel URL
ALLOWED_ORIGINS=https://saki-browser.vercel.app,http://localhost:3000
```

**Backend not starting**
```bash
# Check Render logs
# Common issues:
# - Missing dependencies in requirements.txt
# - Wrong Python version
# - Port binding error (should use $PORT)
```

### Frontend Issues

**"Backend offline" showing**
```bash
# Check VITE_API_BASE points to Render URL
# Should be: https://your-backend.onrender.com (no trailing slash)
```

**Convex errors**
```bash
# Verify VITE_CONVEX_URL is correct
# Should be: https://neat-sparrow-459.convex.cloud

# Verify Convex functions are deployed
convex deploy --prod
```

**Build fails on Vercel**
```bash
# Ensure package.json has all dependencies
# Ensure root directory is set to 'frontend'
# Check build logs for specific errors
```

### Convex Issues

**"Cannot connect to Convex"**
```bash
# Verify URL is correct
echo $VITE_CONVEX_URL
# Should output: https://neat-sparrow-459.convex.cloud

# Deploy functions
cd convex
convex deploy --prod
```

**"No such function"**
```bash
# Redeploy Convex functions
cd convex
convex deploy --prod

# Check function names match:
# - workspaces.list, workspaces.get, workspaces.create
# - messages.list, messages.add
```

## 📊 Monitoring

### Backend (Render)

- **Logs**: Dashboard → Service → Logs
- **Metrics**: Dashboard → Service → Metrics
- **Alerts**: Dashboard → Service → Alerts

Monitor:
- Response times (should be < 2s)
- Error rates (should be < 1%)
- Memory usage
- CPU usage

### Frontend (Vercel)

- **Analytics**: Dashboard → Project → Analytics
- **Logs**: Dashboard → Project → Deployments → Logs

Monitor:
- Page load times
- Error rates
- Build success rate

### Convex

- **Dashboard**: https://dashboard.convex.dev/
- **Logs**: View function execution logs
- **Usage**: Monitor reads/writes

## 🔄 CI/CD Setup

### Automatic Deployments

**Render**: Auto-deploys on git push to main
**Vercel**: Auto-deploys on git push to main
**Convex**: Deploy with `convex deploy --prod`

### Environment Strategy

- **Production**: `main` branch
- **Staging**: `staging` branch (optional)
- **Development**: Local with `npm run dev`

## 🚀 Quick Deploy Script

Save this as `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Saki Browser..."

# Deploy Convex
echo "📦 Deploying Convex..."
cd convex
convex deploy --prod
cd ..

# Deploy Frontend
echo "🎨 Deploying Frontend..."
cd frontend
vercel --prod
cd ..

# Backend auto-deploys on git push
echo "🔄 Backend will auto-deploy from Render"

echo "✅ Deployment complete!"
echo "Frontend: Check Vercel output"
echo "Backend: Check Render dashboard"
echo "Convex: https://dashboard.convex.dev/"
```

Make executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📝 Post-Deployment

1. **Test all features** end-to-end
2. **Monitor logs** for first 24 hours
3. **Set up alerts** for errors
4. **Document** your deployment URLs
5. **Share** with users

## 🔗 Deployment URLs

After deployment, update these in your documentation:

- **Frontend**: `https://saki-browser.vercel.app`
- **Backend**: `https://saki-browser-backend.onrender.com`
- **Convex**: `https://neat-sparrow-459.convex.cloud` ✅ (already set)

---

**Deployment Complete! 🎉**

Your Saki Browser is now live and ready to use.
