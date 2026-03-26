const { isAllowedOrigin, resolveOrigin } = require('./_shared/security');

function getPublicFirebaseConfig() {
  return {
    apiKey: process.env.FIREBASE_WEB_API_KEY || process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_WEB_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_WEB_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_WEB_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_WEB_APP_ID || process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_WEB_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || ''
  };
}

exports.handler = async (event) => {
  const origin = resolveOrigin(event);

  if (!isAllowedOrigin(origin)) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8'
      },
      body: 'window.FIREBASE_CONFIG_ENV = null; console.error("Origen no permitido");'
    };
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8'
      },
      body: 'window.FIREBASE_CONFIG_ENV = null; console.error("Metodo no permitido");'
    };
  }

  const config = getPublicFirebaseConfig();
  const js = `window.FIREBASE_CONFIG_ENV = ${JSON.stringify(config)};`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'Access-Control-Allow-Origin': origin || '*'
    },
    body: js
  };
};
