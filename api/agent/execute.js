import { handleCors } from '../lib/cors.js';
import { createSession, closeSession, getSession } from '../lib/browser-manager.js';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'deepseek/deepseek-r1:free';

const MAX_RETRIES = 3;
const MAX_ACTIONS = 20;

async function callLLM(messages, model = DEFAULT_MODEL) {
  const headers = {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
    'X-Title': 'Saki Browser Agent'
  };

  const payload = {
    model,
    messages,
    temperature: 0.2,
    stream: false
  };

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function executeAction(session, action) {
  const { type, args } = action;
  
  switch (type) {
    case 'goto':
      await session.page.goto(args.url, { waitUntil: 'networkidle2', timeout: 30000 });
      return { url: session.page.url(), title: await session.page.title() };
      
    case 'click':
      await session.page.waitForSelector(args.selector, { timeout: 5000 });
      await session.page.click(args.selector);
      return { clicked: args.selector };
      
    case 'type':
      await session.page.waitForSelector(args.selector, { timeout: 5000 });
      await session.page.type(args.selector, args.text, { delay: 50 });
      return { typed: args.text };
      
    case 'extract':
      await session.page.waitForSelector(args.selector, { timeout: 5000 });
      const data = await session.page.$eval(args.selector, (el, attr) => {
        if (attr) return el.getAttribute(attr);
        return el.textContent.trim();
      }, args.attribute);
      return { extracted: data };
      
    case 'screenshot':
      const screenshot = await session.page.screenshot({
        type: 'jpeg',
        quality: 80,
        encoding: 'base64'
      });
      return { screenshot };
      
    case 'wait':
      await new Promise(resolve => setTimeout(resolve, args.ms || 1000));
      return { waited: args.ms };
      
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { task, sessionId, model = DEFAULT_MODEL, mode = 'auto' } = req.body;

  if (!task) {
    return res.status(400).json({ error: 'task is required' });
  }

  const effectiveSessionId = sessionId || `agent-${Date.now()}`;
  let session = null;
  const actionLog = [];
  const screenshots = [];

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    function sendEvent(data) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    sendEvent({ type: 'start', task, sessionId: effectiveSessionId });

    session = await createSession(effectiveSessionId, mode);
    sendEvent({ type: 'session_created', sessionId: effectiveSessionId, mode: session.mode });

    const systemPrompt = `You are a browser automation agent. Given a task, output a JSON object with an "actions" array containing browser commands.

Available actions:
- {"type": "goto", "args": {"url": "..."}}
- {"type": "click", "args": {"selector": "..."}}
- {"type": "type", "args": {"selector": "...", "text": "..."}}
- {"type": "extract", "args": {"selector": "...", "attribute": "..."}}
- {"type": "screenshot", "args": {}}
- {"type": "wait", "args": {"ms": 1000}}

Output ONLY valid JSON with this structure:
{
  "actions": [ {...}, {...} ],
  "reasoning": "why these actions",
  "final_answer": "result or null if more steps needed"
}

Use semantic selectors (button, input[type=...], a[href*=...], etc) when possible.
After critical actions, add extract or screenshot for verification.
Stop after 3 failed attempts on any step.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Task: ${task}` }
    ];

    let actionCount = 0;
    let finalAnswer = null;
    let conversationHistory = [...messages];

    while (actionCount < MAX_ACTIONS && !finalAnswer) {
      sendEvent({ type: 'thinking', message: 'Planning next actions...' });
      
      const response = await callLLM(conversationHistory, model);
      sendEvent({ type: 'llm_response', response });

      let plan;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        plan = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        sendEvent({ type: 'error', message: 'Failed to parse LLM response as JSON', error: parseError.message });
        break;
      }

      const { actions, reasoning, final_answer } = plan;
      
      if (reasoning) {
        sendEvent({ type: 'reasoning', message: reasoning });
      }

      if (final_answer) {
        finalAnswer = final_answer;
        sendEvent({ type: 'final_answer', answer: finalAnswer });
        break;
      }

      if (!actions || !Array.isArray(actions)) {
        sendEvent({ type: 'error', message: 'No actions array in response' });
        break;
      }

      for (const action of actions) {
        if (actionCount >= MAX_ACTIONS) break;
        
        actionCount++;
        sendEvent({ type: 'action_start', action, count: actionCount });

        let retries = 0;
        let result = null;
        let lastError = null;

        while (retries < MAX_RETRIES) {
          try {
            result = await executeAction(session, action);
            actionLog.push({ action, result, success: true });
            sendEvent({ type: 'action_success', action, result });

            if (action.type === 'screenshot' && result.screenshot) {
              screenshots.push({
                step: actionCount,
                image: result.screenshot,
                url: session.page.url()
              });
            }

            break;
          } catch (error) {
            lastError = error;
            retries++;
            sendEvent({ type: 'action_retry', action, error: error.message, attempt: retries });
            
            if (retries < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
          }
        }

        if (retries >= MAX_RETRIES) {
          actionLog.push({ action, error: lastError.message, success: false });
          sendEvent({ type: 'action_failed', action, error: lastError.message });
          
          conversationHistory.push({
            role: 'assistant',
            content: JSON.stringify(plan)
          });
          conversationHistory.push({
            role: 'user',
            content: `Action failed after ${MAX_RETRIES} attempts: ${action.type}. Error: ${lastError.message}. Current URL: ${session.page.url()}. Please try a different approach or provide final_answer with an error message.`
          });
          break;
        }
      }

      if (!finalAnswer && actionCount < MAX_ACTIONS) {
        const currentUrl = session.page.url();
        const currentTitle = await session.page.title();
        
        conversationHistory.push({
          role: 'assistant',
          content: JSON.stringify(plan)
        });
        conversationHistory.push({
          role: 'user',
          content: `Actions completed. Current state: URL=${currentUrl}, Title="${currentTitle}". Provide next actions or final_answer if task is complete.`
        });
      }
    }

    sendEvent({
      type: 'complete',
      finalAnswer,
      actionCount,
      screenshots: screenshots.length,
      sessionId: effectiveSessionId
    });

    res.end();

  } catch (error) {
    console.error('Agent execution error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  } finally {
    if (session) {
      await closeSession(effectiveSessionId, 'task_complete');
    }
  }
}
