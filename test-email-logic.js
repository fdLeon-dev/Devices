// Script de prueba para verificar lógica de envío de emails
console.log('🧪 PRUEBA: Lógica de envío de emails');
console.log('=====================================');

// Función de detección de email cliente (igual que en emailjs-config.js)
function detectarCliente(email) {
  if (!email) return false;
  if (email.trim() === '') return false;
  if (email === 'No proporcionado') return false;
  if (email === 'no-reply@devices.f2') return false;
  if (!email.includes('@')) return false;
  if (email === 'devices.f02@gmail.com') return false;
  return true;
}

// Casos de prueba
const casosPrueba = [
  {
    descripcion: 'Email cliente válido',
    email: 'cliente@gmail.com',
    esperado: true
  },
  {
    descripcion: 'Email vacío',
    email: '',
    esperado: false
  },
  {
    descripcion: 'Email undefined',
    email: undefined,
    esperado: false
  },
  {
    descripcion: 'Email null',
    email: null,
    esperado: false
  },
  {
    descripcion: 'Email "No proporcionado"',
    email: 'No proporcionado',
    esperado: false
  },
  {
    descripcion: 'Email "no-reply@devices.f2"',
    email: 'no-reply@devices.f2',
    esperado: false
  },
  {
    descripcion: 'Email negocio',
    email: 'devices.f02@gmail.com',
    esperado: false
  },
  {
    descripcion: 'Email sin @',
    email: 'cliente.com',
    esperado: false
  },
  {
    descripcion: 'Email válido diferente',
    email: 'otro@cliente.com',
    esperado: true
  }
];

console.log('\n📊 RESULTADOS DE PRUEBA:');
casosPrueba.forEach((caso, index) => {
  const resultado = detectarCliente(caso.email);
  const estado = resultado === caso.esperado ? '✅' : '❌';
  console.log(`${index + 1}. ${caso.descripcion}:`);
  console.log(`   Email: "${caso.email}"`);
  console.log(`   Resultado: ${resultado} (esperado: ${caso.esperado}) ${estado}`);
  console.log('');
});

console.log('💡 Si algún caso falla, hay un problema en la lógica de detección.');
console.log('🔧 Revisa los console.log en el navegador cuando envíes un formulario.');