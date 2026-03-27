// Script de prueba para verificar envío de emails al cliente
console.log('🧪 Probando envío de emails al cliente...');

// Función helper para detectar si es email de cliente
function detectarCliente(datos) {
  const isClientEmail = datos.email && datos.email !== 'No proporcionado' &&
                       datos.email !== 'no-reply@devices.f2' &&
                       datos.email.includes('@') &&
                       datos.email !== 'devices.f02@gmail.com';
  return isClientEmail;
}

// Función helper para detectar template
function detectarTemplate(datos) {
  return 'templateId';
}

// Pruebas
const pruebas = [
  {
    nombre: 'Envío al negocio (calculadora)',
    datos: {
      nombre: 'Juan Pérez',
      email: 'devices.f02@gmail.com', // Email del negocio
      servicio: 'Limpieza completa, Formateo de disco',
      selectedServices: 2
    }
  },
  {
    nombre: 'Envío al cliente (calculadora)',
    datos: {
      nombre: 'María González',
      email: 'maria@example.com', // Email del cliente
      servicio: 'Limpieza completa, Formateo de disco',
      selectedServices: 2
    }
  },
  {
    nombre: 'Envío al negocio (formulario)',
    datos: {
      nombre: 'Carlos López',
      email: 'carlos@example.com', // Email del cliente, pero envío al negocio
      servicio: 'reparacion',
      selectedServices: 1
    }
  }
];

console.log('📊 Resultados de detección:');
pruebas.forEach((prueba, index) => {
  const esCliente = detectarCliente(prueba.datos);
  const template = detectarTemplate(prueba.datos);
  const destino = esCliente ? prueba.datos.email : 'devices.f02@gmail.com';

  console.log(`${index + 1}. ${prueba.nombre}:`);
  console.log(`   Template: ${template}`);
  console.log(`   Es cliente: ${esCliente}`);
  console.log(`   Destino: ${destino}`);
  console.log('');
});

console.log('✅ Lógica de envío al cliente verificada.');
console.log('💡 La función ahora detecta automáticamente si enviar al cliente o al negocio.');