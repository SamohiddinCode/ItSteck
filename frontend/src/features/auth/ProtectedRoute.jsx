import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, homeForRole } from './AuthContext'
import Spinner from '@/components/ui/Spinner'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, role } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Section is restricted and this role isn't on the list — send them home instead.
  if (roles && !roles.includes(role)) {
    return <Navigate to={homeForRole(role)} replace />
  }

  return children
}
