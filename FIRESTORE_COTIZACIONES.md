# 📊 Estructura de Base de Datos - Firestore

## Colección: `cotizaciones`

Esta es la colección donde se guardan todas las cotizaciones enviadas por los clientes.

### Campos por Documento

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `nombre` | string | ✅ | Nombre completo del cliente |
| `email` | string | ✅ | Email del cliente (puede estar vacío si proporciona teléfono) |
| `telefono` | string | ✅ | Teléfono del cliente (puede estar vacío si proporciona email) |
| `servicios` | array | ✅ | Array de servicios seleccionados (ej: ['reparacion-basica', 'upgrade-ram']) |
| `urgency` | string | ✅ | Nivel de urgencia: 'normal', 'urgente', 'express' |
| `warranty` | string | ✅ | Periodo de garantía: '30', '90', '180', '365' |
| `descripcion` | string | ✅ | Descripción del problema o necesidad |
| `fechaPreferida` | string | ❌ | Fecha preferida para la cita (formato ISO: YYYY-MM-DD) |
| `urgencyMultiplier` | string | ❌ | Multiplicador de urgencia (ej: '1x', '1.5x', '2x') |
| `basePrice` | number | ❌ | Precio base en pesos |
| `urgencyPrice` | number | ❌ | Costo adicional por urgencia |
| `warrantyPrice` | number | ❌ | Costo adicional por garantía |
| `totalPrice` | number | ❌ | Precio total estimado |
| `fechaCreacion` | timestamp | ✅ | Timestamp automático de creación (Firestore) |
| `status` | string | ✅ | Estado de la cotización: 'pendiente', 'contactado', 'completado', 'cancelado' |
| `notas` | string | ❌ | Notas internas del equipo admin |
| `userAgent` | string | ❌ | Información del navegador del cliente |

### Ejemplo de Documento

```json
{
  "id": "abc123xyz789", // ID auto-generado por Firestore
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "099 123 456",
  "servicios": ["reparacion-basica", "upgrade-ram"],
  "urgency": "normal",
  "warranty": "30",
  "descripcion": "Mi PC no enciende correctamente, emite sonidos extraños",
  "fechaPreferida": "2026-03-22",
  "urgencyMultiplier": "1x",
  "basePrice": 50,
  "urgencyPrice": 0,
  "warrantyPrice": 5,
  "totalPrice": 55,
  "fechaCreacion": {
    "_seconds": 1710610234,
    "_nanoseconds": 123456789
  },
  "status": "pendiente",
  "notas": "Cliente muy interesado, contactar mañana",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
}
```

## Reglas de Seguridad

Las cotizaciones están protegidas por reglas de Firestore:

### CREATE (Escribir nuevas cotizaciones)
- ✅ **Permitido:** Cualquiera (clientes sin autenticar)
- ✅ **Validación:** Debe incluir campos requeridos
- ✅ **Sanitización:** Se valida nombre, email, etc.

### READ (Leer cotizaciones)
- ✅ **Permitido:** Solo usuarios autenticados con rol `admin`
- ❌ **Denegado:** Clientes anónimos

### UPDATE (Actualizar cotizaciones)
- ✅ **Permitido:** Solo usuarios autenticados con rol `admin`
- ✅ **Uso:** Cambiar estado y notas internas

### DELETE (Eliminar cotizaciones)
- ✅ **Permitido:** Solo usuarios autenticados con rol `admin`
- ⚠️ **Cuidado:** Eliminar cotizaciones no se puede deshacer

## Estados de Cotización

| Estado | Significado | Uso |
|--------|------------|-----|
| `pendiente` | Cotización enviada, sin contacto | Nuevo registro |
| `contactado` | Se contactó al cliente | Seguimiento iniciado |
| `completado` | Cotización convertida en servicio | Job completado |
| `cancelado` | Cliente canceló la cotización | No procede |

## Cómo Acceder a los Datos

### Opción 1: Firebase Console
1. Ve a https://console.firebase.google.com/
2. Selecciona proyecto "devices-41420"
3. Ve a Firestore Database
4. Busca colección "cotizaciones"

### Opción 2: Panel Admin
1. Abre http://localhost:8000/admin-cotizaciones.html
2. Inicia sesión (admin / devices123)
3. Visualiza todas las cotizaciones
4. Haz clic en "Ver" para detalles completos
5. Actualiza estado y agrega notas

