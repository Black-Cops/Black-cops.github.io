# Saki Browser - Full-Stack AI Notebook Assistant

A production-ready notebook-style AI browser assistant with FastAPI backend, React frontend, and Convex state management. Features real-time streaming, multiple AI models, and an Atlas/Comet-inspired UI.

## 🚀 Features

- **Real-Time Streaming**: SSE-based streaming for low-latency AI responses
- **Multiple AI Models**: Claude Sonnet 3.5 (default) + 4 free OpenRouter models
- **Persistent State**: Convex cloud database for workspaces and messages
- **Modern UI**: React + Tailwind CSS with dark mode
- **Markdown Support**: Full markdown rendering with code syntax highlighting
- **Code Features**: Copy and download code blocks
- **Persona Modes**: Concise, Helpful, and Creative response styles
- **Production Ready**: Optimized for Render (backend) and Vercel (frontend)

## 📋 Architecture

### Backend (FastAPI on Render)
- Server-Sent Events (SSE) streaming
- OpenRouter API integration
- CORS-enabled for frontend
- Environment-based configuration

### Frontend (React + Vite on Vercel)
- Real-time chat interface
- Convex React hooks for state
- Tailwind CSS for styling
- Code highlighting and markdown

### State (Convex Cloud)
- Workspaces management
- Message history
- Real-time synchronization

## 🛠️ Local Development

### Prerequisites

