const admin = require('firebase-admin');
const {
  isAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  parseJsonBody,
  checkRateLimit,
  getClientIp,
  buildRateLimitKey
} = require('./_shared/security');
const { getFirestore } = require('./_shared/firebase-admin');

function asText(value, max = 5000) {
  return String(value || '').trim().slice(0, max);
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
  if (!checkRateLimit(buildRateLimitKey('quote-create', event), 12, 60 * 60 * 1000)) {
    return jsonResponse(429, { success: false, error: 'Demasiadas solicitudes. Intenta mas tarde.' }, origin);
  }

  let body;
  try {
    body = parseJsonBody(event);
  } catch (error) {
    return jsonResponse(400, { success: false, error: 'JSON invalido' }, origin);
  }

  const nombre = asText(body.nombre, 100);
  const email = asText(body.email, 254);
  const telefono = asText(body.telefono, 30);
  const mensaje = asText(body.mensaje, 4000);
  const servicioRaw = body.servicio;
  const servicios = Array.isArray(servicioRaw)
    ? servicioRaw.map((item) => asText(item, 120)).filter(Boolean)
    : [asText(servicioRaw, 120)].filter(Boolean);

  if (!nombre || !mensaje || servicios.length === 0) {
    return jsonResponse(400, { success: false, error: 'Faltan campos requeridos' }, origin);
  }

  if ((!email || email === 'No proporcionado') && (!telefono || telefono === 'No proporcionado')) {
    return jsonResponse(400, { success: false, error: 'Se requiere email o telefono' }, origin);
  }

  if (email && email !== 'No proporcionado' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { success: false, error: 'Email invalido' }, origin);
  }

  if (telefono && telefono !== 'No proporcionado' && !/^[\d+\-\s()]{7,30}$/.test(telefono)) {
    return jsonResponse(400, { success: false, error: 'Telefono invalido' }, origin);
  }

  try {
    const db = getFirestore();

    const payload = {
      nombre,
      email: email === 'No proporcionado' ? '' : email,
      telefono: telefono === 'No proporcionado' ? '' : telefono,
      servicios,
      urgency: asText(body.urgency || 'normal', 20),
      warranty: asText(body.warranty || '30', 20),
      descripcion: mensaje,
      fechaPreferida: asText(body.fechaPreferida, 30),
      urgencyMultiplier: asText(body.urgencyMultiplier || '1x', 20),
      basePrice: Number(body.precios && body.precios.basePrice) || 0,
      urgencyPrice: Number(body.precios && body.precios.urgencyPrice) || 0,
      warrantyPrice: Number(body.precios && body.precios.warrantyPrice) || 0,
      totalPrice: Number(body.precios && body.precios.totalPrice) || 0,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pendiente',
      notas: '',
      devolucionFactura: '',
      source: 'web-form',
      createdIp: ip
    };

    const docRef = await db.collection('cotizaciones').add(payload);
    return jsonResponse(200, { success: true, id: docRef.id }, origin);
  } catch (error) {
    return jsonResponse(500, { success: false, error: 'No se pudo guardar la cotizacion' }, origin);
  }
};
