// Netlify Function para enviar emails de forma segura
// El cliente NO tiene acceso a las credenciales de EmailJS

const emailjs = require('@emailjs/nodejs');

exports.handler = async (event, context) => {
  // CORS - Solo aceptar desde tu dominio
  const origin = event.headers.origin;
  const allowedOrigins = [
    'https://devices-f2.com',
    'https://www.devices-f2.com',
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

  // Rate limiting por IP
  const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'];
  const rateLimitKey = `email_${clientIP}`;
  // Aquí podrías usar DynamoDB o localStorage del servidor para tracking

  try {
    // Solo aceptar POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }

    const data = JSON.parse(event.body);

    // Validar campos requeridos
    if (!data.to_email || !data.userName || !data.servicesList) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Campos requeridos faltantes' })
      };
    }

    // Validar que el email sea válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.to_email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email inválido' })
      };
    }

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

    if (!emailjsPublicKey || !emailjsServiceId || !emailjsTemplateId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Configuración de EmailJS no disponible' })
      };
    }

    // Inicializar EmailJS con credenciales del servidor
    emailjs.init(emailjsPublicKey);

    // Preparar parámetros del email
    const templateParams = {
      to_email: data.to_email || 'devices.f02@gmail.com',
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

    // Enviar al negocio
    const businessPayload = {
      service_id: emailjsServiceId,
      template_id: emailjsTemplateId,
      user_id: emailjsPublicKey,
      template_params: {
        ...templateParams,
        to_email: 'devices.f02@gmail.com'
      }
    };

    // Enviar email
    const response = await emailjs.send(
      emailjsServiceId,
      emailjsTemplateId,
      templateParams,
      { publicKey: emailjsPublicKey }
    );

    console.log('📧 Email enviado exitosamente:', response.status);

    // Si viene un email de cliente, enviar confirmación
    if (data.userEmail && data.userEmail.includes('@')) {
      try {
        const clientPayload = {
          ...templateParams,
          to_email: data.userEmail,
          message: `Gracias por tu cotización. Los servicios solicitados fueron: ${data.servicesList}`
        };

        await emailjs.send(
          emailjsServiceId,
          emailjsClientTemplateId || emailjsTemplateId,
          clientPayload,
          { publicKey: emailjsPublicKey }
        );

        console.log('📧 Email de confirmación enviado al cliente');
      } catch (clientErr) {
        console.warn('⚠️ No se pudo enviar email de confirmación:', clientErr);
        // No es error crítico, continuar
      }
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
    console.error('❌ Error al enviar email:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Error al procesar solicitud de email',
        details: process.env.NODE_ENV === 'production' ? 'Ver logs' : error.message
      })
    };
  }
};
