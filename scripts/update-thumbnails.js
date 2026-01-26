#!/usr/bin/env node
// Update module thumbnails in Firestore using Firebase Admin SDK

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error('Service account key not found at', keyPath);
  process.exit(1);
}

const serviceAccount = require(keyPath);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function updateThumbnails() {
  try {
    // Load the JSON file
    const jsonPath = path.join(process.cwd(), 'public/modules-tgsit-detailed-refined.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('JSON file not found:', jsonPath);
      process.exit(1);
    }

    const raw = fs.readFileSync(jsonPath, 'utf8');
    const payload = JSON.parse(raw);
    const courseId = payload.courseId || 'tgsit-reparacion-bios';
    const modules = payload.modules || [];

    console.log('Loaded', modules.length, 'modules for course', courseId);

    const courseRef = db.collection('courses').doc(courseId);
    const existingSnap = await courseRef.collection('modules').get();

    console.log('Found', existingSnap.docs.length, 'existing modules in Firestore');

    // Update each module with new thumbnail
    const batch = db.batch();
    let updateCount = 0;

    existingSnap.docs.forEach(doc => {
      const existingData = doc.data();
      const title = existingData.title;

      // Find matching module in JSON
      const jsonModule = modules.find(m => m.title === title);
      if (jsonModule && jsonModule.thumbnail && jsonModule.thumbnail !== existingData.thumbnail) {
        console.log(`Updating thumbnail for "${title}": ${existingData.thumbnail} -> ${jsonModule.thumbnail}`);
        batch.update(doc.ref, { thumbnail: jsonModule.thumbnail });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Updated ${updateCount} module thumbnails`);
    } else {
      console.log('No thumbnails needed updating');
    }

  } catch (err) {
    console.error('Update failed:', err.message);
    process.exit(1);
  }
}

updateThumbnails();