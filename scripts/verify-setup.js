#!/usr/bin/env node
// Simple environment verifier for local setup
const fs = require('fs');
const path = require('path');

console.log('Verify environment for Devices project');
console.log('Node version:', process.version);

// Check firebase-tools
const firebaseTools = path.join(process.cwd(),'node_modules','.bin','firebase');
const hasFirebaseTools = fs.existsSync(path.join(process.cwd(),'node_modules','firebase-tools')) || fs.existsSync(firebaseTools);
console.log('firebase-tools installed locally:', hasFirebaseTools);

// Check service account
const keyEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const defaultKey = path.join(process.cwd(),'serviceAccountKey.json');
const keyPath = keyEnv || (fs.existsSync(defaultKey) ? defaultKey : null);
console.log('Service account key path:', keyPath || '(none found)');

// Modules JSON
const refined = path.join(process.cwd(),'public','modules-tgsit-detailed-refined.json');
const detailed = path.join(process.cwd(),'public','modules-tgsit-detailed.json');
const basic = path.join(process.cwd(),'public','modules-tgsit.json');
if (fs.existsSync(refined)) {
  const raw = fs.readFileSync(refined,'utf8');
  try {
    const payload = JSON.parse(raw);
    console.log('Found refined modules file:', refined);
    console.log('CourseId:', payload.courseId || '(not set)');
    console.log('Modules count:', (payload.modules||[]).length);
    console.log('First 5 titles:');
    (payload.modules||[]).slice(0,5).forEach((m,i)=>console.log(i+1, m.title));
  } catch (e) {
    console.error('Failed to parse', refined, e.message);
  }
} else if (fs.existsSync(detailed)) {
  const raw = fs.readFileSync(detailed,'utf8');
  try {
    const payload = JSON.parse(raw);
    console.log('Found detailed modules file:', detailed);
    console.log('CourseId:', payload.courseId || '(not set)');
    console.log('Modules count:', (payload.modules||[]).length);
    console.log('First 5 titles:');
    (payload.modules||[]).slice(0,5).forEach((m,i)=>console.log(i+1, m.title));
  } catch (e) {
    console.error('Failed to parse', detailed, e.message);
  }
} else if (fs.existsSync(basic)) {
  const raw = fs.readFileSync(basic,'utf8');
  try {
    const payload = JSON.parse(raw);
    console.log('Found modules file:', basic);
    console.log('Modules count:', (payload.modules||[]).length);
    (payload.modules||[]).slice(0,5).forEach((m,i)=>console.log(i+1, m.title));
  } catch (e) {
    console.error('Failed to parse', basic, e.message);
  }
} else {
  console.log('No modules JSON found in public/. Place modules-tgsit-detailed-refined.json or modules-tgsit-detailed.json or modules-tgsit.json in public/.');
}

console.log('\nSuggested next steps:');
console.log('- Run `npm install` to install dev dependencies (firebase-tools).');
console.log('- If you want me to deploy rules or import modules, provide a path to serviceAccountKey.json or set GOOGLE_APPLICATION_CREDENTIALS, and ensure you are logged in with `npx firebase login`.');
console.log('- Use `npm run firebase:rules` to deploy rules, or `npm run import-modules:dry` then `npm run import-modules -- --yes` to import.');
