// EmailJS configuration - Direct browser REST calls (no external SDK required)

const EMAILJS_CONFIG_ENDPOINT = '/.netlify/functions/emailjs-config-public';
let emailJsConfigPromise = null;

async function loadEmailJsConfig() {
  if (window.EMAILJS_CONFIG) {
    return window.EMAILJS_CONFIG;
  }

  if (!emailJsConfigPromise) {
    emailJsConfigPromise = fetch(EMAILJS_CONFIG_ENDPOINT)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || data.details || `Error ${response.status}`);
        }
        window.EMAILJS_CONFIG = data;
        return data;
      })
      .catch((error) => {
        emailJsConfigPromise = null;
        throw error;
      });
  }

  return emailJsConfigPromise;
}

function initEmailJS() {
  loadEmailJsConfig()
    .then(() => console.log('✅ EmailJS config cargada (REST browser mode)'))
    .catch((err) => console.warn('⚠️ No se pudo precargar EmailJS config:', err.message));
  return true;
}

async function enviarEmailCotizacion(datosFormulario) {

  try {
    const { serviceId, templateId, publicKey } = await loadEmailJsConfig();

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

    console.log('📧 Enviando email directo via EmailJS REST (browser)...');
    console.log('   📌 to_email:', templateParams.to_email);
    console.log('   📌 folio:', folio);

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS error ${response.status}: ${errorText}`);
    }

    console.log('✅ Email enviado exitosamente via EmailJS REST');
    console.log('📮 Folio:', folio);

    return {
      success: true,
      response: {
        success: true,
        folio: folio,
        method: 'emailjs-rest-browser'
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
