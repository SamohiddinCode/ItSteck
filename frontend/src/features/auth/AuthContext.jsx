import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

const AuthContext = createContext(null)

/** Where each role starts out — managers only ever work with leads. */
export const homeForRole = (role) => (role === 'manager' ? '/admin/leads' : '/admin')

function readToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) return null
    return { id: payload.sub, role: payload.role || null }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    setUser(null)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token', res.data.access_token)
    const me = await api.get('/auth/me').then((r) => r.data)
    setUser(me)
    return me
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    const claims = readToken(token)
    if (!claims) {
      logout()
      setLoading(false)
      return
    }
    // Show the right panel straight away from the token, then confirm with the API,
    // which is what actually decides the role.
    setUser(claims)
    api.get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [logout])

  const role = user?.role ?? null

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAuthenticated: !!user,
      role,
      isAdmin: role === 'admin',
      isManager: role === 'manager',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
