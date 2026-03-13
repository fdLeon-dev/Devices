// Test script to call enviarEmailCotizacion with sample data
// This will perform real HTTP requests to EmailJS using the configured keys.

const { enviarEmailCotizacion } = require('./emailjs-config.js');

(async () => {
  const sampleData = {
    nombre: 'Prueba Usuario',
    email: 'cliente.prueba@example.com',
    telefono: '099123123',
    servicio: 'Reparación de prueba',
    urgency: 'normal',
    warranty: '30',
    mensaje: 'Mensaje de prueba desde test-send.js',
    fechaPreferida: '2026-03-10',
    // precios fields are optional; they will be computed in script.js normally
    precios: { basePrice: 1000, urgencyPrice: 0, warrantyPrice: 0, totalPrice: 1000 },
    urgencyMultiplier: '1x'
  };

  console.log('Iniciando prueba de envío con datos:', sampleData);
  try {
    const result = await enviarEmailCotizacion(sampleData, null);
    console.log('Resultado de emailResult:', result);
  } catch (err) {
    console.error('Error ejecutando enviarEmailCotizacion:', err);
  }
})();