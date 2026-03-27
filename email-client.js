/**
 * Email Client - Envia emails através de servidor Netlify (no expone Public Key)
 * 
 * En lugar de:
 *   emailjs.send(...) ← Expone Public Key en el navegador
 * 
 * Hacer:
 *   sendEmailViaServer(...) ← Llama servidor, credenciales seguras
 */

async function callEmailEndpoint(endpoint, emailData) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (parseErr) {
    payload = { error: `Respuesta no JSON (${response.status})` };
  }

  return {
    ok: response.ok,
    status: response.status,
    payload
  };
}

async function sendEmailViaServer(datosFormulario, pdfBlob = null) {
  // Rate limiting en cliente
  if (!checkRateLimit('email')) {
    console.warn('⚠️ Demasiados emails. Espera antes de intentar de nuevo.');
    return {
      success: false,
      error: 'Por favor espera antes de enviar otro email'
    };
  }

  try {
    // Preparar datos para enviar al servidor
    const emailData = {
      to_email: datosFormulario.email && datosFormulario.email !== 'No proporcionado' ? datosFormulario.email : 'devices.f02@gmail.com',
      userName: datosFormulario.nombre,
      userEmail: datosFormulario.email && datosFormulario.email !== 'No proporcionado' ? datosFormulario.email : 'no-reply@devices.f2',
      userPhone: datosFormulario.telefono || 'No proporcionado',
      servicesList: Array.isArray(datosFormulario.servicio) 
        ? datosFormulario.servicio.join(', ') 
        : datosFormulario.servicio || '',
      message: datosFormulario.mensaje || '',
      urgencyText: datosFormulario.urgency 
        ? getUrgencyText(datosFormulario.urgency) 
        : 'Normal (3-5 días)',
      warrantyText: datosFormulario.warranty 
        ? getWarrantyText(datosFormulario.warranty) 
        : '30 días',
      total: datosFormulario.precios?.totalPrice || datosFormulario.total || 0
    };

    console.log('📧 Enviando email via servidor seguro...');
    console.log('   📌 to_email:', emailData.to_email);
    console.log('   📌 userName:', emailData.userName);
    console.log('   📌 servicesList:', emailData.servicesList);

    // Llamar función serverless principal (EmailJS)
    let endpointUsed = '/.netlify/functions/send-email';
    let sendResult = await callEmailEndpoint(endpointUsed, emailData);

    // Fallback automático si EmailJS falla con error de servidor
    if (!sendResult.ok && sendResult.status >= 500) {
      console.warn(`⚠️ Falla endpoint principal (${sendResult.status}). Reintentando con nodemailer...`);
      endpointUsed = '/.netlify/functions/send-email-nodemailer';
      sendResult = await callEmailEndpoint(endpointUsed, emailData);
    }

    if (!sendResult.ok) {
      const errorMessage = sendResult.payload?.error || `Error ${sendResult.status}`;
      const detailMessage = sendResult.payload?.details ? ` | ${sendResult.payload.details}` : '';
      throw new Error(`${errorMessage}${detailMessage}`);
    }

    const result = sendResult.payload || {};

    if (result.success) {
      console.log('✅ Email enviado exitosamente via servidor');
      console.log('📮 Endpoint usado:', endpointUsed);
      console.log('📎 Folio:', result.folio);
      return {
        success: true,
        response: result
      };
    } else {
      throw new Error(result.error || 'Error desconocido');
    }

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return {
      success: false,
      error: error.message || 'Error al enviar email'
    };
  }
}

/**
 * Wrapper de conveniencia para reemplazar enviarEmailCotizacion cuando no necesitas PDF
 * 
 * Cómo usarlo:
 * const result = await sendEmailSecure({
 *   nombre: 'Juan',
 *   email: 'juan@example.com',
 *   servicio: 'Reparación de laptop',
 *   mensaje: 'Mi laptop no enciende'
 * });
 */
async function sendEmailSecure(datosFormulario) {
  return sendEmailViaServer(datosFormulario, null);
}

/**
 * Utilidad: Obtener texto legible de urgencia
 * (Replicar de emailjs-config.js)
 */
function getUrgencyText(urgencyValue) {
  const urgencyTexts = {
    normal: 'Normal (3-5 días)',
    urgente: 'Urgente (24-48 horas)',
    express: 'Express (mismo día)'
  };
  return urgencyTexts[urgencyValue] || 'Normal (3-5 días)';
}

/**
 * Utilidad: Obtener texto legible de garantía
 * (Replicar de emailjs-config.js)
 */
function getWarrantyText(warrantyValue) {
  const warrantyTexts = {
    '30': '30 días',
    '90': '90 días',
    '180': '6 meses',
    '365': '1 año'
  };
  return warrantyTexts[warrantyValue] || '30 días';
}

console.log('✅ email-client.js cargado - Emails enviados via servidor seguro');
