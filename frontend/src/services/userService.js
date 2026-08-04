import api from './api'

export const userService = {
  list: (params = {}) => api.get('/users', { params }).then((r) => r.data),
  get: (id) => api.get(`/users/${id}`).then((r) => r.data),
  create: (data) => api.post('/users', data).then((r) => r.data),
  update: (id, data) => api.patch(`/users/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/users/${id}`),
}

export const ROLES = [
  { value: 'admin', label: 'Admin', hint: 'Full access to the whole panel' },
  { value: 'manager', label: 'Manager', hint: 'Leads only — no courses, teachers or certificates' },
]
