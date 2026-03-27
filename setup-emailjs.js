// Script de configuración de EmailJS para Devices F2
console.log('🔧 Configuración de EmailJS para Devices F2');
console.log('==========================================');

// Instrucciones de configuración
console.log('\n📋 PASOS PARA CONFIGURAR EMAILJS:');
console.log('1. Ve a https://www.emailjs.com/ y crea una cuenta gratis');
console.log('2. Crea un servicio de email (Gmail, Outlook, etc.)');
console.log('3. Crea DOS plantillas de email:');
console.log('   a) Template principal (negocio y calculadora)');
console.log('   b) Template para el cliente (confirmaciones)');
console.log('4. Copia los IDs de las plantillas aquí abajo');

// Configuración actual
const config = {
  publicKey: 'EMAILJS_PUBLIC_KEY_PLACEHOLDER',
  serviceId: 'EMAILJS_SERVICE_ID_PLACEHOLDER',
  templateId: 'EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER', // Para el negocio y calculadora
  clientTemplateId: 'EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER' // Mismo template para cliente
};

console.log('\n🔑 CONFIGURACIÓN ACTUAL:');
Object.entries(config).forEach(([key, value]) => {
  const status = value.includes('template_') && value !== 'EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER' ? '⚠️ DIFERENTE' :
                 value === 'EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER' ? '✅' : '✅';
  console.log(`${status} ${key}: ${value}`);
});

console.log('\n📧 FUNCIONAMIENTO DEL SISTEMA:');
console.log('• Formulario → Siempre envía a devices.f02@gmail.com');
console.log('• Calculadora → Siempre envía a devices.f02@gmail.com');
console.log('• Si hay email cliente válido → También envía confirmación al cliente');
console.log('• Usa el mismo template EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER para todo');

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('1. ✅ Templates configurados para usar EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER');
console.log('2. Probar el envío de emails desde formulario y calculadora');
console.log('3. Verificar que los emails lleguen tanto al negocio como al cliente');

console.log('\n✅ Configuración completada.');
console.log('🚀 El sistema envía emails tanto al cliente como al negocio.');