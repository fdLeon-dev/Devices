// Configuración de EmailJS para Devices F2
// IMPORTANTE: Debes configurar EmailJS para que funcione

// Instrucciones de configuración:
// 1. Ve a https://www.emailjs.com/ y crea una cuenta gratis
// 2. Crea un servicio de email (Gmail, Outlook, etc.)
// 3. Crea una plantilla de email
// 4. Copia tus credenciales aquí

const EMAILJS_CONFIG = {
  publicKey: 'y9GCD4RwWJbp-dnRO',     // Reemplaza con tu Public Key
  serviceId: 'service_yapkcmx',     // Reemplaza con tu Service ID
  templateId: 'template_h72ctck'    // Reemplaza con tu Template ID
};

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
async function enviarEmailCotizacion(datosFormulario) {
  if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey === 'TU_PUBLIC_KEY_AQUI') {
    console.warn('EmailJS no está configurado. Revisa emailjs-config.js');
    return { success: false, error: 'EmailJS no configurado' };
  }

  try {
    const templateParams = {
      to_email: 'devices.f02@gmail.com', // Tu email
      from_name: datosFormulario.nombre,
      from_email: datosFormulario.email,
      from_phone: datosFormulario.telefono,
      service_type: datosFormulario.servicio,
      message: datosFormulario.mensaje,
      reply_to: datosFormulario.email
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log('Email enviado exitosamente:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Error al enviar email:', error);
    return { success: false, error: error.text || error.message };
  }
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

