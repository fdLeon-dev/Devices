// Netlify Function para enviar emails via Nodemailer (alternativa a EmailJS)
// Más confiable y simple que usar la API REST de EmailJS

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // CORS - Solo aceptar desde tu dominio
  const origin = event.headers.origin;
  const allowedOrigins = [
    'https://devicesf2.com',
    'https://www.devicesf2.com',
    'https://devicesf2.netlify.app',
    'http://localhost:8000',
    'http://localhost:3000'
  ];

  if (!allowedOrigins.includes(origin)) {
    console.error('❌ [nodemailer] CORS Error: Origen no permitido:', origin);
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'CORS Error: Origen no permitido' })
    };
  }

  try {
    console.log('📨 [nodemailer] Función iniciada');
    
    // Solo aceptar POST
    if (event.httpMethod !== 'POST') {
      console.error('❌ [nodemailer] Method no es POST:', event.httpMethod);
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }

    // Parsear datos
    let data;
    try {
      data = JSON.parse(event.body);
      console.log('📨 [nodemailer] Datos recibidos correctamente');
    } catch (parseErr) {
      console.error('❌ [nodemailer] Error parseando JSON:', parseErr.message);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'JSON inválido' })
      };
    }

    // Validar campos
    if (!data.userName || !data.servicesList) {
      console.error('❌ [nodemailer] Campos faltantes');
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Campos requeridos faltantes' })
      };
    }

    // Obtener email del cliente (si no válido, usar genérico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const clientEmail = (data.userEmail && emailRegex.test(data.userEmail)) 
      ? data.userEmail 
      : 'cliente@devices.f2';

    console.log('📨 [nodemailer] Email del cliente:', clientEmail);
    console.log('📨 [nodemailer] Teléfono:', data.userPhone || 'No disponible');

    // Configurar transporte de correo (Gmail via App Password)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'devices.f02@gmail.com',
        pass: process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD
      }
    });

    console.log('📨 [nodemailer] Configurando transporte de Gmail');

    // Verificar credenciales
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;

    if (!gmailPass) {
      console.error('❌ [nodemailer] FALTA GMAIL_PASSWORD o GMAIL_APP_PASSWORD');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Credenciales de Gmail no configuradas',
          missingVar: 'GMAIL_PASSWORD o GMAIL_APP_PASSWORD'
        })
      };
    }

    // Construir contenido del email
    const folio = 'COT-' + Math.floor(Math.random() * 900000 + 100000);
    const fecha = new Date().toLocaleDateString('es-ES');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            ✅ Nueva Cotización Recibida
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Folio:</strong> ${folio}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
          </div>

          <h3 style="color: #2c3e50;">Datos del Cliente</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Nombre:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${clientEmail}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Teléfono:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.userPhone || 'No proporcionado'}</td>
            </tr>
          </table>

          <h3 style="color: #2c3e50; margin-top: 20px;">Servicios Solicitados</h3>
          <p style="background-color: #e8f4f8; padding: 10px; border-left: 3px solid #3498db;">
            ${data.servicesList}
          </p>

          ${data.message ? `
            <h3 style="color: #2c3e50; margin-top: 20px;">Descripción del Problema</h3>
            <p>${data.message}</p>
          ` : ''}

          ${data.urgencyText ? `
            <h3 style="color: #2c3e50; margin-top: 20px;">Urgencia:</h3>
            <p>${data.urgencyText}</p>
          ` : ''}

          ${data.warrantyText ? `
            <h3 style="color: #2c3e50; margin-top: 20px;">Garantía:</h3>
            <p>${data.warrantyText}</p>
          ` : ''}

          <div style="background-color: #d5f4e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #27ae60;">
              <strong>💡 Acción requerida:</strong> Contacta al cliente por WhatsApp (+598 ${data.userPhone || '92 803 418'}) para confirmar la cotización.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #7f8c8d; text-align: center;">
            Devices F2 - Servicio Técnico Profesional<br>
            San Carlos, Maldonado, Uruguay<br>
            Email: devices.f02@gmail.com | WhatsApp: +598 92 803 418
          </p>
        </div>
      </div>
    `;

    const textContent = `
Nueva Cotización - Folio: ${folio}
Fecha: ${fecha}

DATOS DEL CLIENTE:
Nombre: ${data.userName}
Email: ${clientEmail}
Teléfono: ${data.userPhone || 'No proporcionado'}

SERVICIOS SOLICITADOS:
${data.servicesList}

${data.message ? `DESCRIPCIÓN:\n${data.message}\n\n` : ''}
${data.urgencyText ? `URGENCIA: ${data.urgencyText}\n` : ''}
${data.warrantyText ? `GARANTÍA: ${data.warrantyText}\n` : ''}

Contacta al cliente para confirmar la cotización.
    `;

    // Enviar email al negocio
    console.log('📧 [nodemailer] Enviando email al negocio...');
    const mailOptions = {
      from: gmailUser || 'devices.f02@gmail.com',
      to: 'devices.f02@gmail.com',
      replyTo: clientEmail,
      subject: `[COTIZACIÓN] ${folio} - ${data.userName}`,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [nodemailer] Email enviado al negocio - MessageID:', info.messageId);

    // Enviar confirmación al cliente si tiene email válido
    if (clientEmail !== 'cliente@devices.f2') {
      try {
        console.log('📧 [nodemailer] Enviando confirmación al cliente...');
        const clientMailOptions = {
          from: gmailUser || 'devices.f02@gmail.com',
          to: clientEmail,
          subject: `Cotización Recibida - Folio ${folio}`,
          text: `Hola ${data.userName},\n\nRecibimos tu solicitud de cotización.\nNuestro equipo se pondrá en contacto contigo pronto.\n\nFolio: ${folio}\nFecha: ${fecha}\n\nGracias por confiar en Devices F2.`,
          html: `<p>Hola <strong>${data.userName}</strong>,</p><p>Recibimos tu solicitud de cotización.</p><p>Nuestro equipo se pondrá en contacto contigo pronto.</p><p><strong>Folio:</strong> ${folio}<br><strong>Fecha:</strong> ${fecha}</p><p>Gracias por confiar en Devices F2.</p>`
        };
        
        const clientInfo = await transporter.sendMail(clientMailOptions);
        console.log('✅ [nodemailer] Email de confirmación enviado al cliente - MessageID:', clientInfo.messageId);
      } catch (clientErr) {
        console.warn('⚠️ [nodemailer] No se pudo enviar confirmación al cliente:', clientErr.message);
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
        folio: folio,
        method: 'nodemailer'
      })
    };

  } catch (error) {
    console.error('❌ [nodemailer] ERROR CRÍTICO:', error.message);
    console.error('❌ [nodemailer] Stack:', error.stack);

    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Error al enviar email',
        details: error.message.substring(0, 200),
        timestamp: new Date().toISOString()
      })
    };
  }
};
