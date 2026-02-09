Nuevas mejoras de módulos (implementadas):

- **Previsualización de PDFs**: si un módulo contiene un recurso que apunta a un PDF en `public/`, se muestra un preview embebido en el modal del módulo.
- **Campo `order`** en el formulario admin: permite definir el orden manual de los módulos.
- **Editor de quizzes**: puedes añadir preguntas con opciones y seleccionar la respuesta correcta; estos se guardan en el campo `quiz` de cada módulo.

Prueba rápida:
1. Inicia sesión como admin y abre la sección **Cursos**.
2. Usa el formulario mejorado para crear/editar módulos (añade objetivos, recursos y quizzes).  
3. Si quieres importar todos los módulos desde el JSON (`public/modules-tgsit-detailed-refined.json` es ahora preferido), usa **Importar progresivamente** o ejecuta el script server-side (ver sección 'Importación' más arriba). Puedes regenerar el JSON y miniaturas con:

    ```powershell
    python scripts/refine_modules.py
    ```

Esto crea `public/modules-tgsit-detailed-refined.json` y las miniaturas SVG en `public/images/modules/`.
Nuevas mejoras de módulos (implementadas):

- **Previsualización de PDFs**: si un módulo contiene un recurso que apunta a un PDF en `public/`, se muestra un preview embebido en el modal del módulo.
- **Campo `order`** en el formulario admin: permite definir el orden manual de los módulos.
- **Editor de quizzes**: puedes añadir preguntas con opciones y seleccionar la respuesta correcta; estos se guardan en el campo `quiz` de cada módulo.

Prueba rápida:
1. Inicia sesión como admin y abre la sección **Cursos**.
2. Usa el formulario mejorado para crear/editar módulos (añade objetivos, recursos y quizzes).  
3. Si quieres importar todos los módulos desde el JSON (`public/modules-tgsit-detailed-refined.json` es preferido), usa **Importar progresivamente** o ejecuta el script server-side (ver sección 'Importación' más arriba).
# Devices F2 - Sitio Web del Servicio Técnico

Sitio web moderno y profesional para el servicio técnico de reparación y ensamblaje de computadoras Devices F2.

## 🚀 Características

- **Diseño Moderno**: Interfaz limpia y profesional con tema claro/oscuro
- **Responsive**: Optimizado para todos los dispositivos (móvil, tablet, desktop)
- **Rápido**: Carga optimizada con lazy loading de imágenes
- **Accesible**: Cumple con estándares de accesibilidad web
- **SEO Optimizado**: Meta tags y estructura semántica
- **Analytics**: Integración con Google Analytics
- **PWA Ready**: Preparado para funcionar como aplicación web

## 🎨 Diseño