### Opción 3: JavaScript (en la consola del navegador)
```javascript
// Obtener todas las cotizaciones (requiere autenticación admin)
const result = await obtenerCotizacionesAdmin();
console.log(result.data);

// Actualizar estado de una cotización
await actualizarEstadoCotizacion('doc_id', 'contactado', 'Cliente contactado exitosamente');
```

## Índices Recomendados

Para optimizar consultas, Firebase sugiere crear estos índices:

```
Collection: cotizaciones
Fields: status (Ascending), fechaCreacion (Descending)
Fields: status (Ascending), nombre (Ascending)
```

Firestore los crea automáticamente cuando los necesites.

## Respaldo de Datos

### Exportar desde Firebase Console
1. Ve a Firestore Database
2. Haz clic en el botón ⋮ (tres puntos)
3. Selecciona "Exportar"
4. Elige dónde guardar

### Importar en Firebase Console
1. Ve a Firestore Database
2. Haz clic en el botón ⋮ (tres puntos)
3. Selecciona "Importar"
4. Elige el archivo exportado

## Límites y Cuotas

- **Lectura:** 50,000 por día (plan Spark)
- **Escritura:** 20,000 por día (plan Spark)
- **Almacenamiento:** 1 GB (plan Spark)

Para producción, considera cambiar al **plan Blaze** (pago por uso).

## Troubleshooting

### ❌ "Firebase SDK no está cargado" en panel admin
- **Solución:** Se agregaron los scripts de Firebase SDK a admin-cotizaciones.html
- Asegúrate de hacer un hard refresh: **Cmd+Shift+R** (Mac) o **Ctrl+Shift+F5** (Windows)
- Borra el cache del navegador si persiste el error

### ❌ "Cotizaciones no aparecen en panel admin"
- Verifica que Firebase esté inicializado (mira la consola)
- Confirma que el usuario admin está autenticado (admin / devices123)
- Revisa la consola del navegador con F12 para ver los mensajes de debug azules y verdes
- **Intenta el test:** Abre http://localhost:8000/test-cotizaciones-flow.html y ejecuta los tests

### ❌ "Cambios no se guardan en el panel admin"
- Abre la consola (F12) y verifica si hay errores de permiso
- Asegúrate que las reglas de Firestore estén publicadas correctamente
- Los estados só pueden cambiar en estas direcciones:
  - `pendiente` → `contactado` o `cancelado`
  - `contactado` → `completado` o `cancelado`
  - `completado` → (final, no se puede cambiar)
  - `cancelado` → (final, no se puede cambiar)

### ❌ "Búsqueda no funciona"
- La búsqueda es insensible a mayúsculas y busca en:
  - Nombre del cliente
  - Email
  - Teléfono
  - ID de la cotización

### ❌ "No puedo acceder al panel admin"
- Verifica credenciales: usuario **"admin"**, contraseña **"devices123"**
- Limpia el cache del navegador (Cmd+Shift+Del)
- Abre en navegador privado para descartar issues de sesión
- Mira en la consola si hay errores de Firebase SDK no cargado

## Mejoras Implementadas

### ✨ Panel Administrativo

#### 1. Validación de Transiciones de Estado
- ✅ Solo se permite cambiar estado en direcciones lógicas
- ✅ Alerta al usuario si intenta una transición inválida
- ✅ Muestra transiciones válidas disponibles

#### 2. Indicadores Visuales Mejorados
- ✅ Estados con emojis en tabla (📋 Pendiente, 📞 Contactado, ✅ Completado, ❌ Cancelado)
- ✅ Spinner de carga durante actualización
- ✅ Confirmación visual en verde cuando se guardan cambios
- ✅ Contador de caracteres en notas internas

#### 3. Búsqueda y Filtrado Avanzado
- ✅ Campo de búsqueda por nombre, email, teléfono o ID
- ✅ Filtro por estado (Todos, Pendiente, Contactado, Completado, Cancelado)
- ✅ Búsqueda en tiempo real (se actualiza mientras escribes)
- ✅ Mensaje de "No hay resultados" cuando no hay coincidencias

#### 4. Manejo Robusto de Valores Vacíos
- ✅ Email vacío se muestra como "(No proporcionado)"
- ✅ Teléfono vacío se muestra como "(No proporcionado)"
- ✅ Precios siempre tienen valor numérico (mínimo 0.00)
- ✅ Timestamps se convierten correctamente a fechas legibles

