(function () {
  async function request(url, options) {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options && options.headers ? options.headers : {})
      },
      ...options
    });

    let data = {};
    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (!response.ok) {
      const errorMessage = data.error || `Error ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  }

  async function guardarCotizacionEnFirebase(payload) {
    try {
      return await request('/.netlify/functions/cotizaciones-create', {
        method: 'POST',
        body: JSON.stringify(payload || {})
      });
    } catch (error) {
      return { success: false, error: error.message || 'No se pudo guardar la cotizacion' };
    }
  }

  async function obtenerCotizacionesAdmin() {
    try {
      return await request('/.netlify/functions/cotizaciones-list', {
        method: 'GET'
      });
    } catch (error) {
      return { success: false, error: error.message || 'No se pudieron obtener cotizaciones' };
    }
  }

  async function actualizarEstadoCotizacion(id, status, notas) {
    try {
      return await request('/.netlify/functions/cotizaciones-update', {
        method: 'POST',
        body: JSON.stringify({ id, status, notas })
      });
    } catch (error) {
      return { success: false, error: error.message || 'No se pudo actualizar la cotizacion' };
    }
  }

  async function adminLogin(username, password) {
    return request('/.netlify/functions/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  async function adminSession() {
    return request('/.netlify/functions/admin-session', {
      method: 'GET'
    });
  }

  async function adminLogout() {
    return request('/.netlify/functions/admin-logout', {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  window.guardarCotizacionEnFirebase = guardarCotizacionEnFirebase;
  window.obtenerCotizacionesAdmin = obtenerCotizacionesAdmin;
  window.actualizarEstadoCotizacion = actualizarEstadoCotizacion;
  window.adminLogin = adminLogin;
  window.adminSession = adminSession;
  window.adminLogout = adminLogout;

  // Fallback seguro: solo si no existe implementación real de Firebase.
  if (typeof window.initFirebase !== 'function') {
    window.initFirebase = function initFirebaseFallback() {
      return false;
    };
  }
})();
