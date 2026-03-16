// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const quoteForm = document.getElementById('quote-form');
const currentYear = document.getElementById('current-year');

// Note: EmailJS is the primary email delivery method. Webhook support removed.

// New elements for enhanced features
const testimonialPrev = document.getElementById('testimonial-prev');
const testimonialNext = document.getElementById('testimonial-next');
const testimonialDots = document.querySelectorAll('.dot');
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards = document.querySelectorAll('.work-card');
const statNumbers = document.querySelectorAll('.stat-number');

// Global variables for quiz editor
let currentQuiz = [];

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
});

function showDebugBanner(message, level = 'info') {
  // Create or update a small banner at top-right for quick debugging
  let banner = document.getElementById('debug-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'debug-banner';
    banner.style.position = 'fixed';
    banner.style.top = '12px';
    banner.style.right = '12px';
    banner.style.padding = '8px 12px';
    banner.style.borderRadius = '8px';
    banner.style.zIndex = 9999;
    banner.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    banner.style.fontSize = '0.9rem';
    document.body.appendChild(banner);
  }
  banner.style.background = level === 'error' ? 'rgba(220,94,94,0.95)' : 'rgba(50,150,220,0.95)';
  banner.style.color = 'white';
  banner.textContent = message;

  // Auto-hide after a while
  clearTimeout(banner._hideTimer);
  banner._hideTimer = setTimeout(() => {
    try { banner.remove(); } catch (e) {}
  }, 5000);
}

function showToast(message, type = 'info', timeout = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span class="msg">${message}</span><button class="close" aria-label="Cerrar">×</button>`;

  const closeBtn = toast.querySelector('.close');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  // Auto remove
  toast._timer = setTimeout(() => {
    try { toast.remove(); } catch (e) {}
  }, timeout);
}

// Helper: create an SVG icon element from the inline sprite
function createIconSVG(name, classes = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class', ('icon icon-' + name + ' ' + classes).trim());
  svg.setAttribute('aria-hidden','true');
  const use = document.createElementNS('http://www.w3.org/2000/svg','use');
  use.setAttribute('href', '#i-' + name);
  svg.appendChild(use);
  return svg;
}

function numberToSpanishWords(num) {
  const unidades = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];
  const especiales = ['diez','once','doce','trece','catorce','quince','dieciseis','diecisiete','dieciocho','diecinueve'];
  const decenas = ['','','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];

  if (num < 10) return unidades[num];
  if (num < 20) return especiales[num - 10];
  if (num < 100) {
    const d = Math.floor(num/10);
    const r = num%10;
    if (r === 0) return decenas[d];
    if (d === 2) return 'veinti' + unidades[r];
    return decenas[d] + ' y ' + unidades[r];
  }
  if (num < 1000) {
    const c = Math.floor(num/100);
    const r = num%100;
    let texto = c === 1 ? 'cien' : (c === 5 ? 'quinientos' : (c === 7 ? 'setecientos' : (c === 9 ? 'novecientos' : (c === 3 ? 'trescientos' : (c === 4 ? 'cuatrocientos' : (c === 6 ? 'seiscientos' : c + 'cientos'))))));
    if (c === 1 && r > 0) texto = 'ciento';
    if (!r) return texto;
    return texto + ' ' + numberToSpanishWords(r);
  }
  if (num < 1000000) {
    const miles = Math.floor(num / 1000);
    const resto = num % 1000;
    let texto = (miles === 1 ? 'mil' : numberToSpanishWords(miles) + ' mil');
    if (!resto) return texto;
    return texto + ' ' + numberToSpanishWords(resto);
  }
  return num.toString();
}

function initializeApp() {
  // quick sign that script ran
  try { console.log('%c[DEV] script.js loaded', 'color: #6A4CDB; font-weight: bold;'); } catch (e) {}

  // Set current year
  try {
    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }
  } catch (e) { console.error('Error setting year', e); showDebugBanner('Error setting year: ' + e.message, 'error'); }

  // Initialize theme
  try { initializeTheme(); } catch (e) { console.error('initializeTheme failed', e); showDebugBanner('Theme init error: ' + e.message, 'error'); }

  // Initialize lazy loading
  try { initializeLazyLoading(); } catch (e) { console.error('initializeLazyLoading failed', e); showDebugBanner('Lazy load error: ' + e.message, 'error'); }

  // Initialize smooth scrolling
  try { initializeSmoothScrolling(); } catch (e) { console.error('initializeSmoothScrolling failed', e); showDebugBanner('Smooth scroll error: ' + e.message, 'error'); }

  // Initialize EmailJS
  try { if (typeof initEmailJS !== 'undefined') { initEmailJS(); } } catch (e) { console.error('initEmailJS failed', e); showDebugBanner('EmailJS init error: ' + e.message, 'error'); }

  // Initialize form handling
  try { initializeFormHandling(); } catch (e) { console.error('initializeFormHandling failed', e); showDebugBanner('Form init error: ' + e.message, 'error'); }

  // Initialize mobile menu
  try { initializeMobileMenu(); } catch (e) { console.error('initializeMobileMenu failed', e); showDebugBanner('Menu init error: ' + e.message, 'error'); }

  // Initialize navbar scroll effect
  try { initializeNavbarScroll(); } catch (e) { console.error('initializeNavbarScroll failed', e); showDebugBanner('Navbar init error: ' + e.message, 'error'); }

  // Initialize footer visibility (DISABLED: Footer is now always visible)
  // try { initializeFooterVisibility(); } catch (e) { console.error('initializeFooterVisibility failed', e); showDebugBanner('Footer visibility error: ' + e.message, 'error'); }

  // Initialize new features
  try { initializeTestimonials(); } catch (e) { console.error('initializeTestimonials failed', e); showDebugBanner('Testimonials init error: ' + e.message, 'error'); }
  try { initializeCalculator(); } catch (e) { console.error('initializeCalculator failed', e); showDebugBanner('Calculator init error: ' + e.message, 'error'); }
  try { initializeWorkFilters(); } catch (e) { console.error('initializeWorkFilters failed', e); showDebugBanner('Work filters init error: ' + e.message, 'error'); }
  try { initializeStats(); } catch (e) { console.error('initializeStats failed', e); showDebugBanner('Stats init error: ' + e.message, 'error'); }

  // Initialize AI assistant & smart suggestions
  try { initializeAIAssistant(); } catch (e) { console.error('initializeAIAssistant failed', e); showDebugBanner('AI assistant error: ' + e.message, 'error'); }
  try { initializeSuggestService(); } catch (e) { console.error('initializeSuggestService failed', e); showDebugBanner('Suggest service error: ' + e.message, 'error'); }
  // Dev helper removed: registerSWForceButton() intentionally omitted

}

// (Brand icons are now embedded in the sprite to avoid runtime fetching.)

// Theme Toggle
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  if (theme === 'dark') {
    themeToggle.innerHTML = '<svg class="icon icon-sun" aria-hidden="true"><use href="#i-sun"></use></svg>'; 
  } else {
    themeToggle.innerHTML = '<svg class="icon icon-moon" aria-hidden="true"><use href="#i-moon"></use></svg>'; 
  }
}

// Lazy Loading
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => {
      img.classList.add('lazy');
      imageObserver.observe(img);
    });
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.classList.add('loaded');
    });
  }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 75; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// Función para calcular precios de la cotización
function calcularPrecios(servicio, urgency, warranty) {
  // Precios base por servicio (en pesos uruguayos)
  const preciosBase = {
    reparacion: 1500,
    'reparacion-basica': 1500,
    'reparacion-avanzada': 2500,
    upgrade: 2000,
    'upgrade-ram': 800,
    'upgrade-gpu': 2000,
    'upgrade-completo': 3500,
    ensamblaje: 2500,
    'ensamblaje-basico': 1500,
    'ensamblaje-gaming': 2500,
    mantenimiento: 1000,
    'limpieza-profunda': 300,
    'configuracion-red': 300,
    'instalacion-software': 150,
    'recuperacion-datos': 800,
    asesoramiento: 200,
    'soporte-remoto': 400,
    'diagnostico-completo': 100,
    'optimizacion-sistema': 350,
    'backup-datos': 200,
    'limpieza-malware': 550,
    'reemplazo-pantalla': 1800,
    'instalacion-antivirus': 250,
    otro: 1800
  };

  const servicios = Array.isArray(servicio) ? servicio : [servicio];
  const basePrice = servicios.reduce((total, serv) => {
    const normalized = (serv || '').trim();
    return total + (preciosBase[normalized] || preciosBase.otro);
  }, 0);

  // Recargos por urgencia
  const recargosUrgencia = {
    normal: 0,
    urgente: basePrice * 0.3, // 30% extra
    express: basePrice * 0.5  // 50% extra
  };

  const urgencyPrice = recargosUrgencia[urgency] || 0;

  // Recargos por garantía extendida (por día adicional)
  const diasBase = 30;
  const diasSeleccionados = parseInt(warranty) || 30;
  const diasExtra = Math.max(0, diasSeleccionados - diasBase);
  const costoPorDiaExtra = basePrice * 0.005; // 0.5% del precio base por día
  const warrantyPrice = diasExtra * costoPorDiaExtra;

  const totalPrice = basePrice + urgencyPrice + warrantyPrice;

  return {
    basePrice,
    urgencyPrice,
    warrantyPrice,
    totalPrice
  };
}

// Helper functions for form data processing
function getUrgencyText(urgencyValue) {
  const urgencyTexts = {
    normal: 'Normal (3-5 días)',
    urgente: 'Urgente (24-48 horas)',
    express: 'Express (mismo día)'
  };
  return urgencyTexts[urgencyValue] || 'Normal (3-5 días)';
}

function getWarrantyText(warrantyValue) {
  const warrantyTexts = {
    '30': '30 días',
    '90': '90 días',
    '180': '6 meses',
    '365': '1 año'
  };
  return warrantyTexts[warrantyValue] || '30 días';
}

function getUrgencyMultiplier(urgencyValue) {
  const multipliers = {
    normal: 1,
    urgente: 1.3,
    express: 1.5
  };
  return multipliers[urgencyValue] || 1;
}

function getQuoteFormPdfData() {
  if (!quoteForm) return null;
  const formData = new FormData(quoteForm);
  const services = formData.getAll('service').filter(v => v && v.trim() !== '');
  const urgency = formData.get('urgency') || 'normal';
  const warranty = formData.get('warranty') || '30';
  const message = formData.get('message') || '';

  const prices = calcularPrecios(services, urgency, warranty);
  const urgencyText = getUrgencyText(urgency);
  const warrantyText = getWarrantyText(warranty);

  return {
    userName: formData.get('name') || 'Cliente Web',
    userEmail: formData.get('email') || 'no proporcionado',
    userPhone: formData.get('phone') || 'no proporcionado',
    servicios: services.map(s => ({ name: s, price: calcularPrecios(s, urgency, warranty).basePrice })),
    urgency: urgencyText,
    warranty: warrantyText,
    basePrice: prices.basePrice,
    urgencyPrice: prices.urgencyPrice,
    warrantyPrice: prices.warrantyPrice,
    totalPrice: prices.totalPrice,
    descripcion: message
  };
}

function sourceQuoteFormData(){
  if (!quoteForm) return null;
  const formData = new FormData(quoteForm);
  return {
    name: formData.get('name') || '',
    email: formData.get('email') || '',
    phone: formData.get('phone') || '',
    service: formData.getAll('service') || [],
    urgency: formData.get('urgency') || 'normal',
    warranty: formData.get('warranty') || '30',
    preferredDate: formData.get('preferred-date') || '',
    message: formData.get('message') || ''
  };
}

function restoreQuoteFormData(saved) {
  if (!saved || !quoteForm) return;

  quoteForm.querySelector('#name').value = saved.name || '';
  quoteForm.querySelector('#email').value = saved.email || '';
  quoteForm.querySelector('#phone').value = saved.phone || '';

  const serviceSelect = quoteForm.querySelector('#service');
  if (serviceSelect) {
    const selectedServices = saved.service || [];
    Array.from(serviceSelect.options).forEach(opt => {
      opt.selected = selectedServices.includes(opt.value);
    });
  }

  quoteForm.querySelector('#urgency').value = saved.urgency || 'normal';
  quoteForm.querySelector('#warranty').value = saved.warranty || '30';
  quoteForm.querySelector('#preferred-date').value = saved.preferredDate || '';
  quoteForm.querySelector('#message').value = saved.message || '';
}

function saveQuoteFormDraft() {
  const data = sourceQuoteFormData();
  if (!data) return;
  localStorage.setItem('quoteFormDraft', JSON.stringify(data));
}

function loadQuoteFormDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem('quoteFormDraft'));
    if (saved) {
      restoreQuoteFormData(saved);
    }
  } catch (e) {
    console.warn('No se pudo cargar borrador de cotización', e);
  }
}

function updateQuoteFormTotal() {
  const data = sourceQuoteFormData();
  if (!data) return;

  const prices = calcularPrecios(data.service, data.urgency, data.warranty);
  const totalEl = document.getElementById('quote-form-total');
  if (totalEl) {
    totalEl.textContent = `$${(prices.totalPrice || 0).toLocaleString('es-UY')}`;
  }
}


function downloadQuoteFormPdf() {
  const datosFactura = getQuoteFormPdfData();
  if (!datosFactura) {
    showNotification('No se pudo generar PDF: datos incompletos.', 'error');
    return;
  }
  generarPdfCotizacion(datosFactura).then(pdfDataUrl => {
    const link = document.createElement('a');
    link.href = pdfDataUrl;
    link.download = `cotizacion_form_${new Date().toISOString().slice(0,10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showNotification('Factura PDF descargada.', 'success');
  }).catch(error => {
    console.error('Error generando PDF de cotización desde form:', error);
    showNotification('Error generando PDF. Intenta nuevamente.', 'error');
  });
}

// Form Handling
function initializeFormHandling() {
  if (quoteForm) {
    quoteForm.addEventListener('submit', handleFormSubmit);

    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
      // Crear sistema de selección múltiple personalizado
      createCustomMultiSelect(serviceSelect);
    }

    quoteForm.addEventListener('change', () => {
      updateQuoteFormTotal();
    });

    updateQuoteFormTotal();

    // Inicializar validación en tiempo real
    initializeRealTimeValidation();

    // Establecer fecha mínima para el campo de fecha preferida (mañana)
    const preferredDateInput = document.getElementById('preferred-date');
    if (preferredDateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      preferredDateInput.min = `${year}-${month}-${day}`;
    }

    // Inicializar validación en tiempo real
    initializeRealTimeValidation();
  }
}

