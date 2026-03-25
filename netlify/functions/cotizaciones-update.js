const admin = require('firebase-admin');
const {
  isAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  parseJsonBody,
  parseCookies,
  verifySignedToken
} = require('./_shared/security');
const { getFirestore } = require('./_shared/firebase-admin');

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

  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
  const token = cookies.admin_session;
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASS;
  const session = verifySignedToken(token, secret);

  if (!session.valid) {
    return jsonResponse(401, { success: false, error: 'Sesion invalida' }, origin);
  }

  let body;
  try {
    body = parseJsonBody(event);
  } catch (error) {
    return jsonResponse(400, { success: false, error: 'JSON invalido' }, origin);
  }

  const id = String(body.id || '').trim();
  const estado = String(body.status || '').trim();
  const notas = String(body.notas || '').trim().slice(0, 5000);
  const validStatuses = ['pendiente', 'contactado', 'completado', 'cancelado'];

  if (!id || !validStatuses.includes(estado)) {
    return jsonResponse(400, { success: false, error: 'Datos invalidos' }, origin);
  }

  try {
    const db = getFirestore();
    await db.collection('cotizaciones').doc(id).update({
      status: estado,
      notas,
      fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
      ultimaActualizacionPor: session.payload.username || 'admin'
    });

    return jsonResponse(200, { success: true }, origin);
  } catch (error) {
    return jsonResponse(500, { success: false, error: 'No se pudo actualizar la cotizacion' }, origin);
  }
};
