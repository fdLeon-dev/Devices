#!/usr/bin/env node
// Import modules JSON into Firestore using Firebase Admin SDK
// Usage: node scripts/import-modules-admin.js [--dry-run]

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const dryRun = process.argv.includes('--dry-run');
// allow --key path and --project flags
const keyArgIndex = process.argv.indexOf('--key');
const keyPath = (keyArgIndex !== -1 && process.argv[keyArgIndex+1]) ? process.argv[keyArgIndex+1] : (process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'serviceAccountKey.json'));
const projectArgIndex = process.argv.indexOf('--project');
const targetProject = (projectArgIndex !== -1 && process.argv[projectArgIndex+1]) ? process.argv[projectArgIndex+1] : null;
const yes = process.argv.includes('--yes');

if (!fs.existsSync(keyPath)) {
  console.error('Service account key not found at', keyPath);
  console.error('Place your service account JSON as serviceAccountKey.json in the repo root, or set GOOGLE_APPLICATION_CREDENTIALS env var.');
  process.exit(1);
}

const serviceAccount = require(keyPath);
// Allow overriding the target project with --project flag (useful when key and target project differ)
const appOptions = { credential: admin.credential.cert(serviceAccount) };
if (targetProject) appOptions.projectId = targetProject;
admin.initializeApp(appOptions);
const db = admin.firestore();
console.log('Service account project:', serviceAccount.project_id, '  Target project:', targetProject || serviceAccount.project_id);

async function loadPayload() {
  // Prefer the refined JSON if present, then fall back to older files
  const files = ['public/modules-tgsit-detailed-refined.json','public/modules-tgsit-detailed.json','public/modules-tgsit.json'];
  for (const f of files) {
    const p = path.join(process.cwd(), f);
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
      } catch (e) {
        console.warn('Failed reading', f, e.message);
      }
    }
  }
  throw new Error('No modules JSON found in public/. Make sure public/modules-tgsit-detailed-refined.json or public/modules-tgsit-detailed.json or public/modules-tgsit.json exists.');
}

async function run() {
  try {
    const payload = await loadPayload();
    const courseId = payload.courseId || 'tgsit-reparacion-bios';
    const modules = payload.modules || [];
      console.log('Loaded', modules.length, 'modules for course', courseId);

    const courseRef = db.collection('courses').doc(courseId);
    // fetch existing modules to avoid duplicates
    const existingSnap = await courseRef.collection('modules').get();
    const existingTitles = new Set(existingSnap.docs.map(d => (d.data().title||'').trim().toLowerCase()));

    const toCreate = modules.filter(m => !existingTitles.has((m.title||'').trim().toLowerCase()));
    console.log('To create (new) modules:', toCreate.length);

    if (dryRun) {
      console.log('Dry run mode - no writes will be performed. Listing modules to create:');
      toCreate.forEach((m,i) => console.log(i+1, m.title));
      process.exit(0);
    }

    if (!yes) {
      // Ask for confirmation in interactive mode
      const readline = require('readline');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise(resolve => rl.question(`About to create ${toCreate.length} modules in course '${courseId}'. Continue? (y/N) `, a => { rl.close(); resolve(a); }));
      if (!/^y(es)?$/i.test(answer)) {
        console.log('Aborted by user. Run with --yes to skip confirmation or use --dry-run to preview.');
        process.exit(0);
      }
    }

    // commit in batches of 20
    const batchSize = 20;
    for (let i=0;i<toCreate.length;i+=batchSize) {
      const chunk = toCreate.slice(i,i+batchSize);
      const batch = db.batch();
      chunk.forEach((m, idx) => {
        const ref = courseRef.collection('modules').doc();
        batch.set(ref, {
          title: m.title || ('Módulo ' + (i+idx+1)),
          description: m.description || '',
          objectives: m.objectives || [],
          durationMin: m.durationMin || null,
          resources: m.resources || [],
          videoUrl: m.videoUrl || '',
          order: i + idx + 1,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      console.log(`Committing batch ${i+1}..${Math.min(i+batchSize,toCreate.length)}`);
      await batch.commit();
    }

    console.log('Import complete. Created', toCreate.length, 'new modules.');
    process.exit(0);
  } catch (err) {
    // Print full error for easier debugging (do not expose sensitive content)
    console.error('Import failed:', err && err.message ? err.message : err, err);
    process.exit(1);
  }
}

run();