// -----------------------------
// AI Assistant (mock) + Suggest Service
// -----------------------------
function initializeAIAssistant() {
  let aiOpen = document.getElementById('ai-open');
  const aiModal = document.getElementById('ai-modal');
  const aiClose = document.getElementById('ai-close');
  const aiSend = document.getElementById('ai-send');
  const aiPrompt = document.getElementById('ai-prompt');
  const aiChat = document.getElementById('ai-chat');
  const quickBtns = document.querySelectorAll('.ai-quick-btn');
  const aiFallback = document.getElementById('ai-fallback');

  // If the main AI button or modal is missing due to blocking, create a visible fallback
  if (!aiOpen) {
    showDebugBanner('AI button missing — creating fallback', 'info');
    aiOpen = aiFallback;
    if (aiFallback) aiFallback.style.display = 'inline-flex';
  }

  if (!aiModal) { showDebugBanner('AI modal missing - assistant disabled', 'error'); return; }

  function openAI() {
    aiModal.setAttribute('aria-hidden', 'false');
    aiPrompt.focus();
    appendBotMessage('Hola! Soy el asistente. Contame el problema y te sugiero el mejor servicio.');
  }

  function closeAI() {
    aiModal.setAttribute('aria-hidden', 'true');
  }

  aiOpen.addEventListener('click', openAI);
  aiClose.addEventListener('click', closeAI);
  aiModal.addEventListener('click', (e) => {
    if (e.target === aiModal) closeAI();
  });

  aiSend.addEventListener('click', async () => {
    const text = aiPrompt.value.trim();
    if (!text) return;
    appendUserMessage(text);
    aiPrompt.value = '';
    const loadingId = appendBotMessage('Pensando...');
    const response = await mockAIResponse(text);
    replaceBotMessage(loadingId, response.text);

    // If AI returns suggestions, render them
    if (response.suggestions && response.suggestions.length) {
      response.suggestions.forEach(s => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = s.label;
        chip.addEventListener('click', () => {
          selectServiceByValue(s.value);
          // close AI after selection for workflow simplicity
          closeAI();
        });
        aiChat.appendChild(chip);
      });
      aiChat.scrollTop = aiChat.scrollHeight;
    }
  });

  quickBtns.forEach(b => b.addEventListener('click', () => {
    aiPrompt.value = b.textContent;
    aiSend.click();
  }));

  // Share via WhatsApp and copy handlers
  const aiWhats = document.getElementById('ai-whatsapp');
  const aiCopy = document.getElementById('ai-copy');

  function buildConversationText() {
    const nodes = Array.from(aiChat.querySelectorAll('.ai-message'));
    const lines = nodes.map(n => {
      if (n.classList.contains('user')) return 'Cliente: ' + n.textContent;
      return 'Asistente: ' + n.textContent;
    });
    // Include selected services if present (select multiple)
    const serviceSelect = document.getElementById('service-type');
    if (serviceSelect && serviceSelect.selectedOptions.length > 0) {
      const selectedServices = Array.from(serviceSelect.selectedOptions).map(opt => opt.textContent);
      lines.unshift('Servicios seleccionados: ' + selectedServices.join(', '));
    }
    return lines.join('\n');
  }

  function sendToWhatsApp(text) {
    const base = 'https://wa.me/59892803418?text=';
    const url = base + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  if (aiWhats) {
    aiWhats.addEventListener('click', () => {
      const txt = buildConversationText();
      if (!txt) { showToast('No hay mensajes para enviar.', 'error'); return; }
      sendToWhatsApp(txt);
    });
  }

  if (aiCopy) {
    aiCopy.addEventListener('click', async () => {
      const txt = buildConversationText();
      if (!txt) { showToast('No hay mensajes para copiar.', 'error'); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(txt);
        showToast('Conversación copiada', 'success');
      } else {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
        showToast('Conversación copiada', 'success');
      }
    });
  }

  function appendUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'ai-message user';

    // user avatar (generic person icon) next to message
    const icon = createIconSVG('user');
    icon.setAttribute('width','20');
    icon.setAttribute('height','20');
    icon.classList.add('ai-avatar');

    const span = document.createElement('span');
    span.textContent = text;

    div.appendChild(span);
    div.appendChild(icon);

    aiChat.appendChild(div);
    aiChat.scrollTop = aiChat.scrollHeight;
  }

  function appendBotMessage(text) {
    const id = 'bot-' + Math.random().toString(36).slice(2, 9);
    const div = document.createElement('div');
    div.className = 'ai-message bot';
    div.id = id;

    // bot avatar (robot image) on the left
    const icon = document.createElement('img');
    icon.src = 'public/images/icons/robot.png';
    icon.alt = 'Asistente Virtual';
    icon.classList.add('ai-avatar', 'icon-robot-img');

    const span = document.createElement('span');
    span.textContent = text;

    div.appendChild(icon);
    div.appendChild(span);

    aiChat.appendChild(div);
    aiChat.scrollTop = aiChat.scrollHeight;
    return id;
  }

  function replaceBotMessage(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  async function mockAIResponse(text) {
    // Very simple rule-based mock. Replace with API call as needed.
    const normalized = text.toLowerCase();
    const suggestions = [];
    let reply = 'Gracias. Voy a revisar, te recomiendo traer la PC para diagnóstico.';

    if (/pantalla|monitor|parpadea|falla|imagen/.test(normalized)) {
      suggestions.push({ label: 'Diagnóstico Completo', value: 'diagnostico-completo' });
      reply = 'Parece un problema de pantalla o GPU. Te sugiero un diagnóstico completo y revisión de la GPU.';
    } else if (/no enciende|no arranca|pitidos|beep/.test(normalized)) {
      suggestions.push({ label: 'Diagnóstico Completo', value: 'diagnostico-completo' });
      suggestions.push({ label: 'Reparación Básica', value: 'reparacion-basica' });
      reply = 'Los pitidos o la falta de arranque suelen indicar problemas de hardware (PSU, RAM, placa). Recomendado diagnóstico.';
    } else if (/lent|lento|reinicia|calentamiento/.test(normalized)) {
      suggestions.push({ label: 'Optimización de Sistema', value: 'optimizacion-sistema' });
      suggestions.push({ label: 'Mantenimiento', value: 'mantenimiento' });
      reply = 'Puede ser un problema de software o temperatura. Puedo sugerir optimización y limpieza.';
    } else if (/recuperacion|datos|disco|hdd|ssd/.test(normalized)) {
      suggestions.push({ label: 'Recuperación de Datos', value: 'recuperacion-datos' });
      reply = 'Si hay pérdida de datos podemos intentar recuperación; traenos el disco para evaluación.';
    }

    // Simulate latency
    await new Promise(r => setTimeout(r, 700));
    return { text: reply, suggestions };
  }
}

function initializeSuggestService() {
  const btnSuggest = document.getElementById('btn-suggest-service');
  const problemInput = document.getElementById('problem-description');
  const suggestionsContainer = document.getElementById('service-suggestions');
  const serviceList = document.getElementById('service-type');

  if (!btnSuggest || !problemInput || !suggestionsContainer || !serviceList) return;

  btnSuggest.addEventListener('click', () => {
    const text = problemInput.value.trim().toLowerCase();
    if (!text) {
      suggestionsContainer.innerHTML = '<span class="suggestion-chip">Describe el problema para sugerir</span>';
      return;
    }
    const results = suggestServicesFromText(text);
    suggestionsContainer.innerHTML = '';

    results.forEach(s => {
      const chip = document.createElement('button');
      chip.className = 'suggestion-chip';
      chip.type = 'button';
      chip.textContent = s.label;
      chip.addEventListener('click', () => {
        selectServiceByValue(s.value);
        suggestionsContainer.innerHTML = '';
      });
      suggestionsContainer.appendChild(chip);
    });
  });

  // previously there were helper functions to render a "selected service" chip using
  // the <select> element; since we now use checkboxes those were no longer needed.
  // selection is visible directly via the checkboxes.

  function suggestServicesFromText(text) {
    const items = [];
    if (/pantalla|monitor|parpadea|imagen/.test(text)) items.push({ label: 'Diagnóstico Completo', value: 'diagnostico-completo' });
    if (/no enciende|no arranca|pitidos|beep/.test(text)) items.push({ label: 'Diagnóstico Completo', value: 'diagnostico-completo' });
    if (/lent|lento|reinicia|calentamiento/.test(text)) items.push({ label: 'Optimización de Sistema', value: 'optimizacion-sistema' });
    if (/sdd|hdd|disco|datos|recuperaci/.test(text)) items.push({ label: 'Recuperación de Datos', value: 'recuperacion-datos' });
    if (/ram|memoria/.test(text)) items.push({ label: 'Upgrade de RAM', value: 'upgrade-ram' });
    if (items.length === 0) items.push({ label: 'Diagnóstico Completo', value: 'diagnostico-completo' });
    return items;
  }
}

function selectServiceByValue(value) {
  // seleccionar la opción correspondiente en el select múltiple
  const select = document.getElementById('service-type');
  if (!select) return;

  const option = select.querySelector(`option[value="${value}"]`);
  if (!option) return;

  option.selected = true;
  select.dispatchEvent(new Event('change'));

  // Actualizar la interfaz visual del sistema personalizado
  const customOption = select.parentElement?.querySelector(`.custom-option[data-value="${value}"]`);
  if (customOption) {
    customOption.classList.add('selected');
    customOption.style.background = '#e6d6ff';
    customOption.style.color = '#6a0dad';
    customOption.style.fontWeight = '600';
    customOption.style.border = '2px solid #8a2be2';
  }

  // hacer scroll para que sea visible
  select.scrollIntoView({ block: 'center', behavior: 'smooth' });

  // animación de highlight (agregar clase CSS si existe)
  if (customOption) {
    customOption.classList.add('highlighted');
    setTimeout(() => customOption.classList.remove('highlighted'), 900);
  }
}

// Función para crear un sistema de selección múltiple personalizado
function createCustomMultiSelect(selectElement) {
  if (!selectElement || selectElement.dataset.customMultiSelect) return;

  // Marcar como ya procesado
  selectElement.dataset.customMultiSelect = 'true';

  // Crear contenedor personalizado
  const container = document.createElement('div');
  container.className = 'custom-multi-select';
  container.style.cssText = `
    position: relative;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    max-height: 220px;
    overflow-y: auto;
  `;

  // Crear lista de opciones
  const optionsList = document.createElement('div');
  optionsList.className = 'custom-options-list';
  optionsList.style.cssText = `
    padding: 8px;
  `;

  // Convertir cada opción en un elemento clicable
  Array.from(selectElement.options).forEach(option => {
    const optionDiv = document.createElement('div');
    optionDiv.className = `custom-option ${option.selected ? 'selected' : ''}`;
    optionDiv.dataset.value = option.value;
    optionDiv.textContent = option.textContent;
    optionDiv.style.cssText = `
      padding: 8px 12px;
      margin: 2px 0;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: ${option.selected ? '#e6d6ff' : '#f8f9fa'};
      color: ${option.selected ? '#6a0dad' : '#333'};
      font-weight: ${option.selected ? '600' : 'normal'};
      border: 2px solid ${option.selected ? '#8a2be2' : 'transparent'};
    `;

    optionDiv.addEventListener('click', () => {
      option.selected = !option.selected;
      optionDiv.classList.toggle('selected');

      // Actualizar estilos
      if (option.selected) {
        optionDiv.style.background = '#e6d6ff';
        optionDiv.style.color = '#6a0dad';
        optionDiv.style.fontWeight = '600';
        optionDiv.style.borderColor = '#8a2be2';
      } else {
        optionDiv.style.background = '#f8f9fa';
        optionDiv.style.color = '#333';
        optionDiv.style.fontWeight = 'normal';
        optionDiv.style.borderColor = 'transparent';
      }

      // Disparar evento change
      const changeEvent = new Event('change', { bubbles: true });
      selectElement.dispatchEvent(changeEvent);
    });

    optionDiv.addEventListener('mouseenter', () => {
      if (!optionDiv.classList.contains('selected')) {
        optionDiv.style.background = '#f0f0f0';
      }
    });

    optionDiv.addEventListener('mouseleave', () => {
      if (!optionDiv.classList.contains('selected')) {
        optionDiv.style.background = '#f8f9fa';
      }
    });

    optionsList.appendChild(optionDiv);
  });

  container.appendChild(optionsList);

  // Reemplazar el select con el contenedor personalizado
  selectElement.parentNode.insertBefore(container, selectElement);
  selectElement.style.display = 'none';

  // Mantener referencia para actualizaciones futuras
  selectElement.customContainer = container;
}

// Función para actualizar la visualización de opciones seleccionadas
function updateSelectedOptionsVisual(selectElement) {
  if (!selectElement) return;

  // Si tiene contenedor personalizado, actualizarlo
  if (selectElement.customContainer) {
    const customOptions = selectElement.customContainer.querySelectorAll('.custom-option');
    Array.from(selectElement.options).forEach((option, index) => {
      const customOption = customOptions[index];
      if (customOption) {
        if (option.selected) {
          customOption.classList.add('selected');
          customOption.style.background = '#e6d6ff';
          customOption.style.color = '#6a0dad';
          customOption.style.fontWeight = '600';
          customOption.style.borderColor = '#8a2be2';
        } else {
          customOption.classList.remove('selected');
          customOption.style.background = '#f8f9fa';
          customOption.style.color = '#333';
          customOption.style.fontWeight = 'normal';
          customOption.style.borderColor = 'transparent';
        }
      }
    });
  } else {
    // Fallback para el sistema original
    const options = selectElement.querySelectorAll('option');
    options.forEach(option => {
      if (option.selected) {
        option.classList.add('selected-option');
      } else {
        option.classList.remove('selected-option');
      }
    });
  }
}

