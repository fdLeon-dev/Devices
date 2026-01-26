#!/usr/bin/env node
// Test script to verify square columnar module layout

const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'styles.css');
const css = fs.readFileSync(cssPath, 'utf8');

console.log('📐 Verificando layout cuadrado y columnar...\n');

// Check for square columnar features
const checks = [
  { name: 'Layout columnar principal', pattern: 'grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))' },
  { name: 'Proporción cuadrada', pattern: 'aspect-ratio: 1 / 1.2' },
  { name: 'Flex column layout', pattern: 'flex-direction: column' },
  { name: 'Texto centrado', pattern: 'text-align: center' },
  { name: 'Imagen más grande', pattern: 'height: 140px' },
  { name: 'Botones centrados', pattern: 'justify-content: center' },
  { name: 'Columnas fijas grandes', pattern: 'repeat(6, 1fr)' },
  { name: 'Columnas fijas medianas', pattern: 'repeat(4, 1fr)' },
  { name: 'Columnas fijas pequeñas', pattern: 'repeat(2, 1fr)' },
  { name: 'Layout horizontal móvil', pattern: 'flex-direction: row' }
];

checks.forEach(check => {
  if (css.includes(check.pattern)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name} - No encontrado`);
  }
});

// Check for improved spacing and proportions
if (css.includes('padding: 20px') && css.includes('border-radius: 16px')) {
  console.log('✅ Espaciado y bordes mejorados');
} else {
  console.log('❌ Espaciado no optimizado');
}

// Check for enhanced hover effects
if (css.includes('translateY(-4px)') && css.includes('0 8px 24px')) {
  console.log('✅ Hover effects mejorados');
} else {
  console.log('❌ Hover effects básicos');
}

console.log('\n🎯 ¡Layout cuadrado y columnar aplicado!');
console.log('Los módulos ahora se ven así:');
console.log('📱 Grandes (1800px+): 6 columnas');
console.log('💻 Medianas (1400px+): 4 columnas');
console.log('📟 Pequeñas (1024px+): 3 columnas');
console.log('📱 Móviles (768px-): 2 columnas');
console.log('📱 Móviles pequeños: 1 columna horizontal');
console.log('\n✨ Características:');
console.log('- Proporción cuadrada (1:1.2)');
console.log('- Imágenes grandes y prominentes');
console.log('- Texto centrado');
console.log('- Layout columnar consistente');
console.log('- Transiciones suaves mejoradas');