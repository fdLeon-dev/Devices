# 🔧 Guía de Debugging - Cargar firebase-config.js

Si ves el error:
```
❌ guardarCotizacionEnFirebase no está disponible
```

Sigue estos pasos para diagnosticar el problema:

## 1️⃣ Abre la Consola del Navegador
- **Windows/Linux:** Presiona `F12`
- **Mac:** Presiona `Cmd + Option + I`
- Selecciona la pestaña **Console**

## 2️⃣ Busca estos mensajes de carga

Deberías ver algo así (en orden):

```
📝 Cargando firebase-config.js...
✅ firebase-config.js cargado exitosamente
📦 Funciones disponibles: {...}
🔥 Firebase inicializado correctamente
```

### Si VES estos mensajes ✅
Entonces `firebase-config.js` se cargó bien. El problema podría ser:
- Cache del navegador desactualizado
- **Solución:** Presiona `Ctrl + Shift + Del` (Windows) o `Cmd + Shift + Del` (Mac)
  - Selecciona "Cookies y datos del sitio"
  - Haz clic en "Borrar"
  - Recarga la página (F5)

### Si NO VES estos mensajes ❌
Entonces `firebase-config.js` no se está cargando. Verifica:

1. **Abre la pestaña Network (F12 → Network)**
   - Recarga la página (F5)
   - Busca `firebase-config.js` en la lista
   - Si no aparece o tiene un código rojo de error, hay un problema

2. **Posibles causas:**
   - El archivo no existe en la carpeta (verifica que `firebase-config.js` esté en `/Users/facu/Documents/DEV/`)
   - Hay un error de sintaxis en el archivo
   - Problema de servidor/red

## 3️⃣ Verifica el orden de carga en index.html

Abre `index.html` y busca las líneas donde se cargan los scripts (cerca del final):

```html
<script src="firebase-config.js"></script>      <!-- Debe aparecer PRIMERO -->
<!-- ... otros scripts ... -->
<script src="script.js"></script>              <!-- Debe aparecer DESPUÉS -->
```

**El orden es CRÍTICO:**
1. ✅ Firebase SDK (`firebase-app-compat.js`, `firebase-firestore-compat.js`)
2. ✅ `firebase-config.js` (define las funciones)
3. ✅ `script.js` (usa las funciones)

Si el orden está mal, muévelos correctamente y recarga.

## 4️⃣ Verifica la consola para errores específicos

Busca en la consola cualquier error rojo como:

```
❌ Error: ...
Uncaught SyntaxError: ...
```

Si hay un error en `firebase-config.js`, cópialo y comparte conmigo.

## 5️⃣ Verifica que firebase-config.js esté completo

En la terminal, ejecuta:

```bash
tail -10 /Users/facu/Documents/DEV/firebase-config.js
```

Deberías ver:
```
console.log('%c✅ firebase-config.js cargado exitosamente'...
console.log('📦 Funciones disponibles:', {...
```

Si VES esto, el archivo está completo. Si VES algo diferente, contacta soporte.

## 6️⃣ Test rápido en la Consola

Abre la consola del navegador (F12) y pega esto:

```javascript
console.log('guardarCotizacionEnFirebase:', typeof guardarCotizacionEnFirebase);
console.log('obtenerCotizacionesAdmin:', typeof obtenerCotizacionesAdmin);
console.log('initFirebase:', typeof initFirebase);
```

Resultado esperado:
```
guardarCotizacionEnFirebase: function
obtenerCotizacionesAdmin: function
initFirebase: function
```

Si ves `undefined` en lugar de `function`, entonces el archivo no se cargó.

## 7️⃣ Limpieza completa

Si nada funciona, haz una limpieza completa:

1. Borra cache y cookies:
   - `Ctrl + Shift + Del` (Windows) o `Cmd + Shift + Del` (Mac)
   - Selecciona TODO
   - Haz clic en "Borrar"

2. Cierra todas las pestañas del navegador ejecutando localhost

3. Abre una pestaña nueva e ingresa: `http://localhost:8000/`

4. Abre F12 → Console

5. Verifica que veas los mensajes de carga

## 🆘 Si aún no funciona

Abre F12 → Console y:
1. Copia TODO el contenido de la consola
2. Comparte conmigo el error exacto

Common fixes:

| Error | Solución |
|-------|----------|
| `firebase is not defined` | Firebase CDN no se cargó. Verifica conexión a internet |
| `Cannot read property 'firestore'` | Firebase no se inicializó antes de usarlo |
| `Syntax error en firebase-config.js` | Hay un error de código. Reconstruye el archivo |
| `404 Not Found` para firebase-config.js | El archivo no existe en la carpeta DEV |

---

**Última actualización:** 16 de marzo de 2026
