const config = require('../lib/config');

async function sendPush({ tokens, title, body, data = {} }) {
  const unique = [...new Set((tokens || []).filter(Boolean))];
  if (!unique.length) return { sent: 0, skipped: 'no_tokens' };

  const serverKey = process.env.FCM_SERVER_KEY || '';
  if (!serverKey) {
    if (config.demoMode) {
      console.log('[push] demo — would notify:', title, '→', unique.length, 'device(s)');
    }
    return { sent: 0, demo: true };
  }

  try {
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_ids: unique,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v ?? '')])
        ),
      }),
    });
    const json = await res.json().catch(() => ({}));
    return { sent: json.success || 0, failure: json.failure || 0, demo: false };
  } catch (err) {
    console.warn('[push] FCM error:', err.message);
    return { sent: 0, error: err.message };
  }
}

module.exports = { sendPush };
