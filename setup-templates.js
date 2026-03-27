// Script para configurar templates en EmailJS
console.log('🔧 Configuración de Templates en EmailJS');
console.log('==========================================');

console.log('\n📧 TEMPLATE PRINCIPAL:');
console.log('1. Ve a https://dashboard.emailjs.com/admin/templates');
console.log('2. Crea un nuevo template llamado "Quote Template"');
console.log('3. Copia el contenido del archivo quote-template.html al editor HTML');
console.log('4. Configura el Subject: "Nueva Cotización - {{userName}}"');
console.log('5. Configura el To Email: devices.f02@gmail.com (o {{to_email}} si es para cliente)');
console.log('6. Configura el From Email: devices.f02@gmail.com');
console.log('7. Configura el Reply To: {{reply_to}}');
console.log('8. Guarda el template y copia el Template ID');
console.log('9. Actualiza templateId en tu configuración con el ID copiado');

console.log('\n' + '='.repeat(50));
console.log('📝 TEMPLATE CLIENTE (OPCIONAL):');
console.log('1. Crea otro template llamado "Quote Template"');
console.log('2. Copia el contenido del archivo quote-template.html al editor HTML');
console.log('3. Configura Subject: "Confirmación de Cotización - {{userName}}"');
console.log('4. Configura To Email: {{to_email}}');
console.log('5. Configura el From Email: devices.f02@gmail.com');
console.log('6. Configura el Reply To: {{reply_to}}');
console.log('7. Guarda el template y copia el Template ID');
console.log('8. Actualiza clientTemplateId en tu configuración con el ID copiado');

console.log('\n✅ Una vez creados los templates en EmailJS:');
console.log('1. Actualiza los IDs en emailjs-config.js');
console.log('2. Elimina los archivos HTML locales:');
console.log('   rm quote-template.html');
console.log('3. Prueba el envío de emails');

console.log('\n🔑 PLACEHOLDERS COMUNES PARA AMBOS TEMPLATES:');
console.log('- {{userName}}, {{userEmail}}, {{userPhone}}');
console.log('- {{servicesList}}, {{urgencyText}}, {{urgencyMultiplier}}');
console.log('- {{warrantyText}}, {{servicePrice}}, {{urgencyCost}}');
console.log('- {{warrantyPrice}}, {{total}}, {{problemDescription}}');
console.log('- {{currentDate}}, {{preferred_date}}, {{to_email}}, {{reply_to}}');

console.log('\n📊 PLACEHOLDER ADICIONAL OPCIONAL:');
console.log('- {{selectedServices}} (número de servicios seleccionados)');