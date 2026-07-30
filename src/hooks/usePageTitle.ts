import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Home | Empathon Autos',
  '/inventory': 'Inventory | Empathon Autos',
  '/pre-order': 'Pre-Order | Empathon Autos',
  '/auctions': 'Auctions | Empathon Autos',
  '/corporate': 'Corporate Sales | Empathon Autos',
  '/about': 'About Us | Empathon Autos',
  '/contact': 'Contact | Empathon Autos',
  '/blog': 'Blog | Empathon Autos',
  '/privacy': 'Privacy Policy | Empathon Autos',
  '/terms': 'Terms of Use | Empathon Autos',
  '/admin/login': 'Admin Login | Empathon Autos',
  '/admin': 'Dashboard | Empathon Autos Admin',
  '/admin/vehicles': 'Vehicles | Empathon Autos Admin',
  '/admin/vehicles/new': 'Add Vehicle | Empathon Autos Admin',
  '/admin/leads': 'Leads | Empathon Autos Admin',
  '/admin/auctions': 'Auctions | Empathon Autos Admin',
  '/admin/auctions/new': 'New Auction | Empathon Autos Admin',
  '/admin/content': 'Content | Empathon Autos Admin',
  '/admin/blog': 'Blog | Empathon Autos Admin',
}

const defaultTitle = 'Empathon Autos'

/**
 * Updates document.title based on current route pathname.
 * Call once in the root component inside <BrowserRouter>.
 */
export function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Try exact match first, then prefix match
    const title = pageTitles[pathname] ?? (() => {
      for (const [prefix, t] of Object.entries(pageTitles)) {
        if (prefix.endsWith('/') && pathname.startsWith(prefix)) return t
      }
      return defaultTitle
    })()
    document.title = title
  }, [pathname])
}
