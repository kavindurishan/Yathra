const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('api_base_url');
    if (customUrl) return customUrl;
    
    // Check if running in Capacitor Native Android environment
    const isCapacitor = window.Capacitor !== undefined || /capacitor/i.test(navigator.userAgent);
    if (isCapacitor) {
      // 10.0.2.2 maps Android emulator to the computer's localhost:5000
      return 'http://10.0.2.2:5000/api';
    }
  }
  return 'http://127.0.0.1:5000/api';
};

const BASE_URL = getBaseUrl();

const request = async (endpoint, options = {}) => {
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('yathra_admin_token') : null;
  const userToken = typeof window !== 'undefined' ? (localStorage.getItem('yathra_token') || localStorage.getItem('tripzo_token')) : null;
  
  const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const isAdminEndpoint = endpoint.startsWith('/admin') || endpoint.startsWith('/settings');
  const token = ((isAdminPath || isAdminEndpoint) && adminToken) ? adminToken : (userToken || adminToken);

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    let res = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Auto-recovery for Admin session on 401: try refreshing token with stored PIN once
    if (res.status === 401 && (isAdminPath || isAdminEndpoint)) {
      const cachedPin = localStorage.getItem('yathra_admin_pin') || '2026';
      try {
        const pinRes = await fetch(`${BASE_URL}/admin/verify-pin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: cachedPin })
        });
        const pinData = await pinRes.json();
        if (pinData && pinData.success && pinData.token) {
          localStorage.setItem('yathra_admin_token', pinData.token);
          if (pinData.user) {
            localStorage.setItem('yathra_admin_user', JSON.stringify(pinData.user));
          }
          config.headers['Authorization'] = `Bearer ${pinData.token}`;
          res = await fetch(`${BASE_URL}${endpoint}`, config);
        }
      } catch (pinErr) {
        // Recovery failed, proceed with original error
      }
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (err) {
    console.error(`API Error in ${endpoint}:`, err);
    throw err;
  }
};

export const api = {
  // Authentication
  auth: {
    forgotPassword: (email) => request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  },

  // Users Management
  users: {
    getAll: () => request('/users'),
    create: (data) => request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  },

  // Buses
  buses: {
    getAll: () => request('/buses'),
    create: (data) => request('/buses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/buses/${id}`, { method: 'DELETE' }),
  },

  // Routes
  routes: {
    getAll: () => request('/routes'),
    getPopular: () => request('/routes/popular'),
    create: (data) => request('/routes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/routes/${id}`, { method: 'DELETE' }),
  },

  // Schedules
  schedules: {
    getAll: (from = '', to = '', date = '') => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (date) params.append('date', date);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request(`/schedules${query}`);
    },
    getSeatStatus: (id) => request(`/schedules/${id}/seat-status`),
    create: (data) => request('/schedules', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/schedules/${id}`, { method: 'DELETE' }),
  },

  // Bookings
  bookings: {
    getAll: () => request('/bookings'),
    create: (data) => request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    pay: (data) => request('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getMy: () => request('/bookings/my'),
    cancel: (id, reason) => request(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
    reschedule: (id, data) => request(`/bookings/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    track: (id) => request(`/bookings/${id}/track`),
  },

  // Payments
  payments: {
    getAll: () => request('/payments'),
  },

  // Offers
  offers: {
    getAll: () => request('/offers'),
    create: (data) => request('/offers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/offers/${id}`, { method: 'DELETE' }),
    verify: (code, amount) => request('/offers/verify', {
      method: 'POST',
      body: JSON.stringify({ code, amount })
    }),
  },

  // Reviews
  reviews: {
    getAll: () => request('/reviews'),
    create: (data) => request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markAllRead: () => request('/notifications/read', { method: 'POST' }),
  },

  // Reports
  reports: {
    getDashboard: () => request('/reports/dashboard'),
  },

  // SLIIT Transit Hub (Campus Shuttles)
  campus: {
    getAll: (forceWindow = false, role = '') => {
      const q = new URLSearchParams();
      if (forceWindow) q.append('forceWindow', 'true');
      if (role) q.append('role', role);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/campus/shuttles${queryStr}`);
    },
    getById: (id, forceWindow = false, role = '') => {
      const q = new URLSearchParams();
      if (forceWindow) q.append('forceWindow', 'true');
      if (role) q.append('role', role);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/campus/shuttles/${id}${queryStr}`);
    },
    create: (data) => request('/campus/shuttles', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/campus/shuttles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/campus/shuttles/${id}`, {
      method: 'DELETE'
    }),
    simulateStep: (id, action = 'next', stepIndex = null) => request(`/campus/shuttles/${id}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ action, stepIndex })
    }),
    seedDefaults: () => request('/campus/shuttles/seed', {
      method: 'POST'
    }),
  },

  // System Launch Settings
  settings: {
    get: () => request('/settings'),
    update: (data) => request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  }
};
