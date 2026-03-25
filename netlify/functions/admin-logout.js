const {
  isAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  clearSessionCookie
} = require('./_shared/security');

exports.handler = async (event) => {
  const origin = resolveOrigin(event);

  if (!isAllowedOrigin(origin)) {
    return jsonResponse(403, { success: false, error: 'Origen no permitido' }, origin);
  }

  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true }, origin);
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { success: false, error: 'Metodo no permitido' }, origin);
  }

  return {
    statusCode: 200,
    headers: {
      ...jsonResponse(200, {}, origin).headers,
      'Set-Cookie': clearSessionCookie()
    },
    body: JSON.stringify({ success: true })
  };
};
