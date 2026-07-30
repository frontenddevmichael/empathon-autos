import { useState, useEffect } from 'react'
import { MessageCircle, X, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FloatingCTAProps {
  onEnquire?: () => void
  showEnquire?: boolean
}

export function FloatingCTA({ onEnquire, showEnquire = true }: FloatingCTAProps) {
  const [scrolled, setScrolled] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    let frame: number
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 300)
        setShowBackToTop(y > 800)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [])

  if (!scrolled) return null

  return (
    <>
      {/* Back to Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          style={{
            position: 'fixed',
            bottom: showEnquire ? 140 : 80,
            right: 20,
            zIndex: 999,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid rgba(12,30,58,0.1)',
            background: 'white',
            color: 'var(--navy)',
            cursor: 'pointer',
            display: showBackToTop ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(10,10,10,0.08)',
            transition: 'all 250ms var(--ease-out), opacity 300ms',
            opacity: showBackToTop ? 1 : 0,
            transform: showBackToTop ? 'translateY(0)' : 'translateY(10px)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--navy)'; e.currentTarget.style.marginTop = '-2px' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(12,30,58,0.1)'; e.currentTarget.style.marginTop = '0' }}
      >
        <ChevronUp size={18} />
      </button>

      {/* WhatsApp Floating Button */}
      <div style={{ position: 'fixed', bottom: showEnquire ? 80 : 20, right: 20, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        {/* Expanded options */}
        {expanded && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              animation: 'floatFadeIn 200ms var(--ease-out)',
            }}
          >
            {onEnquire && (
              <Button
                size="sm"
                onClick={() => { onEnquire(); setExpanded(false) }}
                style={{
                  borderRadius: 999,
                  boxShadow: '0 2px 12px rgba(10,10,10,0.1)',
                  whiteSpace: 'nowrap',
                  fontSize: 'var(--text-xs)',
                }}
              >
                Send Enquiry
              </Button>
            )}
            <a
              href="https://wa.me/2348023392388?text=Hi%20Empathon%20Autos!%20I%27d%20like%20to%20make%20an%20enquiry."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 999,
                background: '#25D366',
                color: 'white',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 12px rgba(37,211,102,0.25)',
                transition: 'all 200ms var(--ease-out)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,211,102,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(37,211,102,0.25)' }}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        )}

        {/* Main toggle button */}
        <button
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Close quick actions' : 'Quick actions'}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: 'none',
            background: expanded ? 'var(--error)' : 'var(--navy)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: expanded
              ? '0 4px 16px rgba(197,48,48,0.25)'
              : '0 4px 16px rgba(12,30,58,0.2)',
            transition: 'all 250ms var(--ease-out)',
            transform: expanded ? 'rotate(45deg)' : 'rotate(0)',
          }}
          onMouseEnter={e => { if (!expanded) e.currentTarget.style.transform = 'scale(1.08)' }}
          onMouseLeave={e => { if (!expanded) e.currentTarget.style.transform = '' }}
        >
          {expanded ? <X size={20} /> : <MessageCircle size={20} />}
        </button>
      </div>

      <style>{`
        @keyframes floatFadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}
