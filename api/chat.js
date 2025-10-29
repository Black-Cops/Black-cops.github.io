import { handleCors } from './lib/cors.js';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const DEFAULT_MODEL = 'deepseek/deepseek-r1:free';
const FALLBACK_MODELS = [
  'deepseek/deepseek-r1-0528:free',
  'openai/gpt-oss-20b:free',
  'qwen/qwen3-coder:free'
];

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
  }

  const { messages, model = DEFAULT_MODEL, stream = true, persona = 'helpful' } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const personaPrompts = {
    concise: 'You are a concise AI assistant. Provide brief, direct answers without unnecessary elaboration.',
    helpful: 'You are a helpful AI assistant. Provide clear, detailed, and informative responses.',
    creative: 'You are a creative AI assistant. Provide imaginative, engaging, and thoughtful responses.',
    agent: 'You are a browser automation agent. Output structured JSON with tool calls only. Never simulate or describe actions - only output the concrete commands to execute.'
  };

  const systemPrompt = personaPrompts[persona] || personaPrompts.helpful;
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  const headers = {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
    'X-Title': 'Saki Browser Agent'
  };

  const payload = {
    model,
    messages: fullMessages,
    stream
  };

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      
      if (model !== DEFAULT_MODEL && !FALLBACK_MODELS.includes(model)) {
        return res.status(500).json({
          error: 'Model unavailable, using fallback',
          fallbackModel: DEFAULT_MODEL
        });
      }
      
      return res.status(response.status).json({
        error: `OpenRouter API error: ${response.status}`,
        details: error
      });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data.trim() === '[DONE]') {
                res.write(`data: ${JSON.stringify({ done: true, model })}\n\n`);
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0]?.delta?.content) {
                  const content = parsed.choices[0].delta.content;
                  res.write(`data: ${JSON.stringify({ text: content, model })}\n\n`);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (streamError) {
        console.error('Stream error:', streamError);
        res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
      } finally {
        res.end();
      }
    } else {
      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        res.status(200).json({
          text: data.choices[0].message.content,
          model
        });
      } else {
        res.status(500).json({ error: 'Invalid response from OpenRouter' });
      }
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error.message,
      model
    });
  }
}
