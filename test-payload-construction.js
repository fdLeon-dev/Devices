// Script de prueba para verificar construcción de payloads
console.log('🧪 PRUEBA: Construcción de payloads de email');
console.log('=====================================');

// Simular datos del formulario (no calculadora)
const datosFormulario = {
  nombre: 'Juan Pérez',
  email: 'juan@email.com',
  telefono: '099123456',
  servicio: 'Reparación de pantalla',
  urgency: 'normal',
  warranty: '30',
  mensaje: 'Mi pantalla no enciende',
  fechaPreferida: '2024-01-15',
  urgencyMultiplier: '1x',
  precios: {
    basePrice: 1500,
    urgencyPrice: 0,
    warrantyPrice: 0,
    totalPrice: 1500
  }
};

// Configuración
const EMAILJS_CONFIG = {
  publicKey: 'EMAILJS_PUBLIC_KEY_PLACEHOLDER',
  serviceId: 'EMAILJS_SERVICE_ID_PLACEHOLDER',
  templateId: 'EMAILJS_TEMPLATE_ID_PLACEHOLDER',
  clientTemplateId: 'EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER'
};

// Funciones helper
function getUrgencyText(urgencyValue) {
  const urgencyTexts = {
    normal: 'Normal (3-5 días)',
    urgente: 'Urgente (24-48 horas)',
    express: 'Express (mismo día)'
  };
  return urgencyTexts[urgencyValue] || 'Normal (3-5 días)';
}

function getWarrantyText(warrantyValue) {
  const warrantyTexts = {
    '30': '30 días',
    '90': '90 días',
    '180': '6 meses',
    '365': '1 año'
  };
  return warrantyTexts[warrantyValue] || '30 días';
}

const isClientEmail = (() => {
  if (!datosFormulario.email) return false;
  if (datosFormulario.email.trim() === '') return false;
  if (datosFormulario.email === 'No proporcionado') return false;
  if (datosFormulario.email === 'no-reply@devices.f2') return false;
  if (!datosFormulario.email.includes('@')) return false;
  if (datosFormulario.email === 'devices.f02@gmail.com') return false;
  return true;
})();

// Template params base
const templateParams = {
  userName: datosFormulario.nombre,
  userEmail: datosFormulario.email,
  userPhone: datosFormulario.telefono,
  selectedServices: datosFormulario.selectedServices || (datosFormulario.servicio ? datosFormulario.servicio.split(',').length : 1),
  servicesList: datosFormulario.servicio,
  service_type: datosFormulario.servicio, // alias para verificar
  urgencyText: datosFormulario.urgency ? getUrgencyText(datosFormulario.urgency) : 'Normal (3-5 días)',
  urgencyMultiplier: datosFormulario.urgencyMultiplier || '1x',
  warrantyText: datosFormulario.warranty ? getWarrantyText(datosFormulario.warranty) : '30 días',
  warrantyPrice: datosFormulario.precios ? datosFormulario.precios.warrantyPrice : 0,
  servicePrice: datosFormulario.precios ? datosFormulario.precios.basePrice : 0,
  urgencyCost: datosFormulario.precios ? datosFormulario.precios.urgencyPrice : 0,
  total: datosFormulario.precios ? datosFormulario.precios.totalPrice : 0,
  problemDescription: datosFormulario.mensaje,
  currentDate: new Date().toLocaleDateString('es-ES'),
  preferred_date: datosFormulario.fechaPreferida,
  reply_to: isClientEmail ? 'devices.f02@gmail.com' : datosFormulario.email
};

// Seleccionar templates
const templateId = EMAILJS_CONFIG.templateId;
const clientTemplateId = EMAILJS_CONFIG.clientTemplateId;

// Construir payload para el negocio
const businessPayload = {
  service_id: EMAILJS_CONFIG.serviceId,
  template_id: templateId,
  user_id: EMAILJS_CONFIG.publicKey,
  template_params: {
    ...templateParams,
    // para negocio no ponemos to_email, asumimos correo fijo en el template
    reply_to: datosFormulario.email || 'devices.f02@gmail.com'
  }
};

// Si hay email de cliente válido, construimos un payload adicional
let clientPayload = null;
if (isClientEmail) {
  clientPayload = {
    service_id: EMAILJS_CONFIG.serviceId,
    template_id: templateId,
    user_id: EMAILJS_CONFIG.publicKey,
    template_params: {
      ...templateParams,
      to_email: datosFormulario.email,
      reply_to: 'devices.f02@gmail.com'
    }
  };
}

console.log('🔍 Información de detección para datosFormulario:');
console.log('• isClientEmail:', isClientEmail);
console.log('• templateId:', templateId);
console.log('• clientTemplateId:', clientTemplateId);

console.log('\n📧 BUSINESS PAYLOAD:');
console.log(JSON.stringify(businessPayload, null, 2));
if (clientPayload) {
  console.log('\n📧 CLIENT PAYLOAD ADICIONAL:');
  console.log(JSON.stringify(clientPayload, null, 2));
}

console.log('\n✅ Comportamiento:');
console.log('• Se envía EMAIL al negocio siempre con template:', templateId);
console.log('• Si hay email cliente válido, se envía otro email al cliente usando el mismo template.');
console.log('• Si no hay email cliente válido, sólo se envía al negocio.');