import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ds_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const url = err.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('ds_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

export const reportsAPI = {
  upload:   (fd, onProgress) => api.post('/reports/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  }),
  list:     (params) => api.get('/reports', { params }),
  get:      (id)     => api.get(`/reports/${id}`),
  status:   (id)     => api.get(`/reports/${id}/status`),
  summary:  (id)     => api.get(`/reports/${id}/summary`),
  download: (id)     => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  delete:   (id)     => api.delete(`/reports/${id}`),
};

export const dashboardAPI = { stats: () => api.get('/dashboard/stats') };
