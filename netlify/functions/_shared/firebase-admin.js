const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

let app;

function resolveServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const raw = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    return JSON.parse(raw);
  }

  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(keyPath)) {
    return JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  }

  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no configurado y no existe serviceAccountKey.json');
}

function getFirestore() {
  if (!app) {
    const serviceAccount = resolveServiceAccount();
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  return admin.firestore(app);
}

module.exports = {
  getFirestore
};
