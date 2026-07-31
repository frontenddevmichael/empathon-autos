import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { ToastProvider } from '@/context/ToastContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { FloatingCTA } from '@/components/FloatingCTA'
import { LeadForm } from '@/components/LeadForm'
import { PageLayout } from '@/components/PageLayout'
import { PageTransition } from '@/components/PageTransition'
import { Nav } from '@/components/ui/Nav'
import { Footer } from '@/components/ui/Footer'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { ScrollProgress } from '@/components/ScrollProgress'
import { MouseGlow } from '@/components/MouseGlow'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useLenis } from '@/hooks/useLenis'
import { LoadingScreen, AdminSkeleton } from '@/components/LoadingScreen'

const SITE_URL = 'https://www.emphatonautos.com'
const DEFAULT_DESC = 'Premium vehicle imports, pre-orders, and sales based in Lagos, Nigeria. Trusted automotive partner since 2019.'
const DEFAULT_IMG = '/og-image.svg'

function GlobalMeta() {
  return (
    <Helmet>
      <html lang="en" />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={DEFAULT_DESC} />
      <meta property="og:site_name" content="Empathon Autos" />
      <meta property="og:description" content={DEFAULT_DESC} />
      <meta property="og:image" content={DEFAULT_IMG} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content={DEFAULT_DESC} />
      <meta name="twitter:image" content={DEFAULT_IMG} />
      <link rel="canonical" href={SITE_URL} />
    </Helmet>
  )
}

function namedLazy<T>(importer: () => Promise<{ [key: string]: T }>, name: string) {
  return lazy(() => importer().then(m => ({ default: m[name] as any })))
}

const AdminLogin = namedLazy(() => import('@/pages/admin/AdminLogin'), 'AdminLogin')
const AdminDashboard = namedLazy(() => import('@/pages/admin/AdminDashboard'), 'AdminDashboard')
const AdminVehicles = namedLazy(() => import('@/pages/admin/AdminVehicles'), 'AdminVehicles')
const AdminVehicleForm = namedLazy(() => import('@/pages/admin/AdminVehicleForm'), 'AdminVehicleForm')
const AdminLeads = namedLazy(() => import('@/pages/admin/AdminLeads'), 'AdminLeads')
const AdminAuctions = namedLazy(() => import('@/pages/admin/AdminAuctions'), 'AdminAuctions')
const AdminContent = namedLazy(() => import('@/pages/admin/AdminContent'), 'AdminContent')
const AdminAuctionForm = namedLazy(() => import('@/components/admin/AdminAuctionForm'), 'AdminAuctionForm')
const Home = namedLazy(() => import('@/pages/Home'), 'Home')
const Inventory = namedLazy(() => import('@/pages/Inventory'), 'Inventory')
const VehicleDetail = namedLazy(() => import('@/pages/VehicleDetail'), 'VehicleDetail')
const Electric = namedLazy(() => import('@/pages/Electric'), 'Electric')
const PreOrder = namedLazy(() => import('@/pages/PreOrder'), 'PreOrder')
const Auctions = namedLazy(() => import('@/pages/Auctions'), 'Auctions')
const AuctionDetail = namedLazy(() => import('@/pages/AuctionDetail'), 'AuctionDetail')
const Corporate = namedLazy(() => import('@/pages/Corporate'), 'Corporate')
const About = namedLazy(() => import('@/pages/About'), 'About')
const Contact = namedLazy(() => import('@/pages/Contact'), 'Contact')
const Blog = namedLazy(() => import('@/pages/Blog'), 'Blog')
const BlogPost = namedLazy(() => import('@/pages/BlogPost'), 'BlogPost')
const Privacy = namedLazy(() => import('@/pages/Legal'), 'Privacy')
const Terms = namedLazy(() => import('@/pages/Legal'), 'Terms')
const AdminBlog = namedLazy(() => import('@/pages/admin/AdminBlog'), 'AdminBlog')
const AdminTestimonials = namedLazy(() => import('@/pages/admin/AdminTestimonials'), 'AdminTestimonials')
const NotFound = namedLazy(() => import('@/pages/NotFound'), 'NotFound')

