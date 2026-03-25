const {
  isAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  parseCookies,
  verifySignedToken
} = require('./_shared/security');

exports.handler = async (event) => {
  const origin = resolveOrigin(event);

  if (!isAllowedOrigin(origin)) {
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
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASS;
  const result = verifySignedToken(token, secret);

  if (!result.valid) {
    return jsonResponse(401, { authenticated: false }, origin);
  }

  return jsonResponse(200, {
    authenticated: true,
    user: result.payload.username || 'admin'
  }, origin);
};
