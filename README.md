# Saki Browser Agent

A production-ready browser automation agent powered by headless Chromium and OpenRouter's free AI models. Features autonomous web navigation, real-time streaming, and visual verification.

## 🚀 Features

### Core Capabilities
- **Autonomous Browser Control**: Real headless Chromium automation via Puppeteer
- **Multi-Model AI**: Powered exclusively by OpenRouter's free models
- **Streaming Architecture**: Server-Sent Events (SSE) for real-time updates
- **Visual Verification**: Automatic screenshots after key actions
- **Data Extraction**: Structured data extraction from web pages
- **Dual Interface**: Chat mode and autonomous agent mode

### Backend Features
- **Vercel-Ready**: Optimized for serverless deployment
- **Browser Management**: Session-based with automatic cleanup
- **Browserless Support**: Fallback to remote browser service
- **Health Monitoring**: Runtime mode detection and readiness checks
- **Security**: CORS enforcement and server-side secret management

### Frontend Features
- **Task Console**: Live stream of agent actions and decisions
- **Screenshot Gallery**: Visual verification of each step
- **Data Verification**: JSON display of extracted information
- **Environment Control**: Model and backend mode selection
- **Dark Mode**: Modern, eye-friendly interface

## 📋 Prerequisites

- Node.js 18+ (for Vercel Functions)
- OpenRouter API key (free tier available)
- (Optional) Browserless.io account for production

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd saki-browser-agent
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.vercel.app
BROWSERLESS_WS=
```

**Get an OpenRouter API Key:**
1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for free account
3. Generate API key from dashboard

### 3. Local Development

```bash
npm run dev
```

Server starts at `http://localhost:3000`

- Chat interface: `http://localhost:3000/index.html`
- Agent interface: `http://localhost:3000/agent.html`

## 🌐 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Add Environment Variables:**

In Vercel dashboard, add:
- `OPENROUTER_API_KEY`
- `ALLOWED_ORIGINS`
- (Optional) `BROWSERLESS_WS`

4. **Deploy to Production:**
```bash
vercel --prod
```

### Deploy with Browserless.io

For improved reliability on serverless:

