/**
 * Full-page loading skeleton used as Suspense fallback for lazy routes.
 * Matches the visual structure of the page layout.
 */
export function LoadingScreen({ height = '60vh' }: { height?: string }) {
  return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 var(--space-4)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* Branded pulse animation */}
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 16,
            background: 'var(--navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 20, letterSpacing: '0.03em',
            fontFamily: 'var(--font-display)',
            zIndex: 1,
          }}>
            EA
          </div>
          <div style={{
            position: 'absolute', inset: -8,
            borderRadius: '50%',
            border: '2px solid rgba(12,30,58,0.08)',
            animation: 'loadingRing 1.5s ease-in-out infinite',
          }} />
          <style>{`
            @keyframes loadingRing {
              0% { transform: scale(0.8); opacity: 0; }
              50% { opacity: 0.5; }
              100% { transform: scale(1.4); opacity: 0; }
            }
          `}</style>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 240, alignItems: 'center' }}>
          <div style={{ height: 10, width: '45%', background: 'var(--border)', borderRadius: 5, animation: 'loadingShimmer 1.2s ease-in-out infinite' }} />
          <div style={{ height: 10, width: '70%', background: 'var(--border)', borderRadius: 5, animation: 'loadingShimmer 1.2s ease-in-out 0.15s infinite' }} />
          <div style={{ height: 10, width: '55%', background: 'var(--border)', borderRadius: 5, animation: 'loadingShimmer 1.2s ease-in-out 0.3s infinite' }} />
        </div>
        <style>{`
          @keyframes loadingShimmer {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    </div>
  )
}

/**
 * Minimal admin skeleton for sidebar-heavy layouts.
 * Includes its own @keyframes so it works when rendered independently of LoadingScreen.
 */
export function AdminSkeleton() {
  return (
    <div style={{ height: '70vh', display: 'flex', gap: 16, padding: 'var(--space-4)' }}>
      <style>{`
        @keyframes loadingShimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
      <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ height: 14, background: 'var(--border)', borderRadius: 4, animation: 'loadingShimmer 1.2s ease-in-out infinite', animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: 14, background: 'var(--border)', borderRadius: 4, animation: 'loadingShimmer 1.2s ease-in-out infinite', animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
    </div>
  )
}