// Función para sugerir una fecha de cita (próximo día hábil)
function sugerirFechaCita() {
  const hoy = new Date();
  let fechaSugerida = new Date(hoy);

  // Avanzar al próximo día hábil (lunes a viernes)
  do {
    fechaSugerida.setDate(fechaSugerida.getDate() + 1);
  } while (fechaSugerida.getDay() === 0 || fechaSugerida.getDay() === 6); // 0 = domingo, 6 = sábado

  // Formatear como YYYY-MM-DD
  const year = fechaSugerida.getFullYear();
  const month = String(fechaSugerida.getMonth() + 1).padStart(2, '0');
  const day = String(fechaSugerida.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(quoteForm);
  // Just in case, ensure multi select service is reflected in data object
  const servicioSeleccionado = formData.getAll('service').filter(v => v && v.trim() !== '');

  const data = {
    nombre: formData.get('name'),
    email: formData.get('email'),
    telefono: formData.get('phone'),
    servicio: servicioSeleccionado,
    urgency: formData.get('urgency') || 'normal',
    warranty: formData.get('warranty') || '30',
    mensaje: formData.get('message'),
    fechaPreferida: formData.get('preferred-date')
  };

  // Validación básica - campos obligatorios
  if (!data.nombre || !data.nombre.trim()) {
    showNotification('Por favor ingresa tu nombre completo', 'error');
    document.getElementById('name').focus();
    return;
  }

  if (!data.servicio || !data.servicio.length) {
    showNotification('Por favor selecciona al menos un servicio', 'error');
    document.getElementById('service').focus();
    return;
  }

  if (!data.mensaje || !data.mensaje.trim()) {
    showNotification('Por favor describe tu problema o necesidad', 'error');
    document.getElementById('message').focus();
    return;
  }

  // Validación: al menos email O teléfono
  const tieneEmail = data.email && data.email.trim() !== '';
  const tieneTelefono = data.telefono && data.telefono.trim() !== '';

  if (!tieneEmail && !tieneTelefono) {
    showNotification('Por favor proporciona al menos un correo electrónico o teléfono para contactarte', 'error');
    highlightContactFields();
    return;
  }

  // Validación de formato de email si se proporcionó
  if (tieneEmail && !isValidEmail(data.email.trim())) {
    showNotification('Por favor ingresa un correo electrónico válido', 'error');
    document.getElementById('email').focus();
    return;
  }

  // Validación de formato de teléfono si se proporcionó
  if (tieneTelefono && !isValidPhone(data.telefono.trim())) {
    showNotification('Por favor ingresa un número de teléfono válido (ej: 099 XXX XXX)', 'error');
    document.getElementById('phone').focus();
    return;
  }

  // Limpiar valores vacíos
  data.email = tieneEmail ? data.email.trim() : 'No proporcionado';
  data.telefono = tieneTelefono ? data.telefono.trim() : 'No proporcionado';

  // Calcular precios usando los valores reales del formulario
  const precios = calcularPrecios(data.servicio, data.urgency, data.warranty); // ahora `servicio` puede ser array

  // Sugerir fecha de cita si no se proporcionó
  if (!data.fechaPreferida || data.fechaPreferida.trim() === '') {
    data.fechaPreferida = sugerirFechaCita();
  }

  // Agregar campos adicionales para el template completo de EmailJS
  data.urgencyMultiplier = `${getUrgencyMultiplier(data.urgency)}x`;
  data.precios = precios;

  // Show loading state
  const submitBtn = quoteForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="loading"></span> Procesando cotización...';
  submitBtn.disabled = true;
  submitBtn.disabled = true;

  try {
    console.log('typeof enviarEmailCotizacion =', typeof enviarEmailCotizacion);
    const emailResult = await enviarEmailCotizacion(data, null); // Enviar email sin PDF primero
    console.log('emailResult recibido:', emailResult);

    if (emailResult.success) {
      // 1. Generar PDF de la cotización usando los datos del formulario
      const datosFactura = {
        userName: data.nombre,
        userEmail: data.email,
        userPhone: data.telefono,
        servicios: data.servicio ? [data.servicio] : ['Servicio personalizado'],
        urgency: getUrgencyText(data.urgency),
        warranty: getWarrantyText(data.warranty),
        basePrice: precios.basePrice,
        urgencyPrice: precios.urgencyPrice,
        warrantyPrice: precios.warrantyPrice,
        totalPrice: precios.totalPrice,
        descripcion: data.mensaje || ''
      };

      let pdfDataUrl = null;
      try {
        pdfDataUrl = await generarPdfCotizacion(datosFactura);

        // Descargar PDF automáticamente
        if (pdfDataUrl) {
          const link = document.createElement('a');
          link.href = pdfDataUrl;
          link.download = `cotizacion_form_${new Date().toISOString().slice(0,10)}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          console.log('✅ PDF descargado automáticamente');
        }

        // Enviar PDF por webhook después de generado
        if (pdfDataUrl) {
          console.log('📎 Enviando PDF generado por webhook...');
          (async () => {
            try {
              const webhookResult = await enviarPdfPorWebhook(data, pdfDataUrl);
              console.log('✅ PDF enviado por webhook:', webhookResult);
            } catch (webhookErr) {
              console.warn('⚠️ No se pudo enviar PDF por webhook:', webhookErr);
            }
          })();
        }
      } catch (pdfErr) {
        console.warn('No se pudo generar PDF de cotización:', pdfErr);
      }

      // Show success message
      showNotification('¡Cotización enviada y PDF descargado! Te contactaremos pronto.', 'success');

      // Reset form
      quoteForm.reset();

      // Track evento
      trackEvent('quote_submitted', {
        service: data.servicio,
        method: 'email',
        has_email: tieneEmail,
        has_phone: tieneTelefono
      });

      // 2. Abrir WhatsApp del negocio con los datos (siempre)
      setTimeout(() => {
        sendToWhatsApp(data);
      }, 1000);

    } else {
      // Si EmailJS no está configurado, usar fallback de WhatsApp
      console.warn('EmailJS no configurado, usando fallback de WhatsApp');
      showNotification('Te redirigimos a WhatsApp para completar tu cotización.', 'success');

      // Reset form
      quoteForm.reset();

      // Intent: enviar por EmailJS exclusivamente (fallback a WhatsApp si falla)

      // Enviar por WhatsApp (fallback)
      setTimeout(() => {
        sendToWhatsApp(data);
      }, 1000);
    }

  } catch (error) {
    console.error('Error al enviar cotización:', error);

    let errorMessage = 'Hubo un error al procesar tu cotización.';

    // Mensajes de error más específicos
    if (error.message && error.message.includes('EmailJS')) {
      errorMessage = 'Error de configuración del servicio de email. Te redirigimos a WhatsApp.';
    } else if (error.message && error.message.includes('network')) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error.message && error.message.includes('PDF')) {
      errorMessage = 'Error al generar el PDF, pero tu cotización fue enviada.';
    }

    showNotification(errorMessage, 'error');

    // Fallback: enviar por WhatsApp siempre en caso de error
    setTimeout(() => {
      sendToWhatsApp(data);
    }, 1000);
  } finally {
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

function sendToWhatsApp(data) {
  const message = `Hola! Me interesa solicitar una cotización para ${data.servicio}.\n\n` +
    `Nombre: ${data.nombre}\n` +
    `Email: ${data.email}\n` +
    `Teléfono: ${data.telefono}\n` +
    `Mensaje: ${data.mensaje}`;

  const whatsappUrl = `https://wa.me/59892803418?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// Resaltar campos de contacto cuando están vacíos
function highlightContactFields() {
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  // Agregar clase de error temporalmente
  if (emailInput) {
    emailInput.style.borderColor = '#e74c3c';
    emailInput.style.animation = 'shake 0.5s ease';
  }

  if (phoneInput) {
    phoneInput.style.borderColor = '#e74c3c';
    phoneInput.style.animation = 'shake 0.5s ease';
  }

  // Remover resaltado después de 3 segundos
  setTimeout(() => {
    if (emailInput) emailInput.style.borderColor = '';
    if (phoneInput) phoneInput.style.borderColor = '';
  }, 3000);

  // Enfocar el primer campo vacío
  if (emailInput) emailInput.focus();
}

// Validación de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validación de teléfono uruguayo
function isValidPhone(phone) {
  // Limpiar el teléfono de caracteres no numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  // Verificar formatos comunes de Uruguay
  // 099 XXX XXX (9 dígitos)
  // +598 99 XXX XXX (12 dígitos con código país)
  // 59899XXXXXX (12 dígitos)
  return cleanPhone.length === 9 || cleanPhone.length === 12;
}

// Validación en tiempo real del formulario
function initializeRealTimeValidation() {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const messageInput = document.getElementById('message');

  // Validación de nombre
  if (nameInput) {
    nameInput.addEventListener('blur', function() {
      if (this.value.trim() && this.value.trim().length < 2) {
        showFieldError(this, 'El nombre debe tener al menos 2 caracteres');
      } else {
        clearFieldError(this);
      }
    });
  }

  // Validación de email
  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      if (this.value.trim() && !isValidEmail(this.value.trim())) {
        showFieldError(this, 'Ingresa un correo electrónico válido');
      } else {
        clearFieldError(this);
      }
    });
  }

  // Validación de teléfono
  if (phoneInput) {
    phoneInput.addEventListener('blur', function() {
      if (this.value.trim() && !isValidPhone(this.value.trim())) {
        showFieldError(this, 'Ingresa un teléfono válido (ej: 099 XXX XXX)');
      } else {
        clearFieldError(this);
      }
    });
  }

  // Validación de mensaje
  if (messageInput) {
    messageInput.addEventListener('blur', function() {
      if (this.value.trim() && this.value.trim().length < 10) {
        showFieldError(this, 'Describe brevemente tu problema (mínimo 10 caracteres)');
      } else {
        clearFieldError(this);
      }
    });
  }
}

// Mostrar error en campo específico
function showFieldError(input, message) {
  clearFieldError(input); // Limpiar errores previos

  input.style.borderColor = '#e74c3c';
  input.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.1)';

  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
    font-weight: 500;
  `;

  input.parentNode.appendChild(errorDiv);
}

// Limpiar error de campo
function clearFieldError(input) {
  input.style.borderColor = '';
  input.style.boxShadow = '';

  const errorDiv = input.parentNode.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// Mobile Menu
function initializeMobileMenu() {
  navToggle.addEventListener('click', function () {
    const isActive = !navMenu.classList.contains('active');
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');

    // Accessibility & UX: focus first link when opening, return focus to toggle when closing
    if (isActive) {
      const firstLink = navMenu.querySelector('.nav-link');
      if (firstLink) firstLink.focus();
    } else {
      navToggle.focus();
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', function (e) {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    }
  });
}

// Navbar Scroll Effect
function initializeNavbarScroll() {
  let lastScrollTop = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Agregar/quitar clase scrolled
    if (scrollTop > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Ocultar/mostrar navbar al hacer scroll hacia abajo/arriba
    if (scrollTop > lastScrollTop && scrollTop > 200) {
      // Scrolling down - hide navbar
      navbar.classList.add('hidden');
    } else {
      // Scrolling up - show navbar
      navbar.classList.remove('hidden');
    }

    lastScrollTop = scrollTop;
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
}

// Footer Visibility on Scroll to Bottom
// DISABLED: Footer is now always visible (static positioning)
/*
function initializeFooterVisibility() {
  const footer = document.querySelector('.footer');
  if (!footer) return;

  let ticking = false;

  function updateFooterVisibility() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Show footer when user is near the bottom (within 200px of bottom)
    const isNearBottom = scrollTop + windowHeight >= documentHeight - 200;

    if (isNearBottom) {
      footer.classList.add('visible');
    } else {
      footer.classList.remove('visible');
    }

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateFooterVisibility);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });

  // Check initial state
  updateFooterVisibility();
}
*/

// Notification System
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  const iconName = (type === 'success') ? 'check-circle' : 'info-circle';
  notification.innerHTML = `
        <div class="notification-content">
            <svg class="icon icon-${iconName}" aria-hidden="true"><use href="#i-${iconName}"></use></svg>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <svg class="icon icon-times" aria-hidden="true"><use href="#i-times"></use></svg>
        </button>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 15px 20px;
        box-shadow: var(--shadow-hover);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;

  if (type === 'success') {
    notification.style.borderLeft = '4px solid var(--whatsapp-green)';
  }

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
    }
    
    .notification-content i {
        color: var(--primary-color);
        font-size: 1.2rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .notification-close:hover {
        background: var(--bg-accent);
        color: var(--text-primary);
    }
`;
document.head.appendChild(style);

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Performance optimization
const debouncedScroll = debounce(function () {
  // Any scroll-based performance optimizations can go here
}, 10);

window.addEventListener('scroll', debouncedScroll);

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js')
      .then(function (registration) {
        console.log('%c⚙️ ServiceWorker registrado correctamente', 'color: #17a2b8; font-weight: bold;');
        console.warn('%c💡 Si ves errores 404 en imágenes renombradas, desregistra el Service Worker (DevTools > Application > Service Workers) y recarga la página', 'color: #ffc107;');
      })
      .catch(function (err) {
        console.error('❌ Error al registrar ServiceWorker:', err);
      });
  });
}

// Función para forzar actualización o desregistro del Service Worker
/* registerSWForceButton removed */

// Analytics Events
function trackEvent(eventName, parameters = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
  }
}

// Track form submissions
if (quoteForm) {
  quoteForm.addEventListener('submit', function () {
    trackEvent('form_submit', {
      form_name: 'quote_form'
    });
  });
}

// ==============================
// Auth + Cursos (Experimental)
// ==============================

let siteConfig = { live: {}, adminEmails: [] };

async function loadSiteConfig() {
  try {
    const res = await fetch('/public/config.json');
    if (!res.ok) throw new Error('No config');
    siteConfig = await res.json();
  } catch (err) {
    console.warn('No public/config.json found or failed to load. Using defaults.');
    siteConfig = { live: { meetUrl: '#', dayOfWeek: '-', time: '-' }, adminEmails: [] };
  }
}

// Funciones de modal de autenticación DESHABILITADAS para producción
/*
function showAuthModal() {
  document.getElementById('auth-modal').style.display = 'flex';
  // Allow closing with Escape key while modal is open
  document.addEventListener('keydown', authModalEscClose);
}
function hideAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
  document.removeEventListener('keydown', authModalEscClose);
}
function authModalEscClose(e) {
  if (e.key === 'Escape') hideAuthModal();
}

function showAuthMessage(msgEl, text, color) {
  if (!msgEl) return;
  msgEl.style.color = color || '';
  // Clear children safely
  msgEl.textContent = text || '';
}
*/

function renderLiveInfo() {
  const sched = `${siteConfig.live.dayOfWeek || '-'} ${siteConfig.live.time || ''}`;
  const el = document.getElementById('live-schedule'); if (el) el.textContent = sched;
  const join = document.getElementById('btn-join-live'); if (join) join.href = siteConfig.live.meetUrl || '#';
}

// Función de autenticación y cursos DESHABILITADA para producción
// Los cursos están en reforma y no deben estar disponibles
/*
async function initAuthAndCourses() {
  await loadSiteConfig();
  renderLiveInfo();

  // Init Firebase if available
  const firebaseInitialized = typeof initFirebase === 'function' ? initFirebase() : false;

  // UI hooks
  const btnOpenAuth = document.getElementById('btn-open-auth');
  const authClose = document.getElementById('auth-close');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  const btnRegister = document.getElementById('btn-register');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const btnLogoutTop = document.getElementById('btn-logout-top');

  if (btnOpenAuth) btnOpenAuth.addEventListener('click', showAuthModal);
  if (btnOpenAuth) {
    // Diagnostic helper: log clicks and verify modal opens
    btnOpenAuth.addEventListener('click', () => {
      setTimeout(() => {
        const modal = document.getElementById('auth-modal');
        if (modal && getComputedStyle(modal).display !== 'flex') {
          console.warn('⚠️ El modal de autenticación no se abrió después del clic');
          // Show a small inline hint for the user
          try {
            const hint = document.getElementById('auth-click-hint') || (function(){ const d = document.createElement('div'); d.id='auth-click-hint'; d.style.color='#c00'; d.style.marginTop='6px'; d.textContent = 'Detectado clic, pero el modal no se abrió. Revisa la consola para más detalles.'; const parent = document.getElementById('user-info') || document.body; parent.appendChild(d); return d; })();
          } catch (e) { // ignore DOM errors }
        }
      }, 250);
    });
  }
  if (authClose) authClose.addEventListener('click', hideAuthModal);
  if (showRegister) showRegister.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('login-form').style.display='none'; document.getElementById('register-form').style.display='block'; document.getElementById('auth-title').textContent='Registrarse'; });
  if (showLogin) showLogin.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('login-form').style.display='block'; document.getElementById('register-form').style.display='none'; document.getElementById('auth-title').textContent='Acceder'; });

  if (!firebaseInitialized) {
    // If no Firebase, show simple message
    if (btnOpenAuth) btnOpenAuth.addEventListener('click', () => alert('Firebase no configurado. Por favor configura firebase-config.js'));
    return;
  }

  // Auth handlers
  if (btnRegister) btnRegister.addEventListener('click', async () => {
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    const msg = document.getElementById('auth-message');
    // Basic client-side validation
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showAuthMessage(msg, 'Email inválido', 'red'); return; }
    if (!pass || pass.length < 6) { showAuthMessage(msg, 'Contraseña debe tener al menos 6 caracteres', 'red'); return; }
    btnRegister.disabled = true;
    try {
      const userCred = await firebase.auth().createUserWithEmailAndPassword(email, pass);
      const user = userCred.user;

      // Create user document in Firestore
      await db.collection('users').doc(user.uid).set({
        email: user.email,
        displayName: user.displayName || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        completedModules: [],
        enrolledCourses: []
      });

      // Send email verification
      try {
        await user.sendEmailVerification();
        showAuthMessage(msg, 'Registro exitoso. Se envió un email de verificación, por favor revísalo antes de iniciar sesión.', 'green');
        // Sign out so user must verify before accessing dashboard
        await firebase.auth().signOut();
      } catch (error) {
        console.error('Error al enviar cotización:', error);
        showNotification('Hubo un error enviando la cotización por Email. Te redirigimos a WhatsApp.', 'error');

        // Fallback: redirigir a WhatsApp para que el cliente complete la comunicación
        setTimeout(() => {
          sendToWhatsApp(data);
        }, 1000);
  if (btnLogin) btnLogin.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const msg = document.getElementById('auth-message');
    btnLogin.disabled = true;
    try {
      const userCred = await firebase.auth().signInWithEmailAndPassword(email, pass);
      const user = userCred.user;
      if (!user.emailVerified) {
        // don't close modal; prompt to verify with safe DOM elements
        showAuthMessage(msg, 'Tu correo no está verificado. Revisa tu email.', 'orange');
        // Add a 'Reenviar verificación' button and a 'Comprobar ahora' button
        const resendBtn = document.createElement('button'); resendBtn.className = 'btn btn-outline'; resendBtn.textContent = 'Reenviar verificación'; resendBtn.disabled = false;
        const checkBtn = document.createElement('button'); checkBtn.className = 'btn btn-outline'; checkBtn.style.marginLeft = '0.5rem'; checkBtn.textContent = 'Comprobar ahora';
        msg.appendChild(document.createTextNode(' '));
        msg.appendChild(resendBtn);
        msg.appendChild(checkBtn);

        let resendDisabled = false;
        resendBtn.addEventListener('click', async () => {
          if (resendDisabled) return; resendDisabled = true; resendBtn.disabled = true;
          try {
            await user.sendEmailVerification();
            showAuthMessage(msg, 'Email de verificación reenviado. Revisa tu bandeja de entrada.', 'green');
          } catch (reErr) {
            showAuthMessage(msg, 'Error al reenviar verificación: ' + reErr.message, 'red');
          }
          // cooldown
          setTimeout(() => { resendDisabled = false; resendBtn.disabled = false; }, 30000);
        });

        checkBtn.addEventListener('click', async () => {
          try {
            await user.reload();
            const refreshed = firebase.auth().currentUser;
            if (refreshed && refreshed.emailVerified) {
              showAuthMessage(msg, 'Correo verificado. Accediendo...', 'green');
              hideAuthModal();
            } else {
              showAuthMessage(msg, 'Aún no verificado. Revisa tu email y presiona "Comprobar ahora" después de verificar.', 'orange');
            }
          } catch (err) { showAuthMessage(msg, 'Error comprobando verificación: ' + err.message, 'red'); }
        });
        return;
      }


      msg.textContent = '';
      hideAuthModal();
    } catch (err) { msg.style.color = 'red'; msg.textContent = err.message; }
    btnLogin.disabled = false;
  });

  if (btnLogout) btnLogout.addEventListener('click', async () => { await firebase.auth().signOut(); });
  if (btnLogoutTop) btnLogoutTop.addEventListener('click', async () => { await firebase.auth().signOut(); });
  // Admin module panel search
  const adminModulesSearch = document.getElementById('admin-modules-search');
  if (adminModulesSearch) {
    adminModulesSearch.addEventListener('input', () => renderAdminModulesList(adminModulesSearch.value.trim()));
  }

  // Auth state listener
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      const emailEl = document.getElementById('user-email'); if (emailEl) emailEl.textContent = user.email;
      const navCursos = document.getElementById('nav-cursos'); if (navCursos) navCursos.style.display = 'inline-block';
      // Toggle header buttons: hide 'Acceder', show top 'Cerrar sesión'
      if (btnOpenAuth) btnOpenAuth.style.display = 'none';
      if (btnLogoutTop) btnLogoutTop.style.display = 'inline-block';
      if (btnLogout) btnLogout.style.display = 'none';

      // If email not verified, show notice and do not load modules
      if (!user.emailVerified) {
        document.getElementById('cursos').style.display = 'block';
        // show verification notice
        const userInfo = document.getElementById('user-info');
        let notice = document.getElementById('verify-notice');
        if (!notice) {
          notice = document.createElement('div');
          notice.id = 'verify-notice';
          notice.style.marginTop = '0.5rem';
          notice.style.color = 'orange';
            notice.textContent = 'Cuenta sin verificar. Revisa tu correo.';
            const resendBtn = document.createElement('button'); resendBtn.id = 'btn-resend'; resendBtn.className = 'btn btn-outline'; resendBtn.textContent = 'Reenviar verificación'; resendBtn.style.marginLeft = '0.5rem';
            notice.appendChild(resendBtn);
            if (userInfo) userInfo.appendChild(notice);
            resendBtn.addEventListener('click', async () => {
              try {
                resendBtn.disabled = true;
                await user.sendEmailVerification();
                notice.style.color = 'green';
                notice.textContent = 'Email de verificación reenviado. Revisa tu bandeja.';
              } catch (err) {
                notice.style.color = 'red';
                notice.textContent = 'Error al reenviar verificación: ' + err.message;
              }
              setTimeout(() => { resendBtn.disabled = false; }, 30000);
            });
        }
        // Hide admin area and do not load modules until verified
        const isAdmin = siteConfig.adminEmails && siteConfig.adminEmails.includes(user.email);
        document.getElementById('admin-add-module').style.display = 'none';
        // ensure modules list shows message to verify
        const modulesList = document.getElementById('modules-list'); if (modulesList) { modulesList.textContent = ''; const p = document.createElement('p'); p.textContent = 'Debes verificar tu correo para acceder a los módulos.'; modulesList.appendChild(p); }
      } else {
        // Verified user: show dashboard and modules
        document.getElementById('cursos').style.display = 'block';
        // Check token claims for admin flag (preferred) and fallback to public config list
        let isAdmin = false;
        try {
          const idt = await user.getIdTokenResult(true);
          isAdmin = !!(idt && idt.claims && idt.claims.admin);
        } catch (e) {
          console.warn('Error fetching token claims:', e);
        }
        if (!isAdmin && siteConfig.adminEmails && siteConfig.adminEmails.includes(user.email)) isAdmin = true;
        document.getElementById('admin-add-module').style.display = isAdmin ? 'block' : 'none';
        // show admin modules panel and render list
        const adminPanel = document.getElementById('admin-modules-panel'); if (adminPanel) adminPanel.style.display = isAdmin ? 'block' : 'none';
        if (isAdmin) renderAdminModulesList();
        // remove any verify notice
        const notice = document.getElementById('verify-notice'); if (notice) notice.remove();
        // load modules now
        loadModulesForUser(user.uid);
      }
    } else {
      // Logged out: hide dashboard
      document.getElementById('cursos').style.display = 'none';
      const navCursos = document.getElementById('nav-cursos'); if (navCursos) navCursos.style.display = 'none';
      // Toggle header buttons: show 'Acceder', hide top 'Cerrar sesión'
      if (btnOpenAuth) btnOpenAuth.style.display = 'inline-block';
      if (btnLogoutTop) btnLogoutTop.style.display = 'none';
      if (btnLogout) btnLogout.style.display = 'none';
      // Clear modules list and show login message
      const modulesList = document.getElementById('modules-list');
      if (modulesList) {
        modulesList.textContent = '';
        const p = document.createElement('p');
        p.textContent = 'Inicia sesión para acceder a los módulos del curso.';
        modulesList.appendChild(p);
      }
    }
  });

  // Admin add module
  const btnAddModule = document.getElementById('btn-add-module');
  if (btnAddModule) btnAddModule.addEventListener('click', async () => {
    const title = document.getElementById('new-module-title').value.trim();
    const video = document.getElementById('new-module-video').value.trim();
    const desc = document.getElementById('new-module-desc').value.trim();
    const duration = parseInt((document.getElementById('new-module-duration').value || '').trim()) || null;
    const order = parseInt((document.getElementById('new-module-order').value || '').trim()) || null;
    const objectives = (document.getElementById('new-module-objectives').value || '').split(';').map(s=>s.trim()).filter(Boolean);
    const resources = (document.getElementById('new-module-resources').value || '').split(';').map(s=>s.trim()).filter(Boolean);
    // capture quizzes from editor
    const quizItems = [];
    if (quizEditor) {
      Array.from(quizEditor.children).forEach(wrap => {
        const inputs = wrap.querySelectorAll('input');
        if (!inputs || inputs.length < 3) return;
        const qText = inputs[0].value.trim();
        const choices = (inputs[1].value || '').split(';').map(s=>s.trim()).filter(Boolean);
        const ans = parseInt(inputs[2].value);
        if (!qText) return;
        quizItems.push({ question: qText, choices, answer: Number.isNaN(ans) ? 0 : ans });
      });
    }
    if (!title) return alert('El título es requerido');
    try {
      const courseRef = db.collection('courses').doc('tgsit-reparacion-bios');
      const modulesRef = courseRef.collection('modules');
      // if editing
      const editingId = btnAddModule.dataset.editing;
      if (editingId) {
        await modulesRef.doc(editingId).update({ title, videoUrl: video, description: desc, objectives, resources, durationMin: duration, order: order, quiz: quizItems });
        alert('Módulo actualizado');
        clearEditState();
      } else {
        const snap = await modulesRef.orderBy('order','desc').limit(1).get();
        const nextOrder = snap.empty ? (order || 1) : (order || (snap.docs[0].data().order || 0) + 1);
        await modulesRef.add({ title, videoUrl: video, description: desc, objectives, resources, durationMin: duration, order: nextOrder, quiz: quizItems, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        alert('Módulo agregado');
      }
      // clear inputs
      document.getElementById('new-module-title').value=''; document.getElementById('new-module-video').value=''; document.getElementById('new-module-desc').value=''; document.getElementById('new-module-duration').value=''; document.getElementById('new-module-objectives').value=''; document.getElementById('new-module-resources').value=''; document.getElementById('new-module-order').value='';
      currentQuiz = [];
      renderQuizEditor(currentQuiz);
      // refresh modules list and admin view
      const user = firebase.auth().currentUser; if (user) loadModulesForUser(user.uid);
      renderAdminModulesList();
    } catch (err) { alert('Error al agregar/actualizar módulo: ' + err.message); }
  });
  // Import TGSIT modules from public/modules-tgsit.json (admin only)
  const btnImportTgsit = document.getElementById('btn-import-tgsit');
  if (btnImportTgsit) btnImportTgsit.addEventListener('click', async () => {
    if (!confirm('¿Importar los módulos de TGSIT desde public/modules-tgsit.json? Esto creará módulos en Firestore.')) return;
    btnImportTgsit.disabled = true;
    try {
      const ok = await isCurrentUserAdmin();
      if (!ok) throw new Error('Acción reservada a administradores');
      // Prefer detailed JSON when available
      let payload = null;
      const tryFiles = ['/public/modules-tgsit-detailed-refined.json','/public/modules-tgsit-detailed.json','/public/modules-tgsit.json'];
      for (const f of tryFiles) {
        try {
          const r = await fetch(f);
          if (!r.ok) continue;
          payload = await r.json();
          break;
        } catch (e) { continue; }
      }
      if (!payload) throw new Error('No se encontró modules-tgsit JSON en public/');
      const courseId = payload.courseId || 'tgsit-reparacion-bios';
      const courseRef = db.collection('courses').doc(courseId);
      const modules = payload.modules || [];
      if (!modules.length) throw new Error('No hay módulos en el JSON');
      const batch = db.batch();
      modules.forEach((m, i) => {
        const ref = courseRef.collection('modules').doc();
        batch.set(ref, {
          title: m.title || ('Módulo ' + (i+1)),
          description: m.description || '',
          objectives: m.objectives || [],
          durationMin: m.durationMin || null,
          resources: m.resources || [],
          videoUrl: m.videoUrl || '',
          order: i + 1,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
      alert('Importación completada: ' + modules.length + ' módulos creados en ' + courseId);
      const user = firebase.auth().currentUser; if (user) loadModulesForUser(user.uid);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Error importando módulos: ' + (err.message || err));
    }
    btnImportTgsit.disabled = false;
  });

    // Chunked importer: gradual import with progress and cancel
    const btnImportChunked = document.getElementById('btn-import-tgsit-chunked');
    const btnStopImport = document.getElementById('btn-stop-import');
    const importProgress = document.getElementById('import-progress');
    let importAbort = false;

    if (btnImportChunked) btnImportChunked.addEventListener('click', async () => {
      if (!confirm('¿Iniciar importación gradual de módulos TGSIT? Se crearán módulos en lotes y verás el progreso.')) return;
      btnImportChunked.disabled = true; btnImportTgsit.disabled = true; if (btnStopImport) { btnStopImport.style.display = 'inline-block'; btnStopImport.disabled = false; }
      importAbort = false; if (importProgress) importProgress.textContent = 'Preparando import...';
      try {
        const ok = await isCurrentUserAdmin(); if (!ok) throw new Error('Acción reservada a administradores');
        // load payload (prefer detailed)
        let payload = null;
        const tryFiles = ['/public/modules-tgsit-detailed-refined.json','/public/modules-tgsit-detailed.json','/public/modules-tgsit.json'];
        for (const f of tryFiles) { try { const r = await fetch(f); if (!r.ok) continue; payload = await r.json(); break; } catch (e) { continue; } }
        if (!payload) throw new Error('No se encontró modules-tgsit JSON en public/');
        const courseId = payload.courseId || 'tgsit-reparacion-bios';
        const modules = payload.modules || [];
        if (!modules.length) throw new Error('No hay módulos para importar');

        const courseRef = db.collection('courses').doc(courseId);
        const existingSnap = await courseRef.collection('modules').get();
        const existingTitles = new Set(existingSnap.docs.map(d => (d.data().title || '').trim().toLowerCase()));

        const toCreate = modules.filter(m => !existingTitles.has((m.title||'').trim().toLowerCase()));
        if (importProgress) importProgress.textContent = `Módulos a crear: ${toCreate.length} (de ${modules.length})`;

        const chunkSize = 2; // change if needed
        for (let i = 0; i < toCreate.length; i += chunkSize) {
          if (importAbort) { if (importProgress) importProgress.textContent = 'Importación detenida por el usuario.'; break; }
          const batch = db.batch();
          const chunk = toCreate.slice(i, i + chunkSize);
          chunk.forEach((m, idx) => {
            const ref = courseRef.collection('modules').doc();
            batch.set(ref, {
              title: m.title || ('Módulo ' + (i + idx + 1)),
              description: m.description || '',
              objectives: m.objectives || [],
              durationMin: m.durationMin || null,
              resources: m.resources || [],
              videoUrl: m.videoUrl || '',
              order: i + idx + 1,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          });
          if (importProgress) importProgress.textContent = `Importando módulos ${i+1} - ${Math.min(i+chunkSize, toCreate.length)} de ${toCreate.length}...`;
          await batch.commit();
            if (importProgress) {
              importProgress.textContent = `Completado ${Math.min(i+chunkSize,toCreate.length)} de ${toCreate.length}`;
              try {
                const createdNames = chunk.map(x => x.title || 'sin título');
                const ul = document.createElement('ul'); createdNames.forEach(n => { const li = document.createElement('li'); li.textContent = n; ul.appendChild(li); });
                importProgress.appendChild(ul);
              } catch (e) { console.warn('Error updating import progress list', e); }
            }
          // small delay to allow UI update and avoid spikes
          await new Promise(r => setTimeout(r, 800));
        }
        if (!importAbort) { if (importProgress) importProgress.textContent = 'Importación finalizada.'; alert('Importación completa. Revisa los módulos en Firestore.'); }
        const user = firebase.auth().currentUser; if (user) loadModulesForUser(user.uid);
      } catch (err) {
        console.error('Chunked import failed:', err);
        if (importProgress) importProgress.textContent = 'Error: ' + (err.message || err);
        alert('Error importando: ' + (err.message || err));
      } finally {
        btnImportChunked.disabled = false; btnImportTgsit.disabled = false; if (btnStopImport) { btnStopImport.style.display = 'none'; btnStopImport.disabled = false; }
      }
    });

    if (btnStopImport) btnStopImport.addEventListener('click', async () => {
      if (!confirm('¿Detener la importación en curso?')) return;
      importAbort = true; btnStopImport.disabled = true; if (importProgress) importProgress.textContent = 'Deteniendo...';
    });

  async function isCurrentUserAdmin() {
    const user = firebase.auth().currentUser; if (!user) return false;
    try {
      const idt = await user.getIdTokenResult(true);
      if (idt && idt.claims && idt.claims.admin) return true;
    } catch (e) { console.warn('No se pudo leer claims:', e); }
    // fallback to public config list
    if (siteConfig && siteConfig.adminEmails && siteConfig.adminEmails.includes(user.email)) return true;
    return false;
  }

  // Clear module form
  const btnClearModule = document.getElementById('btn-clear-module');
  if (btnClearModule) btnClearModule.addEventListener('click', () => {
    document.getElementById('new-module-title').value = '';
    document.getElementById('new-module-desc').value = '';
    document.getElementById('new-module-duration').value = '';
    document.getElementById('new-module-objectives').value = '';
    document.getElementById('new-module-resources').value = '';
    document.getElementById('new-module-order').value = '';
    currentQuiz = [];
    renderQuizEditor(currentQuiz);
  });

  // Quiz editor handlers
  const quizEditor = document.getElementById('quiz-editor');
  const btnAddQuizItem = document.getElementById('btn-add-quiz-item');
  if (btnAddQuizItem) btnAddQuizItem.addEventListener('click', () => { currentQuiz.push({ question: '', choices: [], answer: 0 }); renderQuizEditor(currentQuiz); });
  // initial render
  renderQuizEditor(currentQuiz);

  // Module viewer handlers
  const moduleClose = document.getElementById('module-close');
  const moduleClose2 = document.getElementById('module-close-2');
  if (moduleClose) moduleClose.addEventListener('click', () => document.getElementById('module-modal').style.display = 'none');
  if (moduleClose2) moduleClose2.addEventListener('click', () => document.getElementById('module-modal').style.display = 'none');
  const moduleMarkBtn = document.getElementById('module-mark-complete');
  if (moduleMarkBtn) moduleMarkBtn.addEventListener('click', async () => {
    const cur = firebase.auth().currentUser; if (!cur) return alert('Debes iniciar sesión para marcar módulo como visto.');
    const currentModuleId = moduleMarkBtn.dataset.moduleId; if (!currentModuleId) return;
    try { await markModuleCompleted(cur.uid, currentModuleId); document.getElementById('module-modal').style.display = 'none'; } catch (e) { alert('Error: ' + e.message); }
  });
}
*/

// Render admin modules list with search
// Función de administración de módulos DESHABILITADA para producción
/*
async function renderAdminModulesList(filter='') {
  const list = document.getElementById('admin-modules-list'); if (!list) return;
  list.textContent = '';
  const courseRef = db.collection('courses').doc('tgsit-reparacion-bios');
  try {
    const snap = await courseRef.collection('modules').orderBy('order','asc').get();
    if (snap.empty) { list.textContent = 'No hay módulos en Firestore.'; return; }
    snap.docs.forEach(doc => {
      const d = doc.data();
      if (filter && !d.title.toLowerCase().includes(filter.toLowerCase())) return;
      const card = document.createElement('div'); card.className = 'module-card';
      // left thumbnail
      const thumb = document.createElement('img'); thumb.className = 'thumb'; thumb.src = d.thumbnail || '/public/images/modules/placeholder.svg'; card.appendChild(thumb);
      // right content
      const rightWrap = document.createElement('div'); rightWrap.className = 'right-wrap';
      const title = document.createElement('h4'); title.textContent = d.title; rightWrap.appendChild(title);
      const quizCount = d.quiz ? d.quiz.length : 0;
      const meta = document.createElement('div'); meta.className='meta'; meta.textContent = (d.durationMin ? d.durationMin + ' min • ' : '') + (d.objectives ? d.objectives.length + ' objetivos • ' : '') + (quizCount ? (quizCount + ' preguntas') : ''); rightWrap.appendChild(meta);
      const desc = document.createElement('div'); desc.textContent = d.description || ''; rightWrap.appendChild(desc);
      const right = document.createElement('div'); right.className='right';
      const viewBtn = document.createElement('button'); viewBtn.className='btn btn-outline'; viewBtn.textContent='Ver'; viewBtn.addEventListener('click', () => viewModule(doc.id, d));
      const editBtn = document.createElement('button'); editBtn.className='btn btn-primary'; editBtn.textContent='Editar'; editBtn.addEventListener('click', () => populateEditForm(doc.id, d));
      const upBtn = document.createElement('button'); upBtn.className='btn btn-outline'; upBtn.textContent='↑'; upBtn.title='Subir'; upBtn.addEventListener('click', async () => { await reorderModule(doc.id, -1); renderAdminModulesList(filter); });
      const downBtn = document.createElement('button'); downBtn.className='btn btn-outline'; downBtn.textContent='↓'; downBtn.title='Bajar'; downBtn.addEventListener('click', async () => { await reorderModule(doc.id, +1); renderAdminModulesList(filter); });
      const delBtn = document.createElement('button'); delBtn.className='btn btn-outline'; delBtn.textContent='Eliminar'; delBtn.addEventListener('click', async () => { if (!confirm('Eliminar módulo?')) return; await courseRef.collection('modules').doc(doc.id).delete(); renderAdminModulesList(filter); });
      right.appendChild(viewBtn); right.appendChild(editBtn); right.appendChild(upBtn); right.appendChild(downBtn); right.appendChild(delBtn);
      rightWrap.appendChild(right);
      card.appendChild(rightWrap);
      list.appendChild(card);
    });
  } catch (err) { console.error('Error loading admin modules:', err); list.textContent = 'Error cargando módulos: ' + err.message; }
}
*/

// Función de reordenamiento de módulos DESHABILITADA para producción
/*
async function reorderModule(docId, direction) {
  // direction -1 up, +1 down
  const courseRef = db.collection('courses').doc('tgsit-reparacion-bios');
  const modulesRef = courseRef.collection('modules').orderBy('order','asc');
  const snap = await modulesRef.get();
  if (snap.empty) return;
  const docs = snap.docs;
  const idx = docs.findIndex(d => d.id === docId);
  if (idx === -1) return;
  const swapWith = idx + direction;
  if (swapWith < 0 || swapWith >= docs.length) return;
  const a = docs[idx]; const b = docs[swapWith];
  const aOrder = a.data().order || (idx+1); const bOrder = b.data().order || (swapWith+1);
  const batch = db.batch();
  batch.update(a.ref, { order: bOrder });
  batch.update(b.ref, { order: aOrder });
  await batch.commit();
}
*/

// Función de edición de módulos DESHABILITADA para producción
/*
function populateEditForm(id, data) {
  document.getElementById('new-module-title').value = data.title || '';
  document.getElementById('new-module-desc').value = data.description || '';
  document.getElementById('new-module-duration').value = data.durationMin || '';
  document.getElementById('new-module-objectives').value = (data.objectives||[]).join(' ; ');
  document.getElementById('new-module-resources').value = (data.resources||[]).join(' ; ');
  document.getElementById('new-module-order').value = data.order || '';
  currentQuiz = data.quiz ? JSON.parse(JSON.stringify(data.quiz)) : [];
  renderQuizEditor(currentQuiz);
  // store editing id
  document.getElementById('btn-add-module').dataset.editing = id;
  document.getElementById('btn-add-module').textContent = 'Guardar cambios';
}
*/

/*
// Función de editor de quizzes DESHABILITADA para producción
function renderQuizEditor(items) {
  const quizEditor = document.getElementById('quiz-editor');
  if (!quizEditor) return;
  quizEditor.textContent = '';
  (items||[]).forEach((q, idx) => {
    const wrap = document.createElement('div'); wrap.style.border='1px dashed var(--border-color)'; wrap.style.padding='8px'; wrap.style.marginBottom='6px';
    const qinp = document.createElement('input'); qinp.placeholder='Pregunta'; qinp.value = q.question || ''; qinp.style.width='100%';
    const choices = document.createElement('input'); choices.placeholder='Opciones (separadas por ; )'; choices.value = (q.choices||[]).join(' ; '); choices.style.width='100%'; choices.style.marginTop='6px';
    const answer = document.createElement('input'); answer.placeholder='Índice respuesta correcta (0-based)'; answer.value = (q.answer!=null?String(q.answer):''); answer.style.width='180px'; answer.style.marginTop='6px';
    const del = document.createElement('button'); del.className='btn btn-outline'; del.textContent='Eliminar'; del.style.marginLeft='8px'; del.addEventListener('click', () => { items.splice(idx,1); renderQuizEditor(items); });
    wrap.appendChild(qinp); wrap.appendChild(choices); const row = document.createElement('div'); row.style.marginTop='6px'; row.appendChild(answer); row.appendChild(del); wrap.appendChild(row);
    quizEditor.appendChild(wrap);
  });
  if ((items||[]).length === 0) {
    const empty = document.createElement('div'); empty.style.color='var(--text-secondary)'; empty.textContent = 'No hay preguntas aún.'; quizEditor.appendChild(empty);
  }
}
*/

function clearEditState() {
  delete document.getElementById('btn-add-module').dataset.editing;
  document.getElementById('btn-add-module').textContent = 'Agregar módulo';
}

// View module in modal (user or admin)
// Función de visualización de módulos DESHABILITADA para producción
/*
function viewModule(id, data) {
  document.getElementById('module-title').textContent = data.title || 'Módulo';
  document.getElementById('module-desc').textContent = data.description || '';

  const objDiv = document.getElementById('module-objectives');
  objDiv.innerHTML = '';
  if (data.objectives && data.objectives.length) {
    const ul = document.createElement('ul');
    data.objectives.forEach(o => {
      const li = document.createElement('li');
      li.textContent = o;
      ul.appendChild(li);
    });
    objDiv.appendChild(ul);
  }

  const resDiv = document.getElementById('module-resources');
  resDiv.innerHTML = '';
  if (data.resources && data.resources.length) {
    const h = document.createElement('div');
    h.textContent = 'Recursos:';
    resDiv.appendChild(h);
    const ul = document.createElement('ul');
    data.resources.forEach(r => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = r;
      a.textContent = r;
      a.target = '_blank';
      a.rel = 'noopener';
      li.appendChild(a);
      ul.appendChild(li);
    });
    resDiv.appendChild(ul);
  }

  // PDF preview if a resource points to a PDF in public/
  const pdfRes = (data.resources || []).find(r =>
    r.toLowerCase().endsWith('.pdf') || r.toLowerCase().includes('.pdf#')
  );
  if (pdfRes) {
    const pdfUrl = encodeURI(pdfRes.replace(/^\//, '')); // remove leading slash if present
    const iframeWrap = document.createElement('div');
    iframeWrap.style.marginTop = '12px';
    const iframe = document.createElement('iframe');
    iframe.src = '/' + pdfUrl;
    iframe.style.width = '100%';
    iframe.style.height = '480px';
    iframe.title = 'PDF preview';
    iframe.loading = 'lazy';
    iframeWrap.appendChild(iframe);
    resDiv.appendChild(iframeWrap);
  }

  const markBtn = document.getElementById('module-mark-complete');
  if (markBtn) markBtn.dataset.moduleId = id;
  document.getElementById('module-modal').style.display = 'flex';
}
*/

// Función de carga de módulos DESHABILITADA para producción
/*
async function loadModulesForUser(uid) {
  const modulesList = document.getElementById('modules-list'); if (!modulesList) return;
  modulesList.textContent = '';
  const loadingP = document.createElement('p'); loadingP.textContent = 'Cargando módulos...'; modulesList.appendChild(loadingP);
  const courseRef = db.collection('courses').doc('tgsit-reparacion-bios');
  const modulesRef = courseRef.collection('modules').orderBy('order','asc');
  let snap;
  try {
    snap = await modulesRef.get();
  } catch (err) {
    console.error('Error loading modules for default course:', err);
    const modulesList = document.getElementById('modules-list'); if (modulesList) { modulesList.textContent = ''; const p = document.createElement('p'); p.textContent = 'Error cargando módulos: ' + (err.message || err); modulesList.appendChild(p); }
    // If permission denied, stop here
    return;
  }
  if (snap.empty) {
    // If empty, maybe admin hasn't imported modules
    const modulesList = document.getElementById('modules-list'); if (modulesList) {
      modulesList.textContent = '';
      const p = document.createElement('p'); p.textContent = 'No hay módulos aún.';
      modulesList.appendChild(p);
      const advice = document.createElement('div'); advice.style.marginTop = '8px';
      advice.style.fontSize = '0.95rem';
      advice.style.color = '#555';
      advice.textContent = 'Si sos administrador, inicia sesión y usa el botón "Importar módulos" en el panel de admin.';
      modulesList.appendChild(advice);
      // if current user is admin, add quick import button
      firebase.auth().onAuthStateChanged(async (u) => {
        if (!u) return;
        try {
          const token = await u.getIdTokenResult();
          if (token.claims && token.claims.admin) {
            const btn = document.createElement('button');
            btn.textContent = 'Importar módulos (chunked)';
            btn.className = 'btn btn-primary';
            btn.style.marginTop = '10px';
            btn.addEventListener('click', () => {
              const importBtn = document.getElementById('btn-import-tgsit-chunked');
              if (importBtn) importBtn.click(); else alert('Botón de importación no encontrado en la UI.');
            });
            modulesList.appendChild(btn);
          }
        } catch (e) {
          console.warn('No se pudo verificar claims de usuario:', e);
        }
      });
    }
    // If empty and current user is admin, seed sample modules for demo
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      try {
        const idt = await currentUser.getIdTokenResult(true);
        if (idt && idt.claims && idt.claims.admin) {
          const sample = [
            { title: 'Módulo 1: Introducción', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Conceptos básicos' , order:1},
            { title: 'Módulo 2: Diagnóstico', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Cómo diagnosticar problemas', order:2},
            { title: 'Módulo 3: Reparación práctica', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Ejercicios prácticos', order:3}
          ];
          const batch = db.batch();
          sample.forEach(s => {
            const ref = courseRef.collection('modules').doc();
            batch.set(ref, s);
          });
          await batch.commit();
          // reload
          return loadModulesForUser(uid);
        }
      } catch (e) {
        console.warn('No se pudo verificar claims para seeding:', e);
      }
    }
    return;
  }

  // Get user progress
  const userDocRef = db.collection('users').doc(uid);
  const userDoc = await userDocRef.get();
  const progress = (userDoc.exists && userDoc.data().completedModules) ? userDoc.data().completedModules : [];

  modulesList.textContent = '';
  let idx = 0;
  snap.forEach(doc => {
    const mod = { id: doc.id, ...doc.data() };
    idx++;
    const prevModuleId = idx > 1 ? snap.docs[idx-2].id : null;
    const locked = prevModuleId ? (!progress.includes(prevModuleId)) : false;
    const div = document.createElement('div'); div.className = 'module-card' + (locked ? ' locked' : '');
    // thumbnail
    const thumb = document.createElement('img'); thumb.className = 'thumb'; thumb.src = mod.thumbnail || '/public/images/modules/placeholder.svg'; div.appendChild(thumb);
    // content container
    const content = document.createElement('div'); content.className = 'content';
    const h4 = document.createElement('h4'); h4.textContent = mod.title || 'Módulo';
    const pdesc = document.createElement('p'); pdesc.textContent = mod.description || '';
    // excerpt preview
    if (mod.excerpt) {
      const ex = document.createElement('p'); ex.style.fontSize='0.95rem'; ex.style.color='var(--text-secondary)'; ex.textContent = (mod.excerpt||'').substring(0,250) + (mod.excerpt.length>250?'...':''); content.appendChild(ex);
    }
    // objectives & quiz preview
    if (mod.objectives && mod.objectives.length) {
      const odiv = document.createElement('div'); odiv.className='meta'; odiv.textContent = 'Objetivos: ' + mod.objectives.join(', ');
      content.appendChild(odiv);
    }
    if (mod.quiz && mod.quiz.length) {
      const qmeta = document.createElement('div'); qmeta.className='meta'; qmeta.textContent = mod.quiz.length + ' preguntas'; content.appendChild(qmeta);
    }
    content.appendChild(h4); content.appendChild(pdesc);

    // video or iframe
    if (mod.videoUrl && mod.videoUrl.endsWith('.mp4')) {
      const video = document.createElement('video'); video.controls = true; video.src = mod.videoUrl; video.style.maxWidth='100%';
      video.addEventListener('ended', () => markModuleCompleted(uid, mod.id, div));
      content.appendChild(video);
    } else if (mod.videoUrl && (mod.videoUrl.includes('youtube.com') || mod.videoUrl.includes('youtu.be'))) {
      const iframe = document.createElement('iframe'); iframe.width = '560'; iframe.height = '315';
      // Normalize common youtube links to embed
      let embed = mod.videoUrl.replace('watch?v=','embed/');
      if (embed.includes('youtu.be/')) embed = embed.replace('youtu.be/','www.youtube.com/embed/');
      iframe.src = embed; iframe.frameBorder='0'; iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; iframe.allowFullscreen=true; iframe.style.width='100%'; content.appendChild(iframe);
      // For youtube we add manual mark button
    }

    const actions = document.createElement('div'); actions.className='module-actions';
      const viewBtn = document.createElement('button'); viewBtn.className='btn btn-outline'; viewBtn.textContent = locked ? 'Bloqueado' : 'Ver módulo'; viewBtn.disabled = !!locked; viewBtn.addEventListener('click', () => viewModule(mod.id, mod));
      actions.appendChild(viewBtn);
    const markBtn = document.createElement('button'); markBtn.className='btn btn-primary'; markBtn.textContent = progress.includes(mod.id) ? 'Visto' : 'Marcar como visto';
    markBtn.disabled = progress.includes(mod.id);
    markBtn.addEventListener('click', async () => {
      if (markBtn.disabled) return;
      markBtn.disabled = true;
      markBtn.textContent = 'Procesando...';
      try {
        await markModuleCompleted(uid, mod.id, div);
      } catch (err) {
        console.error(err); alert('Error marcando módulo: ' + (err.message || err));
        markBtn.disabled = false; markBtn.textContent = 'Marcar como visto';
      }
    });
    actions.appendChild(markBtn);
    content.appendChild(actions);
    div.appendChild(content);

    modulesList.appendChild(div);
  });
}
*/

// Función de marcado de módulos completados DESHABILITADA para producción
/*
async function markModuleCompleted(uid, moduleId, moduleDiv) {
  try {
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.set({ completedModules: firebase.firestore.FieldValue.arrayUnion(moduleId) }, { merge: true });
    // update UI
    if (moduleDiv) {
      moduleDiv.classList.remove('locked');
      const btn = moduleDiv.querySelector('button'); if (btn) { btn.textContent='Visto'; btn.disabled=true; }
    }
    // reload modules to reflect unlocking
    loadModulesForUser(uid);
  } catch (err) { console.error('Error marking module:', err); alert('Error: ' + err.message); }
}
*/

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  // Auth & courses features DISABLED for production
  // initAuthAndCourses().catch(err => console.warn('Auth/Courses init failed:', err));
});

// Track button clicks
document.addEventListener('click', function (e) {
  if (e.target.matches('.btn-primary')) {
    trackEvent('button_click', {
      button_text: e.target.textContent,
      button_type: 'primary'
    });
  }
});

// Track WhatsApp clicks
document.addEventListener('click', function (e) {
  if (e.target.closest('.whatsapp-float') || e.target.closest('[href*="wa.me"]')) {
    trackEvent('whatsapp_click', {
      source: e.target.closest('.whatsapp-float') ? 'float_button' : 'contact_section'
    });
  }
});

// Error Handling
window.addEventListener('error', function (e) {
  console.error('JavaScript Error:', e.error);
  trackEvent('javascript_error', {
    error_message: e.error.message,
    error_filename: e.filename,
    error_lineno: e.lineno
  });
});

// Testimonials Carousel
function initializeTestimonials() {
  let currentSlide = 0;
  const slides = document.querySelectorAll('.testimonial-slide');
  const totalSlides = slides.length;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    testimonialDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
  }

  // Event listeners
  if (testimonialNext) {
    testimonialNext.addEventListener('click', nextSlide);
  }

  if (testimonialPrev) {
    testimonialPrev.addEventListener('click', prevSlide);
  }

  testimonialDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });

  // Auto-advance slides every 5 seconds
  setInterval(nextSlide, 5000);
}

// Calculator Functionality
function initializeCalculator() {
  const serviceSelect = document.getElementById('service-type');
  const urgency = document.getElementById('calc-urgency');
  const warranty = document.getElementById('calc-warranty');

  const basePriceEl = document.getElementById('base-price');
  const urgencyPriceEl = document.getElementById('urgency-price');
  const warrantyPriceEl = document.getElementById('warranty-price');
  const totalPriceEl = document.getElementById('total-price');

  const basePriceLabelEl = document.getElementById('base-price-label');
  const urgencyPriceLabelEl = document.getElementById('urgency-price-label');
  const warrantyPriceLabelEl = document.getElementById('warranty-price-label');

  const serviceWrapper = document.getElementById('service-wrapper');
  const urgencyBadgeEl = document.getElementById('urgency-badge');
  const warrantyBadgeEl = document.getElementById('warranty-badge');

  if (!serviceSelect || !urgency || !warranty || !basePriceEl || !urgencyPriceEl || !warrantyPriceEl || !totalPriceEl ||
      !basePriceLabelEl || !urgencyPriceLabelEl || !warrantyPriceLabelEl) {
    console.warn('Calculator elements not found, skipping initialization');
    return;
  }

  function getSelectedServices() {
    return Array.from(serviceSelect.selectedOptions).map(option => option.value);
  }

  function calculatePrice() {
    const selectedServices = getSelectedServices();
    const urgencyValue = urgency.value;
    const warrantyValue = warranty.value;

    // Usar la función centralizada calcularPrecios
    const prices = calcularPrecios(selectedServices, urgencyValue, warrantyValue);

    // Update labels with descriptive information
    basePriceLabelEl.textContent = `Servicio base (${selectedServices.length} servicio${selectedServices.length !== 1 ? 's' : ''}):`;

    const urgencyOption = urgency.selectedOptions[0];
    if (urgencyOption && prices.urgencyPrice > 0) {
      const percentage = Math.round((prices.urgencyPrice / prices.basePrice) * 100);
      urgencyPriceLabelEl.textContent = `Urgencia (${percentage}% adicional):`;
    } else {
      urgencyPriceLabelEl.textContent = 'Urgencia:';
    }

    const warrantyOption = warranty.selectedOptions[0];
    if (warrantyOption && prices.warrantyPrice > 0) {
      warrantyPriceLabelEl.textContent = `Garantía (+$${prices.warrantyPrice.toLocaleString()}):`;
    } else {
      warrantyPriceLabelEl.textContent = 'Garantía:';
    }

    console.log('Calculator update:', {
      selectedServices: selectedServices.length,
      basePrice: prices.basePrice,
      urgencyPrice: prices.urgencyPrice,
      warrantyPrice: prices.warrantyPrice,
      totalPrice: prices.totalPrice
    });

    basePriceEl.textContent = `$${prices.basePrice.toLocaleString()}`;
    urgencyPriceEl.textContent = `$${prices.urgencyPrice.toLocaleString()}`;
    warrantyPriceEl.textContent = `$${prices.warrantyPrice.toLocaleString()}`;
    totalPriceEl.textContent = `$${prices.totalPrice.toLocaleString()}`;
  }

  // monitor select changes
  serviceSelect.addEventListener('change', calculatePrice);

  if (urgency) {
    urgency.addEventListener('change', () => {
      calculatePrice();
      updateUrgencyBadge();
    });
  }
  if (warranty) {
    warranty.addEventListener('change', () => {
      calculatePrice();
      updateWarrantyBadge();
    });
  }

  function updateUrgencyBadge() {
    if (!urgencyBadgeEl) return;
    const multiplier = parseFloat(urgency.selectedOptions[0]?.dataset.multiplier) || 1;
    urgencyBadgeEl.textContent = multiplier + 'x';
  }

  function updateWarrantyBadge() {
    if (!warrantyBadgeEl) return;
    const price = parseFloat(warranty.selectedOptions[0]?.dataset.price) || 0;
    warrantyBadgeEl.textContent = price > 0 ? `+$${price.toLocaleString()}` : 'incluida';
  }

  // Botón para descargar cotización en PDF
  const downloadPdfBtn = document.getElementById('btn-download-quote-pdf');
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', downloadQuotePdf);
  }

  // Agregar funcionalidad de selección múltiple sin teclas modificadoras
  if (serviceSelect) {
    // Crear sistema de selección múltiple personalizado
    createCustomMultiSelect(serviceSelect);
  }

  // initialize badges and calculate initial price
  updateUrgencyBadge();
  updateWarrantyBadge();
  calculatePrice();
}

// Work Filters
function initializeWorkFilters() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter work cards
      workCards.forEach(card => {
        const categories = card.dataset.category.split(' ');
        const shouldShow = filter === 'all' || categories.includes(filter);

        if (shouldShow) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeInUp 0.5s ease';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// Statistics Counter Animation
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function initializeStats() {
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
      }
    });
  }, observerOptions);

  statNumbers.forEach(stat => {
    observer.observe(stat);
    // Check if already visible on load
    if (isElementInViewport(stat)) {
      animateCounter(stat);
    }
  });
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function animateCounter(element) {
  // Prevent multiple animations
  if (element.dataset.animating === 'true') return;
  element.dataset.animating = 'true';

  const target = parseInt(element.dataset.target);
  const duration = 2000; // 2 seconds
  const increment = target / (duration / 16); // 60fps
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
      element.dataset.animating = 'false';
    }
    element.textContent = Math.floor(current);
  }, 16);
}

function getCalculatorQuoteData() {
  const serviceSelect = document.getElementById('service-type');
  const urgency = document.getElementById('calc-urgency');
  const warranty = document.getElementById('calc-warranty');

  // Obtener servicios seleccionados del select múltiple
  const selectedServices = Array.from(serviceSelect?.selectedOptions || []).map(option => option.value);

  // Calcular precios usando la función centralizada
  const urgencyValue = urgency?.value || 'normal';
  const warrantyValue = warranty?.value || '30';
  const prices = calcularPrecios(selectedServices, urgencyValue, warrantyValue);

  // Crear array de servicios con nombres legibles
  const serviceNames = {
    'reparacion-basica': 'Reparación Básica',
    'reparacion-avanzada': 'Reparación Avanzada',
    'upgrade-ram': 'Upgrade de RAM',
    'upgrade-gpu': 'Upgrade de GPU',
    'upgrade-completo': 'Upgrade Completo',
    'ensamblaje-basico': 'Ensamblaje Básico',
    'ensamblaje-gaming': 'Ensamblaje Gaming',
    'mantenimiento': 'Mantenimiento',
    'asesoramiento': 'Asesoramiento Técnico',
    'soporte-remoto': 'Soporte Técnico Remoto',
    'instalacion-software': 'Instalación de Software',
    'recuperacion-datos': 'Recuperación de Datos',
    'configuracion-red': 'Configuración de Red',
    'limpieza-profunda': 'Limpieza Profunda',
    'diagnostico-completo': 'Diagnóstico Completo',
    'optimizacion-sistema': 'Optimización de Sistema',
    'backup-datos': 'Backup de Datos',
    'limpieza-malware': 'Limpieza de Malware',
    'reemplazo-pantalla': 'Reemplazo de Pantalla',
    'instalacion-antivirus': 'Instalación de Antivirus'
  };

  const servicios = selectedServices.map(service => ({
    name: serviceNames[service] || service,
    price: calcularPrecios(service, urgencyValue, warrantyValue).basePrice
  }));

  const urgencyMultiplier = parseFloat(urgency.selectedOptions[0]?.dataset.multiplier) || 1;

  return {
    servicioTexto: servicios.map(s => s.name).join(', ') || 'Servicio',
    servicios,
    urgencyText: urgency.selectedOptions[0]?.textContent || 'Normal (3-5 días)',
    warrantyText: warranty.selectedOptions[0]?.textContent || '30 días',
    urgencyMultiplier,
    basePrice: prices.basePrice,
    urgencyPrice: prices.urgencyPrice,
    warrantyPrice: prices.warrantyPrice,
    totalPrice: prices.totalPrice,
    descripcion: document.getElementById('problem-description')?.value || ''
  };
}

function downloadQuotePdf() {
  const datos = getCalculatorQuoteData();
  const datosFactura = {
    userName: document.getElementById('quote-name')?.value || 'Cliente Web',
    userEmail: document.getElementById('quote-email')?.value || 'no-reply@devices.f2',
    userPhone: document.getElementById('quote-phone')?.value || 'No proporcionado',
    servicios: datos.servicios,
    urgency: datos.urgencyText,
    warranty: datos.warrantyText,
    basePrice: datos.basePrice,
    urgencyPrice: datos.urgencyPrice,
    warrantyPrice: datos.warrantyPrice,
    totalPrice: datos.totalPrice,
    descripcion: datos.descripcion
  };

  generarPdfCotizacion(datosFactura).then(pdfDataUrl => {
    const link = document.createElement('a');
    link.href = pdfDataUrl;
    link.download = `cotizacion_${new Date().toISOString().slice(0,10)}.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Compatible con Safari y otros navegadores
    try {
      // Intenta click() primero
      if (typeof link.click === 'function') {
        link.click();
      } else {
        // Fallback para algunos navegadores
        link.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      }
    } catch (e) {
      // Si falla, abre en nueva ventana como último recurso
      window.open(pdfDataUrl, '_blank');
    }
    
    // Limpiar después de un delay
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  }).catch(err => {
    console.error('Error al generar descarga de PDF:', err);
    showNotification('No se pudo generar el PDF. Intenta de nuevo.', 'error');
  });
}

