import { handleCors } from './lib/cors.js';
import { getActiveSessions } from './lib/browser-manager.js';

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  const mode = process.env.BROWSERLESS_WS ? 'browserless' : 'local';
  const activeSessions = getActiveSessions();

  res.status(200).json({
    status: 'healthy',
    mode,
    ready: true,
    activeSessions: activeSessions.length,
    environment: process.env.VERCEL ? 'vercel' : 'local',
    timestamp: new Date().toISOString()
  });
}