function PublicLayout({ children }: { children: React.ReactNode }) {
  const [leadOpen, setLeadOpen] = useState(false)
  return (
    <PageLayout>
      <MouseGlow />
      <Nav />
      <PageTransition>{children}</PageTransition>
      <Footer />
      <FloatingCTA onEnquire={() => setLeadOpen(true)} />
      <LeadForm open={leadOpen} onClose={() => setLeadOpen(false)} type="enquiry" />
    </PageLayout>
  )
}

function Lazy({ cmp: C }: { cmp: React.LazyExoticComponent<any> }) {
  return <Suspense fallback={<LoadingScreen />}><C /></Suspense>
}

/** Hooks that need Router context live here, inside <BrowserRouter>. */
function AppShell({ children }: { children: React.ReactNode }) {
  useScrollReveal()
  useScrollToTop()
  usePageTitle()
  useLenis()
  return (
    <>
      <ScrollProgress />
      {children}
    </>
  )
}

export function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <AppShell>
      <ToastProvider>
        <ErrorBoundary>
          <Routes>
          <Route path="/" element={<PublicLayout><Lazy cmp={Home} /></PublicLayout>} />
          <Route path="/inventory" element={<PublicLayout><Lazy cmp={Inventory} /></PublicLayout>} />
          <Route path="/inventory/:id" element={<PublicLayout><Lazy cmp={VehicleDetail} /></PublicLayout>} />
          <Route path="/ev" element={<PublicLayout><Lazy cmp={Electric} /></PublicLayout>} />
          <Route path="/pre-order" element={<PublicLayout><Lazy cmp={PreOrder} /></PublicLayout>} />
          <Route path="/auctions" element={<PublicLayout><Lazy cmp={Auctions} /></PublicLayout>} />
          <Route path="/auctions/:lotId" element={<PublicLayout><Lazy cmp={AuctionDetail} /></PublicLayout>} />
          <Route path="/corporate" element={<PublicLayout><Lazy cmp={Corporate} /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><Lazy cmp={About} /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Lazy cmp={Contact} /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Lazy cmp={Blog} /></PublicLayout>} />
          <Route path="/blog/:slug" element={<PublicLayout><Lazy cmp={BlogPost} /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><Lazy cmp={Privacy} /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><Lazy cmp={Terms} /></PublicLayout>} />

          <Route path="/admin/login" element={<Suspense fallback={<LoadingScreen height="60vh" />}><AdminLogin /></Suspense>} />
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<Suspense fallback={<AdminSkeleton />}><AdminDashboard /></Suspense>} />
            <Route path="vehicles" element={<Suspense fallback={<AdminSkeleton />}><AdminVehicles /></Suspense>} />
            <Route path="vehicles/new" element={<Suspense fallback={<AdminSkeleton />}><AdminVehicleForm /></Suspense>} />
            <Route path="vehicles/:id/edit" element={<Suspense fallback={<AdminSkeleton />}><AdminVehicleForm /></Suspense>} />
            <Route path="leads" element={<Suspense fallback={<AdminSkeleton />}><AdminLeads /></Suspense>} />
            <Route path="auctions" element={<Suspense fallback={<AdminSkeleton />}><AdminAuctions /></Suspense>} />
            <Route path="auctions/new" element={<Suspense fallback={<AdminSkeleton />}><AdminAuctionForm /></Suspense>} />
            <Route path="auctions/:id/edit" element={<Suspense fallback={<AdminSkeleton />}><AdminAuctionForm /></Suspense>} />
            <Route path="content" element={<Suspense fallback={<AdminSkeleton />}><AdminContent /></Suspense>} />
            <Route path="blog" element={<Suspense fallback={<AdminSkeleton />}><AdminBlog /></Suspense>} />
            <Route path="testimonials" element={<Suspense fallback={<AdminSkeleton />}><AdminTestimonials /></Suspense>} />
          </Route>
          <Route path="*" element={<PublicLayout><Lazy cmp={NotFound} /></PublicLayout>} />
        </Routes>
        </ErrorBoundary>
      </ToastProvider>
      </AppShell>
    </BrowserRouter>
    <GlobalMeta />
    </HelmetProvider>
  )
}
