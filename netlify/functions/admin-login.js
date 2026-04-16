const {
  isStrictAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  parseJsonBody,
  createSignedToken,
  buildSessionCookie,
  checkRateLimit,
  buildRateLimitKey
} = require('./_shared/security');
const crypto = require('crypto');

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

function secureTextEquals(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

exports.handler = async (event) => {
  const origin = resolveOrigin(event);

  if (!isStrictAllowedOrigin(origin)) {
    return jsonResponse(403, { success: false, error: 'Origen no permitido' }, origin);
  }

  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true }, origin);
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { success: false, error: 'Metodo no permitido' }, origin);
  }

  if (!checkRateLimit(buildRateLimitKey('admin-login', event), 6, 10 * 60 * 1000)) {
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

  if (!secureTextEquals(user, expectedUser) || !secureTextEquals(pass, expectedPass)) {
    return jsonResponse(401, { success: false, error: 'Credenciales invalidas' }, origin);
  }

  const secret = firstNonEmptyEnv(process.env.ADMIN_SESSION_SECRET);
  if (!secret || secret.length < 32) {
    return jsonResponse(500, { success: false, error: 'ADMIN_SESSION_SECRET no configurado correctamente' }, origin);
  }

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