// Enhanced WhatsApp Quote Function
// Envío de cotización desde la calculadora
// esta función construye los datos y, al usar enviarEmailCotizacion,
// se marca `fromCalculator: true` para que EmailJS utilice
// el template identificado como template_h72ctck (EMAILJS_CONFIG.calculatorTemplateId).
function openWhatsAppQuote() {
  const datos = getCalculatorQuoteData();
  const userEmail = document.getElementById('quote-email')?.value || '';
  const userPhone = document.getElementById('quote-phone')?.value || '';
  const userName = document.getElementById('quote-name')?.value || 'Cliente Web';

  const basePrice = datos.basePrice;
  const urgencyPrice = datos.urgencyPrice;
  const warrantyPrice = datos.warrantyPrice;
  const totalPrice = datos.totalPrice;
  const serviceListText = datos.servicioTexto;
  const urgencyText = datos.urgencyText;
  const warrantyText = datos.warrantyText;
  const urgencyMultiplier = datos.urgencyMultiplier;

  // Build WhatsApp message for the user
  const message = `¡Hola! Me interesa cotizar un servicio:\n\n` +
    `📋 Servicios: ${serviceListText}\n` +
    `⏰ Urgencia: ${urgencyText} ($${urgencyPrice.toLocaleString()})\n` +
    `🛡️ Garantía: ${warrantyText} ($${warrantyPrice.toLocaleString()})\n` +
    `\n💰 Total estimado: $${totalPrice.toLocaleString()}\n\n` +
    `¿Podrían darme más información sobre el proceso y precios?`;

  const datosFactura = {
    servicios: datos.servicios,
    urgency: urgencyText,
    warranty: warrantyText,
    basePrice: basePrice,
    urgencyPrice: urgencyPrice,
    warrantyPrice: warrantyPrice,
    totalPrice: totalPrice,
    descripcion: datos.descripcion,
    userName: userName,
    userEmail: userEmail,
    userPhone: userPhone
  };

  // Generate PDF and send email in background (do not block user)
  (async () => {
    try {
      const pdfDataUrl = await generarPdfCotizacion(datosFactura);

      // Send email to business with the PDF attached (uses EmailJS helper)
      if (typeof enviarEmailCotizacion === 'function') {
        const datosFormulario = {
          nombre: userName,
          email: userEmail || 'no-reply@devices.f2',
          telefono: userPhone || 'No proporcionado',
          servicio: serviceListText,
          mensaje: document.getElementById('problem-description')?.value || `Cotización de calculadora web. Servicios seleccionados: ${serviceListText}. Urgencia: ${urgencyText}. Garantía: ${warrantyText}.`,
          // Indicar explícitamente que esto viene de la calculadora
          fromCalculator: true,
          // Datos específicos de la calculadora para la plantilla
          urgency: urgencyText,
          urgencyMultiplier: `${urgencyMultiplier}x`,
          warranty: warrantyText,
          precios: {
            basePrice: basePrice,
            urgencyPrice: urgencyPrice,
            warrantyPrice: warrantyPrice,
            totalPrice: totalPrice
          },
          fechaPreferida: new Date().toLocaleDateString('es-ES')
        };

        // Fire-and-forget: no await, but catch errors
        enviarEmailCotizacion(datosFormulario, pdfDataUrl).then(async (res) => {
          console.log('Email al negocio enviado:', res);

          // Enviar email de confirmación al cliente si proporcionó email válido
          if (userEmail && userEmail !== 'no-reply@devices.f2' && userEmail.includes('@')) {
            try {
              console.log('Enviando email de confirmación al cliente:', userEmail);

              // Preparar datos para el cliente (usando el mismo template que el negocio)
              const clienteDatos = {
                ...datosFormulario,
                email: userEmail // Asegurar que el email del cliente sea el destinatario
              };

              // Enviar email al cliente usando la misma función pero con datos modificados
              const clienteRes = await enviarEmailCotizacion(clienteDatos, null);
              console.log('Email al cliente enviado:', clienteRes);
            } catch (clienteErr) {
              console.error('Error enviando email al cliente:', clienteErr);
            }
          }
        }).catch(err => console.error('Error enviando email con PDF:', err));
      } else {
        console.warn('enviarEmailCotizacion no está disponible. Configura EmailJS.');
      }
    } catch (err) {
      console.error('Error generando/enviando PDF de cotización:', err);
    }
  })();

  // Redirect user to WhatsApp immediately (no visible PDF)
  const whatsappUrl = `https://wa.me/59892803418?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');

  // Track event
  trackEvent('calculator_whatsapp_click', {
    service_type: serviceListText,
    urgency: urgencyText,
    warranty: warrantyText
  });
}

// Helper: fetch an image and return data URL
function fetchImageAsDataUrl(url) {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
}

// Generar PDF de cotización y devolver dataURL (data:application/pdf;base64,...)
async function generarPdfCotizacion(datos) {
  // Ensure jsPDF is available
  if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('jsPDF no cargado');
  const { jsPDF } = window.jspdf;
  // A4 vertical fijo
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const usableWidth = pageWidth - margin * 2;
  const rightX = pageWidth - margin;

  // Attempt to load logo (silent failure allowed)
  try {
    const logoUrl = 'public/images/logos/logo-devices-f2.jpg';
    const imgData = await fetchImageAsDataUrl(logoUrl);
    // Use image natural ratio to avoid distortion
    const logoImg = new Image();
    await new Promise((resolve, reject) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = reject;
      logoImg.src = imgData;
    });
    const maxLogoWidth = 130;
    const maxLogoHeight = 60;
    let logoWidth = Math.min(maxLogoWidth, usableWidth * 0.25);
    let logoHeight = logoWidth * (logoImg.height / logoImg.width);
    if (logoHeight > maxLogoHeight) {
      logoHeight = maxLogoHeight;
      logoWidth = logoHeight * (logoImg.width / logoImg.height);
    }
    doc.addImage(imgData, 'JPEG', margin, 20, logoWidth, logoHeight);
  } catch (e) {
    console.warn('No se pudo cargar logo para PDF:', e);
  }

  // Funciones de utilidad para el PDF
  const lineHeight = 14;
  const maxWidth = usableWidth;
  const addText = (text, x, y, options = {}) => {
    const lines = doc.splitTextToSize(text, options.maxWidth || maxWidth);
    doc.text(lines, x, y, { maxWidth: options.maxWidth || maxWidth, align: options.align || 'left' });
    return y + (lines.length * lineHeight);
  };

  const addRowText = (label, value, x, y, width = 460) => {
    doc.setFontSize(10);
    doc.text(`${label}:`, x, y);
    const valueLines = doc.splitTextToSize(value, width);
    doc.text(valueLines, x + 110, y);
    return y + (valueLines.length * lineHeight);
  };

  // Header
  doc.setFontSize(20);
  doc.text('FACTURA - COTIZACIÓN', margin, 100);
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, margin, 118);
  doc.text(`Folio: ${'COT-' + Math.floor(Math.random()*900000 + 100000)}`, rightX, 118, { align: 'right' });

  // Divider
  doc.setLineWidth(0.6);
  doc.line(margin, 125, rightX, 125);

  // Cliente info
  let y = 150;
  doc.setFontSize(12);
  doc.text('DATOS DEL CLIENTE', margin, y);
  y += 16;
  y = addRowText('Nombre', datos.userName || 'Cliente Web', 40, y);
  y = addRowText('Email', datos.userEmail || 'No proporcionado', 40, y);
  y = addRowText('Teléfono', datos.userPhone || 'No proporcionado', 40, y);

  // Problem description
  if (datos.descripcion) {
    y += 4;
    doc.setFontSize(10);
    doc.text('Descripción del problema:', 40, y);
    y += 12;
    doc.setFontSize(9);
    y = addText(datos.descripcion, 40, y, { maxWidth: 500 });
    y += 8;
    doc.setFontSize(10);
  }

  // Divider
  y += 5;
  doc.line(margin, y, rightX, y);
  y += 16;

  // Services / Items
  doc.setFontSize(12);
  doc.text('SERVICIOS SOLICITADOS', margin, y);
  y += 16;
  doc.setFontSize(10);

  // Table headers
  doc.setFontSize(10);
  doc.text('Descripción', margin, y);
  doc.text('Costo', rightX, y, { align: 'right' });
  y += 16;
  doc.setLineWidth(0.5);
  doc.line(margin, y, rightX, y);
  y += 16;

  // Services
  const servicesRaw = Array.isArray(datos.servicios) ? datos.servicios : [];
  let services = servicesRaw.map(item => {
    if (typeof item === 'string' || typeof item === 'number') {
      return { name: String(item), price: 0 };
    }
    if (item && typeof item === 'object') {
      return { name: item.name || item.label || 'Servicio', price: parseFloat(item.price) || 0 };
    }
    return { name: 'Servicio', price: 0 };
  });

  let totalServicePrice = services.reduce((sum, s) => sum + s.price, 0);

  if (services.length === 0 && datos.basePrice > 0) {
    services.push({ name: 'Servicio general', price: datos.basePrice });
    totalServicePrice = datos.basePrice;
  }

  if (totalServicePrice === 0 && services.length > 0 && datos.basePrice) {
    const equalShare = (datos.basePrice || 0) / services.length;
    services.forEach(s => s.price = equalShare);
    totalServicePrice = datos.basePrice;
  }

  if (services.length === 0) {
    doc.setFontSize(10);
    doc.text('No se seleccionaron servicios.', 40, y);
    y += lineHeight + 8;
  } else {
    services.forEach(servicio => {
      if (y > pageHeight - margin - 120) {
        doc.addPage();
        y = margin + 20;
      }
      const serviceLines = doc.splitTextToSize(servicio.name, usableWidth * 0.7);
      doc.text(serviceLines, margin, y);
      doc.text(`$${(servicio.price || 0).toLocaleString('es-UY')}`, rightX, y, { align: 'right' });
      y += Math.max(1, serviceLines.length) * lineHeight + 10;
    });
  }

  // Divider
  if (y > pageHeight - margin - 150) {
    doc.addPage();
    y = margin + 20;
  }
  y += 12;
  doc.setLineWidth(0.5);
  doc.line(margin, y, rightX, y);
  y += 20;

  // Price breakdown
  if (y > pageHeight - margin - 120) {
    doc.addPage();
    y = margin + 20;
  }
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  const detailX = rightX - 220; // mover más a la izquierda como se solicitó
  const valueX = rightX - 8;
  doc.text('Subtotal (Servicios):', detailX, y);
  doc.text(`$${totalServicePrice.toLocaleString('es-UY')}`, valueX, y, { align: 'right' });
  doc.setFont(undefined, 'normal');
  y += 18;

  doc.text(`Recargo por urgencia (${datos.urgency}):`, detailX, y);
  doc.text(`$${(datos.urgencyPrice || 0).toLocaleString('es-UY')}`, valueX, y, { align: 'right' });
  y += 16;

  doc.text(`Acrecentado por Garantía (${datos.warranty}):`, detailX, y);
  doc.text(`$${(datos.warrantyPrice || 0).toLocaleString('es-UY')}`, valueX, y, { align: 'right' });
  y += 18;

  // Total
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL ESTIMADO:', detailX, y);
  doc.text(`$${(datos.totalPrice || 0).toLocaleString('es-UY')}`, valueX, y, { align: 'right' });
  doc.setFont(undefined, 'normal');
  y += 26;

  doc.setFontSize(9);
  doc.setTextColor(51, 51, 51);
  doc.setFont(undefined, 'normal');
  doc.text('* Precios con IVA incluido (si aplica).', margin, y);
  y += 16;

  // Espacio extra para total en palabras y evitar solape al ubicar detalles.
  y += 12;
  y += 16;
  y += 28;

  // Total en palabras
  const totalEntero = Math.round((datos.totalPrice || 0));
  const totalTexto = numberToSpanishWords(totalEntero);
  doc.setFontSize(10);
  doc.text(`Total en palabras: ${totalTexto.charAt(0).toUpperCase() + totalTexto.slice(1)} pesos`, 40, y);
  y += 16;

  // Service details
  doc.setFontSize(11);
  doc.text('DETALLES DEL SERVICIO', 40, y);
  y += 14;
  doc.setFontSize(10);
  doc.text(`Urgencia: ${datos.urgency || 'Normal'}`, 40, y);
  y += 12;
  doc.text(`Garantía: ${datos.warranty || '30 días'}`, 40, y);
  y += 20;

  // Footer
  doc.setFontSize(9);
  doc.line(40, y, 550, y);
  y += 12;
  doc.text('Devices F2 - Servicio Técnico Profesional de Computadoras', 40, y);
  y += 10;
  doc.text('Correo: devices.f02@gmail.com | Teléfono: +598 92 803 418', 40, y);
  y += 10;
  doc.text('San Carlos, Maldonado, Uruguay', 40, y);
  y += 12;
  doc.setTextColor(150);
  doc.text('Esta cotización es válida por 7 días. Para confirmar tu servicio, contáctanos por WhatsApp.', 40, y);

  // Return data URL
  return doc.output('datauristring');
}

// Enviar PDF al webhook configurado (devuelve la respuesta JSON)
async function sendPdfToWebhook(datosFormulario) {
  // Webhook helper removed — using EmailJS exclusively.
  throw new Error('sendPdfToWebhook removed: use EmailJS via enviarEmailCotizacion');
}

// Enhanced animations
function addScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = document.querySelectorAll('.service-card, .work-card, .testimonial-content, .contact-item');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    observer.observe(el);
  });
}


// Initialize scroll animations
document.addEventListener('DOMContentLoaded', addScrollAnimations);

// Console welcome message
console.log('%c🚀 Devices F2 - Website Loaded Successfully!', 'color: #6A4CDB; font-size: 16px; font-weight: bold;');
console.log('%c💻 Servicio técnico profesional de computadoras', 'color: #666; font-size: 12px;');
console.log('%c✨ Enhanced with testimonials, calculator, and filters!', 'color: #6A4CDB; font-size: 12px;'); 

// ============================================
// Sistema de Testimonios en Tiempo Real
// ============================================

let unsubscribeTestimonios = null;
let currentUserId = null;

// Inicializar sistema de testimonios
function initializeRealtimeTestimonials() {
  // Obtener o generar ID de usuario
  currentUserId = obtenerUserId();

  // Intentar inicializar Firebase
  const firebaseInitialized = initFirebase();

  if (!firebaseInitialized) {
    console.warn('⚠️ Firebase no configurado. El sistema de testimonios funcionará en modo offline.');
    showTestimonialsOfflineMessage();
    return;
  }

  // Configurar contador de caracteres
  setupCharacterCounter();

  // Configurar carga de imagen
  setupImageUpload();

  // Configurar formulario de testimonios
  setupTestimonialForm();

  // Cargar testimonios en tiempo real
  loadRealtimeTestimonios();
}

// Mostrar mensaje cuando Firebase no está configurado
function showTestimonialsOfflineMessage() {
  const container = document.getElementById('testimonials-container');
  const loading = document.getElementById('testimonials-loading');

  if (loading) loading.style.display = 'none';

  if (container) {
    container.innerHTML = `
      <div class="testimonials-offline">
        <svg class="icon icon-exclamation-triangle" aria-hidden="true"><use href="#i-exclamation-triangle"></use></svg>
        <h4>Sistema de testimonios no disponible</h4>
        <p>Para habilitar los testimonios en tiempo real, configura Firebase en el archivo firebase-config.js</p>
        <a href="https://console.firebase.google.com" target="_blank" class="btn btn-secondary">
          <svg class="icon icon-external-link" aria-hidden="true"><use href="#i-external-link"></use></svg> Ir a Firebase Console
        </a>
      </div>
    `;
  }
}

// Configurar contador de caracteres
function setupCharacterCounter() {
  const textarea = document.getElementById('testimonial-comment');
  const charCount = document.getElementById('char-count');

  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const count = textarea.value.length;
      charCount.textContent = count;

      // Cambiar color cuando se acerque al límite
      if (count > 450) {
        charCount.style.color = 'var(--danger)';
      } else if (count > 400) {
        charCount.style.color = 'var(--warning)';
      } else {
        charCount.style.color = 'var(--text-secondary)';
      }
    });
  }
}

// Configurar carga de imagen
function setupImageUpload() {
  const btnUpload = document.getElementById('btn-upload-image');
  const inputFile = document.getElementById('testimonial-image');
  const imagePreview = document.getElementById('image-preview');

  if (!btnUpload || !inputFile || !imagePreview) return;

  // Hacer clic en el botón abre el selector de archivos
  btnUpload.addEventListener('click', () => {
    inputFile.click();
  });

  // Manejar selección de archivo
  inputFile.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showFormMessage('Por favor selecciona una imagen válida (JPG, PNG o GIF)', 'error');
      inputFile.value = '';
      return;
    }

    // Validar tamaño (2MB máximo)
    const maxSize = 2 * 1024 * 1024; // 2MB en bytes
    if (file.size > maxSize) {
      showFormMessage('La imagen es muy grande. El tamaño máximo es 2MB', 'error');
      inputFile.value = '';
      return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.classList.add('has-image');

      // Eliminar imagen anterior si existe
      const oldImg = imagePreview.querySelector('img');
      if (oldImg) oldImg.remove();

      // Crear nueva imagen
      const img = document.createElement('img');
      img.src = event.target.result;
      img.alt = 'Vista previa';
      imagePreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

// Configurar formulario de testimonios
function setupTestimonialForm() {
  const form = document.getElementById('testimonial-form');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('testimonial-name');
    const commentInput = document.getElementById('testimonial-comment');
    const imageInput = document.getElementById('testimonial-image');
    const submitBtn = form.querySelector('button[type="submit"]');
    const imagePreview = document.getElementById('image-preview');

    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();
    const imageFile = imageInput.files[0];

    // Validación
    if (!name || !comment) {
      showFormMessage('Por favor completa todos los campos', 'error');
      return;
    }

    if (comment.length < 10) {
      showFormMessage('El comentario debe tener al menos 10 caracteres', 'error');
      return;
    }

    // Mostrar estado de carga
    const originalHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg class="icon icon-spinner" aria-hidden="true"><use href="#i-spinner"></use></svg> Enviando...';
    submitBtn.disabled = true;

    try {
      // Convertir imagen a base64 (si existe)
      const imageBase64 = imageFile ? await convertImageToBase64(imageFile) : '';

      // Agregar testimonio a Firebase con o sin imagen
      const result = await agregarTestimonioConImagen(name, comment, imageBase64);

      if (result.success) {
        showFormMessage('¡Gracias por tu testimonio! Se ha enviado correctamente.', 'success');
        form.reset();
        document.getElementById('char-count').textContent = '0';

        // Resetear vista previa de imagen
        imagePreview.classList.remove('has-image');
        const img = imagePreview.querySelector('img');
        if (img) img.remove();

        // Track evento
        trackEvent('testimonial_submitted', {
          testimonial_id: result.id,
          name_length: name.length,
          comment_length: comment.length,
          has_image: true
        });
      } else {
        throw new Error(result.error || 'Error al enviar testimonio');
      }
    } catch (error) {
      console.error('Error al enviar testimonio:', error);
      showFormMessage('Hubo un error al enviar tu testimonio. Por favor intenta nuevamente.', 'error');
    } finally {
      // Restaurar botón
      submitBtn.innerHTML = originalHtml;
      submitBtn.disabled = false;
    }
  });
}

// Convertir imagen a base64
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Agregar testimonio con imagen
async function agregarTestimonioConImagen(nombre, comentario, imageBase64) {
  try {
    const testimonio = {
      nombre: nombre,
      comentario: comentario,
      imagen: imageBase64,
      userId: currentUserId, // Agregar ID del usuario para poder eliminar
      likes: 0,
      likedBy: [],
      fecha: firebase.firestore.FieldValue.serverTimestamp(),
      aprobado: false
    };

    const docRef = await testimoniosRef.add(testimonio);
    console.log('%c✅ Testimonio agregado exitosamente', 'color: #28a745; font-weight: bold;', 'ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error al agregar testimonio:', error);
    return { success: false, error: error.message };
  }
}

// Mostrar mensaje del formulario
function showFormMessage(message, type) {
  const messageDiv = document.getElementById('form-message');

  if (!messageDiv) return;

  messageDiv.className = `form-message ${type}`;
  // Build message safely to avoid injecting HTML
  messageDiv.innerHTML = '';
  const icon = document.createElementNS('http://www.w3.org/2000/svg','svg'); icon.setAttribute('class', `icon icon-${type === 'success' ? 'check-circle' : 'exclamation-circle'}`); const use = document.createElementNS('http://www.w3.org/2000/svg','use'); use.setAttribute('href', `#i-${type === 'success' ? 'check-circle' : 'exclamation-circle'}`); icon.appendChild(use);
  const span = document.createElement('span'); span.textContent = message;
  messageDiv.appendChild(icon); messageDiv.appendChild(span);
  messageDiv.style.display = 'flex';

  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Cargar testimonios en tiempo real
function loadRealtimeTestimonios() {
  const container = document.getElementById('testimonials-container');
  const loading = document.getElementById('testimonials-loading');
  const empty = document.getElementById('testimonials-empty');
  const countSpan = document.getElementById('testimonials-count');

  if (!container) return;

  // Escuchar cambios en tiempo real
  unsubscribeTestimonios = escucharTestimonios((testimonios) => {
    // Ocultar loading
    if (loading) loading.style.display = 'none';

    // Actualizar contador
    if (countSpan) {
      countSpan.textContent = testimonios.length;
    }

    // Mostrar empty state si no hay testimonios
    if (testimonios.length === 0) {
      if (empty) empty.style.display = 'flex';
      // Limpiar testimonios existentes
      const existingCards = container.querySelectorAll('.live-testimonial-card');
      existingCards.forEach(card => card.remove());
      return;
    }

    // Ocultar empty state
    if (empty) empty.style.display = 'none';

    // Renderizar testimonios
    renderTestimonios(testimonios, container);
  });
}

// Renderizar testimonios
function renderTestimonios(testimonios, container) {
  // Obtener IDs de testimonios actuales
  const existingIds = Array.from(container.querySelectorAll('.live-testimonial-card'))
    .map(card => card.dataset.id);

  testimonios.forEach(testimonio => {
    // Si el testimonio ya existe, actualizar likes
    if (existingIds.includes(testimonio.id)) {
      updateTestimonialLikes(testimonio);
    } else {
      // Crear nuevo testimonio
      const card = createTestimonialCard(testimonio);
      container.appendChild(card);

      // Animación de entrada
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 10);
    }
  });

  // Eliminar testimonios que ya no existen
  const currentIds = testimonios.map(t => t.id);
  Array.from(container.querySelectorAll('.live-testimonial-card'))
    .forEach(card => {
      if (!currentIds.includes(card.dataset.id)) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(-20px)';
        setTimeout(() => card.remove(), 300);
      }
    });
}

