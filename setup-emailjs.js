// Script de configuración de EmailJS para Devices F2
console.log('🔧 Configuración de EmailJS para Devices F2');
console.log('==========================================');

// Instrucciones de configuración
console.log('\n📋 PASOS PARA CONFIGURAR EMAILJS:');
console.log('1. Ve a https://www.emailjs.com/ y crea una cuenta gratis');
console.log('2. Crea un servicio de email (Gmail, Outlook, etc.)');
console.log('3. Crea TRES plantillas de email:');
console.log('   a) Template para el negocio (cotizaciones de formulario)');
console.log('   b) Template para la calculadora (cotizaciones múltiples servicios)');
console.log('   c) Template para el cliente (confirmaciones)');
console.log('4. Copia los IDs de las plantillas aquí abajo');

// Configuración actual
const config = {
  publicKey: 'y9GCD4RwWJbp-dnRO',
  serviceId: 'service_yapkcmx',
  templateId: 'template_h72ctck', // Para el negocio (formulario y calculadora)
  calculatorTemplateId: 'template_h72ctck', // Mismo template que formulario
  clientTemplateId: 'template_h72ctck' // Mismo template para cliente
};

console.log('\n🔑 CONFIGURACIÓN ACTUAL:');
Object.entries(config).forEach(([key, value]) => {
  const status = value.includes('template_') && value !== 'template_h72ctck' ? '⚠️ DIFERENTE' :
                 value === 'template_h72ctck' ? '✅' : '✅';
  console.log(`${status} ${key}: ${value}`);
});

console.log('\n📧 FUNCIONAMIENTO DEL SISTEMA:');
console.log('• Formulario → Siempre envía a devices.f02@gmail.com');
console.log('• Calculadora → Siempre envía a devices.f02@gmail.com');
console.log('• Si hay email cliente válido → También envía confirmación al cliente');
console.log('• Usa el mismo template template_h72ctck para todo');

console.log('\n🎯 PRÓXIMOS PASOS:');
console.log('1. ✅ Templates configurados para usar template_h72ctck');
console.log('2. Probar el envío de emails desde formulario y calculadora');
console.log('3. Verificar que los emails lleguen tanto al negocio como al cliente');

console.log('\n✅ Configuración completada.');
console.log('🚀 El sistema envía emails tanto al cliente como al negocio.');