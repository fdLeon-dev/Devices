// Configuración de Firebase para Devices F2
// IMPORTANTE: Debes reemplazar estos valores con tus propias credenciales de Firebase
// Para obtener tu configuración:
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un nuevo proyecto o selecciona uno existente
// 3. Ve a Configuración del proyecto > Tus apps > SDK de Firebase
// 4. Copia la configuración y pégala aquí

// ============ FUNCIONES DE VALIDACIÓN (cargar primero) ============
try {
  console.log('📝 Cargando firebase-config.js...');
  console.log('📍 Location: ' + window.location.href);
  console.log('📋 Script ejecutándose en:', document.currentScript?.src || 'unknown');
} catch (e) {
  console.warn('⚠️ Error en logging inicial:', e);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>\"']/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

function validateEmail(email) {
  const sanitized = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) && sanitized.length <= 254;
}

function validatePhone(phone) {
  const sanitized = sanitizeInput(phone);
  const phoneRegex = /^[\d+\-\s()]+$/;
  return phoneRegex.test(sanitized) && sanitized.length >= 7 && sanitized.length <= 20;
}

function validateName(name) {
  const sanitized = sanitizeInput(name);
  return sanitized.length >= 2 && sanitized.length <= 100;
}

// ============ CONFIGURACIÓN FIREBASE ============

// Seguridad: no incluir credenciales reales en cliente.
const firebaseConfig = window.FIREBASE_CONFIG_ENV || {
  apiKey: "CONFIGURE_IN_SERVER_ONLY",
  authDomain: "CONFIGURE_IN_SERVER_ONLY",
  projectId: "CONFIGURE_IN_SERVER_ONLY",
  storageBucket: "CONFIGURE_IN_SERVER_ONLY",
  messagingSenderId: "CONFIGURE_IN_SERVER_ONLY",
  appId: "CONFIGURE_IN_SERVER_ONLY",
  measurementId: "CONFIGURE_IN_SERVER_ONLY"
};
// Inicializar Firebase
let db;
let testimoniosRef;

function initFirebase() {
  // Verificar si Firebase ya está inicializado
  if (typeof db !== 'undefined' && db) {
    console.log('%c🔄 Firebase ya está inicializado', 'color: #ffc107; font-weight: bold;');
    return true;
  }

  // Verificar si Firebase está cargado
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK no está cargado');
    return false;
  }

  try {
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    testimoniosRef = db.collection('testimonios');

    console.log('%c🔥 Firebase inicializado correctamente', 'color: #ff6b35; font-weight: bold;');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    return false;
  }
}

// Función para agregar un testimonio (DEPRECADA - usar agregarTestimonioConImagen)
async function agregarTestimonio(nombre, comentario) {
  try {
    const testimonio = {
      nombre: nombre,
      comentario: comentario,
      imagen: '', // Campo vacío para compatibilidad
      likes: 0,
      likedBy: [],
      fecha: firebase.firestore.FieldValue.serverTimestamp(),
      aprobado: false // Moderación opcional
    };

    const docRef = await testimoniosRef.add(testimonio);
    console.log('Testimonio agregado con ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error al agregar testimonio:', error);
    return { success: false, error: error.message };
  }
}

// NOTA: Esta función es mantenida por compatibilidad pero se recomienda
// usar agregarTestimonioConImagen() definida en script.js

// Función para dar like a un testimonio
async function toggleLike(testimonioId, userId) {
  try {
    const docRef = testimoniosRef.doc(testimonioId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Testimonio no encontrado');
    }

    const data = doc.data();
    const likedBy = data.likedBy || [];
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      // Quitar like
      await docRef.update({
        likes: firebase.firestore.FieldValue.increment(-1),
        likedBy: firebase.firestore.FieldValue.arrayRemove(userId)
      });
    } else {
      // Agregar like
      await docRef.update({
        likes: firebase.firestore.FieldValue.increment(1),
        likedBy: firebase.firestore.FieldValue.arrayUnion(userId)
      });
    }

    return { success: true, hasLiked: !hasLiked };
  } catch (error) {
    console.error('Error al dar like:', error);
    return { success: false, error: error.message };
  }
}

