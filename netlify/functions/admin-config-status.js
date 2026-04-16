const {
  isStrictAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  parseCookies,
  verifySignedToken
} = require('./_shared/security');

function hasValue(value) {
  return String(value || '').trim().length > 0;
}

exports.handler = async (event) => {
  const origin = resolveOrigin(event);

  if (!isStrictAllowedOrigin(origin)) {
    return jsonResponse(403, { ok: false, error: 'Origen no permitido' }, origin);
  }

  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true }, origin);
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { ok: false, error: 'Metodo no permitido' }, origin);
  }

  if (String(process.env.NODE_ENV || '').toLowerCase() === 'production') {
    return jsonResponse(404, { ok: false, error: 'No encontrado' }, origin);
  }

  const secret = String(process.env.ADMIN_SESSION_SECRET || '').trim();
  if (!secret || secret.length < 32) {
    return jsonResponse(500, { ok: false, error: 'ADMIN_SESSION_SECRET no configurado correctamente' }, origin);
  }

  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
  const session = verifySignedToken(cookies.admin_session, secret);
  if (!session.valid || session.payload.role !== 'admin') {
    return jsonResponse(401, { ok: false, error: 'No autorizado' }, origin);
  }

  const status = {
    ok: true,
    vars: {
      ADMIN_USERNAME: hasValue(process.env.ADMIN_USERNAME),
      ADMIN_PASSWORD: hasValue(process.env.ADMIN_PASSWORD),
      ADMIN_USER: hasValue(process.env.ADMIN_USER),
      ADMIN_PASS: hasValue(process.env.ADMIN_PASS),
      ADMIN_SESSION_SECRET: hasValue(process.env.ADMIN_SESSION_SECRET)
    },
    selected: {
      usernameFrom: hasValue(process.env.ADMIN_USERNAME)
        ? 'ADMIN_USERNAME'
        : hasValue(process.env.ADMIN_USER)
          ? 'ADMIN_USER'
          : 'NONE',
      passwordFrom: hasValue(process.env.ADMIN_PASSWORD)
        ? 'ADMIN_PASSWORD'
        : hasValue(process.env.ADMIN_PASS)
          ? 'ADMIN_PASS'
          : 'NONE'
    }
  };

  return jsonResponse(200, status, origin);
};