// Crear tarjeta de testimonio
function createTestimonialCard(testimonio) {
  const card = document.createElement('div');
  card.className = 'live-testimonial-card';
  card.dataset.id = testimonio.id;
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'all 0.3s ease';

  const hasLiked = testimonio.likedBy && testimonio.likedBy.includes(currentUserId);
  const fecha = formatearFecha(testimonio.fecha);

  // Determinar el avatar a mostrar
  // Build DOM safely for avatar and content
  const header = document.createElement('div'); header.className = 'testimonial-header';
  const avatarWrap = document.createElement('div'); avatarWrap.className = 'testimonial-avatar';
  if (testimonio.imagen && isValidImageUrl(testimonio.imagen)) {
    const img = document.createElement('img'); img.alt = testimonio.nombre || 'Avatar';
    img.src = testimonio.imagen;
    img.addEventListener('error', () => {
      avatarWrap.innerHTML = '<svg class="icon icon-user" aria-hidden="true"><use href="#i-user"></use></svg>'; 
    });
    avatarWrap.appendChild(img);
  } else {
    avatarWrap.innerHTML = '<svg class="icon icon-user" aria-hidden="true"><use href="#i-user"></use></svg>';
  }

  const info = document.createElement('div'); info.className = 'testimonial-info';
  const h4 = document.createElement('h4'); h4.textContent = testimonio.nombre || '';
  const spanDate = document.createElement('span'); spanDate.className = 'testimonial-date';
  const clockIcon = document.createElementNS('http://www.w3.org/2000/svg','svg'); clockIcon.setAttribute('class','icon icon-clock'); const useClock = document.createElementNS('http://www.w3.org/2000/svg','use'); useClock.setAttribute('href','#i-clock'); clockIcon.appendChild(useClock);
  spanDate.appendChild(clockIcon); spanDate.appendChild(document.createTextNode(' ' + fecha));
  info.appendChild(h4); info.appendChild(spanDate);
  header.appendChild(avatarWrap); header.appendChild(info);

  const body = document.createElement('div'); body.className = 'testimonial-body';
  const p = document.createElement('p'); p.textContent = testimonio.comentario || '';
  body.appendChild(p);

  const footer = document.createElement('div'); footer.className = 'testimonial-footer';
  const likeBtnEl = document.createElement('button'); likeBtnEl.className = 'like-btn ' + (hasLiked ? 'liked' : ''); likeBtnEl.dataset.id = testimonio.id;
  likeBtnEl.innerHTML = '<svg class="icon icon-heart" aria-hidden="true"><use href="#i-heart"></use></svg><span class="like-count">' + (testimonio.likes || 0) + '</span>';
  footer.appendChild(likeBtnEl);

  // Agregar botón de eliminar si el testimonio pertenece al usuario actual
  if (testimonio.userId === currentUserId) {
    const deleteBtnEl = document.createElement('button'); deleteBtnEl.className = 'delete-btn'; deleteBtnEl.dataset.id = testimonio.id;
    deleteBtnEl.innerHTML = '<svg class="icon icon-trash" aria-hidden="true"><use href="#i-trash"></use></svg>';
    deleteBtnEl.title = 'Eliminar testimonio';
    footer.appendChild(deleteBtnEl);

    // Agregar evento de eliminación
    deleteBtnEl.addEventListener('click', () => handleDelete(testimonio.id));
  }

  card.appendChild(header); card.appendChild(body); card.appendChild(footer);

  // Agregar evento de like
  likeBtnEl.addEventListener('click', () => handleLike(testimonio.id));

  return card;
}

