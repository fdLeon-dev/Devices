const { isAllowedOrigin, resolveOrigin, jsonResponse } = require('./_shared/security');

function hasValue(value) {
  return String(value || '').trim().length > 0;
}

exports.handler = async (event) => {
  const origin = resolveOrigin(event);

  if (!isAllowedOrigin(origin)) {
    return jsonResponse(403, { ok: false, error: 'Origen no permitido' }, origin);
  }

  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true }, origin);
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { ok: false, error: 'Metodo no permitido' }, origin);
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
