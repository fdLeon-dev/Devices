// Configuración de EmailJS para Devices F2
console.log('%c[LEGACY] emailjs-config.js cargado - Usar email-client.js en su lugar', 'color: #ff9800; font-weight: bold;');

/**
 * ⚠️ ARCHIVO LEGACY - USAR email-client.js EN SU LUGAR
 * 
 * Este archivo está aquí como fallback para compatibilidad.
 * Las credenciales de EmailJS se cargan desde config-loader.js (variables de entorno Netlify)
 * 
 * RECOMENDACIÓN: Usar sendEmailViaServer() en email-client.js
 * Eso NO expone ninguna credencial en el navegador.
 */

// Usar credenciales desde variables globales configuradas por config-loader.js
// config-loader.js las carga desde /.netlify/functions/inject-env (Netlify)
const configFromEnv = (window.__ENV_CONFIG__ && window.__ENV_CONFIG__.emailjs) ? window.__ENV_CONFIG__.emailjs : {};
const EMAILJS_CONFIG = window.EMAILJS_CONFIG_ENV || {
  publicKey: configFromEnv.publicKey || 'y9GCD4RwWJbp-dnRO',
  serviceId: configFromEnv.serviceId || 'service_yapkcmx',
  templateId: configFromEnv.templateId || 'template_o9khfnz',
  calculatorTemplateId: configFromEnv.calculatorTemplateId || 'template_h72ctck',
  clientTemplateId: configFromEnv.clientTemplateId || 'template_h72ctck'
};

if (!window.EMAILJS_CONFIG_ENV) {
  console.warn('%c[LEGACY] EMAILJS_CONFIG_ENV no está definido; usando valores fallback', 'color: #ff9800; font-weight: bold;');
}

// Helper functions for form data processing
function getUrgencyText(urgencyValue) {
  const urgencyTexts = {
    normal: 'Normal (3-5 días)',
    urgente: 'Urgente (24-48 horas)',
    express: 'Express (mismo día)'
  };
  return urgencyTexts[urgencyValue] || 'Normal (3-5 días)';
}

function getWarrantyText(warrantyValue) {
  const warrantyTexts = {
    '30': '30 días',
    '90': '90 días',
    '180': '6 meses',
    '365': '1 año'
  };
  return warrantyTexts[warrantyValue] || '30 días';
}

// Inicializar EmailJS
function initEmailJS() {
  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS no está cargado');
    return false;
  }

  try {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.log('%c📧 EmailJS inicializado correctamente', 'color: #28a745; font-weight: bold;');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar EmailJS:', error);
    return false;
  }
}