// Validate that an image URL is safe (http(s) or data URI)
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url, location.href);
    return (u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'data:');
  } catch (e) { return false; }
}

// Actualizar likes de un testimonio existente
function updateTestimonialLikes(testimonio) {
  const card = document.querySelector(`.live-testimonial-card[data-id="${testimonio.id}"]`);
  if (!card) return;

  const likeBtn = card.querySelector('.like-btn');
  const likeCount = card.querySelector('.like-count');
  const hasLiked = testimonio.likedBy && testimonio.likedBy.includes(currentUserId);

  if (likeBtn) {
    likeBtn.className = `like-btn ${hasLiked ? 'liked' : ''}`;
  }

  if (likeCount) {
    likeCount.textContent = testimonio.likes || 0;
  }
}

// Manejar like
async function handleLike(testimonioId) {
  const likeBtn = document.querySelector(`.like-btn[data-id="${testimonioId}"]`);

  if (!likeBtn || likeBtn.disabled) return;

  // Deshabilitar botón temporalmente
  likeBtn.disabled = true;

  try {
    const result = await toggleLike(testimonioId, currentUserId);

    if (result.success) {
      // Animación del botón
      likeBtn.style.transform = 'scale(1.2)';
      setTimeout(() => {
        likeBtn.style.transform = 'scale(1)';
      }, 200);

      // Track evento
      trackEvent('testimonial_like', {
        testimonial_id: testimonioId,
        action: result.hasLiked ? 'liked' : 'unliked'
      });
    } else {
      throw new Error(result.error || 'Error al dar like');
    }
  } catch (error) {
    console.error('Error al dar like:', error);
    showNotification('Error al dar like. Intenta nuevamente.', 'error');
  } finally {
    // Habilitar botón
    setTimeout(() => {
      likeBtn.disabled = false;
    }, 500);
  }
}

