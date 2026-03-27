// EmailJS configuration - Direct browser calls
// Credentials loaded from /.netlify/functions/emailjs-config-public endpoint

function initEmailJS() {
  // EmailJS initialized by HTML script before this loads
  if (typeof emailjs !== 'undefined' && window.EMAILJS_CONFIG) {
    console.log('✅ EmailJS ready (initialized from config endpoint)');
    return true;
  } else if (typeof emailjs !== 'undefined') {
    console.warn('⚠️ EmailJS library loaded but config not yet available');
    return true;
  } else {
    console.warn('⚠️ EmailJS library not loaded');
    return false;
  }
}

async function enviarEmailCotizacion(datosFormulario) {
  if (typeof emailjs === 'undefined') {
    return { success: false, error: 'EmailJS library no cargada' };
  }

  if (!window.EMAILJS_CONFIG) {
    return { success: false, error: 'EmailJS config no disponible - espera a que cargue' };
  }

  try {
    const { serviceId, templateId } = window.EMAILJS_CONFIG;

    // Prepare template parameters
    const folio = 'COT-' + Math.floor(Math.random() * 900000 + 100000);
    const templateParams = {
      to_email: datosFormulario.email || 'devices.f02@gmail.com',
      userName: datosFormulario.nombre,
      userEmail: datosFormulario.email || 'no-reply@devices.f2',
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
      total: datosFormulario.precios?.totalPrice || datosFormulario.total || 0,
      currentDate: new Date().toLocaleDateString('es-ES'),
      folio: folio,
      reply_to: datosFormulario.email || 'devices.f02@gmail.com'
    };

    console.log('📧 Enviando email directo via EmailJS (browser)...');
    console.log('   📌 to_email:', templateParams.to_email);
    console.log('   📌 folio:', folio);

    // Send directly via EmailJS browser API
    const response = await emailjs.send(serviceId, templateId, templateParams);

    console.log('✅ Email enviado exitosamente via EmailJS');
    console.log('📮 Folio:', folio);
    console.log('📧 Respuesta:', response);

    return {
      success: true,
      response: {
        success: true,
        folio: folio,
        method: 'emailjs-browser'
      }
    };

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    
    // Parse EmailJS error responses
    let errorMessage = error.message || 'Error desconocido';
    if (error.text) {
      errorMessage = error.text;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

console.log('emailjs-config.js: Enviando directamente desde navegador (EmailJS API browser)');

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { enviarEmailCotizacion };
}
