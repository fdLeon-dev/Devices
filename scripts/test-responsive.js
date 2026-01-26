#!/usr/bin/env node
// Test script to verify responsive module grid is working

const fs = require('fs');
const path = require('path');

const cssPath = path.join(process.cwd(), 'styles.css');
const css = fs.readFileSync(cssPath, 'utf8');

console.log('🔍 Verificando estilos responsive de módulos...\n');

// Check for grid layout
if (css.includes('display: grid') && css.includes('grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))')) {
  console.log('✅ Grid layout aplicado correctamente');
} else {
  console.log('❌ Grid layout no encontrado');
}

// Check for responsive breakpoints
const breakpoints = [
  { name: '1400px+', pattern: '@media (min-width: 1400px)' },
  { name: '1024px-', pattern: '@media (max-width: 1024px)' },
  { name: '768px-', pattern: '@media (max-width: 768px)' },
  { name: '640px-', pattern: '@media (max-width: 640px)' }
];

breakpoints.forEach(bp => {
  if (css.includes(bp.pattern)) {
    console.log(`✅ Breakpoint ${bp.name} configurado`);
  } else {
    console.log(`❌ Breakpoint ${bp.name} faltante`);
  }
});

// Check for min-width: 0
if (css.includes('min-width: 0')) {
  console.log('✅ min-width: 0 aplicado para permitir shrinking');
} else {
  console.log('❌ min-width: 0 no encontrado');
}

console.log('\n🎉 Verificación completada!');
console.log('Los módulos ahora deberían mostrar más columnas en pantallas grandes y adaptarse mejor a diferentes tamaños.');