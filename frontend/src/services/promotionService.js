import api from './api'

export const promotionService = {
  // Public — what the ticker is running right now.
  active: () => api.get('/promotions/active').then((r) => r.data),

  // Admin.
  list: (params = {}) => api.get('/promotions', { params }).then((r) => r.data),
  get: (id) => api.get(`/promotions/${id}`).then((r) => r.data),
  create: (data) => api.post('/promotions', data).then((r) => r.data),
  update: (id, data) => api.patch(`/promotions/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/promotions/${id}`),
}
