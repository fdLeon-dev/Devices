const {
  isAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  parseJsonBody,
  createSignedToken,
  buildSessionCookie,
  checkRateLimit,
  getClientIp
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

  const ip = getClientIp(event);
  if (!checkRateLimit(`admin-login:${ip}`, 8, 10 * 60 * 1000)) {
    return jsonResponse(429, { success: false, error: 'Demasiados intentos. Espera unos minutos.' }, origin);
  }

  let body;
  try {
    body = parseJsonBody(event);
  } catch (error) {
    return jsonResponse(400, { success: false, error: 'JSON invalido' }, origin);
  }

  const user = String(body.username || '').trim();
  const pass = String(body.password || '').trim();

  const expectedUser = String(process.env.ADMIN_USER || process.env.ADMIN_USERNAME || '').trim();
  const expectedPass = String(process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || '').trim();

  if (!expectedUser || !expectedPass) {
    return jsonResponse(500, { success: false, error: 'Credenciales admin no configuradas en servidor' }, origin);
  }

  if (user !== expectedUser || pass !== expectedPass) {
    return jsonResponse(401, { success: false, error: 'Credenciales invalidas' }, origin);
  }

  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASS;
  const token = createSignedToken({ username: user, role: 'admin' }, secret, 8 * 60 * 60 * 1000);

  return {
    statusCode: 200,
    headers: {
      ...jsonResponse(200, {}, origin).headers,
      'Set-Cookie': buildSessionCookie(token)
    },
    body: JSON.stringify({ success: true, user })
  };
};
