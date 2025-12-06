/*
 * swaps 'Nuestros Servicios' and 'Nuestros Trabajos' sections in index.html
 * Usage: node scripts/swap-sections.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const filePath = path.join(__dirname, '..', 'index.html');

const html = fs.readFileSync(filePath, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

// Helper to find the section that contains an H2 with the given text
function findSectionByH2Text(text) {
  const sections = $('section');
  for (let i = 0; i < sections.length; i++) {
    const sec = sections.eq(i);
    const h2 = sec.find('h2').first();
    if (h2 && h2.text().trim() === text) {
      return sec;
    }
  }
  return null;
}

const servicios = findSectionByH2Text('Nuestros Servicios');
const trabajos = findSectionByH2Text('Nuestros Trabajos');

if (!servicios) {
  console.error("No se encontró la sección 'Nuestros Servicios'");
  process.exit(1);
}
if (!trabajos) {
  console.error("No se encontró la sección 'Nuestros Trabajos'");
  process.exit(1);
}

// Swap nodes in the DOM. We'll replace each with a unique placeholder, then swap.
const marker1 = '<!--__SWAP_MARKER_SERVICIOS__-->';
const marker2 = '<!--__SWAP_MARKER_TRABAJOS__-->';
servicios.before(marker1);
trabajos.before(marker2);
servicios.remove();
trabajos.remove();

// Replace markers: insert trabajos at servicios marker and servicios at trabajos marker
$('body').html($('body').html().replace(marker1, trabajos.toString()).replace(marker2, servicios.toString()));

const out = $.html();
fs.writeFileSync(filePath, out, 'utf8');
console.log('Sections swapped: "Nuestros Servicios" <-> "Nuestros Trabajos"');
