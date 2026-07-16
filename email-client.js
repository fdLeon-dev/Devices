/**
 * Email Client - Envia emails através de servidor Netlify (no expone Public Key)
 * 
 * En lugar de:
 *   emailjs.send(...) ← Expone Public Key en el navegador
 * 
 * Hacer:
 *   sendEmailViaServer(...) ← Llama servidor, credenciales seguras
 */

async function callEmailEndpoint(endpoint, emailData) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (parseErr) {
    payload = { error: `Respuesta no JSON (${response.status})` };
  }

  return {
    ok: response.ok,
    status: response.status,
    payload
  };
}

function mapServiceDetails(rawServices) {
  const catalog = {
    'reparacion-basica': { label: 'Reparación Básica', price: 1500 },
    'reparacion-avanzada': { label: 'Reparación Avanzada', price: 2500 },
    'upgrade-ram': { label: 'Upgrade de RAM', price: 800 },
    'upgrade-gpu': { label: 'Upgrade de GPU', price: 2000 },
    'upgrade-motherboard': { label: 'Upgrade de Motherboard', price: 1600 },
    'upgrade-ssd': { label: 'Upgrade de SSD', price: 1200 },
    'upgrade-cpu': { label: 'Upgrade de CPU', price: 2500 },
    'upgrade-completo': { label: 'Upgrade Completo', price: 3500 },
    'ensamblaje-basico': { label: 'Ensamblaje Básico', price: 1500 },
    'ensamblaje-gaming': { label: 'Ensamblaje Gaming', price: 2500 },
    'ensamblaje-personalizado': { label: 'Ensamblaje Personalizado', price: 3000 },
    'mantenimiento': { label: 'Mantenimiento', price: 1000 },
    'asesoramiento': { label: 'Asesoramiento Técnico', price: 200 },
    'soporte-remoto': { label: 'Soporte Técnico Remoto', price: 400 },
    'instalacion-software': { label: 'Instalación de Software', price: 150 },
    'instalacion-software-personalizado': { label: 'Instalación de Software Personalizado', price: 300 },
    'recuperacion-datos': { label: 'Recuperación de Datos', price: 800 },
    'recuperacion-datos-avanzada': { label: 'Recuperación de Datos Avanzada', price: 1500 },
    'configuracion-red': { label: 'Configuración de Red', price: 300 },
    'configuracion-red-avanzada': { label: 'Configuración de Red Avanzada', price: 500 },
    'limpieza-profunda': { label: 'Limpieza Profunda', price: 300 },
    'diagnostico-completo': { label: 'Diagnóstico Completo', price: 100 },
    'diagnostico-hardware': { label: 'Diagnóstico de Hardware', price: 200 },
    'optimizacion-sistema': { label: 'Optimización de Sistema', price: 350 },
    'backup-datos': { label: 'Backup de Datos', price: 200 },
    'configuracion-backup': { label: 'Configuración de Backup', price: 400 },
    'limpieza-malware': { label: 'Limpieza de Malware', price: 550 },
    'reemplazo-pantalla': { label: 'Reemplazo de Pantalla', price: 1800 },
    'instalacion-antivirus': { label: 'Instalación de Antivirus', price: 250 },
    'sistema-enfriamiento': { label: 'Sistema de Enfriamiento', price: 600 }
  };

  const serviceCodes = Array.isArray(rawServices)
    ? rawServices.map((item) => String(item || '').trim()).filter(Boolean)
    : String(rawServices || '').split(',').map((item) => item.trim()).filter(Boolean);

  return serviceCodes.map((code) => {
    const item = catalog[code];
    return {
      label: item?.label || code || 'Servicio personalizado',
      price: Number(item?.price || 0)
    };
  });
}

function getUrgencyMultiplierText(urgencyValue) {
  const multipliers = {
    normal: '1x',
    urgente: '1.3x',
    express: '1.5x'
  };
  return multipliers[urgencyValue] || '1x';
}

