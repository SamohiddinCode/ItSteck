import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth, homeForRole } from '@/features/auth/AuthContext'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import { I18nProvider } from '@/i18n'

// Layouts
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'

// Public pages
import Landing from '@/pages/Landing'
import Courses from '@/pages/Courses'
import CourseDetail from '@/pages/CourseDetail'
import Apply from '@/pages/Apply'
import CareerTest from '@/pages/CareerTest'
import Verify from '@/pages/Verify'
import NotFound from '@/pages/NotFound'

// Admin pages
import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'
import CoursesList from '@/pages/admin/CoursesList'
import TeachersList from '@/pages/admin/TeachersList'
import LeadsList from '@/pages/admin/LeadsList'
import CertificatesList from '@/pages/admin/CertificatesList'
import PromotionsList from '@/pages/admin/PromotionsList'
import UsersList from '@/pages/admin/UsersList'

/** Managers have no dashboard — they land straight on leads. */
function AdminHome() {
  const { isAdmin, role } = useAuth()
  return isAdmin ? <Dashboard /> : <Navigate to={homeForRole(role)} replace />
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/test" element={<CareerTest />} />
              <Route path="/verify" element={<Verify />} />
            </Route>

            {/* Admin auth */}
            <Route path="/admin/login" element={<Login />} />

            {/* Admin protected */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminHome />} />
              <Route path="courses" element={
                <ProtectedRoute roles={['admin']}><CoursesList /></ProtectedRoute>
              } />
              <Route path="teachers" element={
                <ProtectedRoute roles={['admin']}><TeachersList /></ProtectedRoute>
              } />
              <Route path="leads" element={<LeadsList />} />
              <Route path="certificates" element={
                <ProtectedRoute roles={['admin']}><CertificatesList /></ProtectedRoute>
              } />
              <Route path="promotions" element={
                <ProtectedRoute roles={['admin']}><PromotionsList /></ProtectedRoute>
              } />
              <Route path="users" element={
                <ProtectedRoute roles={['admin']}><UsersList /></ProtectedRoute>
              } />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </I18nProvider>
  )
}
