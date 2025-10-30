import { createSession } from '../lib/browser-manager.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, mode = 'auto' } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    const startTime = Date.now();
    const session = await createSession(sessionId, mode);
    const timing = Date.now() - startTime;

    res.status(200).json({
      status: 'success',
      sessionId: session.sessionId,
      mode: session.mode,
      timing,
      url: 'about:blank'
    });
  } catch (error) {
    console.error('Error opening browser session:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timing: Date.now() - (req.body.startTime || Date.now())
    });
  }
}