// Enviar email de cotización
// pdfDataUrl: opcional, data URL (data:application/pdf;base64,...) generado por jsPDF
async function enviarEmailCotizacion(datosFormulario, pdfDataUrl) {
  // Rate limiting check
  if (!checkRateLimit('email')) {
    console.warn('Rate limit exceeded for email submission');
    return { success: false, error: 'Por favor espera antes de enviar otro email' };
  }

  if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey === 'TU_PUBLIC_KEY_AQUI') {
    console.warn('EmailJS no está configurado. Revisa emailjs-config.js');
    return { success: false, error: 'EmailJS no configurado' };
  }

  try {
    // Validate input email before processing
    if (datosFormulario.email && !validateEmail(datosFormulario.email)) {
      console.warn('Invalid email format received:', datosFormulario.email);
      return { success: false, error: 'Email inválido' };
    }

    // Detectar si viene de calculadora usando el flag explícito (formulario de cotización NO debe activar este modo)
    const isFromCalculator = datosFormulario.fromCalculator === true;

    // Detectar si es email para el cliente o para el negocio
    const isClientEmail = (() => {
      if (!datosFormulario.email) return false;
      if (datosFormulario.email.trim() === '') return false;
      if (datosFormulario.email === 'No proporcionado') return false;
      if (datosFormulario.email === 'no-reply@devices.f2') return false;
      if (!datosFormulario.email.includes('@')) return false;
      if (datosFormulario.email === 'devices.f02@gmail.com') return false;
      return true;
    })();

    console.log('🔍 DEBUG EMAIL:');
    console.log('• Email recibido:', datosFormulario.email);
    console.log('• isClientEmail:', isClientEmail);
    console.log('• Servicio:', Array.isArray(datosFormulario.servicio) ? datosFormulario.servicio.join(', ') : datosFormulario.servicio);
    console.log('• Viene de calculadora:', isFromCalculator);

    // Normalizar servicios (puede ser array o string)
    const serviciosArray = Array.isArray(datosFormulario.servicio) ? datosFormulario.servicio : (datosFormulario.servicio ? datosFormulario.servicio.split(',').filter(s => s.trim()) : []);
    const serviciosString = serviciosArray.join(', ');

    const folio = 'COT-' + Math.floor(Math.random() * 900000 + 100000);

    const templateParams = {
      // to_email se establece por payload específico (negocio vs cliente)
      userName: datosFormulario.nombre,
      from_name: datosFormulario.nombre,        // alias utilizado en plantilla
      name: datosFormulario.nombre,             // alias simplificado
      userEmail: datosFormulario.email,
      email: datosFormulario.email,             // alias simplificado
      userPhone: datosFormulario.telefono,
      phone: datosFormulario.telefono,           // alias simplificado
      selectedServices: datosFormulario.selectedServices || serviciosArray.length,
      servicesList: serviciosString,
      service_type: serviciosString,          // alias para plantilla
      service: serviciosString,               // otro posible nombre
      urgencyText: datosFormulario.urgency ? getUrgencyText(datosFormulario.urgency) : 'Normal (3-5 días)',
      urgencyMultiplier: datosFormulario.urgencyMultiplier || '1x',
      warrantyText: datosFormulario.warranty ? getWarrantyText(datosFormulario.warranty) : '30 días',
      warrantyPrice: datosFormulario.precios ? datosFormulario.precios.warrantyPrice : 0,
      servicePrice: datosFormulario.precios ? datosFormulario.precios.basePrice : 0,
      urgencyCost: datosFormulario.precios ? datosFormulario.precios.urgencyPrice : 0,
      total: datosFormulario.precios ? datosFormulario.precios.totalPrice : 0,
      problemDescription: datosFormulario.mensaje,
      message: datosFormulario.mensaje,          // alias para cuerpo de mensaje
      currentDate: new Date().toLocaleDateString('es-ES'),
      folio,
      preferred_date: datosFormulario.fechaPreferida,
      reply_to: isClientEmail ? 'devices.f02@gmail.com' : datosFormulario.email
    };

    // Seleccionar template según origen
    const templateId = isFromCalculator ? EMAILJS_CONFIG.calculatorTemplateId : EMAILJS_CONFIG.templateId;
    const clientTemplateId = isFromCalculator ? EMAILJS_CONFIG.clientTemplateId : EMAILJS_CONFIG.templateId; // Usar mismo template para formulario

    console.log(`📧 Enviando ${isFromCalculator ? 'calculadora' : 'formulario'} al negocio`);
    console.log('Template usado:', templateId);

    // generar lista de destinatarios para el negocio (solo negocio, no incluir cliente aquí)
    const businessRecipients = 'devices.f02@gmail.com';

    const businessPayload = {
      service_id: EMAILJS_CONFIG.serviceId,
      template_id: templateId,
      user_id: EMAILJS_CONFIG.publicKey,
      template_params: {
        ...templateParams,
        to_email: businessRecipients,
        reply_to: datosFormulario.email || 'devices.f02@gmail.com'
      }
    };

    console.log('📧 Business Payload completo:', JSON.stringify(businessPayload, null, 2));
    console.log('📧 Enviando email al negocio a:', businessRecipients);
    const businessRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(businessPayload)
    });

    if (!businessRes.ok) {
      const text = await businessRes.text();
      console.error('❌ Error al enviar email al negocio:', { status: businessRes.status, text });
      return { success: false, error: text || `HTTP ${businessRes.status}` };
    }

    const businessJson = await businessRes.json().catch(() => ({}));
    console.log('✅ Email enviado al negocio exitosamente');

    // Enviar email separado al cliente con la factura si hay email válido
    if (isClientEmail) {
      console.log('📧 Enviando email con factura al cliente:', datosFormulario.email);
      
      const clientPayload = {
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: clientTemplateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          ...templateParams,
          to_email: datosFormulario.email,
          reply_to: 'devices.f02@gmail.com'
        }
      };

      try {
        const clientRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientPayload)
        });

        if (clientRes.ok) {
          console.log('✅ Email con factura enviado al cliente exitosamente');
        } else {
          const clientText = await clientRes.text();
          console.warn('⚠️ No se pudo enviar email al cliente:', { status: clientRes.status, text: clientText });
        }
      } catch (clientError) {
        console.warn('⚠️ Error al enviar email al cliente:', clientError);
      }
    }

    // Si el correo se envió y tenemos PDF, intentar enviarlo por webhook
    if (pdfDataUrl) {
      console.log('📎 Intentando enviar PDF como adjunto por webhook...');
      (async () => {
        try {
          const webhookResult = await enviarPdfPorWebhook(datosFormulario, pdfDataUrl);
          console.log('✅ PDF enviado por webhook:', webhookResult);
        } catch (webhookErr) {
          console.warn('⚠️ No se pudo enviar PDF por webhook (continúa normalmente):', webhookErr);
        }
      })();
    }

    return { success: true, response: businessJson };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return { success: false, error: error.text || error.message };
  }
}

