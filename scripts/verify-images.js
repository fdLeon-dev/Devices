#!/usr/bin/env node
// Verify that all module images exist and are accessible

const fs = require('fs');
const path = require('path');
const http = require('http');

const imageDir = path.join(process.cwd(), 'public', 'images', 'modules', 'real');
const jsonPath = path.join(process.cwd(), 'public', 'modules-tgsit-detailed-refined.json');

console.log('Verifying module images...\n');

// Check if JSON exists
if (!fs.existsSync(jsonPath)) {
  console.error('❌ JSON file not found:', jsonPath);
  process.exit(1);
}

// Load JSON
const raw = fs.readFileSync(jsonPath, 'utf8');
const payload = JSON.parse(raw);
const modules = payload.modules || [];

console.log(`Found ${modules.length} modules in JSON`);

// Check each image
let allGood = true;
modules.forEach((mod, index) => {
  if (mod.thumbnail) {
    // Extract filename from path
    const filename = path.basename(mod.thumbnail);
    const fullPath = path.join(imageDir, filename);

    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`✅ ${index + 1}. ${mod.title}: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`❌ ${index + 1}. ${mod.title}: ${filename} - FILE NOT FOUND`);
      allGood = false;
    }
  } else {
    console.log(`⚠️  ${index + 1}. ${mod.title}: No thumbnail specified`);
  }
});

if (allGood) {
  console.log('\n🎉 All images verified successfully!');
} else {
  console.log('\n❌ Some images are missing!');
  process.exit(1);
}