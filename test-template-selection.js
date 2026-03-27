// Script de prueba para verificar uso de template único
console.log('🧪 PRUEBA: Uso de template único para formulario y calculadora');
console.log('=====================================');

// Simular datos del formulario quote-form
const datosFormulario = {
  nombre: 'Juan Pérez',
  email: 'juan@email.com',
  telefono: '099123456',
  servicio: 'Reparación de pantalla', // Un solo servicio, sin comas
  urgency: 'normal',
  warranty: '30',
  mensaje: 'Mi pantalla no enciende',
  fechaPreferida: '2024-01-15'
  // No tiene selectedServices definido
};

// Simular datos de la calculadora
const datosCalculadora = {
  nombre: 'María García',
  email: 'maria@email.com',
  telefono: '099654321',
  servicio: 'Reparación de pantalla, Limpieza completa, Actualización de software', // Múltiples servicios con comas
  selectedServices: 3, // Múltiples servicios
  urgency: 'urgente',
  warranty: '90',
  mensaje: 'Necesito varios servicios',
  fechaPreferida: '2024-01-16'
};

// Configuración de EmailJS
const EMAILJS_CONFIG = {
  templateId: 'EMAILJS_TEMPLATE_ID_PLACEHOLDER',    // Template único
  clientTemplateId: 'EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER' // Template para cliente (calculadora)
};

// Función de detección
function detectarTemplates(datos) {
  const isFromCalculator = (datos.servicio && datos.servicio.includes(',')) ||
                           (datos.selectedServices && datos.selectedServices > 1);

  const templateId = EMAILJS_CONFIG.templateId;
  const clientTemplateId = EMAILJS_CONFIG.clientTemplateId;

  return {
    isFromCalculator,
    templateId,
    clientTemplateId,
    origen: isFromCalculator ? 'calculadora' : 'formulario'
  };
}

// Probar con datos del formulario
console.log('\n📋 PRUEBA - Datos del FORMULARIO quote-form:');
console.log('Servicio:', datosFormulario.servicio);
console.log('selectedServices:', datosFormulario.selectedServices || 'no definido');

const resultadoFormulario = detectarTemplates(datosFormulario);
console.log('Resultado:', resultadoFormulario);

// Probar con datos de la calculadora
console.log('\n🧮 PRUEBA - Datos de la CALCULADORA:');
console.log('Servicio:', datosCalculadora.servicio);
console.log('selectedServices:', datosCalculadora.selectedServices);

const resultadoCalculadora = detectarTemplates(datosCalculadora);
console.log('Resultado:', resultadoCalculadora);

// Prueba extra: simulación de calculadora con un solo servicio
const datosCalcUno = {
  nombre: 'Carlos López',
  email: 'carlos@email.com',
  telefono: '099000111',
  servicio: 'Mantenimiento preventivo', // un solo servicio
  selectedServices: 1,
  urgency: 'normal',
  warranty: '30',
  mensaje: 'Solo un servicio',
  fechaPreferida: '2024-01-20'
};
console.log('\n🧪 PRUEBA ADICIONAL - Calculadora con 1 servicio:');
console.log('Servicio:', datosCalcUno.servicio);
const resultadoCalcUno = detectarTemplates(datosCalcUno);
console.log('Resultado:', resultadoCalcUno);

console.log('\n✅ Si ambos orígenes usan EMAILJS_TEMPLATE_ID_PLACEHOLDER, está correcto.');