- **Colores**: Violeta (principal: #6A4CDB) como color principal, con tema claro/oscuro
- **Tipografía**: Inter (sans-serif moderna y legible)
- **Iconos**: Font Awesome para una experiencia visual consistente
- **Animaciones**: Efectos sutiles y transiciones suaves

## 📱 Secciones

1. **Navbar**: Navegación fija con logo y menú responsive
2. **Hero**: Sección principal con mensaje de bienvenida
3. **Servicios**: Tarjetas con los servicios ofrecidos
4. **Trabajos**: Galería de proyectos realizados
5. **Cotización**: Formulario para solicitar presupuestos
6. **Contacto**: Información de contacto y redes sociales
7. **Footer**: Información básica y derechos de autor

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS y Grid/Flexbox
- **JavaScript ES6+**: Funcionalidad interactiva
- **Font Awesome**: Iconografía
- **Google Fonts**: Tipografía Inter

## 📦 Instalación

1. Clona o descarga el proyecto
2. Abre `index.html` en tu navegador web
3. ¡Listo! No requiere instalación adicional

## ⚙️ Configuración

### Google Analytics
Para habilitar Google Analytics, reemplaza `GA_MEASUREMENT_ID` en el archivo `index.html` con tu ID de medición real.

### Información de Contacto
Actualiza la siguiente información en `index.html`:
- Número de teléfono
- Email de contacto
- Ubicación
- Enlaces de redes sociales

### Imágenes
El proyecto incluye una estructura organizada para imágenes en la carpeta `public/images/`:

#### Estructura de Carpetas:
```
public/images/
├── avatars/          # Avatares de clientes (80x80px)
├── logos/            # Logos y favicons (200x60px, 32x32px)
├── works/            # Imágenes de trabajos (400x300px)
├── icons/            # Iconos personalizados
├── config.json       # Configuración de imágenes
└── README.md         # Documentación de imágenes
```

#### Para usar imágenes propias:
1. **Avatares**: Coloca fotos de clientes en `public/images/avatars/`
2. **Trabajos**: Coloca fotos de trabajos en `public/images/works/`
3. **Logos**: Coloca logos en `public/images/logos/`
4. **Formato**: Usa JPG para fotos, PNG para logos, WebP para optimización
5. **Fallback**: Las URLs de Unsplash se usan como respaldo automático

#### Nombres recomendados:
- Avatares: `cliente-nombre.jpg`
- Trabajos: `trabajo-categoria-numero.jpg`
- Logos: `logo-devices-f2-[tamaño].png`

## 🎯 Funcionalidades

### Formulario de Cotización
- Validación de campos requeridos
- Envío automático a WhatsApp
- Notificaciones de confirmación
- Estados de carga

### Modo Oscuro
- Toggle en la navbar
- Preferencia guardada en localStorage
- Transiciones suaves entre temas

### Navegación
- Scroll suave entre secciones
- Menú móvil hamburguesa
- Navbar que se oculta/muestra al hacer scroll

### Optimizaciones
- Lazy loading de imágenes
- Debounce en eventos de scroll
- Código modular y comentado

## 📱 Responsive Design

El sitio está optimizado para:
- **Móviles**: 320px - 768px
- **Tablets**: 768px - 1024px
- **Desktop**: 1024px+

## 🔧 Personalización

### Colores
Modifica las variables CSS en `:root` para cambiar la paleta de colores:

```css
:root {
    --primary-color: #6A4CDB;
    --secondary-color: #2c2c2c;
    /* ... más variables */
}
```

### Contenido
- Actualiza los textos en `index.html`
- Modifica las imágenes en la galería
- Ajusta la información de contacto

## 📈 SEO y Performance

- Meta tags optimizados
- Estructura semántica HTML5
- Imágenes con lazy loading
- CSS y JS minificables
- Código limpio y comentado

## 🚀 Despliegue

Para desplegar el sitio:
1. Sube todos los archivos a tu servidor web
2. Asegúrate de que `index.html` esté en la raíz
3. Configura HTTPS para mejor seguridad
4. Actualiza los enlaces de contacto

## 📞 Soporte

Para soporte técnico o consultas sobre el sitio web, contacta a Devices F2:
- WhatsApp: +52 55 1234 5678
- Email: contacto@devicesf2.com
- Instagram: @devices_.f2

## 📄 Licencia

© 2024 Devices F2. Todos los derechos reservados.

---

**Desarrollado con ❤️ para Devices F2**

## 🧑‍🏫 Cursos / Módulos (experimental)

Se agregó una sección experimental para ofrecer un diplomado por módulos con registro de usuarios (Auth) y progreso (Firestore).

Pasos rápidos para habilitar:
1. Configura Firebase en `firebase-config.js` (ya existe plantilla en el repo).
2. En Firebase Console: habilita **Authentication → Email/Password** y **Firestore Database** (modo de pruebas para comenzar).
3. Actualiza `public/config.json` con el `live.meetUrl` y el listado `adminEmails` (usuarios que pueden crear módulos).
4. Sube el proyecto a tu hosting y prueba: en el sitio haz clic en "Acceder" para registrarte y luego ve a la sección "Cursos".

## Crear un administrador (admin)

Hay dos formas de conceder permisos de administrador:

- Rápido (solo UI, no seguro para producción): añade tu email a `public/config.json` → `adminEmails` (lista de strings). Esto habilita las UI admin (solo conveniencia).
- Seguro (recomendado): establece la claim personalizada `admin` en el usuario de Firebase Auth. Para ello he añadido un script que puedes ejecutar localmente.

Instrucciones (método seguro):

1. En Firebase Console → Project Settings → Service accounts → Genera una nueva clave privada (JSON) y guárdala como `serviceAccountKey.json` en la raíz del proyecto (o guarda la ruta y usa la variable de entorno `GOOGLE_APPLICATION_CREDENTIALS`).
2. Instala la dependencia: `npm install firebase-admin` (solo en tu máquina local donde correrás el script).
3. Ejecuta: `node scripts/set-admin-claim.js tu-email@dominio.com`.
4. El script buscará al usuario por email y añadirá `{ admin: true }` a sus custom claims.

Nota: después de asignar claims, el usuario puede necesitar recargar el token (salir y entrar o usar `user.getIdToken(true)` en la app) para que la UI muestre las opciones de admin.

Notas:
- Los módulos se almacenan en `courses / diplomado-reparacion / modules` en Firestore.
- El progreso del usuario se guarda en `users / {uid}` con `completedModules`.
- Para demo: si no hay módulos, el primer admin puede "sembrar" módulos de ejemplo usando la interfaz.

### Registro y verificación de correo

- Al registrarse, se crea automáticamente un documento en `users/{uid}` con campos básicos y `completedModules: []`.
- Tras registrar, el sistema envía un **email de verificación** y la sesión se cierra hasta que el usuario confirme su correo.
- Si un usuario inicia sesión sin verificar, verá un aviso con opción para reenviar el email de verificación.

### Reglas de Firestore

He incluido `FIRESTORE_RULES.txt` con reglas de ejemplo para proteger `users/{uid}` y permitir solo escritura de módulos a administradores (requiere claims `admin`). Ajusta y publica las reglas desde Firebase Console.

Para desplegar las reglas desde tu máquina (si usas Firebase CLI):

```powershell
# Asegúrate de haber instalado y autenticado Firebase CLI
firebase deploy --only firestore:rules
```

Si prefieres usar el archivo `firestore.rules` incluido aquí, también funcionará con el mismo comando.

Para asignar el claim `admin` a un usuario (necesitas una key de cuenta de servicio):

```powershell
# Guarda tu key en el repo como serviceAccountKey.json (temporal) o exporta la variable de entorno
#$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\ruta\a\serviceAccountKey.json"
node scripts/set-admin-claim.js tu-admin@correo.com
```

Nota: No subas `serviceAccountKey.json` a GitHub; agrégalo a `.gitignore` y elimínalo cuando termines.

Comandos útiles añadidos al proyecto:

- Instalar dev deps (incluye `firebase-tools`):
```powershell
npm install
```

- Desplegar reglas usando el script npm:
```powershell
npm run firebase:rules
```

- Ejecutar importación (dry-run primero):
```powershell
npm run import-modules:dry
# y luego (después de revisar):
npm run import-modules -- --yes
```

Los scripts `scripts/set-admin-claim.js` y `scripts/import-modules-admin.js` ahora aceptan la opción `--key <path>` para especificar la ubicación del archivo JSON de cuenta de servicio en lugar de usar la variable de entorno.

Chequeo rápido del entorno:

```powershell
# Ejecútalo para verificar que tengas dependencias instaladas, key y el JSON de módulos
node scripts/verify-setup.js
```

Admin UI (gestión de módulos)
--------------------------------

Hice una mejora al panel de admin en la sección `Cursos` para gestionar los módulos de forma más profesional:

- Formulario mejorado para crear módulos: **Título**, **Duración**, **Descripción**, **Objetivos** (separados por `;`), **Recursos** (URLs separados por `;`) y URL de video opcional.
- Panel de módulos existente con búsqueda, ver, editar, eliminar y reordenar módulos (flechas ↑ ↓).
- Vista de módulo (modal) para leer la descripción, objetivos y recursos, y botón **Marcar como visto** para usuarios.

Para usarlo:
1. Inicia sesión con tu cuenta admin (asegúrate que el correo esté verificado).  
2. En `Cursos`, si tu usuario es admin verás la sección **Agregar módulo (Admin)** y el panel con la lista de módulos.  
3. Usa **Importar progresivamente** para traer módulos desde `public/modules-tgsit-detailed.json` si lo deseas.

Si querés, puedo ajustar la UI (por ejemplo, permitir previsualizar PDFs embebidos, importar objetivos automáticamente desde el JSON, o añadir campos para quizzes). Dime qué prefieres y lo implemento.

Si quieres que implemente subida de videos a Firebase Storage o integración automática con Google Calendar/Meet para programar sesiones, lo puedo prototipar en la siguiente iteración.
