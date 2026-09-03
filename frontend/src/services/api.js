import axios from 'axios'

/** Same-origin behind nginx by default; overridable at build time. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global 401 handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      if (!window.location.hash.startsWith('#/admin/login')) {
        window.location.replace('/#/admin/login')
      }
    }
    return Promise.reject(err)
  }
)

export default api
