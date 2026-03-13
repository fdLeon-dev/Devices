// Script para configurar templates en EmailJS
console.log('🔧 Configuración de Templates en EmailJS');
console.log('==========================================');

console.log('\n📧 TEMPLATE PARA CALCULADORA:');
console.log('1. Ve a https://dashboard.emailjs.com/admin/templates');
console.log('2. Crea un nuevo template llamado "Calculator Template"');
console.log('3. Copia el contenido del archivo calculator-template.html al editor HTML');
console.log('4. Configura el Subject: "Cotización desde Calculadora - {{userName}}"');
console.log('5. Configura el To Email: devices.f02@gmail.com (o {{to_email}} si es para cliente)');
console.log('6. Configura el From Email: devices.f02@gmail.com');
console.log('7. Configura el Reply To: {{reply_to}}');
console.log('8. Guarda el template y copia el Template ID');
console.log('9. Actualiza calculatorTemplateId en emailjs-config.js con el ID copiado');

console.log('\n' + '='.repeat(50));
console.log('📝 TEMPLATE PARA FORMULARIO/COTIZAR:');
console.log('1. Crea otro template llamado "Quote Template"');
console.log('2. Copia el contenido del archivo quote-template.html al editor HTML');
console.log('3. Configura Subject: "Nueva Cotización - {{userName}}"');
console.log('4. Configura To Email: devices.f02@gmail.com');
console.log('5. Configura el From Email: devices.f02@gmail.com');
console.log('6. Configura el Reply To: {{reply_to}}');
console.log('7. Guarda el template y copia el Template ID');
console.log('8. Actualiza templateId en emailjs-config.js con el ID copiado');

console.log('\n✅ Una vez creados los templates en EmailJS:');
console.log('1. Actualiza los IDs en emailjs-config.js');
console.log('2. Elimina los archivos HTML locales:');
console.log('   rm calculator-template.html quote-template.html');
console.log('3. Prueba el envío de emails');

console.log('\n🔑 PLACEHOLDERS COMUNES PARA AMBOS TEMPLATES:');
console.log('- {{userName}}, {{userEmail}}, {{userPhone}}');
console.log('- {{servicesList}}, {{urgencyText}}, {{urgencyMultiplier}}');
console.log('- {{warrantyText}}, {{servicePrice}}, {{urgencyCost}}');
console.log('- {{warrantyPrice}}, {{total}}, {{problemDescription}}');
console.log('- {{currentDate}}, {{preferred_date}}, {{to_email}}, {{reply_to}}');

console.log('\n📊 PLACEHOLDER ESPECÍFICO PARA CALCULADORA:');
console.log('- {{selectedServices}} (número de servicios seleccionados)');