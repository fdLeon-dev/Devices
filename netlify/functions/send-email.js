// Netlify Function para enviar emails de forma segura
// El cliente NO tiene acceso a las credenciales de EmailJS
// Usa la API REST de EmailJS directamente (no requiere dependencia)

exports.handler = async (event, context) => {
  // CORS - Solo aceptar desde tu dominio
  const origin = event.headers.origin;
  const allowedOrigins = [
    'https://devices-f2.com',
    'https://www.devices-f2.com',
    'https://devicesf2.netlify.app',  // Netlify preview
    'http://localhost:8000',  // Para desarrollo
    'http://localhost:3000'
  ];

  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'CORS Error: Origen no permitido' })
    };
  }

  try {
    console.log('📨 [send-email] Función iniciada');
    console.log('📨 [send-email] Method:', event.httpMethod);
    console.log('📨 [send-email] Origin:', origin);
    
    // Solo aceptar POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }

    let data;
    try {
      data = JSON.parse(event.body);
      console.log('📨 [send-email] Datos recibidos:', { 
        to_email: data.to_email,
        userName: data.userName,
        servicesList: data.servicesList
      });
    } catch (parseErr) {
      console.error('❌ [send-email] Error parseando JSON:', parseErr.message);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'JSON inválido' })
      };
    }

    // Validar campos requeridos
    if (!data.to_email || !data.userName || !data.servicesList) {
      console.error('❌ [send-email] Campos faltantes:', {
        to_email: !!data.to_email,
        userName: !!data.userName,
        servicesList: !!data.servicesList
      });
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Campos requeridos faltantes', received: { to_email: data.to_email, userName: data.userName, servicesList: data.servicesList } })
      };
    }

    // Validar que el email sea válido (si se proporcionó)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const to_email = data.to_email && emailRegex.test(data.to_email) ? data.to_email : 'devices.f02@gmail.com';
    
    console.log('📨 [send-email] Email destino:', to_email);

    // Validar límite de caracteres
    if (data.userName.length > 100 || data.servicesList.length > 1000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Datos exceden límite permitido' })
      };
    }

    // Las credenciales vienen de variables de entorno (NUNCA expuestas)
    const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
    const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;
    const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
    const emailjsClientTemplateId = process.env.EMAILJS_CLIENT_TEMPLATE_ID;

    console.log('🔑 [send-email] Verificando variables de entorno:');
    console.log('   ✓ EMAILJS_PUBLIC_KEY:', emailjsPublicKey ? '✅ Set' : '❌ Missing');
    console.log('   ✓ EMAILJS_SERVICE_ID:', emailjsServiceId ? '✅ Set' : '❌ Missing');
    console.log('   ✓ EMAILJS_TEMPLATE_ID:', emailjsTemplateId ? '✅ Set' : '❌ Missing');
    console.log('   ✓ EMAILJS_CLIENT_TEMPLATE_ID:', emailjsClientTemplateId ? '✅ Set (opcional)' : '⚠️ Not set (optional)');

    if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
      console.error('❌ Falta configuración de EmailJS');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Configuración de EmailJS no disponible',
          missingVars: {
            EMAILJS_PUBLIC_KEY: !emailjsPublicKey,
            EMAILJS_SERVICE_ID: !emailjsServiceId,
            EMAILJS_TEMPLATE_ID: !emailjsTemplateId
          }
        })
      };
    }

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

    console.log('📧 Enviando email al negocio...');
    const businessResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(businessPayload)
    });

    if (!businessResponse.ok) {
      const error = await businessResponse.text();
      console.error('❌ Error EmailJS:', businessResponse.status, error);
      throw new Error(`EmailJS error: ${businessResponse.status}`);
    }

    console.log('✅ Email al negocio enviado exitosamente');

    // Si viene un email de cliente válido, enviar confirmación
    if (data.userEmail && data.userEmail.includes('@') && emailRegex.test(data.userEmail)) {
      try {
        console.log('📧 Enviando email de confirmación al cliente...');
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
          console.warn('⚠️ No se pudo enviar email de confirmación al cliente');
        }
      } catch (clientErr) {
        console.warn('⚠️ No se pudo enviar email de confirmación:', clientErr.message);
        // No es error crítico, continuar
      }
    } else {
      console.log('📌 [send-email] No se envía email de confirmación al cliente (email no válido o no proporcionado)');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        message: 'Email enviado correctamente',
        folio: templateParams.folio
      })
    };

  } catch (error) {
    console.error('❌ [send-email] Error al enviar email:', error.message);
    console.error('❌ [send-email] Stack:', error.stack);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Error al procesar solicitud de email',
        details: process.env.NODE_ENV === 'production' ? 'Ver logs en Netlify' : error.message
      })
    };
  }
};
