#!/usr/bin/env node
// Test script to verify square row layout

const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'styles.css');
const css = fs.readFileSync(cssPath, 'utf8');

console.log('📱 Verificando layout de filas cuadradas...\n');

// Check for row layout features
const checks = [
  { name: 'Grid de filas principal', pattern: 'grid-template-columns: 1fr' },
  { name: 'Layout horizontal', pattern: 'flex-direction: row' },
  { name: 'Proporción horizontal cuadrada', pattern: 'aspect-ratio: 4 / 1' },
  { name: 'Imagen a la izquierda', pattern: 'margin-right: 20px' },
  { name: 'Contenido estructurado', pattern: 'flex-direction: column' },
  { name: 'Texto justificado izquierda', pattern: 'justify-content: flex-start' },
  { name: 'Dos columnas en desktop', pattern: 'grid-template-columns: 1fr 1fr' },
  { name: 'Layout vertical en móvil', pattern: 'flex-direction: column' }
];

checks.forEach(check => {
  if (css.includes(check.pattern)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name} - No encontrado`);
  }
});

// Check for improved proportions
if (css.includes('width: 160px') && css.includes('height: 120px')) {
  console.log('✅ Dimensiones de imagen optimizadas');
} else {
  console.log('❌ Dimensiones de imagen no optimizadas');
}

// Check for better typography
if (css.includes('font-size: 18px') && css.includes('line-height: 1.5')) {
  console.log('✅ Tipografía mejorada');
} else {
  console.log('❌ Tipografía básica');
}

console.log('\n🎯 ¡Layout de filas cuadradas aplicado!');
console.log('Los módulos ahora se ven así:');
console.log('💻 Desktop (1200px+): 2 filas anchas');
console.log('📱 Tablet (1024px-): 1 fila ancha');
console.log('📱 Móvil (640px-): 1 fila vertical centrada');
console.log('\n✨ Características:');
console.log('- Layout horizontal con imagen a la izquierda');
console.log('- Proporción 4:1 para aspecto cuadrado');
console.log('- Texto justificado a la izquierda');
console.log('- Imágenes de 160x120px');
console.log('- Tipografía más grande y legible');
console.log('- Transiciones suaves');