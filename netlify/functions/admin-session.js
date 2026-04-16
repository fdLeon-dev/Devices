const {
  isStrictAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  parseCookies,
  verifySignedToken
} = require('./_shared/security');

exports.handler = async (event) => {
  const origin = resolveOrigin(event);

  if (!isStrictAllowedOrigin(origin)) {
    return jsonResponse(403, { authenticated: false, error: 'Origen no permitido' }, origin);
  }

  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true }, origin);
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { authenticated: false, error: 'Metodo no permitido' }, origin);
  }

  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
  const token = cookies.admin_session;
  const secret = String(process.env.ADMIN_SESSION_SECRET || '').trim();
  if (!secret || secret.length < 32) {
    return jsonResponse(500, { authenticated: false, error: 'ADMIN_SESSION_SECRET no configurado correctamente' }, origin);
  }
  const result = verifySignedToken(token, secret);

  if (!result.valid) {
    return jsonResponse(401, { authenticated: false }, origin);
  }

  return jsonResponse(200, {
    authenticated: true,
    user: result.payload.username || 'admin'
  }, origin);
};
