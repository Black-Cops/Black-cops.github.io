import { getSession } from '../lib/browser-manager.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, url, waitUntil = 'networkidle2', timeout = 30000 } = req.body;

  if (!sessionId || !url) {
    return res.status(400).json({ error: 'sessionId and url are required' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const startTime = Date.now();
    await session.page.goto(url, { waitUntil, timeout });
    const timing = Date.now() - startTime;

    const currentUrl = session.page.url();
    const title = await session.page.title();

    res.status(200).json({
      status: 'success',
      sessionId,
      url: currentUrl,
      title,
      timing
    });
  } catch (error) {
    console.error('Error navigating:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      sessionId
    });
  }
}
