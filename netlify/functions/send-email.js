// Netlify Function para enviar emails de forma segura
// El cliente NO tiene acceso a las credenciales de EmailJS
// Usa la API REST de EmailJS directamente (no requiere dependencia)

const {
  checkRateLimit,
  isStrictAllowedOrigin,
  resolveOrigin,
  jsonResponse,
  buildRateLimitKey
} = require('./_shared/security');

exports.handler = async (event, context) => {
  const origin = resolveOrigin(event);

  if (!isStrictAllowedOrigin(origin)) {
    return jsonResponse(403, { error: 'Origen no permitido' }, origin);
  }

  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true }, origin);
  }

  try {
        if (!checkRateLimit(buildRateLimitKey('send-email', event), 8, 60 * 60 * 1000)) {
          return jsonResponse(429, { error: 'Demasiadas solicitudes. Intenta mas tarde.' }, origin);
        }

    console.log('📨 [send-email] Función iniciada');
    console.log('📨 [send-email] Method:', event.httpMethod);
    console.log('📨 [send-email] Origin:', origin);
    
    // Solo aceptar POST
    if (event.httpMethod !== 'POST') {
      console.error('❌ [send-email] Method no es POST:', event.httpMethod);
      return jsonResponse(405, { error: 'Metodo no permitido' }, origin);
    }

    let data;
    try {
      // Netlify podría no incluir body si está vacío - verificar
      if (!event.body) {
        console.error('❌ [send-email] event.body está vacío');
        return jsonResponse(400, { error: 'Request body no puede estar vacio' }, origin);
      }
      
      data = JSON.parse(event.body);
      console.log('📨 [send-email] Datos recibidos bien');
    } catch (parseErr) {
      console.error('❌ [send-email] Error parseando JSON:', parseErr?.message || 'Unknown parse error');
      return jsonResponse(400, { error: 'JSON invalido' }, origin);
    }

    // Validar campos requeridos
    if (!data.to_email || !data.userName || !data.servicesList) {
      console.error('❌ [send-email] Campos faltantes:', {
        to_email: !!data.to_email,
        userName: !!data.userName,
        servicesList: !!data.servicesList
      });
      return jsonResponse(400, { error: 'Campos requeridos faltantes' }, origin);
    }

    // Validar que el email sea válido (si se proporcionó)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const to_email = data.to_email && emailRegex.test(data.to_email) ? data.to_email : 'devices.f02@gmail.com';
    
    console.log('📨 [send-email] Email destino:', to_email);

    // Validar límite de caracteres
    if (data.userName.length > 100 || data.servicesList.length > 1000) {
      console.error('❌ [send-email] Datos demasiado largos');
      return jsonResponse(400, { error: 'Datos exceden limite permitido' }, origin);
    }

    // Las credenciales vienen de variables de entorno (NUNCA expuestas)
    const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
    const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;
    const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
    const emailjsClientTemplateId = process.env.EMAILJS_CLIENT_TEMPLATE_ID;

    console.log('🔑 [send-email] Variables de entorno verificadas');

    // Preparar parámetros del email
    const templateParams = {
      to_email: to_email,
      userName: data.userName,
      userEmail: data.userEmail || 'no-reply@devices.f2',
      userPhone: data.userPhone || 'No proporcionado',
      servicesList: data.servicesList,
      service_type: data.servicesList,
      total: data.total || 0,
      urgencyText: data.urgencyText || 'Normal (3-5 días)',
      warrantyText: data.warrantyText || '30 días',
      message: data.message || 'Cotización desde formulario',
      currentDate: new Date().toLocaleDateString('es-ES'),
      folio: 'COT-' + Math.floor(Math.random() * 900000 + 100000),
      reply_to: data.userEmail || 'devices.f02@gmail.com'
    };

    if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
      const missing = [];
      if (!emailjsPublicKey) missing.push('EMAILJS_PUBLIC_KEY');
      if (!emailjsServiceId) missing.push('EMAILJS_SERVICE_ID');
      if (!emailjsTemplateId) missing.push('EMAILJS_TEMPLATE_ID');

      return jsonResponse(500, {
        success: false,
        error: `Configuracion EmailJS incompleta: ${missing.join(', ')}`
      }, origin);
    }

    // Enviar al negocio via API REST de EmailJS
    const businessPayload = {
      service_id: emailjsServiceId,
      template_id: emailjsTemplateId,
      user_id: emailjsPublicKey,
      template_params: {
        ...templateParams,
        to_email: 'devices.f02@gmail.com'
      }
    };

    console.log('📧 [send-email] Enviando email al negocio...');
    console.log('📧 [send-email] Payload listo para enviar');

    const businessResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(businessPayload)
    });

    console.log('📧 [send-email] Respuesta de EmailJS:', businessResponse.status);

    if (!businessResponse.ok) {
      const error = await businessResponse.text();
      throw new Error(`EmailJS business error: ${businessResponse.status} - ${error}`);
    }

    console.log('✅ [send-email] Email al negocio enviado exitosamente');

    // Si viene un email de cliente válido, enviar confirmación (no es crítico si falla)
    if (data.userEmail && data.userEmail.includes('@') && emailRegex.test(data.userEmail)) {
      try {
        console.log('📧 Enviando email de confirmación al cliente:', data.userEmail);
        const clientPayload = {
          service_id: emailjsServiceId,
          template_id: emailjsClientTemplateId || emailjsTemplateId,
          user_id: emailjsPublicKey,
          template_params: {
            ...templateParams,
            to_email: data.userEmail,
            message: `Gracias por tu cotización. Los servicios solicitados fueron: ${data.servicesList}`
          }
        };

        const clientResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientPayload)
        });

        if (clientResponse.ok) {
          console.log('✅ Email de confirmación enviado al cliente:', data.userEmail);
        } else {
          const clientError = await clientResponse.text();
          console.warn('⚠️ No se pudo enviar email de confirmación:', clientResponse.status, clientError);
        }
      } catch (clientErr) {
        console.warn('⚠️ No se pudo enviar email de confirmación:', clientErr?.message || 'Unknown error');
        // No es error crítico, continuar igual
      }
    } else {
      console.log('📌 [send-email] No se envía email de confirmación (email no válido o no proporcionado)');
    }

    return jsonResponse(200, {
      success: true,
      message: 'Email enviado correctamente',
      folio: templateParams.folio,
      method: 'emailjs'
    }, origin);

  } catch (error) {
    console.error('❌ [send-email] ERROR CRÍTICO:', error?.message || 'Unknown error');
    if (error?.stack) {
      console.error('❌ [send-email] Stack:', error.stack.substring(0, 500));
    }

    return jsonResponse(502, {
      success: false,
      error: 'No se pudo enviar el email. Intenta nuevamente.'
    }, origin);
  }
};
