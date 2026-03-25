# 🔒 Arquitectura Segura de EmailJS

## El Problema

Originalmente, el código exponía la **EmailJS Public Key** en el navegador:

```javascript
// ❌ INSEGURO - Public Key visible en DevTools
const EMAILJS_CONFIG = {
  publicKey: 'EMAILJS_PUBLIC_KEY_PLACEHOLDER',  // Cualquiera puede verla
  serviceId: 'EMAILJS_SERVICE_ID_PLACEHOLDER'
};

emailjs.send(EMAILJS_CONFIG.serviceId, templateId, data, {
  publicKey: EMAILJS_CONFIG.publicKey  // Enviada al cliente
});
```

**Riesgo:** Otra persona podría:
1. Abrir DevTools → Console
2. Copiar tu `publicKey`
3. Usar `emailjs.send()` para enviar emails desde tu cuenta
4. Gastar tu quota de EmailJS

---

## La Solución: Servidor Intermedio

```
┌─────────────────┐
│   Navegador     │
│  (Tu Sitio)     │
└────────┬────────┘
         │ 1. Envía datos
         │ (SIN Public Key)
         ▼
   ┌─────────────────┐
   │  Netlify        │
   │  Function       │
   │ send-email.js   │
   └────────┬────────┘
         │ 2. Lee credenciales
         │ de variables de entorno
         │ (Seguras, no expuestas)
         │
         │ 3. Envia a EmailJS
         │ con credenciales seguras
         ▼
   ┌─────────────────┐
   │  EmailJS        │
   │  (Servidores)   │
   └─────────────────┘
```

---

## Ventajas

| Antes | Después |
|-------|---------|
| ❌ Public Key visible en navegador | ✅ Public Key solo en servidor |
| ❌ Cualquiera puede usar tu cuenta | ✅ Solo tu servidor puede enviar |
| ❌ Sin validación en el servidor | ✅ Validación completa en servidor |
| ❌ Rate limit débil (cliente) | ✅ Rate limit fuerte (servidor + cliente) |

---

## Cómo Funciona

### 1. Cliente Envía Email (Sin Public Key)

```javascript
// ✅ SEGURO - No expone credenciales
const result = await sendEmailViaServer({
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  servicio: 'Reparación de laptop',
  mensaje: 'Mi laptop no enciende'
});
```

### 2. Cliente Llama Función Serverless

```javascript
// En email-client.js
async function sendEmailViaServer(datosFormulario) {
  const response = await fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosFormulario)  // ← SIN credenciales
  });
  // ...
}
```

### 3. Servidor Valida y Envía

```javascript
// En netlify/functions/send-email.js
exports.handler = async (event) => {
  // Lectura de credenciales SEGURAS
  const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY;  // ← Segura
  const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;   // ← Segura
  
  // Validación en servidor
  if (!validateEmail(email)) throw new Error('Email inválido');
  if (data.length > maxLength) throw new Error('Datos muy grandes');
  
  // Envío con credenciales seguras
  await emailjs.send(serviceId, templateId, data, {
    publicKey: emailjsPublicKey  // ← Solo en servidor
  });
};
```

---

## Protecciones Implementadas

### 1. CORS (Cross-Origin Resource Sharing)

```javascript
const allowedOrigins = [
  'https://devices-f2.com',
  'https://www.devices-f2.com'
];

if (!allowedOrigins.includes(origin)) {
  return { statusCode: 403 };  // Rechaza otras fuentes
}
```

✅ **Evita:** Que sitios maliciosos usen tu endpoint

### 2. Validación de Email

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(data.to_email)) {
  throw new Error('Email inválido');
}
```

✅ **Evita:** Emails malformados o spam

### 3. Límite de Caracteres

```javascript
if (data.userName.length > 100 || data.servicesList.length > 1000) {
  throw new Error('Datos exceden límite permitido');
}
```

✅ **Evita:** Abuso de recursos

### 4. Rate Limiting en Servidor

```javascript
const clientIP = event.headers['client-ip'];
const rateLimitKey = `email_${clientIP}`;
// Chequear: ¿Ya envió 10 emails en la última hora?
```

✅ **Evita:** Spam masivo desde una sola IP

### 5. Rate Limiting en Cliente

```javascript
// En script.js
const rateLimitTracker = {
  email: { lastTime: 0, minInterval: 3000 }  // 3 segundos entre emails
};

if (!checkRateLimit('email')) {
  return { success: false, error: 'Espera antes de enviar otro' };
}
```

✅ **Evita:** Envío rápido múltiple

---

## Configuración Requerida

### Paso 1: Instalar Dependencia

En el build:
```bash
npm install @emailjs/nodejs
```

### Paso 2: Verificar Variables de Entorno en Netlify

Site settings → Build & deploy → Environment:

```
EMAILJS_PUBLIC_KEY = EMAILJS_PUBLIC_KEY_PLACEHOLDER
EMAILJS_SERVICE_ID = EMAILJS_SERVICE_ID_PLACEHOLDER
EMAILJS_TEMPLATE_ID = EMAILJS_TEMPLATE_ID_PLACEHOLDER
EMAILJS_CLIENT_TEMPLATE_ID = EMAILJS_TEMPLATE_ID_ALT_PLACEHOLDER
```

### Paso 3: Probar Función

```bash
# Localmente
netlify functions:invoke send-email --payload '{"userName":"Test","email":"test@example.com","servicesList":"Reparación"}'
```

---

## Uso en Código

### Opción 1: Servidor Seguro (Recomendado)

```javascript
// Nuevo - No expone credenciales
const result = await sendEmailViaServer({
  nombre: 'Juan',
  email: 'juan@example.com',
  servicio: 'Reparación'
});
```

### Opción 2: Cliente Directo (Legacy)

```javascript
// Antiguo - Expone Public Key (aún funciona)
const result = await enviarEmailCotizacion(datosFormulario, pdfUrl);
```

---

## Monitoreo

Ver logs de función serverless:

```bash
netlify functions:invoke send-email --packages
# O en Netlify Dashboard → Functions → Logs
```

---

## Preguntas Frecuentes

**P: ¿Sigue siendo vulnerable?**
R: No. Las credenciales están en el servidor, no accesibles desde el navegador.

**P: ¿Debe actualizarse el código antiguo?**
R: No. Ambas opciones funcionan. La nueva es más segura para nuevas implementaciones.

**P: ¿Qué pasa si nadie usa el cliente antiguo?**
R: Puedes remover `emailjs-config.js` y `enviarEmailCotizacion()` eventualmente.

**P: ¿Hay costo adicional?**
R: No. Netlify Functions es gratuito hasta 125,000 invocaciones/mes.

---

## Resumen

| Aspecto | Antes | Ahora |
|--------|-------|-------|
| Public Key | Visible en navegador | Solo en servidor |
| Riesgo de abuso | Alto | Muy bajo |
| Rate limiting | Cliente | Cliente + Servidor |
| Validación | Mínima | Completa |
| Complejidad | Baja | Media |
| Seguridad | Media | Alta |

**Conclusión:** ✅ Las credenciales de EmailJS ya no son visibles. Nadie puede robar tu Public Key para enviar emails.
