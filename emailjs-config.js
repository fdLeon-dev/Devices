// Wrapper de compatibilidad: elimina credenciales en cliente
// y fuerza el envio por servidor mediante email-client.js.

function initEmailJS() {
  // Ya no se inicializa EmailJS en navegador.
  return true;
}

async function enviarEmailCotizacion(datosFormulario) {
  if (typeof sendEmailViaServer !== 'function') {
    return { success: false, error: 'Cliente de email seguro no disponible' };
  }

  return sendEmailViaServer({
    nombre: datosFormulario.nombre,
    email: datosFormulario.email,
    telefono: datosFormulario.telefono,
    servicio: datosFormulario.servicio,
    mensaje: datosFormulario.mensaje,
    urgency: datosFormulario.urgency,
    warranty: datosFormulario.warranty,
    precios: datosFormulario.precios,
    fechaPreferida: datosFormulario.fechaPreferida
  });
}

console.log('emailjs-config.js: modo seguro activo (envio solo server-side)');

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { enviarEmailCotizacion };
}
