#!/usr/bin/env node

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const serverUrl = process.env.PUPPR_API_HEALTH_URL || 'http://localhost:3001/api/health';
const clientUrl = process.env.PUPPR_WEB_URL || 'http://localhost:5173';

async function waitFor(url, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok || response.status === 404) {
        return true;
      }
    } catch (_) {
      // Ignore and retry
    }
    await wait(1000);
  }
  return false;
}

(async () => {
  console.log('[ready] Waiting for Puppr services...');
  const [apiReady, appReady] = await Promise.all([waitFor(serverUrl), waitFor(clientUrl)]);

  console.log(`[ready] Backend: ${apiReady ? 'online' : 'unreachable'} → ${serverUrl}`);
  console.log(`[ready] Frontend: ${appReady ? 'online' : 'unreachable'} → ${clientUrl}`);
  console.log('[ready] Use CTRL+C in this terminal to stop both services.');
})();
