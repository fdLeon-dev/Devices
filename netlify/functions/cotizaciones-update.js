const admin = require('firebase-admin');
const {
  isStrictAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  parseJsonBody,
  parseCookies,
  verifySignedToken
} = require('./_shared/security');
const { getFirestore } = require('./_shared/firebase-admin');

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

  let body;
  try {
    body = parseJsonBody(event);
  } catch (error) {
    return jsonResponse(400, { success: false, error: 'JSON invalido' }, origin);
  }

  const id = String(body.id || '').trim();
  const estado = String(body.status || '').trim();
  const notas = String(body.notas || '').trim().slice(0, 5000);
  const devolucionFactura = String(body.devolucionFactura || '').trim().slice(0, 5000);
  const emailNuevo = String(body.email || '').trim().slice(0, 254);
  const validStatuses = ['pendiente', 'contactado', 'completado', 'cancelado'];

  // Validate email format if provided
  if (emailNuevo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNuevo)) {
    return jsonResponse(400, { success: false, error: 'Email invalido' }, origin);
  }

  if (!id || !validStatuses.includes(estado)) {
    return jsonResponse(400, { success: false, error: 'Datos invalidos' }, origin);
  }

  try {
    const db = getFirestore();
    const docRef = db.collection('cotizaciones').doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return jsonResponse(404, { success: false, error: 'Cotizacion no encontrada' }, origin);
    }

    const updateData = {
      status: estado,
      notas,
      devolucionFactura,
      fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
      ultimaActualizacionPor: session.payload.username || 'admin'
    };
    if (emailNuevo) {
      updateData.email = emailNuevo;
    }

    await docRef.update(updateData);

    return jsonResponse(200, { success: true }, origin);
  } catch (error) {
    return jsonResponse(500, { success: false, error: 'No se pudo actualizar la cotizacion' }, origin);
  }
};
