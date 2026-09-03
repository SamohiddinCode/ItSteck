import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth, homeForRole } from '@/features/auth/AuthContext'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import { I18nProvider } from '@/i18n'

// Layouts
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'

const Landing = lazy(() => import('@/pages/Landing'))
const Courses = lazy(() => import('@/pages/Courses'))
const CourseDetail = lazy(() => import('@/pages/CourseDetail'))
const Apply = lazy(() => import('@/pages/Apply'))
const CareerTest = lazy(() => import('@/pages/CareerTest'))
const Verify = lazy(() => import('@/pages/Verify'))
const Business = lazy(() => import('@/pages/Business'))
const About = lazy(() => import('@/pages/About'))
const Legal = lazy(() => import('@/pages/Legal'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Login = lazy(() => import('@/pages/admin/Login'))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const CoursesList = lazy(() => import('@/pages/admin/CoursesList'))
const TeachersList = lazy(() => import('@/pages/admin/TeachersList'))
const LeadsList = lazy(() => import('@/pages/admin/LeadsList'))
const CertificatesList = lazy(() => import('@/pages/admin/CertificatesList'))
const PromotionsList = lazy(() => import('@/pages/admin/PromotionsList'))
const UsersList = lazy(() => import('@/pages/admin/UsersList'))

const PageLoader = () => <div className="min-h-[45vh] grid place-items-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>

/** Managers have no dashboard — they land straight on leads. */
function AdminHome() {
  const { isAdmin, role } = useAuth()
  return isAdmin ? <Dashboard /> : <Navigate to={homeForRole(role)} replace />
}

export default function App() {
  return (
    <I18nProvider>
      <HashRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}><Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/test" element={<CareerTest />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/business" element={<Business />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Legal type="privacy" />} />
              <Route path="/terms" element={<Legal type="terms" />} />
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
          </Routes></Suspense>
        </AuthProvider>
      </HashRouter>
    </I18nProvider>
  )
}
