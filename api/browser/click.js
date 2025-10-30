import { getSession } from '../lib/browser-manager.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, selector, waitForNavigation = false, timeout = 5000 } = req.body;

  if (!sessionId || !selector) {
    return res.status(400).json({ error: 'sessionId and selector are required' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const startTime = Date.now();
    
    await session.page.waitForSelector(selector, { timeout });
    
    if (waitForNavigation) {
      await Promise.all([
        session.page.waitForNavigation({ waitUntil: 'networkidle2', timeout }),
        session.page.click(selector)
      ]);
    } else {
      await session.page.click(selector);
    }
    
    const timing = Date.now() - startTime;
    const url = session.page.url();

    res.status(200).json({
      status: 'success',
      sessionId,
      selector,
      url,
      timing
    });
  } catch (error) {
    console.error('Error clicking element:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      sessionId,
      selector
    });
  }
}
