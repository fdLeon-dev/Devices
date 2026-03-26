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

function normalizeCredential(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^['\"]+|['\"]+$/g, '');
}

function firstNonEmptyEnv(...values) {
  for (const value of values) {
    const normalized = normalizeCredential(value);
    if (normalized) {
      return normalized;
    }
  }
  return '';
}

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

  const user = normalizeCredential(body.username);
  const pass = normalizeCredential(body.password);

  // Prefer new variable names to avoid collisions with stale legacy values.
  const expectedUser = firstNonEmptyEnv(process.env.ADMIN_USERNAME, process.env.ADMIN_USER);
  const expectedPass = firstNonEmptyEnv(process.env.ADMIN_PASSWORD, process.env.ADMIN_PASS);

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
