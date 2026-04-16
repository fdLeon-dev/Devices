// Safely expose non-secret EmailJS configuration
// Only serves PUBLIC_KEY, SERVICE_ID, and TEMPLATE_ID (no secrets)

const {
  isStrictAllowedOrigin,
  resolveOrigin,
  jsonResponse
} = require('./_shared/security');

exports.handler = async (event, context) => {
  const origin = resolveOrigin(event);

  if (!isStrictAllowedOrigin(origin)) {
    return jsonResponse(403, { error: 'Origen no permitido' }, origin);
  }

  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true }, origin);
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Metodo no permitido' }, origin);
  }

  const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
  const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;
  const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
  const emailjsClientTemplateId = process.env.EMAILJS_CLIENT_TEMPLATE_ID;
  const emailjsCompletionTemplateId = process.env.EMAILJS_COMPLETION_TEMPLATE_ID;

  // Validate that at least the required config is present
  if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
    return jsonResponse(500, {
      error: 'Configuracion EmailJS incompleta'
    }, origin);
  }

  return {
    statusCode: 200,
    headers: {
      ...jsonResponse(200, {}, origin).headers,
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    },
    body: JSON.stringify({
      publicKey: emailjsPublicKey,
      serviceId: emailjsServiceId,
      templateId: emailjsTemplateId,
      clientTemplateId: emailjsClientTemplateId || emailjsTemplateId,
      completionTemplateId: emailjsCompletionTemplateId || emailjsClientTemplateId || emailjsTemplateId
    })
  };
};
