# 🚀 Guía de Despliegue en Netlify

## ✅ Pre-requisitos

- [x] Proyecto clonado/descargado localmente
- [x] Credenciales en `public/config-credentials.json` (NO en Git)
- [x] `.gitignore` actualizado (credenciales excluidas)
- [x] GitHub repository criado
- [x] Cambios commiteados y pusheados

---

## 🔐 Paso 1: Configurar Variables de Entorno en Netlify

1. **Ir a Netlify Dashboard**
   - Login en [netlify.com](https://netlify.com)
   - New site from Git → Selecciona tu repositorio

2. **Configurar variables de entorno:**
   - Build & deploy → Environment
   - Agrega nuevas variables:

```
ADMIN_USER = ADMIN_USER_PLACEHOLDER
ADMIN_PASS = ADMIN_PASS_PLACEHOLDER
```

> ⚠️ IMPORTANTE: No guardes estas en el repositorio GitHub. Solo en Netlify Dashboard.

---

## 📋 Paso 2: Configurar Build Settings

1. **Deploy settings:**
   - Base directory: (dejar vacío o `/`)
   - Build command: (dejar vacío - es sitio estático)
   - Publish directory: `.` (raíz del proyecto)

2. **Advanced build settings (opcional):**
   - Si necesitas generar `config-credentials.json` en build:

Click en **New variable** en Environment section y agrega un build script personalizado.

---

## 🔗 Paso 3: Conectar GitHub

```bash
# 1. Inicializa Git si no lo está
git init

# 2. Agrega archivos (config-credentials.json NOT incluido)
git add .

# 3. Verifica que config-credentials.json NO aparece
git status  # config-credentials.json NO debe estar aquí

# 4. Commit
git commit -m "Initial commit - credentials not included"

# 5. Push a GitHub
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 🎯 Paso 4: Verificar Archivos en GitHub

```bash
# Ver qué está en GitHub
git ls-tree -r HEAD public/ | grep config-credentials

# Debe mostrar SOLO:
# config-credentials.example.json
# NO debe mostrar config-credentials.json
```

### ✅ Correcto:
```
public/config-credentials.example.json
```

### ❌ INCORRECTO (NO hagas esto):
```
public/config-credentials.example.json
public/config-credentials.json
```

---

## 🌐 Paso 5: Crear archivo de credenciales en Netlify

**Opción A: Crear manualmente en Netlify (Simple)**

1. Dashboard → Build & deploy → Environment
2. Agrega variables: `ADMIN_USER`, `ADMIN_PASS`
3. Redeploy: Deploys → Trigger deploy → Deploy site

**Opción B: Build script automático (Avanzado)**

Crea `build.sh`:
```bash
#!/bin/bash
set -e

# Generar config-credentials.json desde environment variables
if [ -z "$ADMIN_USER" ] || [ -z "$ADMIN_PASS" ]; then
  echo "⚠️ Credenciales no configuradas"
  echo "Por favor, configura ADMIN_USER y ADMIN_PASS en Netlify"
  exit 1
fi

mkdir -p public
cat > public/config-credentials.json <<EOF
{
  "admin": {
    "usuario": "$ADMIN_USER",
    "contraseña": "$ADMIN_PASS"
  }
}
EOF

echo "✅ config-credentials.json generado dinámicamente"
```

Luego en `netlify.toml`:
```toml
[build]
  command = "./build.sh"
  publish = "."
```

---

## 🧪 Paso 6: Verificar Despliegue

1. **Ver logs de build:**
   - Dashboard → Deploys → Click en último deploy
   - Buscar: "✅ Credenciales cargadas"

2. **Probar en sitio desplegado:**
   - Abre tu sitio en Netlify
   - F12 → Console
   - Busca: "✅ Credenciales cargadas desde config-credentials.json"
   - Si ves `⚠️ No se pudieron cargar...` → Revisar variables de entorno

3. **Probar login:**
   - Navega a `/admin-cotizaciones.html`
   - Intenta login con credenciales configuradas
   - Debe funcionar

---

## 🔄 Cambiar Credenciales Después

### En Netlify:
1. Dashboard → Site settings → Build & deploy → Environment
2. Edita `ADMIN_USER` y `ADMIN_PASS`
3. Redeploy (Deploys → Trigger deploy)

### Localmente:
1. Edita `public/config-credentials.json`
2. No commites este cambio
3. Usa localmente para testing

---

## 🛡️ Checklist Final

### Antes de hacer Deploy:
- [ ] `config-credentials.json` está en `.gitignore`
- [ ] `config-credentials.json` NO está en GitHub
- [ ] `config-credentials.example.json` SÍ está en GitHub
- [ ] Variables configuradas en Netlify Dashboard
- [ ] `netlify.toml` existe en raíz del proyecto
- [ ] Admin panel carga sin errores localmente

### Después de hacer Deploy:
- [ ] Sitio está online en [tu-sitio].netlify.app
- [ ] Console muestra "✅ Credenciales cargadas"
- [ ] Login funciona con credenciales correctas
- [ ] Cambios de estado en cotizaciones funcionan

---

## 🆘 Troubleshooting

### "❌ No se pueden cargar credenciales"

**Causa:** `config-credentials.json` no existe en servidor

**Solución:**
```bash
# 1. Verifica variables en Netlify Dashboard
# 2. Redeploy el sitio
# 3. Espera 1-2 minutos
# 4. Recarga página (Cmd+Shift+R)
```

### "⚠️ Credenciales no configuradas" en logs

**Causa:** Variables `ADMIN_USER` o `ADMIN_PASS` no están configuradas

**Solución:**
1. Dashboard → Site settings → Build & deploy → Environment
2. Agrega/verifica variables
3. Redeploy

### Login fallido con credenciales correctas

**Causa:** Formato de credenciales incompatible

**Solución:**
```javascript
// En Console del navegador:
console.log(ADMIN_CREDENTIALS)
// Verifica que tenga .usuario y .contraseña exactamente
```

---

## 📚 Archivos Importantes

| Archivo | Visibilidad | Propósito |
|---------|-----------|----------|
| `config-credentials.example.json` | ✅ GitHub | Template/Referencia |
| `config-credentials.json` | ❌ GitHub | Credenciales reales (local) |
| `.gitignore` | ✅ GitHub | Excluye credenciales |
| `netlify.toml` | ✅ GitHub | Config de despliegue |
| `admin-cotizaciones.html` | ✅ GitHub | Panel admin (sin creds) |

---

## 🔗 Enlaces Útiles

- [Netlify Environment Variables Docs](https://docs.netlify.com/configure-builds/environment-variables/)
- [Netlify Build Configuration](https://docs.netlify.com/configure-builds/file-conventions/)
- [Git .gitignore](https://git-scm.com/docs/gitignore)
- [Project README](./README.md)
- [Credenciales Setup](./CREDENCIALES_SETUP.md)

---

## 💡 Tips de Seguridad

✅ **NUNCA** hagas push de `config-credentials.json`

✅ **SIEMPRE** usa Netlify Dashboard para credenciales en producción

✅ **REGENERA** credenciales periódicamente (cada 3-6 meses)

✅ **MONITOREA** logs de acceso en Firestore

✅ **USA** HTTPS (Netlify lo da gratis)

---

**Ultima actualización:** 2026-03-17  
**Status:** ✅ Listo para producción
