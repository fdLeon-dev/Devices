/**
 * MEDIDAS DE SEGURIDAD PARA FRONTEND
 * 
 * 1. OFUSCACIÓN Y MINIFICACIÓN
 * 2. PROTECCIÓN DE API KEYS
 * 3. RATE LIMITING
 * 4. CORS Y SANITIZACIÓN
 * 5. TOKENS Y AUTENTICACIÓN
 */

// ============ 1. MINIFICAR Y OFUSCAR EN PRODUCCIÓN ============
// En package.json agregar:
// "scripts": {
//   "build:prod": "terser script.js -o script.min.js -c -m"
// }
// Usar script.min.js en producción

// ============ 2. PROTEGER CREDENCIALES SENSIBLES ============
// ✅ CORRECTO: Cargar desde servidor (no visible en DevTools)
// config-loader.js carga credenciales del endpoint Netlify
// Las credenciales NO están hardcodeadas en el archivo

// ❌ INCORRECTO: Hardcodear credenciales
// const ADMIN_USER = "usuario";  // NO HACER ESTO

// ============ 3. RATE LIMITING EN CLIENTE ============
// Ya existe en script.js, pero agregar en servidor también:

// ============ 4. CONTENT SECURITY POLICY (CSP) ============
// Agregable en netlify.toml o headers:
/*
[[headers]]
  for = "/*"
  [headers.values]
    # Permitir solo scripts de fuentes confiables
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.emailjs.com https://www.gstatic.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.firebaseapp.com https://api.emailjs.com"
    # Evitar clickjacking
    X-Frame-Options = "DENY"
    # Prevenir MIME type sniffing
    X-Content-Type-Options = "nosniff"
    # XSS Protection
    X-XSS-Protection = "1; mode=block"
*/

// ============ 5. PROTECCIÓN DE FIREBASE ============
// En Firebase Console:
// - Restringir API key por dominio
// - Usar Web Key, no Android/iOS key
// - Implementar Security Rules estrictas

// ============ 6. PROTECCIÓN DE EMAILJS ============
// EmailJS public key es pública por diseño, pero:
// - Usar rate limiting
// - Validar emails en servidor
// - Monitorear abuso

// ============ 7. VARIABLES DE ENTORNO ============
// En Netlify o hosting:
// - Las credenciales sensitivas en Build & deploy → Environment
// - Cargarse mediante función serverless
// - No exponerse al navegador

// ============ 8. SANITIZACIÓN Y VALIDACIÓN ============
// Todos los inputs deben ser validados, no confiar en el cliente

function sanitizeInput(input, type = 'text') {
  if (typeof input !== 'string') return '';
  let sanitized = input.trim();

  switch (type) {
    case 'email':
      sanitized = sanitized.replace(/[^a-zA-Z0-9@._-]/g, '');
      break;
    case 'phone':
      sanitized = sanitized.replace(/[^0-9+\-\s()]/g, '');
      break;
    default:
      // Remover caracteres potencialmente peligrosos
      sanitized = sanitized.replace(/[<>\"']/g, '');
  }
  
  return sanitized;
}

// ============ 9. PROTECCIÓN CONTRA XSS ============
// Script injection protection
function preventXSS(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// ============ 10. AUTENTICACIÓN Y TOKENS ============
// Para credenciales de admin:
// - Usar JWT tokens con expiración
// - Almacenar en sessionStorage (no localStorage)
// - Validar SIEMPRE en el servidor
// - Implementar CSRF protection

function createCSRFToken() {
  // En el servidor, vincular a la sesión del usuario
  return 'csrf_' + Math.random().toString(36).substr(2, 9);
}

// Guardar en sessionStorage (se elimina al cerrar pestaña)
function saveAuthToken(token) {
  sessionStorage.setItem('auth_token', token);
  // Expiración de 1 hora
  sessionStorage.setItem('auth_expires', Date.now() + 3600000);
}

function getAuthToken() {
  const token = sessionStorage.getItem('auth_token');
  const expires = parseInt(sessionStorage.getItem('auth_expires'));
  
  if (!token || Date.now() > expires) {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_expires');
    return null;
  }
  
  return token;
}

// ============ 11. MONITOREO Y ALERTAS ============
// Detectar intentos de abuso
function detectAnomalousActivity() {
  const failedLogins = sessionStorage.getItem('failed_logins') || 0;
  
  if (parseInt(failedLogins) > 5) {
    console.warn('⚠️ Múltiples intentos fallidos detectados');
    // Bloquear temporalmente, notificar al servidor
    return true;
  }
  
  return false;
}

// ============ 12. SUBRESOURCE INTEGRITY (SRI) ============
// En index.html, en los scripts externos:
/*
<script 
  src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  integrity="sha512-qZvrmS2ekKPF2mSznTQsxqPgnpkI4DNTlrdUmTzrDgektczlKNRRhy5X5AAOnx5S09ydFYWWNSfcEqDTTHgtNA=="
  crossorigin="anonymous">
</script>

El integrity hash asegura que el script no fue modificado
*/

// ============ 13. HTTPS OBLIGATORIO ============
// En netlify.toml:
/*
[[redirects]]
  from = "http://*"
  to = "https://:splat"
  status = 301
  force = true
*/

// ============ RESUMEN DE MEDIDAS IMPLEMENTADAS ============
/*
✅ config-loader.js - Credenciales cargadas del servidor, no hardcodeadas
✅ Sanitización - Todos los inputs validados
✅ XSS Protection - sanitizeHTML() en script.js
✅ CSRF Token - Implementado en admin panel
✅ Rate Limiting - email y pdf en script.js
✅ Firebase Security Rules - Implementadas en firestore.rules
✅ EmailJS Rate Limit - Implementado en emailjs-config.js
✅ Variables de entorno - En Netlify, no en código
✅ HTTPS - Forzado en Netlify
✅ SRI - Hashes de integridad en scripts externos

PENDIENTE:
⏳ Minificación de código para producción
⏳ CSP headers (agregar a netlify.toml)
⏳ Monitoreo de intentos de abuso
⏳ JWT tokens para admin (mejoraría seguridad)
*/
