/**
 * Script para cargar configuración desde variables de entorno (Netlify)
 * Se ejecuta ANTES de firebase-config.js y emailjs-config.js
 */
window.__CONFIG_LOADED__ = false;

(async () => {
  try {
    // Intentar cargar desde función Netlify
    const response = await fetch('/.netlify/functions/inject-env');
    if (response.ok) {
      const data = await response.json();
      
      // Guardar en ventana global
      window.__ENV_CONFIG__ = data;
      window.__CONFIG_LOADED__ = true;
      
      // Admin
      if (data.admin) {
        window.ADMIN_USER = data.admin.usuario;
        window.ADMIN_PASS = data.admin.contraseña;
      }
      
      // Firebase
      if (data.firebase) {
        window.FIREBASE_CONFIG_ENV = {
          apiKey: data.firebase.apiKey,
          authDomain: data.firebase.authDomain,
          projectId: data.firebase.projectId,
          storageBucket: data.firebase.storageBucket,
          messagingSenderId: data.firebase.messagingSenderId,
          appId: data.firebase.appId
        };
      }
      
      // EmailJS
      if (data.emailjs) {
        window.EMAILJS_CONFIG_ENV = {
          publicKey: data.emailjs.publicKey,
          serviceId: data.emailjs.serviceId,
          templateId: data.emailjs.templateId,
          calculatorTemplateId: data.emailjs.calculatorTemplateId,
          clientTemplateId: data.emailjs.clientTemplateId
        };
      }
      
      console.log('✅ Configuración cargada desde Netlify');
      return;
    }
  } catch (error) {
    console.warn('⚠️ No se pudo cargar configuración desde Netlify (probablemente en LOCAL)');
  }
  
  // Si estamos en LOCAL, intenta cargar desde archivo JSON
  try {
    const response = await fetch('./public/config-credentials.json?v=' + Date.now());
    if (response.ok) {
      const config = await response.json();
      
      if (config.admin) {
        window.ADMIN_USER = config.admin.usuario;
        window.ADMIN_PASS = config.admin.contraseña;
      }
      
      if (config.firebase) {
        window.FIREBASE_CONFIG_ENV = config.firebase;
      }
      
      if (config.emailjs) {
        window.EMAILJS_CONFIG_ENV = config.emailjs;
      }
      
      window.__CONFIG_LOADED__ = true;
      console.log('✅ Configuración cargada desde archivo local');
    }
  } catch (error) {
    console.warn('⚠️ Configuración no disponible - usando defaults');
  }
})();