async function sendEmailViaServer(datosFormulario, pdfBlob = null) {
  // Rate limiting en cliente
  if (!checkRateLimit('email')) {
    console.warn('⚠️ Demasiados emails. Espera antes de intentar de nuevo.');
    return {
      success: false,
      error: 'Por favor espera antes de enviar otro email'
    };
  }

  try {
    const serviceItems = mapServiceDetails(datosFormulario.servicio);
    const servicePrice = Number(datosFormulario.precios?.basePrice || serviceItems.reduce((sum, item) => sum + item.price, 0));
    const urgencyCost = Number(datosFormulario.precios?.urgencyPrice || 0);
    const warrantyPrice = Number(datosFormulario.precios?.warrantyPrice || 0);
    const total = Number(datosFormulario.precios?.totalPrice || datosFormulario.total || (servicePrice + urgencyCost + warrantyPrice));

    // Preparar datos para enviar al servidor
    const emailData = {
      to_email: datosFormulario.email && datosFormulario.email !== 'No proporcionado' ? datosFormulario.email : 'devices.f02@gmail.com',
      userName: datosFormulario.nombre,
      userEmail: datosFormulario.email && datosFormulario.email !== 'No proporcionado' ? datosFormulario.email : 'no-reply@devices.f2',
      userPhone: datosFormulario.telefono || 'No proporcionado',
      servicesList: serviceItems.length ? serviceItems.map((item) => item.label).join(', ') : 'Servicio personalizado',
      servicesBreakdown: serviceItems.length
        ? serviceItems.map((item) => `<tr><td>${item.label}</td><td style="text-align:right;">$ ${item.price.toLocaleString('es-UY')}</td></tr>`).join('')
        : `<tr><td>Servicio personalizado</td><td style="text-align:right;">$ ${servicePrice.toLocaleString('es-UY')}</td></tr>`,
      selectedServices: serviceItems.length,
      message: datosFormulario.mensaje || '',
      problemDescription: datosFormulario.mensaje || '',
      urgencyText: datosFormulario.urgency 
        ? getUrgencyText(datosFormulario.urgency) 
        : 'Normal (3-5 días)',
      urgencyMultiplier: datosFormulario.urgencyMultiplier || getUrgencyMultiplierText(datosFormulario.urgency),
      warrantyText: datosFormulario.warranty 
        ? getWarrantyText(datosFormulario.warranty) 
        : '30 días',
      servicePrice,
      urgencyCost,
      warrantyPrice,
      total,
      preferred_date: datosFormulario.fechaPreferida || ''
    };

    console.log('📧 Enviando email via servidor seguro...');
    console.log('   📌 to_email:', emailData.to_email);
    console.log('   📌 userName:', emailData.userName);
    console.log('   📌 servicesList:', emailData.servicesList);

    // Llamar función serverless principal (EmailJS)
    const endpointUsed = '/.netlify/functions/send-email';
    const sendResult = await callEmailEndpoint(endpointUsed, emailData);

    if (!sendResult.ok) {
      const errorMessage = sendResult.payload?.error || `Error ${sendResult.status}`;
      const detailMessage = sendResult.payload?.details ? ` | ${sendResult.payload.details}` : '';
      throw new Error(`${errorMessage}${detailMessage}`);
    }

    const result = sendResult.payload || {};

    if (result.success) {
      console.log('✅ Email enviado exitosamente via servidor');
      console.log('📮 Endpoint usado:', endpointUsed);
      console.log('📎 Folio:', result.folio);
      return {
        success: true,
        response: result
      };
    } else {
      throw new Error(result.error || 'Error desconocido');
    }

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return {
      success: false,
      error: error.message || 'Error al enviar email'
    };
  }
}

/**
 * Wrapper de conveniencia para reemplazar enviarEmailCotizacion cuando no necesitas PDF
 * 
 * Cómo usarlo:
 * const result = await sendEmailSecure({
 *   nombre: 'Juan',
 *   email: 'juan@example.com',
 *   servicio: 'Reparación de laptop',
 *   mensaje: 'Mi laptop no enciende'
 * });
 */
async function sendEmailSecure(datosFormulario) {
  return sendEmailViaServer(datosFormulario, null);
}

/**
 * Utilidad: Obtener texto legible de urgencia
 * (Replicar de emailjs-config.js)
 */
function getUrgencyText(urgencyValue) {
  const urgencyTexts = {
    normal: 'Normal (3-5 días)',
    urgente: 'Urgente (24-48 horas)',
    express: 'Express (mismo día)'
  };
  return urgencyTexts[urgencyValue] || 'Normal (3-5 días)';
}

/**
 * Utilidad: Obtener texto legible de garantía
 * (Replicar de emailjs-config.js)
 */
function getWarrantyText(warrantyValue) {
  const warrantyTexts = {
    '30': '30 días',
    '90': '90 días',
    '180': '6 meses',
    '365': '1 año'
  };
  return warrantyTexts[warrantyValue] || '30 días';
}

console.log('✅ email-client.js cargado - Emails enviados via servidor seguro');
