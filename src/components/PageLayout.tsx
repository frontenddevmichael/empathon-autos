import type { ReactNode } from 'react'

export function Section({ children, dark, className = '', style }: { children: ReactNode; dark?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <section
      className={className}
      style={{
        padding: 'var(--section-y) var(--space-4)',
        background: dark ? 'var(--navy)' : undefined,
        color: dark ? 'white' : undefined,
        ...style,
      }}
    >
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </section>
  )
}

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a id="main-content" tabIndex={-1} style={{ position: 'absolute', top: 0 }} />
      <div style={{ paddingTop: 'var(--nav-height)' }}>
        {children}
      </div>
    </>
  )
}
