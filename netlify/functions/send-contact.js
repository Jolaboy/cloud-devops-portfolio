// Lightweight SendGrid HTTP implementation to avoid heavy SDKs in functions
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    const params = new URLSearchParams(event.body);
    payload = Object.fromEntries(params.entries());
  }

  const { name, email, message } = payload || {};
  if (!name || !email || !message) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const TO_EMAIL = process.env.TO_EMAIL;
  const FROM_EMAIL = process.env.FROM_EMAIL || TO_EMAIL;

  if (!SENDGRID_API_KEY || !TO_EMAIL) {
    return { statusCode: 500, body: 'Email configuration not set' };
  }

  const sgPayload = {
    personalizations: [{ to: [{ email: TO_EMAIL }], subject: `Website contact from ${name}` }],
    from: { email: FROM_EMAIL },
    reply_to: { email },
    content: [
      { type: 'text/plain', value: `Name: ${name}\nEmail: ${email}\n\n${message}` },
      { type: 'text/html', value: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p>${escapeHtml(message)}</p>` }
    ]
  };

  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sgPayload)
    });

    const text = await res.text();
    if (res.status === 202) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }
    return { statusCode: res.status, body: text || res.statusText };
  } catch (err) {
    return { statusCode: 500, body: (err && err.message) || 'SendGrid request failed' };
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