// Función para obtener testimonios en tiempo real
function escucharTestimonios(callback) {
  return testimoniosRef
    .orderBy('fecha', 'desc')
    .limit(50)
    .onSnapshot((snapshot) => {
      const testimonios = [];
      snapshot.forEach((doc) => {
        testimonios.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(testimonios);
    }, (error) => {
      console.error('Error al escuchar testimonios:', error);
      // Mostrar mensaje amigable en la UI
      try {
        const container = document.getElementById('testimonials-container');
        const loading = document.getElementById('testimonials-loading');
        const empty = document.getElementById('testimonials-empty');
        if (loading) loading.style.display = 'none';
        if (empty) empty.style.display = 'none';
        if (container) {
          container.innerHTML = '';
          const errDiv = document.createElement('div');
          errDiv.className = 'testimonials-error';
          errDiv.textContent = 'No se pueden cargar testimonios: ' + (error.message || error);
          container.appendChild(errDiv);
        }
      } catch (e) {
        // Ignorar errores de DOM por si la página no está lista
      }
      callback([]);
    });
}

// Función para generar ID de usuario único (para el sistema de likes)
function obtenerUserId() {
  let userId = localStorage.getItem('devicesf2_userId');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('devicesf2_userId', userId);
  }
  return userId;
}

// Función para dar/quitar like a un testimonio
async function toggleLike(testimonioId, userId) {
  try {
    const docRef = testimoniosRef.doc(testimonioId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { success: false, error: 'Testimonio no encontrado' };
    }

    const data = doc.data();
    const likedBy = data.likedBy || [];
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      // Quitar like
      await docRef.update({
        likes: firebase.firestore.FieldValue.increment(-1),
        likedBy: firebase.firestore.FieldValue.arrayRemove(userId)
      });
      return { success: true, hasLiked: false };
    } else {
      // Dar like
      await docRef.update({
        likes: firebase.firestore.FieldValue.increment(1),
        likedBy: firebase.firestore.FieldValue.arrayUnion(userId)
      });
      return { success: true, hasLiked: true };
    }
  } catch (error) {
    console.error('Error al toggle like:', error);
    return { success: false, error: error.message };
  }
}

// Función para eliminar un testimonio
async function deleteTestimonial(testimonioId, userId) {
  try {
    const docRef = testimoniosRef.doc(testimonioId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { success: false, error: 'Testimonio no encontrado' };
    }

    const data = doc.data();

    // Verificar que el usuario sea el propietario
    if (data.userId !== userId) {
      return { success: false, error: 'No tienes permisos para eliminar este testimonio' };
    }

    await docRef.delete();
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar testimonio:', error);
    return { success: false, error: error.message };
  }
}

// ============ COTIZACIONES - Guardar en Firestore ============
/**
 * Guarda una cotización en Firestore
 * @param {Object} datosFormulario - Datos del formulario de cotización
 * @returns {Promise<Object>} - { success: true, id: "doc_id" } o { success: false, error: "mensaje" }
 */
async function guardarCotizacionEnFirebase(datosFormulario) {
  // Validar que Firebase esté inicializado
  if (!db) {
    if (!initFirebase()) {
      return { success: false, error: 'Firebase no está inicializado' };
    }
  }

  try {
    // Validar datos requeridos antes de guardar
    if (!datosFormulario.nombre || !datosFormulario.nombre.trim()) {
      return { success: false, error: 'El nombre es requerido' };
    }

    if (!datosFormulario.servicio || datosFormulario.servicio.length === 0) {
      return { success: false, error: 'Debe seleccionar al menos un servicio' };
    }

    if (!datosFormulario.mensaje || !datosFormulario.mensaje.trim()) {
      return { success: false, error: 'La descripción del problema es requerida' };
    }

    // Validar al menos email o teléfono
    const tieneEmail = datosFormulario.email && datosFormulario.email.trim() !== '' && datosFormulario.email !== 'No proporcionado';
    const tieneTelefono = datosFormulario.telefono && datosFormulario.telefono.trim() !== '' && datosFormulario.telefono !== 'No proporcionado';

    if (!tieneEmail && !tieneTelefono) {
      return { success: false, error: 'Se requiere al menos un email o teléfono' };
    }

    // Sanitizar y normalizar datos
    const cotizacion = {
      nombre: sanitizeInput(datosFormulario.nombre).trim(),
      email: tieneEmail ? sanitizeInput(datosFormulario.email).toLowerCase().trim() : '',
      telefono: tieneTelefono ? sanitizeInput(datosFormulario.telefono).trim() : '',
      servicios: Array.isArray(datosFormulario.servicio) ? datosFormulario.servicio : [datosFormulario.servicio],
      urgency: datosFormulario.urgency || 'normal',
      warranty: datosFormulario.warranty || '30',
      descripcion: sanitizeInput(datosFormulario.mensaje).trim(),
      fechaPreferida: datosFormulario.fechaPreferida || '',
      urgencyMultiplier: datosFormulario.urgencyMultiplier || '1x',
      
      // Información de precios si está disponible
      basePrice: datosFormulario.precios?.basePrice || 0,
      urgencyPrice: datosFormulario.precios?.urgencyPrice || 0,
      warrantyPrice: datosFormulario.precios?.warrantyPrice || 0,
      totalPrice: datosFormulario.precios?.totalPrice || 0,
      
      // Metadatos
      fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
      ipAddress: 'web-form', // Seguridad: no se recopila IP del cliente
      userAgent: navigator.userAgent,
      status: 'pendiente', // Estados posibles: pendiente, contactado, completado, cancelado
      notas: '' // Campo para notas internas del negocio
    };

    // Guardar en Firestore
    const cotizacionesRef = db.collection('cotizaciones');
    const docRef = await cotizacionesRef.add(cotizacion);

    console.log('✅ Cotización guardada en Firestore con ID:', docRef.id);

    return {
      success: true,
      id: docRef.id,
      message: 'Cotización guardada correctamente'
    };

  } catch (error) {
    console.error('❌ Error al guardar cotización en Firestore:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al guardar cotización'
    };
  }
}