- Python 3.8+
- Node.js 18+
- OpenRouter API key ([Get one free](https://openrouter.ai/))
- Convex account ([Sign up](https://convex.dev/))

### Backend Setup

1. **Navigate to project root**:
```bash
cd saki-browser
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env`:
```env
OPENROUTER_API_KEY=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
ALLOWED_ORIGINS=http://localhost:3000
APP_URL=http://localhost:3000
PORT=8000
```

5. **Start backend**:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE=http://localhost:8000
VITE_CONVEX_URL=https://neat-sparrow-459.convex.cloud
```

4. **Start frontend**:
```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

### Convex Setup

1. **Install Convex CLI**:
```bash
npm install -g convex
```

2. **Initialize Convex**:
```bash
cd convex
convex dev
```

This will:
- Create a Convex project (if needed)
- Deploy schema and functions
- Provide your `VITE_CONVEX_URL`

## 🌐 Production Deployment

### Deploy Backend to Render

1. **Create new Web Service** on [Render](https://render.com/)

2. **Configure build**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add environment variables**:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   APP_URL=https://your-frontend.vercel.app
   ```

4. **Deploy** and note your Render URL: `https://your-app.onrender.com`

### Deploy Frontend to Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy from frontend directory**:
```bash
cd frontend
vercel
```

3. **Add environment variables** in Vercel dashboard:
   ```
   VITE_API_BASE=https://your-backend.onrender.com
   VITE_CONVEX_URL=https://neat-sparrow-459.convex.cloud
   ```

4. **Deploy to production**:
```bash
vercel --prod
```

### Deploy Convex

Convex deploys automatically on `convex dev` or:

```bash
convex deploy --prod
```

Use production URL in `VITE_CONVEX_URL`.

## 📖 API Reference

### Health Check

**GET** `/health`

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "api_key_configured": true
}
```

### List Models

**GET** `/api/models`

```bash
curl http://localhost:8000/api/models
```

**Response:**
```json
{
  "models": [
    {
      "id": "anthropic/claude-3.5-sonnet",
      "name": "Claude Sonnet 3.5",
      "provider": "Anthropic",
      "default": true,
      "free": false,
      "description": "Default workspace model with strong reasoning"
    },
    {
      "id": "openai/gpt-oss-20b:free",
      "name": "GPT OSS 20B",
      "provider": "OpenAI",
      "default": false,
      "free": true,
      "description": "Free general-purpose model"
    }
  ],
  "defaultModel": {...},
  "totalFree": 4
}
```

### Chat Completion (Streaming)

**POST** `/api/chat`

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "model": "anthropic/claude-3.5-sonnet",
    "stream": true,
    "persona": "helpful"
  }'
```

**Response (SSE):**
```
data: {"text": "Hello", "model": "anthropic/claude-3.5-sonnet"}
data: {"text": "!", "model": "anthropic/claude-3.5-sonnet"}
data: {"done": true, "model": "anthropic/claude-3.5-sonnet"}
```

### Chat Completion (Non-Streaming)

**POST** `/api/chat`

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "model": "anthropic/claude-3.5-sonnet",
    "stream": false,
    "persona": "concise"
  }'
```

**Response:**
```json
{
  "text": "Hello! How can I help you today?",
  "model": "anthropic/claude-3.5-sonnet"
}
```

## 🎨 Available Models

| Model | Provider | Type | Description |
|-------|----------|------|-------------|
| Claude Sonnet 3.5 | Anthropic | Default | Strong reasoning, default workspace model |
| GPT OSS 20B | OpenAI | Free | General-purpose free model |
| Qwen3 Coder | Qwen | Free | Code-focused free model |
| GLM 4.5 Air | Z-AI | Free | Lightweight free model |
| Gemma 3N E2B IT | Google | Free | Google's free model |

## 🎭 Personas

- **Concise**: Brief, direct answers without unnecessary elaboration
- **Helpful**: Clear, detailed, and informative responses (default)
- **Creative**: Imaginative, engaging, and thoughtful responses

## 🔧 Configuration

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | - | Your OpenRouter API key |
| `ALLOWED_ORIGINS` | No | `*` | Comma-separated allowed origins |
| `APP_URL` | No | `http://localhost:3000` | Frontend URL for CORS |
| `PORT` | No | `8000` | Backend port |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE` | Yes | `http://localhost:8000` | Backend API URL |
| `VITE_CONVEX_URL` | Yes | - | Convex deployment URL |

## 🧪 Testing

### Test Backend

```bash
# Health check
curl http://localhost:8000/health

# List models
curl http://localhost:8000/api/models

# Test chat (streaming)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Say hi"}], "stream": true}'
```

### Test Frontend

1. Open `http://localhost:3000`
2. Create a new workspace
3. Send a message
4. Verify streaming works
5. Test code block copy/download
6. Switch personas and models

## 📚 Project Structure

```
saki-browser/
├── main.py                 # FastAPI backend
├── requirements.txt        # Python dependencies
├── .env.example           # Backend env template
├── README.md              # This file
├── security.md            # Security guidelines
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── main.jsx          # Entry point
│   │   ├── index.css         # Tailwind styles
│   │   └── components/
│   │       ├── Sidebar.jsx        # Workspaces sidebar
│   │       ├── ChatArea.jsx       # Chat interface
│   │       ├── MessageList.jsx    # Message rendering
│   │       └── RightPanel.jsx     # Model/persona selector
│   ├── package.json       # Node dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind configuration
│   ├── .env.example       # Frontend env template
│   └── index.html         # HTML entry point
│
└── convex/
    ├── schema.ts          # Convex database schema
    ├── workspaces.ts      # Workspace queries/mutations
    └── messages.ts        # Message queries/mutations
```

## 🔒 Security

See [security.md](security.md) for:
- API key management
- Key rotation procedures
- SSE security hardening
- CORS configuration
- Production security checklist

## 🐛 Troubleshooting

### Backend Issues

**Error: "OPENROUTER_API_KEY not configured"**
- Ensure `.env` file exists with valid API key
- Restart backend after adding env variables

**CORS errors**
- Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`
- Format: `http://localhost:3000,https://your-domain.com`

**SSE stream stops mid-response**
- Check OpenRouter API status
- Verify API key has credits
- Check network connectivity

### Frontend Issues

**"Backend offline" error**
- Ensure backend is running
- Verify `VITE_API_BASE` points to correct backend URL
- Check CORS configuration

**Convex connection fails**
- Verify `VITE_CONVEX_URL` is correct
- Run `convex dev` to ensure deployment is active
- Check Convex dashboard for errors

**Messages not persisting**
- Ensure Convex is deployed
- Check browser console for Convex errors
- Verify workspace exists before sending messages

## 📦 Dependencies

### Backend
- `fastapi` - Modern web framework
- `uvicorn` - ASGI server
- `httpx` - Async HTTP client
- `python-dotenv` - Environment management
- `sse-starlette` - Server-Sent Events

### Frontend
- `react` - UI library
- `react-dom` - React DOM rendering
- `vite` - Build tool
- `tailwindcss` - Utility-first CSS
- `convex` - Convex client
- `react-markdown` - Markdown rendering
- `lucide-react` - Icon library

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

- Powered by [OpenRouter](https://openrouter.ai/)
- State management by [Convex](https://convex.dev/)
- UI components by [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Built with ❤️ for seamless AI interactions**
