import { getSession } from '../lib/browser-manager.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, selector, text, delay = 50, clear = false, timeout = 5000 } = req.body;

  if (!sessionId || !selector || text === undefined) {
    return res.status(400).json({ error: 'sessionId, selector, and text are required' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const startTime = Date.now();
    
    await session.page.waitForSelector(selector, { timeout });
    
    if (clear) {
      await session.page.click(selector, { clickCount: 3 });
      await session.page.keyboard.press('Backspace');
    }
    
    await session.page.type(selector, text, { delay });
    
    const timing = Date.now() - startTime;

    res.status(200).json({
      status: 'success',
      sessionId,
      selector,
      text,
      timing
    });
  } catch (error) {
    console.error('Error typing text:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      sessionId,
      selector
    });
  }
}