#### 5. Mejor UX en Modal de Detalles
- ✅ Información adicional: transiciones válidas, contador de caracteres
- ✅ Valores readonly para campos de cliente
- ✅ Emojis en opciones de estado
- ✅ ID de cotización con familia monoespacial para copiar fácilmente
- ✅ Desglose de precios con TOTAL destacado

#### 6. Estadísticas Mejoradas
- ✅ Incluye conteo de cotizaciones "Canceladas"
- ✅ Actualiza solo cuando se cargan datos nuevos
- ✅ Muestra resumen en pie de tabla

### 🔥 Firebase Config

#### 1. Mejor Validación y Sanitización
- ✅ Validación de estados posibles
- ✅ Sanitización de notas internas
- ✅ Validación de que ID existe antes de actualizar

#### 2. Timestamps de Auditoría
- ✅ Campo `fechaActualizacion` al editar
- ✅ Campo `ultimaActualizacionPor` identifica quién hizo cambios
- ✅ Permite seguimiento de cambios

#### 3. Logging Detallado
- ✅ Mensajes de debug en colores para cada operación
- ✅ Información de qué campos se están actualizando
- ✅ Códigos de error específicos de Firestore

#### 4. Manejo de Errores Específico
- ✅ Error 'not-found': Cotización no existe
- ✅ Error 'permission-denied': Verifica reglas de Firestore
- ✅ Otros errores: Mensaje descriptivo

### 🧪 Testing

#### Nuevo archivo: test-cotizaciones-flow.html
- ✅ Verifica que Firebase SDK esté cargado
- ✅ Comprueba que Firestore se inicializa
- ✅ Valida disponibilidad de todas las funciones
- ✅ Test de crear cotización
- ✅ Test de leer cotizaciones
- ✅ Test de conexión a Firebase
- ✅ Panel de resultados con logging en tiempo real

**Acceso:** http://localhost:8000/test-cotizaciones-flow.html

## Flujo Completo Validado

```
1. FORMULARIO (index.html)
   ↓
   Datos → handleFormSubmit()
   ↓
   Validación → Precios calculados
   ↓
   [Firebase] guardarCotizacionEnFirebase()
   ↓
   Firestore: Colección "cotizaciones"
   ↓
   [Email] enviarEmailCotizacion()
   ↓
   Email al cliente + Email al negocio
   ✅ Cotización guardada

2. PANEL ADMIN (admin-cotizaciones.html)
   ↓
   Autenticación de sesión
   ↓
   [Firebase] obtenerCotizacionesAdmin()
   ↓
   Firestore: Lee colección "cotizaciones"
   ↓
   Tabla con búsqueda/filtrado
   ↓
   Click "Ver" → Modal de detalles
   ↓
   Editar estado + notas
   ↓
   [Firebase] actualizarEstadoCotizacion()
   ↓
   Firestore: Actualiza documento
   ✅ Estado y notas guardados
```

## Campos Verificados

### Guardados correctamente
- ✅ nombre, email, telefono
- ✅ servicios (array)
- ✅ urgency, warranty
- ✅ descripcion, fechaPreferida
- ✅ basePrice, urgencyPrice, warrantyPrice, totalPrice
- ✅ fechaCreacion, status, notas
- ✅ userAgent, ipAddress

### Auditoría agregada
- ✅ fechaActualizacion (timestamp)
- ✅ ultimaActualizacionPor (tracks admin)
- ✅ Validación de estados únicamente válidos

## Mantenimiento

### Limpiar datos antiguos
```javascript
// Eliminar cotizaciones más antiguas de 1 año
const cutoffDate = new Date();
cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

const oldCotizaciones = await db.collection('cotizaciones')
  .where('fechaCreacion', '<', cutoffDate)
  .get();

oldCotizaciones.docs.forEach(doc => doc.ref.delete());
```

### Generar reportes
```javascript
// Contar cotizaciones por estado
const snapshot = await db.collection('cotizaciones').get();
const stats = {};
snapshot.docs.forEach(doc => {
  const status = doc.data().status;
  stats[status] = (stats[status] || 0) + 1;
});
console.log(stats);
```

### Exportar datos por estado
```javascript
// Obtener todas las cotizaciones completadas
const completed = await db.collection('cotizaciones')
  .where('status', '==', 'completado')
  .orderBy('fechaCreacion', 'desc')
  .get();

const data = completed.docs.map(doc => doc.data());
console.table(data);
```

---

**Última actualización:** 16 de marzo de 2026
**Versión:** 2.0 - Sistema integrado y probado
**Estado:** ✅ Funcional, seguro y optimizado
