import api, { API_BASE_URL } from './api'

export const certificateService = {
  // Public — no auth required.
  verify: (code) => api.get(`/certificates/verify/${encodeURIComponent(code)}`).then((r) => r.data),
  // Plain link, not an axios call — the browser opens it directly.
  pdfUrl: (code, { download = false } = {}) =>
    `${API_BASE_URL}/certificates/verify/${encodeURIComponent(code)}/pdf${download ? '?download=true' : ''}`,

  // Admin.
  list: (params = {}) => api.get('/certificates', { params }).then((r) => r.data),
  get: (id) => api.get(`/certificates/${id}`).then((r) => r.data),
  create: (data) => api.post('/certificates', data).then((r) => r.data),
  update: (id, data) => api.patch(`/certificates/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/certificates/${id}`),
}
