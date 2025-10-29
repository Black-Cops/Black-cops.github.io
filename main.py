import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Saki Browser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

AVAILABLE_MODELS = [
    {
        "id": "openai/gpt-oss-20b:free",
        "name": "GPT OSS 20B",
        "provider": "OpenAI",
        "default": True
    },
    {
        "id": "qwen/qwen3-coder:free",
        "name": "Qwen3 Coder",
        "provider": "Qwen",
        "default": False
    },
    {
        "id": "z-ai/glm-4.5-air:free",
        "name": "GLM 4.5 Air",
        "provider": "Z-AI",
        "default": False
    },
    {
        "id": "google/gemma-3n-e2b-it:free",
        "name": "Gemma 3N E2B IT",
        "provider": "Google",
        "default": False
    }
]

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = "openai/gpt-oss-20b:free"
    stream: Optional[bool] = True
    persona: Optional[str] = "helpful"

@app.get("/")
async def root():
    return {"message": "Saki Browser API", "status": "running"}

@app.get("/api/models")
async def get_models():
    return {"models": AVAILABLE_MODELS}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")

    persona_prompts = {
        "concise": "You are a concise AI assistant. Provide brief, direct answers without unnecessary elaboration.",
        "helpful": "You are a helpful AI assistant. Provide clear, detailed, and informative responses.",
        "creative": "You are a creative AI assistant. Provide imaginative, engaging, and thoughtful responses."
    }
    
    persona = request.persona or "helpful"
    system_prompt = persona_prompts.get(persona, persona_prompts["helpful"])
    
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend([{"role": msg.role, "content": msg.content} for msg in request.messages])

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://saki-browser.local",
        "X-Title": "Saki Browser"
    }

    payload = {
        "model": request.model,
        "messages": messages,
        "stream": request.stream
    }

    if request.stream:
        async def stream_response():
            async with httpx.AsyncClient(timeout=60.0) as client:
                try:
                    async with client.stream(
                        "POST",
                        f"{OPENROUTER_BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload
                    ) as response:
                        if response.status_code != 200:
                            error_text = await response.aread()
                            yield f"data: {json.dumps({'error': f'API Error: {response.status_code}'})}\n\n"
                            return

                        async for line in response.aiter_lines():
                            if line.strip():
                                if line.startswith("data: "):
                                    data = line[6:]
                                    if data.strip() == "[DONE]":
                                        yield f"data: {json.dumps({'done': True, 'model': request.model})}\n\n"
                                        break
                                    try:
                                        chunk = json.loads(data)
                                        if "choices" in chunk and len(chunk["choices"]) > 0:
                                            delta = chunk["choices"][0].get("delta", {})
                                            content = delta.get("content", "")
                                            if content:
                                                normalized = {
                                                    "text": content,
                                                    "model": request.model
                                                }
                                                yield f"data: {json.dumps(normalized)}\n\n"
                                    except json.JSONDecodeError:
                                        continue
                except Exception as e:
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(stream_response(), media_type="text/event-stream")
    else:
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )
                if response.status_code != 200:
                    raise HTTPException(status_code=response.status_code, detail="OpenRouter API error")
                
                data = response.json()
                if "choices" in data and len(data["choices"]) > 0:
                    content = data["choices"][0]["message"]["content"]
                    return JSONResponse({
                        "text": content,
                        "model": request.model
                    })
                else:
                    raise HTTPException(status_code=500, detail="Invalid response from OpenRouter")
            except httpx.RequestError as e:
                raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
