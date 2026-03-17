#!/usr/bin/env node

/**
 * Script de Configuración de Cotizaciones en Firestore
 * 
 * Este script verifica y configura la colección de cotizaciones en Firestore
 * Ejecutar: node setup-cotizaciones.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n📊 ===== SETUP DE COTIZACIONES EN FIRESTORE ===== \n');

// ============ VERIFICACIÓN DE ARCHIVOS ============
console.log('✓ Verificando archivos necesarios...\n');

const filesToCheck = [
  'firebase-config.js',
  'firestore.rules',
  'script.js',
  'admin-cotizaciones.html',
  'emailjs-config.js'
];

let allFilesOk = true;
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - NO ENCONTRADO`);
    allFilesOk = false;
  }
});

if (!allFilesOk) {
  console.log('\n⚠️  Algunos archivos no se encontraron. Verifica que todos existan.');
  process.exit(1);
}

// ============ VERIFICACIÓN DE FUNCIÓN EN FIREBASE-CONFIG ============
console.log('\n✓ Verificando funciones en firebase-config.js...\n');

const firebaseConfig = fs.readFileSync(path.join(__dirname, 'firebase-config.js'), 'utf8');

const requiredFunctions = [
  'guardarCotizacionEnFirebase',
  'obtenerCotizacionesAdmin',
  'actualizarEstadoCotizacion'
];

requiredFunctions.forEach(func => {
  if (firebaseConfig.includes(`function ${func}`) || firebaseConfig.includes(`${func}(`)) {
    console.log(`  ✅ ${func}()`);
  } else {
    console.log(`  ❌ ${func}() - NO ENCONTRADA`);
  }
});

// ============ VERIFICACIÓN DE REGLAS DE SEGURIDAD ============
console.log('\n✓ Verificando reglas de Firestore...\n');

const rules = fs.readFileSync(path.join(__dirname, 'firestore.rules'), 'utf8');

const requiredRules = [
  'match /cotizaciones',
  'allow create:',
  'allow read:',
  'allow update:',
  'allow delete:'
];

requiredRules.forEach(rule => {
  if (rules.includes(rule)) {
    console.log(`  ✅ "${rule}" encontrado`);
  } else {
    console.log(`  ⚠️  "${rule}" no encontrado`);
  }
});

// ============ ESTRUCTURA DE DATOS ============
console.log('\n📋 ===== ESTRUCTURA DE COTIZACIÓN ESPERADA ===== \n');

const cotizacionEjemplo = {
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  telefono: '099 123 456',
  servicios: ['reparacion-basica', 'upgrade-ram'],
  urgency: 'normal',
  warranty: '30',
  descripcion: 'Mi PC no enciende correctamente',
  fechaPreferida: '2026-03-20',
  urgencyMultiplier: '1x',
  basePrice: 50,
  urgencyPrice: 0,
  warrantyPrice: 10,
  totalPrice: 60,
  fechaCreacion: 'timestamp_automatico',
  status: 'pendiente',
  notas: '',
  userAgent: 'navegador_del_cliente'
};

console.log(JSON.stringify(cotizacionEjemplo, null, 2));

// ============ INSTRUCCIONES DE CONFIGURACIÓN ============
console.log('\n📝 ===== INSTRUCCIONES DE CONFIGURACIÓN ===== \n');

console.log(`
1️⃣  FIREBASE CONSOLE - Actualizar Reglas de Seguridad:
   
   a) Ve a: https://console.firebase.google.com/
   b) Selecciona tu proyecto "devices-41420"
   c) Ve a Firestore → Reglas
   d) Reemplaza el contenido con las reglas de: firestore.rules
   e) Haz clic en "Publicar"
   f) Espera a que se publiquen (toma 1-2 minutos)

2️⃣  CREDENCIALES DEL ADMIN PANEL:

   Archivo: admin-cotizaciones.html
   Línea: ~360 (busca ADMIN_CREDENTIALS)
   
   Cambia:
   const ADMIN_CREDENTIALS = {
     usuario: "admin",
     contraseña: "devices123"
   };

3️⃣  PRUEBA DE FUNCIONAMIENTO:

   a) Abre: http://localhost:8000/
   b) Completa el formulario de cotización
   c) Envía la cotización
   d) Abre: http://localhost:8000/admin-cotizaciones.html
   e) Inicia sesión con tus credenciales
   f) Verifica que la cotización aparezca en la tabla

4️⃣  VERIFICAR DATOS EN FIREBASE:

   a) Ve a: https://console.firebase.google.com/
   b) Selecciona "devices-41420"
   c) Ve a Firestore Database
   d) Busca la colección "cotizaciones"
   e) Deberías ver los documentos creados

`);

// ============ DATOS DE CONTACTO PARA TESTING ============
console.log('\n🧪 ===== DATOS DE PRUEBA PARA TESTING ===== \n');

console.log(`
Para probar el sistema:

FORMULARIO DE COTIZACIÓN:
- Nombre: Juan Pérez
- Email: test@example.com
- Teléfono: 099 123 456
- Servicios: Reparación Básica, Upgrade de RAM
- Urgencia: Normal
- Garantía: 30 días
- Descripción: Mi PC no enciende
- Fecha preferida: Elige una fecha futura

CREDENTIALS DEL ADMIN:
- Usuario: admin
- Contraseña: devices123

`);

// ============ RESUMEN ============
console.log('\n✅ ===== SETUP COMPLETADO ===== \n');

console.log(`
PRÓXIMOS PASOS:

1. Publica las reglas de seguridad en Firebase Console
2. Cambia las credenciales del admin (si lo deseas)
3. Prueba el formulario de cotización
4. Accede al panel admin para ver las cotizaciones
5. Verifica los datos en Firebase Console

¿Necesitas ayuda? Verifica que:
- Firebase SDK esté cargado en index.html
- Las credenciales de Firebase sean correctas
- Las reglas de seguridad estén publicadas
- El navegador permita almacenamiento local (sessionStorage)

`);

console.log('ℹ️  Para más detalles, consulta:\n');
console.log('   📄 firestore.rules - Reglas de seguridad');
console.log('   📄 firebase-config.js - Configuración de Firebase');
console.log('   📄 admin-cotizaciones.html - Panel administrativo');
console.log('\n');
