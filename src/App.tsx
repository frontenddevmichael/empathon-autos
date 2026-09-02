import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageLayout } from './components/PageLayout'
import { AdminGuard } from './components/admin/AdminGuard'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminLogin } from './pages/admin/AdminLogin'
import { Home } from './pages/Home'
import { Inventory } from './pages/Inventory'
import { VehicleDetail } from './pages/VehicleDetail'
import { PreOrder } from './pages/PreOrder'
import { Corporate } from './pages/Corporate'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Auctions } from './pages/Auctions'
import { AuctionDetail } from './pages/AuctionDetail'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { NotFound } from './pages/NotFound'

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminVehicles = lazy(() => import('./pages/admin/AdminVehicles').then(m => ({ default: m.AdminVehicles })))
const AdminVehicleForm = lazy(() => import('./pages/admin/AdminVehicleForm').then(m => ({ default: m.AdminVehicleForm })))
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads').then(m => ({ default: m.AdminLeads })))
const AdminAuctions = lazy(() => import('./pages/admin/AdminAuctions').then(m => ({ default: m.AdminAuctions })))

function AdminFallback() {
  return <div style={{ padding: 'var(--space-3)' }}><p>Loading...</p></div>
}

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PageLayout />}>
          <Route index element={<Home />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/:id" element={<VehicleDetail />} />
          <Route path="pre-order" element={<PreOrder />} />
          <Route path="corporate" element={<Corporate />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="auctions" element={<Auctions />} />
          <Route path="auctions/:lotId" element={<AuctionDetail />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
            <Route path="/admin/vehicles" element={<Suspense fallback={<AdminFallback />}><AdminVehicles /></Suspense>} />
            <Route path="/admin/vehicles/new" element={<Suspense fallback={<AdminFallback />}><AdminVehicleForm /></Suspense>} />
            <Route path="/admin/vehicles/:id/edit" element={<Suspense fallback={<AdminFallback />}><AdminVehicleForm /></Suspense>} />
            <Route path="/admin/leads" element={<Suspense fallback={<AdminFallback />}><AdminLeads /></Suspense>} />
            <Route path="/admin/auctions" element={<Suspense fallback={<AdminFallback />}><AdminAuctions /></Suspense>} />
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
