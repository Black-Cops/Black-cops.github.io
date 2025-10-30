import { closeSession, getActiveSessions } from '../lib/browser-manager.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    const closed = await closeSession(sessionId, 'manual');
    
    if (closed) {
      res.status(200).json({
        status: 'success',
        sessionId,
        closed: true,
        activeSessions: getActiveSessions().length
      });
    } else {
      res.status(404).json({
        status: 'error',
        error: 'Session not found',
        sessionId
      });
    }
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      sessionId
    });
  }
}
