const {
  isAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  parseCookies,
  verifySignedToken
} = require('./_shared/security');
const { getFirestore } = require('./_shared/firebase-admin');

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

  if (!isAllowedOrigin(origin)) {
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
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASS;
  const session = verifySignedToken(token, secret);

  if (!session.valid) {
    return jsonResponse(401, { success: false, error: 'Sesion invalida' }, origin);
  }

  try {
    const db = getFirestore();
    const snapshot = await db.collection('cotizaciones').orderBy('fechaCreacion', 'desc').limit(100).get();
    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...serializeValue(doc.data()) });
    });
    return jsonResponse(200, { success: true, data }, origin);
  } catch (error) {
    return jsonResponse(500, { success: false, error: 'No se pudieron obtener cotizaciones' }, origin);
  }
};
