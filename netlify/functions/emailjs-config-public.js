// Safely expose non-secret EmailJS configuration
// Only serves PUBLIC_KEY, SERVICE_ID, and TEMPLATE_ID (no secrets)

exports.handler = async (event, context) => {
  const origin = event.headers.origin;
  const allowedOrigins = [
    'https://devices-f2.com',
    'https://www.devices-f2.com',
    'https://devicesf2.netlify.app',
    'http://localhost:8000',
    'http://localhost:3000'
  ];

  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'CORS error: Origin not allowed' })
    };
  }

  const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
  const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;
  const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
  const emailjsClientTemplateId = process.env.EMAILJS_CLIENT_TEMPLATE_ID;

  // Validate that at least the required config is present
  if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'EmailJS configuration incomplete',
        details: 'Missing EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, or EMAILJS_TEMPLATE_ID in environment variables'
      })
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    },
    body: JSON.stringify({
      publicKey: emailjsPublicKey,
      serviceId: emailjsServiceId,
      templateId: emailjsTemplateId,
      clientTemplateId: emailjsClientTemplateId || emailjsTemplateId
    })
  };
};