// Manejar eliminación de testimonio
async function handleDelete(testimonioId) {
  if (!confirm('¿Estás seguro de que quieres eliminar este testimonio? Esta acción no se puede deshacer.')) {
    return;
  }

  const deleteBtn = document.querySelector(`.delete-btn[data-id="${testimonioId}"]`);

  if (!deleteBtn) return;

  // Deshabilitar botón temporalmente
  deleteBtn.disabled = true;
  deleteBtn.innerHTML = '<svg class="icon icon-spinner" aria-hidden="true"><use href="#i-spinner"></use></svg>'; 

  try {
    const result = await deleteTestimonial(testimonioId, currentUserId);

    if (result.success) {
      // Animación de salida
      const card = document.querySelector(`.live-testimonial-card[data-id="${testimonioId}"]`);
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(-20px)';
        setTimeout(() => card.remove(), 300);
      }

      showNotification('Testimonio eliminado correctamente', 'success');

      // Track evento
      trackEvent('testimonial_delete', {
        testimonial_id: testimonioId
      });
    } else {
      throw new Error(result.error || 'Error al eliminar testimonio');
    }
  } catch (error) {
    console.error('Error al eliminar testimonio:', error);
    showNotification('Error al eliminar testimonio. Intenta nuevamente.', 'error');

    // Restaurar botón
    deleteBtn.disabled = false;
    deleteBtn.innerHTML = '<svg class="icon icon-trash" aria-hidden="true"><use href="#i-trash"></use></svg>'; 
  }
}

