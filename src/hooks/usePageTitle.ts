import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Home | Empathon Autos',
  '/inventory': 'Inventory | Empathon Autos',
  '/ev': 'Electric Vehicles | Empathon Autos',
  '/pre-order': 'Pre-Order | Empathon Autos',
  '/track-order': 'Track Order | Empathon Autos',
  '/auctions': 'Auctions | Empathon Autos',
  '/corporate': 'Corporate Sales | Empathon Autos',
  '/about': 'About Us | Empathon Autos',
  '/contact': 'Contact | Empathon Autos',
  '/blog': 'Blog | Empathon Autos',
  '/register': 'Register to Bid | Empathon Autos',
  '/dashboard': 'My Dashboard | Empathon Autos',
  '/privacy': 'Privacy Policy | Empathon Autos',
  '/terms': 'Terms of Use | Empathon Autos',
  '/admin/login': 'Admin Login | Empathon Autos',
  '/admin': 'Dashboard | Empathon Autos Admin',
  '/admin/vehicles': 'Vehicles | Empathon Autos Admin',
  '/admin/auctions': 'Auctions | Empathon Autos Admin',
  '/admin/leads': 'Leads | Empathon Autos Admin',
  '/admin/content': 'Content | Empathon Autos Admin',
  '/admin/blog': 'Blog | Empathon Autos Admin',
  '/admin/testimonials': 'Testimonials | Empathon Autos Admin',
}

const defaultTitle = 'Empathon Autos'

/**
 * Longest matching route wins: "/blog/ev-guide" resolves to the "/blog" title,
 * and "/" only ever matches the home page itself.
 */
function titleFor(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]

  let bestKey = ''
  for (const key of Object.keys(pageTitles)) {
    if (key === '/') continue
    const matches = pathname.startsWith(`${key}/`)
    if (matches && key.length > bestKey.length) bestKey = key
  }
  return bestKey ? pageTitles[bestKey] : defaultTitle
}

/**
 * Updates document.title based on current route pathname.
 * Call once in the root component inside <BrowserRouter>.
 */
export function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = titleFor(pathname)
  }, [pathname])
}
