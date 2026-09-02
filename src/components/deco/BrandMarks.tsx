import { useEffect, useRef, useState } from 'react'

/**
 * Original hand-drawn brand marks for Empathon Autos.
 * Single stroke-weight line art, drawn with stroke-dasharray so each mark
 * animates in once on mount/scroll — no icon-pack imports, no gradients,
 * no blurred blobs. Color is inherited via currentColor so each usage sets
 * its own token color.
 */

function useDraw(delay = 0) {
  const ref = useRef<SVGPathElement>(null)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return { ref, drawn }
}

/** Signature hero mark: a single road line resolving into an abstracted
 *  vehicle silhouette — built as one continuous stroke, not a stock car icon. */
export function HeroMark({ size = 340, delay = 300 }: { size?: number; delay?: number }) {
  const { drawn } = useDraw(delay)
  return (
    <svg width={size} height={size} viewBox="0 0 340 340" fill="none" aria-hidden="true">
      <circle cx="170" cy="170" r="164" stroke="var(--border)" strokeWidth="1" />
      <path
        d="M40 230 C 90 230, 100 190, 140 190 C 175 190, 170 150, 210 150
           C 245 150, 250 120, 300 118"
        stroke="var(--gold-dust)"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: drawn ? 0 : 1,
          transition: 'stroke-dashoffset 1400ms cubic-bezier(0.16,1,0.3,1)',
        }}
      />
      <path
        d="M120 214 h96 c6 0 11-4 13-10 l7-20 c2-6-2-12-9-12 h-118
           c-7 0-11 6-9 12 l7 20 c2 6 7 10 13 10z"
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinejoin="round"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: drawn ? 0 : 1,
          transition: 'stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1) 900ms',
        }}
      />
      <circle cx="140" cy="216" r="9" stroke="var(--ink)" strokeWidth="2"
        opacity={drawn ? 1 : 0} style={{ transition: 'opacity 300ms ease 1700ms' }} />
      <circle cx="208" cy="216" r="9" stroke="var(--ink)" strokeWidth="2"
        opacity={drawn ? 1 : 0} style={{ transition: 'opacity 300ms ease 1700ms' }} />
      <text x="170" y="285" textAnchor="middle" fontSize="11" letterSpacing="3"
        fill="var(--text-secondary)" opacity={drawn ? 0.7 : 0}
        style={{ transition: 'opacity 500ms ease 1900ms', textTransform: 'uppercase' }}>
        Since 2019
      </text>
    </svg>
  )
}

/** Perk icon — global sourcing (route across a map, not a generic truck) */
export function IconSourcing({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 13c3 1.5 6-1 9 0s6 3.5 9 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="12" r="1.6" fill="currentColor" />
      <circle cx="24" cy="11" r="1.6" fill="currentColor" />
      <circle cx="16" cy="22" r="1.6" fill="currentColor" />
    </svg>
  )
}

/** Perk icon — inspection/verification (a checked document, not a shield-badge) */
export function IconVerified({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M9 5h14v22l-7-4-7 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 15l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Perk icon — nationwide reach (a pin with a widening ripple, not a truck) */
export function IconReach({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 27s8-8.5 8-14.5S20.4 4 16 4 8 7 8 12.5 16 27 16 27z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="12.5" r="3.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

/** Process-step icons — distinctive, single-line-weight, no icon-pack */
export function IconExplore({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.3 15.3L20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
export function IconEnquire({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 5h16v11H9l-4 4V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 9.5h8M8 12.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
export function IconDrive({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Corporate service icons — distinct concepts, not generic briefcase/gear icons */
export function IconFleet({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="3" y="14" width="9" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="10" width="12" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="23" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="23" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="22" cy="23" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
export function IconLease({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M6 10a8 8 0 0114 -3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 4v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 18a8 8 0 01-14 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 24v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IconMaintenance({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M17 6l5 5-2 2-5-5 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M15 8l-8 8c-1 1-1 3 0 4s3 1 4 0l8-8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="8" cy="20" r="1.4" fill="currentColor" />
    </svg>
  )
}
export function IconReporting({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M5 22V13M13 22V6M21 22v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 22h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** A small pulsing "live" dot — for the auctions listing, signals real-time energy
 *  without a decorative blob. Pure CSS ping, no library. */
export function LiveDot({ size = 8 }: { size?: number }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'var(--live)', opacity: 0.6,
        animation: 'empathon-ping 1.6s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: 'var(--live)' }} />
      <style>{`@keyframes empathon-ping{0%{transform:scale(1);opacity:0.6}75%,100%{transform:scale(2.4);opacity:0}}`}</style>
    </span>
  )
}


export function LostRoadMark({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <path d="M20 130 C 50 130, 55 100, 80 100 C 105 100, 100 60, 130 40"
        stroke="var(--border)" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 10" />
      <g transform="translate(96 18) rotate(18)">
        <rect x="-3" y="0" width="6" height="46" rx="2" fill="var(--stone-light)" />
        <rect x="-34" y="-8" width="68" height="34" rx="4" stroke="var(--gold-dust)" strokeWidth="2" fill="var(--surface-elevated)" />
        <path d="M-20 9 l40 0 M-8 -2 l-12 22 M8 -2 l12 22" stroke="var(--gold-dust)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function ProcessConnector({ drawn }: { drawn: boolean }) {
  return (
    <svg
      viewBox="0 0 720 4" preserveAspectRatio="none"
      style={{ position: 'absolute', top: 27, left: '16.5%', width: '67%', height: 4, zIndex: 0 }}
      aria-hidden="true"
    >
      <path
        d="M0 2 H720" stroke="var(--gold-dust)" strokeWidth="1.4" strokeDasharray="2 7" strokeLinecap="round"
        pathLength={1}
        style={{
          strokeDasharray: drawn ? '2 7' : '1 1',
          strokeDashoffset: drawn ? 0 : 1,
          opacity: drawn ? 0.5 : 0,
          transition: 'opacity 600ms ease 300ms, stroke-dashoffset 1200ms cubic-bezier(0.16,1,0.3,1) 300ms',
        }}
      />
    </svg>
  )
}
