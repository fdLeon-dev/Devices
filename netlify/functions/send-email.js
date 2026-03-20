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
      console.error('❌ [send-email] Method no es POST:', event.httpMethod);
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }

    let data;
    try {
      // Netlify podría no incluir body si está vacío - verificar
      if (!event.body) {
        console.error('❌ [send-email] event.body está vacío');
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Request body no puede estar vacío' })
        };
      }
      
      data = JSON.parse(event.body);
      console.log('📨 [send-email] Datos recibidos bien');
    } catch (parseErr) {
      console.error('❌ [send-email] Error parseando JSON:', parseErr?.message || 'Unknown parse error');
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
        body: JSON.stringify({ 
          error: 'Campos requeridos faltantes',
          received: { 
            to_email: data.to_email, 
            userName: data.userName, 
            servicesList: data.servicesList 
          }
        })
      };
    }

    // Validar que el email sea válido (si se proporcionó)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const to_email = data.to_email && emailRegex.test(data.to_email) ? data.to_email : 'devices.f02@gmail.com';
    
    console.log('📨 [send-email] Email destino:', to_email);

    // Validar límite de caracteres
    if (data.userName.length > 100 || data.servicesList.length > 1000) {
      console.error('❌ [send-email] Datos demasiado largos');
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
    console.log('   ✓ EMAILJS_PUBLIC_KEY:', emailjsPublicKey ? `${emailjsPublicKey.substring(0,10)}...` : '❌ Missing');
    console.log('   ✓ EMAILJS_SERVICE_ID:', emailjsServiceId ? `${emailjsServiceId.substring(0,10)}...` : '❌ Missing');
    console.log('   ✓ EMAILJS_TEMPLATE_ID:', emailjsTemplateId ? `${emailjsTemplateId.substring(0,10)}...` : '❌ Missing');
    console.log('   ✓ EMAILJS_CLIENT_TEMPLATE_ID:', emailjsClientTemplateId ? '✅ Set' : '⚠️ Not set');

    if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
      console.error('❌ [send-email] FALTA configuración de EmailJS');
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

    console.log('📧 [send-email] Enviando email al negocio...');
    console.log('📧 [send-email] Payload:', JSON.stringify(businessPayload).substring(0, 200) + '...');
    
    let businessResponse;
    try {
      businessResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessPayload)
      });

      console.log('📧 [send-email] Respuesta de EmailJS:', businessResponse.status);

      if (!businessResponse.ok) {
        const error = await businessResponse.text();
        console.error('❌ [send-email] Error de EmailJS:', businessResponse.status, error);
        throw new Error(`EmailJS error: ${businessResponse.status} - ${error}`);
      }

      console.log('✅ [send-email] Email al negocio enviado exitosamente');
    } catch (fetchErr) {
      console.error('❌ [send-email] Error en fetch a EmailJS:', fetchErr.message);
      throw fetchErr;
    }

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
          console.warn('⚠️ No se pudo enviar email de confirmación (status:', clientResponse.status + ')');
        }
      } catch (clientErr) {
        console.warn('⚠️ No se pudo enviar email de confirmación:', clientErr?.message || 'Unknown error');
        // No es error crítico, continuar igual
      }
    } else {
      console.log('📌 [send-email] No se envía email de confirmación (email no válido o no proporcionado)');
    }

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
    console.error('❌ [send-email] ERROR CRÍTICO:', error?.message || 'Unknown error');
    if (error?.stack) {
      console.error('❌ [send-email] Stack:', error.stack.substring(0, 500));
    }

    const errorMessage = error?.message || 'Error desconocido';
    const errorDetails = errorMessage.substring(0, 200);

    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Error al enviar email',
        details: errorDetails,
        timestamp: new Date().toISOString()
      })
    };
  }
};