// Enviar PDF por webhook (si está disponible)
async function enviarPdfPorWebhook(datosFormulario, pdfDataUrl) {
  // Prefer the configured window.WEBHOOK_URL; default to Netlify function path for deployed sites
  const webhookUrl = window.WEBHOOK_URL || '/.netlify/functions/send-pdf';

  if (!webhookUrl) {
    throw new Error('No hay webhook URL configurado');
  }

  const rawMatch = String(pdfDataUrl).match(/^data:.*;base64,(.*)$/);
  const pdfBase64 = rawMatch ? rawMatch[1] : pdfDataUrl;

  const body = {
    to: 'devices.f02@gmail.com',
    subject: `Cotización PDF - ${datosFormulario.servicio}`,
    message: `Cotización para: ${datosFormulario.nombre} (${datosFormulario.email})`,
    pdf_base64: pdfBase64,
    pdf_filename: 'cotizacion-devices.pdf'
  };

  // Add optional Authorization header if front-end exposes the secret token
  const headers = { 'Content-Type': 'application/json' };
  if (window.WEBHOOK_SECRET_TOKEN) {
    headers.Authorization = 'Bearer ' + window.WEBHOOK_SECRET_TOKEN;
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webhook error ${res.status}: ${text}`);
  }

  return res.json();
}

// Generar mensaje de WhatsApp para el cliente
function generarMensajeWhatsAppCliente(nombre, servicio) {
  const mensaje = `¡Hola ${nombre}! 👋

Gracias por solicitar una cotización para *${servicio}* en Devices F2.

Hemos recibido tu solicitud y te responderemos en menos de 24 horas. 📧

Si tienes alguna pregunta urgente, estamos aquí para ayudarte.

*Devices F2* - Tu PC como nueva 💻✨`;

  return encodeURIComponent(mensaje);
}

// Abrir WhatsApp del cliente con mensaje de confirmación
function enviarWhatsAppConfirmacion(telefono, nombre, servicio) {
  // Limpiar el número de teléfono
  let numeroLimpio = telefono.replace(/\D/g, '');

  // Si no tiene código de país, agregar +598 (Uruguay)
  if (!numeroLimpio.startsWith('598') && numeroLimpio.length === 9) {
    numeroLimpio = '598' + numeroLimpio;
  }

  const mensaje = generarMensajeWhatsAppCliente(nombre, servicio);
  const whatsappUrl = `https://wa.me/${numeroLimpio}?text=${mensaje}`;

  // Abrir WhatsApp en nueva pestaña
  window.open(whatsappUrl, '_blank');
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { enviarEmailCotizacion };
}