1. Sign up at [Browserless.io](https://www.browserless.io/)
2. Get WebSocket URL from dashboard
3. Add to Vercel environment: `BROWSERLESS_WS=wss://your-id.browserless.io`

## 📖 API Reference

### Health Check

**GET** `/api/health`

Returns runtime mode and readiness status.

**Response:**
```json
{
  "status": "healthy",
  "mode": "local|browserless",
  "ready": true,
  "activeSessions": 0,
  "environment": "vercel|local"
}
```

### List Models

**GET** `/api/models`

Returns available OpenRouter free models.

**Response:**
```json
{
  "models": [
    {
      "id": "deepseek/deepseek-r1:free",
      "name": "DeepSeek R1",
      "provider": "DeepSeek",
      "default": true,
      "free": true
    }
  ],
  "defaultModel": { "id": "deepseek/deepseek-r1:free", ... },
  "totalFree": 6
}
```

### Browser API Endpoints

All endpoints require `sessionId` and return timing information.

#### Open Session

**POST** `/api/browser/open`

```json
{
  "sessionId": "my-session",
  "mode": "auto|local|browserless"
}
```

#### Navigate

**POST** `/api/browser/goto`

```json
{
  "sessionId": "my-session",
  "url": "https://example.com",
  "waitUntil": "networkidle2",
  "timeout": 30000
}
```

#### Click Element

**POST** `/api/browser/click`

```json
{
  "sessionId": "my-session",
  "selector": "button.submit",
  "waitForNavigation": false,
  "timeout": 5000
}
```

#### Type Text

**POST** `/api/browser/type`

```json
{
  "sessionId": "my-session",
  "selector": "input[name='query']",
  "text": "search term",
  "delay": 50,
  "clear": false
}
```

#### Extract Data

**POST** `/api/browser/extract`

```json
{
  "sessionId": "my-session",
  "selector": "h1",
  "attribute": "textContent",
  "multiple": false
}
```

#### Take Screenshot

**POST** `/api/browser/screenshot`

```json
{
  "sessionId": "my-session",
  "fullPage": false,
  "quality": 80
}
```

#### Close Session

**POST** `/api/browser/close`

```json
{
  "sessionId": "my-session"
}
```

### Chat Completion

**POST** `/api/chat`

Supports streaming via SSE.

```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "model": "deepseek/deepseek-r1:free",
  "stream": true,
  "persona": "helpful|concise|creative|agent"
}
```

### Agent Execution

**POST** `/api/agent/execute`

Autonomous task execution with LLM planning. Streams events via SSE.

```json
{
  "task": "Go to example.com and extract the main heading",
  "model": "deepseek/deepseek-r1:free",
  "mode": "auto",
  "sessionId": "optional-session-id"
}
```

**Event Types:**
- `start` - Task initiated
- `session_created` - Browser session ready
- `thinking` - LLM planning next actions
- `action_start` - Executing browser action
- `action_success` - Action completed
- `action_failed` - Action failed after retries
- `complete` - Task finished
- `error` - Fatal error

## 🤖 AI Models

### Default Model

**DeepSeek R1** (`deepseek/deepseek-r1:free`)
- Strong reasoning capabilities
- Step-by-step thinking
- Zero cost usage
- Best for complex automation tasks

### Fallback Chain

1. `deepseek/deepseek-r1-0528:free` - Alternative DeepSeek version
2. `openai/gpt-oss-20b:free` - Fast general-purpose
3. `qwen/qwen3-coder:free` - Code generation specialist

### All Available Free Models

- DeepSeek R1 (default)
- DeepSeek R1 0528
- GPT OSS 20B
- Qwen3 Coder
- GLM 4.5 Air
- Gemma 3N E2B IT

## 🔒 Security

### API Key Management

**Never commit API keys to version control!**

- Store in `.env` file (gitignored)
- Use environment variables in production
- Rotate keys regularly (see `security.md`)

### CORS Protection

Configure allowed origins:

```env
ALLOWED_ORIGINS=https://your-domain.com,https://another-domain.com
```

### Session Security

- Auto-cleanup after 5 minutes inactivity
- Timeout enforcement on all operations
- Resource limits on Vercel

## 🧪 Testing

### Run E2E Tests

```bash
npm test
```

Tests validate:
- Health check
- Model listing
- Browser session lifecycle
- Navigation and interaction
- Data extraction
- Screenshot capture

### Test Against Production

```bash
TEST_URL=https://your-app.vercel.app npm test
```

## 🐳 Self-Host with Docker

### Option 1: Playwright Docker

Use the official Playwright image for full browser support.

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  saki-browser:
    image: mcr.microsoft.com/playwright:v1.40.0
    ports:
      - "3000:3000"
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - ALLOWED_ORIGINS=*
    volumes:
      - ./:/app
    working_dir: /app
    command: npm run dev
```

Run:
```bash
docker-compose up
```

### Option 2: Custom Dockerfile

**Dockerfile:**
```dockerfile
FROM node:18-slim

RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3000
CMD ["npm", "run", "dev"]
```

Build and run:
```bash
docker build -t saki-browser .
docker run -p 3000:3000 -e OPENROUTER_API_KEY=your-key saki-browser
```

## 📊 Architecture

### Technology Stack

**Backend:**
- Node.js serverless functions (Vercel)
- Puppeteer-core + @sparticuz/chromium
- Server-Sent Events (SSE) for streaming
- Session-based browser management

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- Server-Sent Events client
- Markdown rendering
- Real-time updates

**AI Integration:**
- OpenRouter API (chat completions)
- Attribution headers (HTTP-Referer, X-Title)
- Streaming responses
- Free models only

### Browser Modes

**Local Chromium** (Development)
- Full Puppeteer with bundled Chromium
- Fast iteration
- No external dependencies

**@sparticuz/chromium** (Vercel Production)
- Optimized for serverless
- Automatic binary management
- Works within Vercel limits

**Browserless.io** (Production Fallback)
- Remote browser service
- Better reliability
- No cold start penalty
- Automatic failover

### Data Flow

1. **User Request** → Frontend
2. **Agent Planning** → OpenRouter LLM API
3. **Action Execution** → Puppeteer/Browser
4. **Verification** → Screenshot/Extract
5. **Streaming Updates** → SSE → Frontend
6. **Session Cleanup** → Automatic timeout

## 🔧 Configuration

### Vercel Limits

Configured in `vercel.json`:

```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

Adjust based on your needs:
- Memory: 1024-3008 MB
- Duration: 10-60 seconds (depends on plan)

### Session Timeouts

Default: 5 minutes inactivity

Edit `api/lib/browser-manager.js`:
```javascript
const SESSION_TIMEOUT = 300000; // milliseconds
```

### OpenRouter Attribution

Headers sent automatically:
- `HTTP-Referer`: Your domain
- `X-Title`: "Saki Browser Agent"

Helps track usage in OpenRouter analytics.

## 📚 Additional Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Puppeteer API](https://pptr.dev/)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Browserless.io Docs](https://docs.browserless.io/)
- [DeepSeek R1 Model](https://openrouter.ai/deepseek/deepseek-r1:free)

## 🐛 Troubleshooting

### Browser won't launch on Vercel

**Solution:** Use Browserless.io

1. Sign up at Browserless.io
2. Add WebSocket URL to environment
3. Mode automatically switches to "browserless"

### Function timeout errors

**Causes:**
- Complex tasks exceeding 60s
- Slow network conditions
- Heavy pages

**Solutions:**
- Break task into smaller steps
- Increase timeout in `vercel.json`
- Use Browserless for better reliability

### Memory issues

**Symptoms:**
- Out of memory errors
- Crashes during screenshots

**Solutions:**
- Increase memory in `vercel.json`
- Reduce screenshot quality
- Close sessions promptly

### OpenRouter rate limits

**Symptoms:**
- 429 Too Many Requests
- Model unavailable errors

**Solutions:**
- Use fallback models
- Implement request queuing
- Upgrade OpenRouter plan

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests: `npm test`
5. Submit pull request

## 📄 License

MIT License - see LICENSE file

## 🙏 Credits

- Powered by [OpenRouter](https://openrouter.ai/)
- Browser automation via [Puppeteer](https://pptr.dev/)
- Serverless hosting on [Vercel](https://vercel.com/)
- Optional browser service by [Browserless.io](https://browserless.io/)

---

**Developed with ❤️ for autonomous web automation**
