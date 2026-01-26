#!/usr/bin/env node
// Set a Firebase Auth custom claim 'admin' for a user identified by email.
// Usage: node scripts/set-admin-claim.js user@example.com

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/set-admin-claim.js user@example.com');
  process.exit(1);
}

// Path to service account key JSON. You can set the env var GOOGLE_APPLICATION_CREDENTIALS
const argKeyIndex = process.argv.indexOf('--key');
const defaultKeyPath = path.join(process.cwd(), 'serviceAccountKey.json');
const keyPath = (argKeyIndex !== -1 && process.argv[argKeyIndex+1]) ? process.argv[argKeyIndex+1] : (process.env.GOOGLE_APPLICATION_CREDENTIALS || defaultKeyPath);

if (!fs.existsSync(keyPath)) {
  console.error('Service account key not found at:', keyPath);
  console.error('Create a service account key in Firebase Console -> Project Settings -> Service accounts -> Generate new private key.');
  process.exit(1);
}

const serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Success: user ${email} now has admin claim.`);
    process.exit(0);
  } catch (err) {
    console.error('Error setting admin claim:', err && err.message ? err.message : err);
    console.error('If the user does not exist, create the user first in Firebase Console or via Admin SDK.');
    process.exit(1);
  }
}

setAdminClaim(email);
