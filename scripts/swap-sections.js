/*
 * swaps 'Nuestros Servicios' and 'Nuestros Trabajos' sections in index.html
 * Usage: node scripts/swap-sections.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// Use simple regex to find and extract sections by their id
// Find servicios section (id="servicios" with class "services")
const serviciosMatch = html.match(/(<section id="servicios"[^>]*>[\s\S]*?<\/section>)/);
// Find trabajos section (id="trabajos" with class "works")
const trabajosMatch = html.match(/(<section id="trabajos"[^>]*>[\s\S]*?<\/section>)/);

if (!serviciosMatch) {
  console.error("No se encontró la sección 'Nuestros Servicios'");
  process.exit(1);
}
if (!trabajosMatch) {
  console.error("No se encontró la sección 'Nuestros Trabajos'");
  process.exit(1);
}

const serviciosSection = serviciosMatch[1];
const trabajosSection = trabajosMatch[1];

// Perform the swap by replacing servicios with trabajos and vice versa
let swapped = html.replace(serviciosSection, '___TEMP_SERVICIOS___');
swapped = swapped.replace(trabajosSection, serviciosSection);
swapped = swapped.replace('___TEMP_SERVICIOS___', trabajosSection);

fs.writeFileSync(filePath, swapped, 'utf8');
console.log('✓ Sections swapped: "Nuestros Servicios" <-> "Nuestros Trabajos"');
