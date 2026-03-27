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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || normalized === 'no proporcionado' || normalized === '(no proporcionado)') {
    return false;
  }
  return EMAIL_REGEX.test(normalized);
}

function normalizeServices(cotizacion) {
  const serviciosRaw = cotizacion.servicios;
  if (Array.isArray(serviciosRaw)) {
    return serviciosRaw
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') return item.name || item.service || item.label || '';
        return '';
      })
      .filter(Boolean)
      .join(', ');
  }
  if (typeof serviciosRaw === 'string' && serviciosRaw.trim()) {
    return serviciosRaw.trim();
  }
  if (typeof cotizacion.servicio === 'string' && cotizacion.servicio.trim()) {
    return cotizacion.servicio.trim();
  }
  return 'Servicio tecnico';
}

function buildCompletionTemplateParams(cotizacion, updateData) {
  const nombre = String(cotizacion.nombre || 'Cliente').trim() || 'Cliente';
  const servicios = normalizeServices(cotizacion);
  const total = Number(cotizacion.totalPrice || 0);
  const fecha = new Date().toLocaleString('es-ES');

  return {
    to_email: String(cotizacion.email || '').trim(),
    userName: nombre,
    quoteId: updateData.id,
    folio: String(cotizacion.folio || updateData.id || '').trim(),
    estado: 'completado',
    servicesList: servicios,
    total: Number.isFinite(total) ? total.toFixed(2) : '0.00',
    devolucionFactura: updateData.devolucionFactura || 'Sin observaciones de devolucion.',
    message: updateData.devolucionFactura || 'Tu servicio fue marcado como completado.',
    notas: updateData.notas || '',
    currentDate: fecha,
    reply_to: 'devices.f02@gmail.com'
  };
}

async function sendCompletionEmail(templateParams) {
  const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
  const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;
  const completionTemplateId =
    process.env.EMAILJS_COMPLETION_TEMPLATE_ID ||
    process.env.EMAILJS_CLIENT_TEMPLATE_ID ||
    process.env.EMAILJS_TEMPLATE_ID;

  if (!emailjsPublicKey || !emailjsServiceId || !completionTemplateId) {
    return {
      triggered: true,
      sent: false,
      recipient: templateParams.to_email || '',
      reason: 'missing_emailjs_config',
      details: 'Faltan variables EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID o EMAILJS_COMPLETION_TEMPLATE_ID'
    };
  }

  const payload = {
    service_id: emailjsServiceId,
    template_id: completionTemplateId,
    user_id: emailjsPublicKey,
    template_params: templateParams
  };

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const providerError = await response.text();
    return {
      triggered: true,
      sent: false,
      recipient: templateParams.to_email || '',
      reason: 'email_provider_error',
      details: `EmailJS ${response.status}: ${providerError}`.slice(0, 300)
    };
  }

  return {
    triggered: true,
    sent: true,
    recipient: templateParams.to_email || '',
    reason: 'sent'
  };
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
  const devolucionFactura = String(body.devolucionFactura || '').trim().slice(0, 5000);
  const validStatuses = ['pendiente', 'contactado', 'completado', 'cancelado'];

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

    const cotizacionActual = snapshot.data() || {};
    const estadoAnterior = String(cotizacionActual.status || '').trim();

    await docRef.update({
      status: estado,
      notas,
      devolucionFactura,
      fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
      ultimaActualizacionPor: session.payload.username || 'admin'
    });

    let emailNotification = { triggered: false, sent: false, reason: 'not_required' };
    const cambioACompletado = estado === 'completado' && estadoAnterior !== 'completado';

    if (cambioACompletado) {
      const emailCliente = String(cotizacionActual.email || '').trim();

      if (!isValidEmail(emailCliente)) {
        emailNotification = {
          triggered: true,
          sent: false,
          recipient: emailCliente,
          reason: 'invalid_customer_email',
          details: 'La cotizacion no tiene un email valido en el campo EMAIL asociado'
        };
      } else {
        const templateParams = buildCompletionTemplateParams(cotizacionActual, {
          id,
          notas,
          devolucionFactura
        });
        emailNotification = await sendCompletionEmail(templateParams);
      }
    }

    return jsonResponse(200, { success: true, emailNotification }, origin);
  } catch (error) {
    return jsonResponse(500, { success: false, error: 'No se pudo actualizar la cotizacion' }, origin);
  }
};
