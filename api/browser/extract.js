import { getSession } from '../lib/browser-manager.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, selector, attribute, multiple = false, timeout = 5000 } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const startTime = Date.now();
    let data;

    if (selector) {
      await session.page.waitForSelector(selector, { timeout });
      
      if (multiple) {
        data = await session.page.$$eval(selector, (elements, attr) => {
          return elements.map(el => {
            if (attr) return el.getAttribute(attr);
            return el.textContent.trim();
          });
        }, attribute);
      } else {
        data = await session.page.$eval(selector, (el, attr) => {
          if (attr) return el.getAttribute(attr);
          return el.textContent.trim();
        }, attribute);
      }
    } else {
      const url = session.page.url();
      const title = await session.page.title();
      const html = await session.page.content();
      
      data = {
        url,
        title,
        htmlLength: html.length
      };
    }
    
    const timing = Date.now() - startTime;

    res.status(200).json({
      status: 'success',
      sessionId,
      data,
      timing
    });
  } catch (error) {
    console.error('Error extracting data:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      sessionId
    });
  }
}
