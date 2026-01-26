#!/usr/bin/env node
// Script de prueba para verificar conexión con Firestore y testimonios

const admin = require('firebase-admin');
const fs = require('fs');

// Cargar service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testFirestoreConnection() {
  try {
    console.log('🔄 Probando conexión con Firestore...');

    // Verificar conexión básica
    const testDoc = await db.collection('testimonios').limit(1).get();
    console.log('✅ Conexión exitosa con Firestore');

    // Contar testimonios existentes
    const snapshot = await db.collection('testimonios').get();
    console.log(`📊 Testimonios existentes: ${snapshot.size}`);

    // Agregar un testimonio de prueba
    const testTestimonio = {
      nombre: 'Usuario de Prueba',
      comentario: 'Este es un testimonio de prueba para verificar la funcionalidad.',
      imagen: '',
      likes: 0,
      likedBy: [],
      fecha: admin.firestore.FieldValue.serverTimestamp(),
      aprobado: true
    };

    const docRef = await db.collection('testimonios').add(testTestimonio);
    console.log('✅ Testimonio de prueba agregado con ID:', docRef.id);

    // Verificar que se puede leer
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('✅ Testimonio leído correctamente:', doc.data().nombre);
    }

    // Limpiar: eliminar el testimonio de prueba
    await docRef.delete();
    console.log('🧹 Testimonio de prueba eliminado');

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('Los testimonios están completamente integrados con Firebase.');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

testFirestoreConnection();