# Saki Browser - Quick Start Guide

Get up and running with Saki Browser in 5 minutes!

## Prerequisites

- Python 3.8 or higher
- A web browser (Chrome, Firefox, Safari, Edge)
- OpenRouter API key

## Quick Setup

### 1. Get an OpenRouter API Key

If you don't have one yet:
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for a free account
3. Generate an API key from your dashboard

### 2. Configure Environment

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and replace with your actual API key:
```
OPENROUTER_API_KEY=your-actual-key-here
```

### 3. Start the Application

#### Option A: Using the start script (Recommended)
```bash
./start.sh
```

#### Option B: Manual start
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend
python main.py
```

The backend will start on `http://localhost:8000`

### 4. Open the Frontend

Open `index.html` in your web browser:

- **Quick way**: Just double-click `index.html`
- **With local server** (recommended for development):
  ```bash
  # In a new terminal
  python -m http.server 3000
  ```
  Then open `http://localhost:3000` in your browser

## First Steps

1. **Check Status**: Look for the green indicator next to "Saki Browser" in the header
2. **Select Model**: Choose from available AI models in the right panel (Claude Sonnet 3.5 is default)
3. **Choose Persona**: Select Concise, Helpful, or Creative response style
4. **Start Chatting**: Type a message and press Enter or click Send

## Example Conversations

Try these to get started:

- "Write a Python hello world program"
- "Explain quantum computing in simple terms"
- "Generate a creative story about AI"
- "Help me debug this code: [paste code]"

## Features to Explore

### Code Blocks
When the AI generates code, you can:
- **Copy**: Click the Copy button
- **Download**: Save as a file with the Download button

### Sessions
- Create new chat sessions with the "+ New Session" button
- Switch between sessions in the left sidebar
- Each session maintains its own conversation history

### Personas
- **Concise**: Brief, to-the-point answers
- **Helpful**: Detailed, informative responses
- **Creative**: Imaginative, engaging replies

### Models
Switch between different AI models:
- **Claude Sonnet 3.5** - Best overall, great reasoning
- **GPT OSS 20B** - Fast, good for general tasks
- **Qwen3 Coder** - Specialized for coding
- **GLM 4.5 Air** - Lightweight, quick responses
- **Gemma 3N E2B IT** - Google's model

## Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Try reinstalling dependencies
pip install --upgrade -r requirements.txt
```

### Frontend shows offline
- Make sure the backend is running on port 8000
- Check `server.log` for errors
- Verify your API key in `.env`

### API errors
- Check your OpenRouter API key is valid
- Verify you have internet connection
- Check OpenRouter service status

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Review [security.md](security.md) for security best practices
- Check the API endpoints documentation in README.md

## Getting Help

- Check the logs: `tail -f server.log`
- Review the browser console for frontend errors
- Ensure all prerequisites are met

## Tips

1. **Use Shift+Enter** for multi-line messages
2. **Session History** is stored in browser memory (lost on refresh)
3. **Model Selection** persists within a session
4. **Dark Mode** is the default theme (matches your system preference)
5. **Streaming** provides real-time responses as they're generated

---

Enjoy using Saki Browser! 🚀
