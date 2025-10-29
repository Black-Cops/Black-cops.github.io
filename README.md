# Saki Browser

A full-stack notebook-like AI browser assistant with multi-model streaming chat powered by OpenRouter free models.

## Features

- **Multi-Model Streaming Chat**: Real-time streaming responses from multiple AI models
- **Atlas/Comet-Inspired UI**: Dynamic three-panel workspace
  - Left: Session management
  - Center: Streaming markdown chat
  - Right: Model and persona selection
- **OpenRouter Integration**: Powered by OpenRouter's free AI models
- **Default Model**: Claude Sonnet 3.5
- **Available Models**:
  - Claude Sonnet 3.5 (default)
  - GPT OSS 20B
  - Qwen3 Coder
  - GLM 4.5 Air
  - Gemma 3N E2B IT
- **Persona Selector**: Choose between Concise, Helpful, or Creative response styles
- **Code Block Features**: Copy and download code with syntax highlighting
- **Dark Mode**: Modern dark theme
- **Offline Status**: Visual indicator for backend connectivity
- **Session Management**: Multiple chat sessions with history

## Tech Stack

- **Backend**: FastAPI with Server-Sent Events (SSE) for streaming
- **Frontend**: Single-page application (HTML/CSS/JavaScript)
- **API**: OpenRouter API integration
- **Architecture**: Full-stack with REST API and event streaming

## Prerequisites

- Python 3.8+
- OpenRouter API key

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

**Example with provided key:**

```env
OPENROUTER_API_KEY=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
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

## Running the Application

### Start the Backend

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Start the Frontend

Open `index.html` in your web browser or serve it with a simple HTTP server:

```bash
# Using Python's built-in HTTP server
python -m http.server 3000
```

Then open `http://localhost:3000` in your browser.

## API Endpoints

### GET `/api/models`

Returns list of available AI models.

**Response:**
```json
{
  "models": [
    {
      "id": "anthropic/claude-3.5-sonnet",
      "name": "Claude Sonnet 3.5",
      "provider": "Anthropic",
      "default": true
    },
    ...
  ]
}
```

### POST `/api/chat`

Send messages and receive streaming responses.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "model": "anthropic/claude-3.5-sonnet",
  "stream": true,
  "persona": "helpful"
}
```

**Response (Server-Sent Events):**
```
data: {"text": "Hello", "model": "anthropic/claude-3.5-sonnet"}
data: {"text": "!", "model": "anthropic/claude-3.5-sonnet"}
data: {"done": true, "model": "anthropic/claude-3.5-sonnet"}
```

### Example curl request

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Write a Python hello world"}],
    "model": "anthropic/claude-3.5-sonnet",
    "stream": true,
    "persona": "helpful"
  }'
```

### Example non-streaming request

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "anthropic/claude-3.5-sonnet",
    "stream": false,
    "persona": "concise"
  }'
```

**Response:**
```json
{
  "text": "Hello! How can I assist you today?",
  "model": "anthropic/claude-3.5-sonnet"
}
```

## Usage

1. **Select a Model**: Choose from available AI models in the right panel
2. **Choose a Persona**: Select Concise, Helpful, or Creative response style
3. **Start Chatting**: Type your message and press Send or Enter
4. **Manage Sessions**: Create new chat sessions or switch between existing ones
5. **Code Features**: Copy or download code blocks from AI responses
6. **Monitor Status**: Check the green/red indicator for backend connectivity

## Project Structure

```
.
├── main.py              # FastAPI backend server
├── index.html           # Frontend SPA
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
├── .env                 # Your environment variables (create this)
├── README.md            # This file
└── security.md          # Security guidelines
```

## Development

### Backend Development

The FastAPI backend runs on port 8000 by default. To run with hot reload:

```bash
uvicorn main:app --reload
```

### Frontend Development

The frontend is a static SPA. Any changes to `index.html` will be reflected on browser refresh.

## Troubleshooting

### Backend not starting
- Check if Python 3.8+ is installed: `python --version`
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Ensure port 8000 is not in use

### API key errors
- Verify your `.env` file exists and contains `OPENROUTER_API_KEY`
- Check that the API key is valid and has not expired
- See `security.md` for key rotation instructions

### Offline status indicator
- Ensure the backend is running on `http://localhost:8000`
- Check browser console for CORS or network errors
- Verify the `API_BASE_URL` in `index.html` matches your backend URL

### Streaming not working
- Ensure your browser supports Server-Sent Events (all modern browsers do)
- Check backend logs for errors
- Verify OpenRouter API is accessible

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

Developed with ❤️ using OpenRouter's AI models and FastAPI.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review `security.md` for security-related questions
- Open an issue on GitHub
