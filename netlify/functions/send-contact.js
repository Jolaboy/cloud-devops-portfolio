const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    // fallback for form-encoded bodies
    const params = new URLSearchParams(event.body);
    payload = Object.fromEntries(params.entries());
  }

  const { name, email, message } = payload;
  if (!name || !email || !message) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const TO_EMAIL = process.env.TO_EMAIL;
  const FROM_EMAIL = process.env.FROM_EMAIL || TO_EMAIL;

  if (!SENDGRID_API_KEY || !TO_EMAIL) {
    return { statusCode: 500, body: 'Email configuration not set' };
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  const msg = {
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject: `Website contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p>${escapeHtml(message)}</p>`
  };

  try {
    await sgMail.send(msg);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: (err && err.message) || 'SendGrid error' };
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
