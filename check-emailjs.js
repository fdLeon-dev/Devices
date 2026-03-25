// Checklist de verificación para EmailJS
console.log('🔍 CHECKLIST: Verificación de EmailJS');
console.log('=====================================');

// Template ID actual
const templateId = 'EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER';

console.log(`\n📧 Template a verificar: ${templateId}`);
console.log('\n🔧 ACCIONES EN EMAILJS DASHBOARD:');
console.log('1. Ve a https://dashboard.emailjs.com/admin/templates');
console.log(`2. Abre el template: ${templateId}`);
console.log('3. Verifica estos campos:');

console.log('\n📝 CONFIGURACIÓN DEL TEMPLATE:');
console.log('• Subject: "Nueva cotización de {{userName}}"');
console.log('• To Email: devices.f02@gmail.com (o {{to_email}} si es dinámico)');
console.log('• From Email: devices.f02@gmail.com');
console.log('• Reply To: {{reply_to}}');

console.log('\n🏷️ PLACEHOLDERS REQUERIDOS:');
const placeholders = [
  '{{userName}}', '{{userEmail}}', '{{userPhone}}',
  '{{servicesList}}', '{{urgencyText}}', '{{urgencyMultiplier}}',
  '{{warrantyText}}', '{{servicePrice}}', '{{urgencyCost}}',
  '{{warrantyPrice}}', '{{total}}', '{{problemDescription}}',
  '{{currentDate}}', '{{preferred_date}}', '{{to_email}}', '{{reply_to}}',
  '{{selectedServices}}' // Solo para calculadora
];

placeholders.forEach(placeholder => {
  console.log(`• ${placeholder}`);
});

console.log('\n✅ VERIFICACIÓN:');
console.log('• ¿El template existe en EmailJS?');
console.log('• ¿Todos los placeholders están presentes?');
console.log('• ¿El Subject está configurado?');
console.log('• ¿Los emails To/From están correctos?');

console.log('\n🧪 PRUEBA:');
console.log('• Envía una cotización desde el formulario');
console.log('• Envía una cotización desde la calculadora');
console.log('• Verifica que lleguen emails a devices.f02@gmail.com');
console.log('• Si hay email cliente, verifica que también llegue al cliente');

console.log('\n🚨 SI HAY ERRORES:');
console.log('• "Template not found" → El template no existe');
console.log('• "Missing parameters" → Faltan placeholders en el template');
console.log('• "Invalid email" → Email mal configurado en el template');