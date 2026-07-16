// EmailJS configuration - Direct browser REST calls (no external SDK required)

const EMAILJS_CONFIG_ENDPOINT = '/.netlify/functions/emailjs-config-public';
let emailJsConfigPromise = null;

async function loadEmailJsConfig() {
  if (window.EMAILJS_CONFIG) {
    return window.EMAILJS_CONFIG;
  }

  if (!emailJsConfigPromise) {
    emailJsConfigPromise = fetch(EMAILJS_CONFIG_ENDPOINT)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || data.details || `Error ${response.status}`);
        }
        window.EMAILJS_CONFIG = data;
        return data;
      })
      .catch((error) => {
        emailJsConfigPromise = null;
        throw error;
      });
  }

  return emailJsConfigPromise;
}

function initEmailJS() {
  loadEmailJsConfig()
    .then(() => console.log('✅ EmailJS config cargada (REST browser mode)'))
    .catch((err) => console.warn('⚠️ No se pudo precargar EmailJS config:', err.message));
  return true;
}

function getServiceCatalog() {
  return {
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
}

function getUrgencyMultiplierText(urgencyValue) {
  const multipliers = {
    normal: '1x',
    urgente: '1.3x',
    express: '1.5x'
  };
  return multipliers[urgencyValue] || '1x';
}

function currency(value) {
  return Number(value || 0).toLocaleString('es-UY');
}

function toServiceCodes(rawService) {
  if (Array.isArray(rawService)) {
    return rawService.map((item) => String(item || '').trim()).filter(Boolean);
  }
  return String(rawService || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildServiceBreakdown(datosFormulario) {
  const catalog = getServiceCatalog();
  const serviceCodes = toServiceCodes(datosFormulario.servicio);
  const items = serviceCodes.map((code) => {
    const item = catalog[code];
    return {
      code,
      label: item?.label || code || 'Servicio personalizado',
      price: Number(item?.price || 0)
    };
  });

  const fallbackBase = Number(datosFormulario.precios?.basePrice || 0);
  const subtotal = items.reduce((sum, item) => sum + item.price, 0) || fallbackBase;
  const urgencyCost = Number(datosFormulario.precios?.urgencyPrice || 0);
  const warrantyPrice = Number(datosFormulario.precios?.warrantyPrice || 0);
  const total = Number(datosFormulario.precios?.totalPrice || datosFormulario.total || (subtotal + urgencyCost + warrantyPrice));

  const servicesBreakdown = items.length
    ? items
      .map((item) => `<tr><td>${item.label}</td><td style="text-align:right;">$ ${currency(item.price)}</td></tr>`)
      .join('')
    : `<tr><td>Servicio personalizado</td><td style="text-align:right;">$ ${currency(subtotal)}</td></tr>`;

  return {
    servicesList: items.length ? items.map((item) => item.label).join(', ') : 'Servicio personalizado',
    servicesBreakdown,
    servicePrice: subtotal,
    urgencyCost,
    warrantyPrice,
    total
  };
}

async function enviarEmailCotizacion(datosFormulario) {

  try {
    const { serviceId, templateId, publicKey } = await loadEmailJsConfig();

    // Prepare template parameters
    const folio = 'COT-' + Math.floor(Math.random() * 900000 + 100000);
    const breakdown = buildServiceBreakdown(datosFormulario);
    const templateParams = {
      to_email: datosFormulario.email || 'devices.f02@gmail.com',
      userName: datosFormulario.nombre,
      userEmail: datosFormulario.email || 'no-reply@devices.f2',
      userPhone: datosFormulario.telefono || 'No proporcionado',
      servicesList: breakdown.servicesList,
      servicesBreakdown: breakdown.servicesBreakdown,
      selectedServices: toServiceCodes(datosFormulario.servicio).length,
      message: datosFormulario.mensaje || '',
      problemDescription: datosFormulario.mensaje || '',
      urgencyText: datosFormulario.urgency 
        ? getUrgencyText(datosFormulario.urgency) 
        : 'Normal (3-5 días)',
      urgencyMultiplier: datosFormulario.urgencyMultiplier || getUrgencyMultiplierText(datosFormulario.urgency),
      warrantyText: datosFormulario.warranty 
        ? getWarrantyText(datosFormulario.warranty) 
        : '30 días',
      servicePrice: breakdown.servicePrice,
      urgencyCost: breakdown.urgencyCost,
      warrantyPrice: breakdown.warrantyPrice,
      total: breakdown.total,
      preferred_date: datosFormulario.fechaPreferida || '',
      currentDate: new Date().toLocaleDateString('es-ES'),
      folio: folio,
      reply_to: datosFormulario.email || 'devices.f02@gmail.com'
    };

    console.log('📧 Enviando email directo via EmailJS REST (browser)...');
    console.log('   📌 to_email:', templateParams.to_email);
    console.log('   📌 folio:', folio);

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS error ${response.status}: ${errorText}`);
    }

    console.log('✅ Email enviado exitosamente via EmailJS REST');
    console.log('📮 Folio:', folio);

    return {
      success: true,
      response: {
        success: true,
        folio: folio,
        method: 'emailjs-rest-browser'
      }
    };

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    
    // Parse EmailJS error responses
    let errorMessage = error.message || 'Error desconocido';
    if (error.text) {
      errorMessage = error.text;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

console.log('emailjs-config.js: Enviando directamente desde navegador (EmailJS API browser)');

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { enviarEmailCotizacion };
}
