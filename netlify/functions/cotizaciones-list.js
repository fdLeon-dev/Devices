const {
  isStrictAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  parseCookies,
  verifySignedToken
} = require('./_shared/security');
const { getFirestore } = require('./_shared/firebase-admin');

function asTimestampMillis(value) {
  if (!value) return 0;

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }

  if (value.seconds !== undefined) {
    return Number(value.seconds) * 1000;
  }

  if (value._seconds !== undefined) {
    return Number(value._seconds) * 1000;
  }

  return 0;
}

function resolveListError(error) {
  const message = String((error && error.message) || '').toLowerCase();

  if (message.includes('firebase_service_account_json') || message.includes('serviceaccountkey.json')) {
    return 'Firebase no esta configurado en el servidor';
  }

  return 'No se pudieron obtener cotizaciones';
}

function serializeValue(value) {
  if (!value) return value;

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      return value.toDate().toISOString();
    }

    const obj = {};
    Object.keys(value).forEach((key) => {
      obj[key] = serializeValue(value[key]);
    });
    return obj;
  }

  return value;
}

exports.handler = async (event) => {
  const origin = resolveOrigin(event);

  if (!isStrictAllowedOrigin(origin)) {
    return jsonResponse(403, { success: false, error: 'Origen no permitido' }, origin);
  }

  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true }, origin);
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { success: false, error: 'Metodo no permitido' }, origin);
  }

  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
  const token = cookies.admin_session;
  const secret = String(process.env.ADMIN_SESSION_SECRET || '').trim();
  if (!secret || secret.length < 32) {
    return jsonResponse(500, { success: false, error: 'ADMIN_SESSION_SECRET no configurado correctamente' }, origin);
  }
  const session = verifySignedToken(token, secret);

  if (!session.valid) {
    return jsonResponse(401, { success: false, error: 'Sesion invalida' }, origin);
  }

  try {
    const db = getFirestore();
    let snapshot;

    try {
      snapshot = await db.collection('cotizaciones').orderBy('fechaCreacion', 'desc').limit(100).get();
    } catch (queryError) {
      snapshot = await db.collection('cotizaciones').limit(100).get();
    }

    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...serializeValue(doc.data()) });
    });

    data.sort((a, b) => asTimestampMillis(b.fechaCreacion) - asTimestampMillis(a.fechaCreacion));
    return jsonResponse(200, { success: true, data }, origin);
  } catch (error) {
    return jsonResponse(500, { success: false, error: resolveListError(error) }, origin);
  }
};
