import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('unistay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      if (isAdminRoute && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('unistay_token');
        localStorage.removeItem('unistay_admin');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ─── Districts ───────────────────────────────────────────────────────────────
export const districtAPI = {
  getAll: () => api.get('/districts'),
  getOne: (id) => api.get(`/districts/${id}`),
  create: (data) => api.post('/admin/districts', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/admin/districts/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/admin/districts/${id}`),
};

// ─── Apartments ──────────────────────────────────────────────────────────────
export const apartmentAPI = {
  getAll: (params) => api.get('/apartments', { params }),
  getFeatured: () => api.get('/apartments/featured'),
  getOne: (id) => api.get(`/apartments/${id}`),
  create: (data) => api.post('/admin/apartments', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/admin/apartments/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/admin/apartments/${id}`),
  toggleFeatured: (id) => api.patch(`/admin/apartments/${id}/toggle-featured`),
  toggleAvailable: (id) => api.patch(`/admin/apartments/${id}/toggle-available`),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
};

export default api;
