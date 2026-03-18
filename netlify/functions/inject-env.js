// Netlify Function para obtener credenciales desde variables de entorno
exports.handler = async (event, context) => {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  
  // Firebase
  const firebaseApiKey = process.env.FIREBASE_API_KEY;
  const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN;
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
  const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  const firebaseMessagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
  const firebaseAppId = process.env.FIREBASE_APP_ID;
  
  // EmailJS
  const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
  const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;
  const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
  const emailjsCalculatorTemplateId = process.env.EMAILJS_CALCULATOR_TEMPLATE_ID;
  const emailjsClientTemplateId = process.env.EMAILJS_CLIENT_TEMPLATE_ID;
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
    body: JSON.stringify({
      admin: {
        usuario: adminUser || '',
        contraseña: adminPass || ''
      },
      firebase: {
        apiKey: firebaseApiKey || '',
        authDomain: firebaseAuthDomain || '',
        projectId: firebaseProjectId || '',
        storageBucket: firebaseStorageBucket || '',
        messagingSenderId: firebaseMessagingSenderId || '',
        appId: firebaseAppId || ''
      },
      emailjs: {
        publicKey: emailjsPublicKey || '',
        serviceId: emailjsServiceId || '',
        templateId: emailjsTemplateId || '',
        calculatorTemplateId: emailjsCalculatorTemplateId || '',
        clientTemplateId: emailjsClientTemplateId || ''
      }
    })
  };
};
