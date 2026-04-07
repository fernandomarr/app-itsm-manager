import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authStore } from '@/store/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStore.getState().token;
    const tenantId = authStore.getState().tenantId;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  signUp: (data: { email: string; password: string; fullName: string; tenantSlug?: string }) =>
    api.post('/auth/signup', data),

  signIn: (data: { email: string; password: string }) =>
    api.post('/auth/signin', data),

  signOut: () => api.post('/auth/logout'),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const tenantsApi = {
  getMyTenants: () => api.get('/tenants/my'),
  getById: (id: string) => api.get(`/tenants/${id}`),
  create: (data: { name: string; slug: string }) => api.post('/tenants', data),
  update: (id: string, data: { name?: string; settings?: any }) => api.put(`/tenants/${id}`, data),
  getMembers: (id: string) => api.get(`/tenants/${id}/members`),
  addMember: (id: string, data: { userId: string; role: string }) =>
    api.post(`/tenants/${id}/members`, data),
  removeMember: (id: string, userId: string) =>
    api.delete(`/tenants/${id}/members/${userId}`),
};

export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: { fullName?: string; avatarUrl?: string }) =>
    api.put('/users/me', data),
  search: (query: string, limit?: number) =>
    api.get('/users', { params: { q: query, limit } }),
  getById: (id: string) => api.get(`/users/${id}`),
  getByRole: (role: string) => api.get(`/users/by-role/${role}`),
};

export const ticketsApi = {
  getAll: (params?: {
    type?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => api.get('/tickets', { params }),

  getById: (id: string) => api.get(`/tickets/${id}`),

  create: (data: {
    type: string;
    title: string;
    description: string;
    priority?: string;
    impact?: string;
    urgency?: string;
    assigneeId?: string;
    categoryId?: string;
    customFields?: any;
  }) => api.post('/tickets', data),

  update: (id: string, data: any) => api.put(`/tickets/${id}`, data),

  transition: (id: string, toStatus: string) =>
    api.post(`/tickets/${id}/transition/${toStatus}`),

  addComment: (id: string, data: { content: string; visibility?: 'public' | 'internal' }) =>
    api.post(`/tickets/${id}/comments`, data),

  getComments: (id: string) => api.get(`/tickets/${id}/comments`),

  getStats: (type?: string) => api.get('/tickets/stats', { params: { type } }),

  linkTickets: (id: string, data: { targetTicketId: string; relationType: string }) =>
    api.post(`/tickets/${id}/link`, data),
};

export const incidentsApi = {
  create: (data: any) => api.post('/incidents', data),
  getStats: () => api.get('/incidents/stats'),
  getUnassigned: () => api.get('/incidents/unassigned'),
};

export const requestsApi = {
  create: (data: any) => api.post('/requests', data),
  getStats: () => api.get('/requests/stats'),
};

export const problemsApi = {
  getAll: (status?: string) => api.get('/problems', { params: { status } }),
  getById: (id: string) => api.get(`/problems/${id}`),
  create: (data: any) => api.post('/problems', data),
  update: (id: string, data: any) => api.put(`/problems/${id}`, data),
  searchKEDB: (query: string) => api.get('/problems/kedb/search', { params: { q: query } }),
  getKnownErrors: () => api.get('/problems/kedb'),
  createKnownError: (data: any) => api.post('/problems/kedb', data),
};

export const changesApi = {
  getAll: (type?: string, status?: string) =>
    api.get('/changes', { params: { type, status } }),

  getById: (id: string) => api.get(`/changes/${id}`),

  create: (data: any) => api.post('/changes', data),

  update: (id: string, data: any) => api.put(`/changes/${id}`, data),

  submit: (id: string) => api.post(`/changes/${id}/submit`),

  scheduleCab: (id: string, meetingDate: string) =>
    api.post(`/changes/${id}/schedule-cab`, { meetingDate }),

  recordCabDecision: (id: string, data: { memberId: string; vote: string; comments?: string }) =>
    api.post(`/changes/${id}/cab-decision`, data),

  implement: (id: string) => api.post(`/changes/${id}/implement`),

  complete: (id: string) => api.post(`/changes/${id}/complete`),

  getCabMembers: () => api.get('/changes/cab/members'),

  addCabMember: (userId: string) => api.post('/changes/cab/members', { userId }),

  getCalendar: (start: string, end: string) =>
    api.get('/changes/calendar', { params: { start, end } }),
};

export const workflowsApi = {
  getAll: () => api.get('/workflows'),
  getDefault: (type: string) => api.get(`/workflows/default/${type}`),
  getById: (id: string) => api.get(`/workflows/${id}`),
  create: (data: any) => api.post('/workflows', data),
  update: (id: string, data: any) => api.put(`/workflows/${id}`, data),
  setDefault: (id: string) => api.post(`/workflows/${id}/set-default`),
  delete: (id: string) => api.delete(`/workflows/${id}`),
};

export const slasApi = {
  getAll: () => api.get('/slas'),
  getById: (id: string) => api.get(`/slas/${id}`),
  create: (data: any) => api.post('/slas', data),
  update: (id: string, data: any) => api.put(`/slas/${id}`, data),
  delete: (id: string) => api.delete(`/slas/${id}`),
};

export const servicesApi = {
  getAll: () => api.get('/services'),
  getFeatured: () => api.get('/services/featured'),
  search: (query: string) => api.get('/services/search', { params: { q: query } }),
  getById: (id: string) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
  getCategories: () => api.get('/services/categories/list'),
  createCategory: (data: any) => api.post('/services/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/services/categories/${id}`, data),
};

export const integrationsApi = {
  getAll: () => api.get('/integrations'),
  getById: (id: string) => api.get(`/integrations/${id}`),
  create: (data: any) => api.post('/integrations', data),
  update: (id: string, data: any) => api.put(`/integrations/${id}`, data),
  delete: (id: string) => api.delete(`/integrations/${id}`),
  testConnection: (id: string) => api.post(`/integrations/${id}/test`),
  getLogs: (id: string) => api.get(`/integrations/${id}/logs`),
  trigger: (id: string, data: { eventType: string; payload: any }) =>
    api.post(`/integrations/${id}/trigger`, data),
};

export const notificationsApi = {
  getMyNotifications: (limit?: number) =>
    api.get('/notifications', { params: { limit } }),

  getTemplates: () => api.get('/notifications/templates'),

  createTemplate: (data: any) => api.post('/notifications/templates', data),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
};
