import { getSession } from '../lib/browser-manager.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    sessionId, 
    fullPage = false, 
    quality = 80,
    encoding = 'base64'
  } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const startTime = Date.now();
    
    const screenshot = await session.page.screenshot({
      type: 'jpeg',
      quality,
      fullPage,
      encoding
    });
    
    const timing = Date.now() - startTime;

    res.status(200).json({
      status: 'success',
      sessionId,
      screenshot: encoding === 'base64' ? screenshot : screenshot.toString('base64'),
      timing,
      url: session.page.url()
    });
  } catch (error) {
    console.error('Error taking screenshot:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      sessionId
    });
  }
}
