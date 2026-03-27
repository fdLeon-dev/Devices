# Configuración de Variables de Entorno para Netlify

## 📋 Resumen

Todo está configurado para cargar las credenciales de Firebase, EmailJS y Admin desde variables de entorno de Netlify automáticamente.

## 🔧 Componentes

### 1. Función Serverless Netlify
**Archivo:** `netlify/functions/inject-env.js`

Lee todas las variables de entorno de Netlify y las expone como JSON en:
```
/.netlify/functions/inject-env
```

Retorna:
```json
{
  "admin": { "usuario": "...", "contraseña": "..." },
  "firebase": { "apiKey": "...", "authDomain": "..." },
  "emailjs": { "publicKey": "...", "serviceId": "..." }
}
```

### 2. Script de carga de configuración
**Archivo:** `config-loader.js`

Se ejecuta ANTES de cualquier otro script y:
- Intenta cargar desde `/.netlify/functions/inject-env` (Netlify)
- Si falla, intenta desde `./public/config-credentials.json` (LOCAL)
- Expone las variables en objetos globales: `window.FIREBASE_CONFIG_ENV`, `window.EMAILJS_CONFIG_ENV`, etc.

### 3. Configuraciones actualizadas
- `firebase-config.js`: Usa `window.FIREBASE_CONFIG_ENV` si está disponible
- `emailjs-config.js`: Usa `window.EMAILJS_CONFIG_ENV` si está disponible
- `admin-cotizaciones.html`: Usa variables globales `window.ADMIN_USER`, `window.ADMIN_PASS`

## 📝 Archivos HTML que cargan la configuración

```
✅ index.html
✅ admin-cotizaciones.html
✅ test-firebase-config.html
✅ test-cotizaciones-flow.html
```

Todos cargan `config-loader.js` ANTES de `firebase-config.js` para asegurar que las variables estén disponibles.

## 🚀 Variables de Entorno Requeridas en Netlify

Total: **13 variables**

### Admin (2)
```
ADMIN_USER=ADMIN_USER_PLACEHOLDER
ADMIN_PASS=ADMIN_PASS_PLACEHOLDER
```

### Firebase (6)
```
FIREBASE_API_KEY=FIREBASE_API_KEY_PLACEHOLDER
FIREBASE_AUTH_DOMAIN=devices-41420.firebaseapp.com
FIREBASE_PROJECT_ID=devices-41420
FIREBASE_STORAGE_BUCKET=devices-41420.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=(obtén de Firebase)
FIREBASE_APP_ID=(obtén de Firebase)
```

### EmailJS (4)
```
EMAILJS_PUBLIC_KEY=EMAILJS_PUBLIC_KEY_PLACEHOLDER
EMAILJS_SERVICE_ID=EMAILJS_SERVICE_ID_PLACEHOLDER
EMAILJS_TEMPLATE_ID=EMAILJS_TEMPLATE_ID_PLACEHOLDER
EMAILJS_CLIENT_TEMPLATE_ID=EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER
```

## 🔐 Cómo Configurar en Netlify

1. Ve a **Netlify Dashboard** → Selecciona tu sitio
2. **Site settings** → **Build & deploy** → **Environment**
3. Click en **Add environment variable**
4. Agregar cada variable una a una

## 🧪 Pruebas

### En Producción (Netlify)
1. Deploy normalmente
2. Abre la consola del navegador (F12)
3. Deberías ver: `✅ Configuración cargada desde Netlify`

### Localmente
1. Crea `/public/config-credentials.json`:
   ```bash
   cp public/config-credentials.example.json public/config-credentials.json
   ```
2. Sirve con un servidor HTTP:
   ```bash
   python3 -m http.server 8000
   ```
3. Abre http://localhost:8000
4. Deberías ver: `✅ Configuración cargada desde archivo local`

## 📦 Archivos Relacionados

```
.env.netlify              # Plantilla de variables para referencia
.env.example              # Igual que arriba
config-loader.js          # Script de carga principal
netlify/functions/        # Funciones serverless
firebase-config.js        # Configuración de Firebase
emailjs-config.js         # Configuración de EmailJS
```

## ✅ Checklist Final

- [x] Función serverless creada
- [x] config-loader.js configurado
- [x] firebase-config.js actualizado
- [x] emailjs-config.js actualizado
- [x] index.html actualizado
- [x] admin-cotizaciones.html actualizado
- [x] Archivos de prueba actualizados
- [ ] 13 variables configuradas en Netlify
- [ ] Deploy y pruebas en producción

## 🔗 Documentación Útil

- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Firebase Config](https://firebase.google.com/docs/web/setup)
- [EmailJS Config](https://www.emailjs.com/docs/setup/configuration/)