/**
 * Obtiene todas las cotizaciones (para panel de administrador)
 * Requiere autenticación
 */
async function obtenerCotizacionesAdmin() {
  console.log('%c🔍 obtenerCotizacionesAdmin() iniciando...', 'color: #3498db; font-weight: bold;');
  
  if (!db) {
    console.log('❌ db no existe, inicializando Firebase...');
    if (!initFirebase()) {
      console.error('❌ No se pudo inicializar Firebase');
      return { success: false, error: 'Firebase no está inicializado' };
    }
  }
  
  console.log('✅ Firebase inicializado, db =', db);

  try {
    const cotizacionesRef = db.collection('cotizaciones');
    console.log('📚 Referencia a colección "cotizaciones" creada');
    
    const snapshot = await cotizacionesRef
      .orderBy('fechaCreacion', 'desc')
      .limit(100)
      .get();

    console.log(`✅ Query completado: ${snapshot.size} documentos encontrados`);
    
    const cotizaciones = [];
    snapshot.forEach((doc) => {
      cotizaciones.push({
        id: doc.id,
        ...doc.data()
      });
      console.log(`  📄 ${doc.id}: ${doc.data().nombre}`);
    });

    console.log(`📊 Total cotizaciones cargadas: ${cotizaciones.length}`);
    return { success: true, data: cotizaciones };
  } catch (error) {
    console.error('❌ Error al obtener cotizaciones:', error);
    console.error('   Código:', error.code);
    console.error('   Mensaje:', error.message);
    console.error('   Stack:', error.stack);
    
    // Mensaje de ayuda específico
    if (error.code === 'permission-denied') {
      return { 
        success: false, 
        error: `❌ Permiso denegado. Verifica que las reglas de Firestore estén publicadas en Firebase Console.` 
      };
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza el estado de una cotización
 * Estados válidos: pendiente, contactado, completado, cancelado
 */
async function actualizarEstadoCotizacion(cotizacionId, nuevoEstado, notas = '') {
  console.log(`%c🔄 Actualizando cotización: ${cotizacionId}`, 'color: #3498db; font-weight: bold;');
  
  if (!db) {
    if (!initFirebase()) {
      return { success: false, error: 'Firebase no está inicializado' };
    }
  }

  // Validar que el nuevo estado sea válido
  const estadosValidos = ['pendiente', 'contactado', 'completado', 'cancelado'];
  if (!estadosValidos.includes(nuevoEstado)) {
    return { success: false, error: `Estado inválido: "${nuevoEstado}". Debe ser uno de: ${estadosValidos.join(', ')}` };
  }

  // Validar notas
  if (typeof notas !== 'string') {
    notas = '';
  }
  notas = sanitizeInput(notas).trim();

  try {
    const docRef = db.collection('cotizaciones').doc(cotizacionId);
    
    console.log(`  Status: ${nuevoEstado}`);
    console.log(`  Notas: ${notas ? notas.substring(0, 50) + '...' : '(vacías)'}`);
    
    await docRef.update({
      status: nuevoEstado,
      notas: notas,
      fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp(),
      ultimaActualizacionPor: 'admin-panel'
    });

    console.log(`✅ Cotización actualizada correctamente`);
    return { success: true, message: 'Estado y notas actualizados correctamente' };
  } catch (error) {
    console.error('❌ Error al actualizar cotización:', error);
    console.error('   Código:', error.code);
    console.error('   Mensaje:', error.message);
    
    if (error.code === 'not-found') {
      return { success: false, error: 'La cotización no existe en la base de datos' };
    } else if (error.code === 'permission-denied') {
      return { success: false, error: 'Permiso denegado. Verifica las reglas de Firestore.' };
    } else {
      return { success: false, error: error.message };
    }
  }
}

// ============ CONFIRMACIÓN DE CARGA ============
console.log('%c✅ firebase-config.js cargado exitosamente', 'color: #27ae60; font-weight: bold; font-size: 13px;');
console.log('📦 Funciones disponibles:', {
  'initFirebase': typeof initFirebase,
  'guardarCotizacionEnFirebase': typeof guardarCotizacionEnFirebase,
  'obtenerCotizacionesAdmin': typeof obtenerCotizacionesAdmin,
  'actualizarEstadoCotizacion': typeof actualizarEstadoCotizacion,
  'sanitizeInput': typeof sanitizeInput,
  'validateEmail': typeof validateEmail,
  'validatePhone': typeof validatePhone,
  'validateName': typeof validateName
});

// ============ EXPORTAR A WINDOW (garantizar accesibilidad global) ============
window.initFirebase = initFirebase;
window.guardarCotizacionEnFirebase = guardarCotizacionEnFirebase;
window.obtenerCotizacionesAdmin = obtenerCotizacionesAdmin;
window.actualizarEstadoCotizacion = actualizarEstadoCotizacion;
window.sanitizeInput = sanitizeInput;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validateName = validateName;

console.log('%c✅ Todas las funciones de Firebase exportadas a window (global)', 'color: #2ecc71; font-weight: bold; display: block; margin-top: 5px;');