// Formatear fecha relativa
function formatearFecha(timestamp) {
  if (!timestamp) return 'Hace un momento';

  const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const ahora = new Date();
  const diferencia = ahora - fecha;

  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  const semanas = Math.floor(dias / 7);
  const meses = Math.floor(dias / 30);

  if (segundos < 60) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (semanas < 4) return `Hace ${semanas} semana${semanas > 1 ? 's' : ''}`;
  if (meses < 12) return `Hace ${meses} mes${meses > 1 ? 'es' : ''}`;

  return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
  if (unsubscribeTestimonios) {
    unsubscribeTestimonios();
  }
});

// Función de animación de ensamblaje con IA
function initializeAssemblyAnimation() {
  const pcCabinets = document.querySelectorAll('.pc-cabinet');

  pcCabinets.forEach(cabinet => {
    const aiAssistant = cabinet.querySelector('.ai-assistant');
    const aiText = cabinet.querySelector('.ai-text');
    const components = cabinet.querySelectorAll('.component');
    const cabinetBody = cabinet.querySelector('.cabinet-body');

    let currentStep = 0;
    let assemblyInterval;
    let energyParticles = [];

    const isGaming = cabinet.classList.contains('gaming-cabinet');

    const assemblySteps = isGaming ? [
      { message: "🔌 Instalando fuente de poder 1000W Gold...", component: "psu", detail: "Conectando alimentación principal", compatible: true },
      { message: "🖥️ Colocando motherboard Z790...", component: "motherboard", detail: "Base del sistema preparada", compatible: true },
      { message: "🧠 Instalando Intel Core i9-14900K...", component: "cpu", detail: "Procesador de alto rendimiento listo", compatible: true },
      { message: "💾 Agregando 64GB DDR5 RGB...", component: "ram", detail: "Memoria de velocidad extrema instalada", compatible: true },
      { message: "🎮 Instalando RTX 4090 24GB...", component: "gpu", detail: "Tarjeta gráfica para gaming 4K", compatible: true },
      { message: "💿 Conectando SSD NVMe 2TB Gen4...", component: "ssd", detail: "Almacenamiento ultrarrápido conectado", compatible: true },
      { message: "🌊 Instalando enfriamiento líquido 360mm...", component: "cooler", detail: "Sistema de refrigeración avanzado", compatible: true },
      { message: "⚡ ¡Ensamblaje completado! PC gaming lista para la acción extrema.", component: "complete", detail: "¡Sistema optimizado para rendimiento máximo!", compatible: true }
    ] : [
      { message: "🔌 Instalando fuente 750W 80+ Gold...", component: "psu", detail: "Alimentación confiable conectada", compatible: true },
      { message: "🖥️ Colocando motherboard B650...", component: "motherboard", detail: "Plataforma empresarial preparada", compatible: true },
      { message: "🧠 Instalando AMD Ryzen 9 7950X...", component: "cpu", detail: "Procesador workstation instalado", compatible: true },
      { message: "💾 Agregando 32GB DDR5 ECC...", component: "ram", detail: "Memoria ECC para estabilidad", compatible: true },
      { message: "💼 Instalando RTX 4070 Ti 12GB...", component: "gpu", detail: "Gráficos profesionales conectados", compatible: true },
      { message: "💿 Conectando SSD NVMe 1TB Gen4...", component: "ssd", detail: "Almacenamiento empresarial listo", compatible: true },
      { message: "🌬️ Instalando enfriamiento premium...", component: "cooler", detail: "Sistema de refrigeración silencioso", compatible: true },
      { message: "📊 ¡Configuración completada! Workstation lista para productividad.", component: "complete", detail: "¡Sistema optimizado para trabajo profesional!", compatible: true }
    ];

    function checkCompatibility(component) {
      // Simular verificación de compatibilidad inteligente
      const compatibilityRules = {
        cpu: { socket: "LGA1700", chipset: "Z790" },
        gpu: { interface: "PCIe 5.0", power: "450W" },
        ram: { type: "DDR5", speed: "5600MHz" },
        motherboard: { socket: "LGA1700", chipset: "Z790" },
        psu: { wattage: 1000, efficiency: "80+ Gold" },
        ssd: { interface: "PCIe 4.0", form: "M.2" },
        cooler: { socket: "LGA1700", type: "liquid" }
      };

      // Verificar compatibilidad básica (todos son compatibles en este ejemplo)
      return component in compatibilityRules;
    }

    function updateCompatibilityIndicators() {
      const components = cabinet.querySelectorAll('.component');
      components.forEach(component => {
        const componentType = component.classList[1]; // ej: 'cpu', 'gpu', etc.
        const isCompatible = checkCompatibility(componentType);
        const indicator = component.querySelector('.compatibility-indicator');

        if (indicator) {
          indicator.className = `compatibility-indicator ${isCompatible ? 'compatible' : 'incompatible'}`;
          component.setAttribute('data-compatible', isCompatible);
        }
      });
    }

    function startAssembly() {
      currentStep = 0;
      clearInterval(assemblyInterval);

      // Inicializar indicadores de compatibilidad
      updateCompatibilityIndicators();

      // Limpiar partículas anteriores
      energyParticles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      energyParticles = [];

      assemblyInterval = setInterval(() => {
        if (currentStep < assemblySteps.length) {
          const step = assemblySteps[currentStep];
          const compatibilityText = step.compatible ? "✅ Compatible" : "❌ Incompatible";
          aiText.textContent = `${step.message} ${compatibilityText}`;

          // Resaltar componente actual
          components.forEach(comp => {
            comp.classList.remove('current-assembly');
          });

          if (step.component !== 'complete') {
            const currentComponent = cabinet.querySelector(`.component.${step.component}`);
            if (currentComponent) {
              currentComponent.classList.add('current-assembly');

              // Actualizar indicador de compatibilidad
              const indicator = currentComponent.querySelector('.compatibility-indicator');
              if (indicator) {
                indicator.className = `compatibility-indicator ${step.compatible ? 'compatible' : 'incompatible'}`;
              }

              // Crear efecto de energía
              const rect = currentComponent.getBoundingClientRect();
              const cabinetRect = cabinetBody.getBoundingClientRect();
              const x = rect.left - cabinetRect.left + rect.width / 2;
              const y = rect.top - cabinetRect.top + rect.height / 2;

              createEnergyParticle(x, y);
            }
          }

          currentStep++;
        } else {
          clearInterval(assemblyInterval);

          // Efecto de encendido final
          cabinet.classList.add('assembly-complete');

          // Agregar efecto holograma a todos los componentes
          components.forEach(comp => {
            comp.classList.add('hologram');
          });

          setTimeout(() => {
            aiText.textContent = isGaming ?
              "🚀 ¡Sistema gaming listo para conquistar!" :
              "💼 ¡Workstation empresarial operativa!";

            // Remover efectos después de un tiempo
            setTimeout(() => {
              cabinet.classList.remove('assembly-complete');
              components.forEach(comp => {
                comp.classList.remove('hologram');
              });
            }, 3000);

          }, 2000);
        }
      }, 1800);
    }

    function stopAssembly() {
      clearInterval(assemblyInterval);
      components.forEach(comp => {
        comp.classList.remove('current-assembly');
      });

      // Limpiar partículas
      energyParticles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      energyParticles = [];

      aiText.textContent = isGaming ?
        "Iniciando ensamblaje inteligente..." :
        "Optimizando configuración empresarial...";
    }

    // Eventos hover
    cabinet.addEventListener('mouseenter', startAssembly);
    cabinet.addEventListener('mouseleave', stopAssembly);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Pequeño delay para asegurar que Firebase se cargue primero
  setTimeout(initializeRealtimeTestimonials, 500);
  // Inicializar animación de ensamblaje
  initializeAssemblyAnimation();
});

