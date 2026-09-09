/**
 * Hand-drawn SVG decorative elements for a premium editorial aesthetic.
 * Each component renders a simple SVG with a sketchy, organic feel.
 */
import type { CSSProperties } from 'react'

interface DecoProps {
  className?: string
  style?: CSSProperties
}

/** Wavy underline / squiggle divider — path draws in on hover */
export function Squiggle({ className, style }: DecoProps) {
  return (
    <svg
      className={`deco-svg deco-hover-draw ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width="120"
      height="12"
      viewBox="0 0 120 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="deco-draw-target"
        d="M2 6c8-4 12 4 20 0s12-4 20 0 12 4 20 0 12-4 20 0 12 4 20 0 12-4 14 0"
        stroke="var(--navy)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.25"
      />
    </svg>
  )
}

/** Small hand-drawn circle / ring — gently rotates on hover, floats continuously */
export function HandCircle({ className, style, size = 48 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-rotate ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="var(--gold)"
        strokeWidth="1.5"
        strokeDasharray="3 4"
        opacity="0.3"
      />
    </svg>
  )
}

/** Scattered dots cluster — staggers in on scroll, lifts on hover */
export function HandDots({ className, style }: DecoProps) {
  return (
    <svg
      className={`deco-svg deco-hover-scale ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width="60"
      height="40"
      viewBox="0 0 60 40"
      fill="none"
      aria-hidden="true"
    >
      <circle className="deco-dot" cx="8" cy="12" r="2" fill="var(--navy)" style={{ '--deco-dot-opacity': '0.12' } as CSSProperties} />
      <circle className="deco-dot" cx="24" cy="8" r="1.5" fill="var(--gold)" style={{ '--deco-dot-opacity': '0.2' } as CSSProperties} />
      <circle className="deco-dot" cx="40" cy="16" r="2.5" fill="var(--navy)" style={{ '--deco-dot-opacity': '0.08' } as CSSProperties} />
      <circle className="deco-dot" cx="52" cy="10" r="1.5" fill="var(--gold)" style={{ '--deco-dot-opacity': '0.15' } as CSSProperties} />
      <circle className="deco-dot" cx="16" cy="28" r="2" fill="var(--gold)" style={{ '--deco-dot-opacity': '0.18' } as CSSProperties} />
      <circle className="deco-dot" cx="36" cy="32" r="1.5" fill="var(--navy)" style={{ '--deco-dot-opacity': '0.1' } as CSSProperties} />
      <circle className="deco-dot" cx="48" cy="30" r="2" fill="var(--navy)" style={{ '--deco-dot-opacity': '0.12' } as CSSProperties} />
    </svg>
  )
}

/** Hand-drawn arrow pointing right — rotates on hover */
export function HandArrow({ className, style, size = 40 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-rotate ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 20h20M22 14l6 6-6 6"
        stroke="var(--gold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
    </svg>
  )
}

/** Bracket / corner decoration — rotates on hover */
export function HandBracket({ className, style, position = 'top-left' }: DecoProps & { position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const transforms: Record<string, string> = {
    'top-left': '',
    'top-right': 'scale(-1,1) translate(-40,0)',
    'bottom-left': 'scale(1,-1) translate(0,-40)',
    'bottom-right': 'scale(-1,-1) translate(-40,-40)',
  }

  return (
    <svg
      className={`deco-svg deco-hover-rotate ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <g transform={transforms[position]}>
        <path
          d="M4 4v12M4 4h12"
          stroke="var(--navy)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.15"
        />
      </g>
    </svg>
  )
}

/** Wavy line divider — full width, path draws in on hover */
export function WavyDivider({ className, style }: DecoProps) {
  return (
    <svg
      className={`deco-svg deco-hover-draw ${className ?? ''}`.trim()}
      style={{ display: 'block', width: '100%', height: '8px', ...style }}
      viewBox="0 0 800 8"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="deco-draw-target-long"
        d="M0 4c10-3 15 3 25 0s15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0 15 3 25 0 15-3 25 0"
        stroke="var(--navy)"
        strokeWidth="1"
        opacity="0.08"
      />
    </svg>
  )
}

/* ── Industry-specific illustrations ── */

/** Hand-drawn sedan car silhouette — side profile, scales on hover */
export function CarSilhouette({ className, style, size = 80 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-scale ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={(size * 36) / 80}
      viewBox="0 0 80 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M 6 26 Q 4 26 4 22 Q 4 18 12 18 Q 18 12 26 10 Q 34 8 46 8 Q 54 8 60 12 Q 66 14 72 18 Q 74 20 74 22 Q 74 26 70 26 L 6 26 Z"
        stroke="var(--navy)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="var(--navy)"
        fillOpacity="0.04"
        opacity="0.2"
      />
      <path
        d="M 5 25 Q 3 25 3 21 Q 3 17 11 17 Q 17 11 25 9 Q 33 7 45 7 Q 53 7 59 11 Q 65 13 71 17 Q 73 19 73 21 Q 73 25 69 25 L 5 25 Z"
        stroke="var(--gold)"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.12"
      />
      <path d="M 17 12 L 25 11 L 25 16 L 17 16 Z" fill="var(--navy)" opacity="0.04" />
      <path d="M 28 11 L 44 11 L 44 16 L 28 16 Z" fill="var(--navy)" opacity="0.04" />
      <circle cx="20" cy="28" r="7" stroke="var(--navy)" strokeWidth="1.2" fill="none" opacity="0.2" />
      <circle cx="20" cy="28" r="5.5" stroke="var(--navy)" strokeWidth="0.8" fill="none" opacity="0.12" />
      <circle cx="20" cy="28" r="2" fill="var(--navy)" opacity="0.1" />
      <circle cx="58" cy="28" r="7" stroke="var(--navy)" strokeWidth="1.2" fill="none" opacity="0.2" />
      <circle cx="58" cy="28" r="5.5" stroke="var(--navy)" strokeWidth="0.8" fill="none" opacity="0.12" />
      <circle cx="58" cy="28" r="2" fill="var(--navy)" opacity="0.1" />
    </svg>
  )
}

/** Hand-drawn steering wheel — rotates on hover, floats gently */
export function SteeringWheel({ className, style, size = 48 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-rotate ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M 12 24 C 12 14, 16 8, 24 8 C 32 8, 36 14, 36 24 C 36 34, 32 40, 24 40 C 16 40, 12 34, 12 24"
        stroke="var(--navy)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.2"
      />
      <path
        d="M 11 24 C 11 13, 15 7, 24 7 C 33 7, 37 13, 37 24 C 37 35, 33 41, 24 41 C 15 41, 11 35, 11 24"
        stroke="var(--gold)"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.12"
      />
      <path d="M 24 24 L 24 11" stroke="var(--navy)" strokeWidth="1.2" strokeLinecap="round" opacity="0.15" />
      <path d="M 24 24 L 34 16" stroke="var(--navy)" strokeWidth="1.2" strokeLinecap="round" opacity="0.15" />
      <path d="M 24 24 L 30 36" stroke="var(--navy)" strokeWidth="1.2" strokeLinecap="round" opacity="0.15" />
      <circle cx="24" cy="24" r="5" stroke="var(--navy)" strokeWidth="1" fill="var(--navy)" fillOpacity="0.04" opacity="0.15" />
      <circle cx="24" cy="24" r="2" fill="var(--navy)" opacity="0.08" />
    </svg>
  )
}

/** Hand-drawn car key — scales on hover */
export function CarKey({ className, style, size = 48 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-scale ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={(size * 22) / 48}
      viewBox="0 0 52 22"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="11" r="8" stroke="var(--navy)" strokeWidth="1.5" fill="var(--navy)" fillOpacity="0.04" opacity="0.2" />
      <circle cx="10" cy="11" r="7" stroke="var(--gold)" strokeWidth="0.8" fill="none" opacity="0.12" />
      <circle cx="10" cy="11" r="2.5" stroke="var(--navy)" strokeWidth="1" fill="none" opacity="0.15" />
      <path d="M 18 9 L 44 9" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <path d="M 18 13 L 44 13" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <path d="M 19 10 L 43 10" stroke="var(--gold)" strokeWidth="0.6" strokeLinecap="round" opacity="0.1" />
      <path d="M 38 13 L 38 17 M 42 13 L 42 18 M 46 13 L 46 16"
        stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <path d="M 39 13 L 39 16 M 43 13 L 43 17"
        stroke="var(--gold)" strokeWidth="0.7" strokeLinecap="round" opacity="0.1" />
    </svg>
  )
}

/** Hand-drawn speedometer / gauge — scales on hover */
export function Speedometer({ className, style, size = 48 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-scale ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M 8 32 C 8 14, 16 6, 24 6 C 32 6, 40 14, 40 32"
        stroke="var(--navy)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.2"
      />
      <path
        d="M 7 32 C 7 13, 15 5, 24 5 C 33 5, 41 13, 41 32"
        stroke="var(--gold)"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.12"
      />
      <line x1="24" y1="6" x2="24" y2="11" stroke="var(--navy)" strokeWidth="1" strokeLinecap="round" opacity="0.18" />
      <line x1="13" y1="10" x2="16" y2="14" stroke="var(--navy)" strokeWidth="0.8" strokeLinecap="round" opacity="0.12" />
      <line x1="35" y1="10" x2="32" y2="14" stroke="var(--navy)" strokeWidth="0.8" strokeLinecap="round" opacity="0.12" />
      <line x1="9" y1="20" x2="13" y2="22" stroke="var(--navy)" strokeWidth="0.8" strokeLinecap="round" opacity="0.1" />
      <line x1="39" y1="20" x2="35" y2="22" stroke="var(--navy)" strokeWidth="0.8" strokeLinecap="round" opacity="0.1" />
      <path d="M 24 24 L 32 14" stroke="var(--navy)" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
      <path d="M 24 24 L 18 20" stroke="var(--navy)" strokeWidth="0.6" strokeLinecap="round" opacity="0.12" />
      <circle cx="24" cy="24" r="3" stroke="var(--navy)" strokeWidth="1" fill="var(--navy)" fillOpacity="0.04" />
      <circle cx="24" cy="24" r="1.2" fill="var(--navy)" opacity="0.15" />
    </svg>
  )
}

/** Hand-drawn shield with checkmark — scales on hover */
export function ShieldCheck({ className, style, size = 40 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-scale ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={(size * 48) / 40}
      viewBox="0 0 40 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M 20 4 C 28 4 36 8 36 14 L 36 22 C 36 32 28 40 20 44 C 12 40 4 32 4 22 L 4 14 C 4 8 12 4 20 4 Z"
        stroke="var(--navy)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="var(--navy)"
        fillOpacity="0.04"
        opacity="0.2"
      />
      <path
        d="M 20 5 C 27 5 34 9 34 14 L 34 22 C 34 31 27 39 20 42 C 13 39 6 31 6 22 L 6 14 C 6 9 13 5 20 5 Z"
        stroke="var(--gold)"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.12"
      />
      <path
        d="M 14 24 L 18 28 L 26 20"
        stroke="var(--navy)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
      />
    </svg>
  )
}

/** Hand-drawn handshake — two hands clasping, scales on hover */
export function Handshake({ className, style, size = 56 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-scale ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={(size * 30) / 56}
      viewBox="0 0 56 30"
      fill="none"
      aria-hidden="true"
    >
      <path d="M 2 24 C 12 24 18 20 24 16" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.2" />
      <path d="M 54 6 C 44 6 38 10 32 14" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.2" />
      <path d="M 3 23 C 13 23 19 19 25 15" stroke="var(--gold)" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.1" />
      <path d="M 53 7 C 43 7 37 11 31 15" stroke="var(--gold)" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.1" />
      <path d="M 22 16 C 26 12 30 12 32 14" stroke="var(--navy)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.18" />
      <path d="M 34 14 C 30 18 26 18 24 16" stroke="var(--navy)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.18" />
      <path d="M 26 18 C 30 20 32 20 34 16" stroke="var(--navy)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.15" />
      <path d="M 30 12 C 28 14 28 16 30 18" stroke="var(--navy)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.12" />
    </svg>
  )
}

/** Hand-drawn sparkle / star burst — twinkles on hover */
export function Sparkle({ className, style, size = 32 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-scale ${className ?? ''}`.trim()}
      style={{ display: 'block', transition: 'transform 600ms var(--ease-spring), opacity 400ms', ...style }}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path d="M16 4 L18 12 L26 14 L18 16 L16 24 L14 16 L6 14 L14 12 Z"
        stroke="var(--gold)" strokeWidth="1" strokeLinejoin="round" fill="var(--gold)" fillOpacity="0.08" opacity="0.25" />
      <circle cx="16" cy="14" r="1.5" fill="var(--gold)" opacity="0.15" />
    </svg>
  )
}

/** Hand-drawn compass / direction — points toward content */
export function Compass({ className, style, size = 48 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-rotate ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="18" stroke="var(--navy)" strokeWidth="1.2" fill="var(--navy)" fillOpacity="0.03" opacity="0.16" />
      <circle cx="24" cy="24" r="17" stroke="var(--gold)" strokeWidth="0.6" opacity="0.08" />
      <path d="M24 10 L28 22 L24 24 L20 22 Z" fill="var(--navy)" opacity="0.12" />
      <path d="M24 38 L20 26 L24 24 L28 26 Z" fill="var(--navy)" opacity="0.08" />
      <circle cx="24" cy="24" r="2" fill="var(--navy)" opacity="0.18" />
    </svg>
  )
}

/** Hand-drawn chat bubble — for contact/lead sections */
export function ChatBubble({ className, style, size = 40 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg deco-hover-scale ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 4 L36 4 L36 28 L24 28 L16 36 L16 28 L4 28 Z"
        stroke="var(--navy)" strokeWidth="1.2" strokeLinejoin="round" fill="var(--navy)" fillOpacity="0.03" opacity="0.16" />
      <path d="M12 14 L28 14" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" opacity="0.15" />
      <path d="M12 20 L22 20" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" opacity="0.1" />
    </svg>
  )
}

/** Hand-drawn car under a magnifying glass — empty-search state, draws on reveal */
export function EmptyCarSearch({ className, style, size = 120 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={(size * 70) / 120}
      viewBox="0 0 120 70"
      fill="none"
      aria-hidden="true"
    >
      {/* Magnifying glass */}
      <circle
        className="deco-draw-reveal"
        pathLength={1}
        cx="89" cy="21" r="12"
        stroke="var(--gold)"
        strokeWidth="1.6"
        opacity="0.55"
      />
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M97.5 29.5 L108 40"
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Car — monoline side profile */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M13 55 C10 55 9 52 9 49 C9 46 12 45 16 44 C23 39 32 37 44 36 C55 35 65 38 71 42 C76 45 80 47 83 50 C85 52 85 55 80 56"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M9 57 C28 58 58 58 81 57"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle
        className="deco-draw-reveal"
        pathLength={1}
        cx="27" cy="61" r="7"
        stroke="var(--navy)"
        strokeWidth="1.6"
        opacity="0.55"
      />
      <circle
        className="deco-draw-reveal"
        pathLength={1}
        cx="66" cy="61" r="7"
        stroke="var(--navy)"
        strokeWidth="1.6"
        opacity="0.55"
      />
      <circle cx="27" cy="61" r="2.2" fill="var(--navy)" opacity="0.45" />
      <circle cx="66" cy="61" r="2.2" fill="var(--navy)" opacity="0.45" />
    </svg>
  )
}

/** Hand-drawn open book with pencil — empty-learning state, draws on reveal */
export function EmptyOpenBook({ className, style, size = 120 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={(size * 80) / 120}
      viewBox="0 0 120 80"
      fill="none"
      aria-hidden="true"
    >
      {/* Spine */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M60 20 C58 34 58 48 60 62"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Left page */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M60 20 C40 15 18 17 10 23 C13 38 34 50 60 62"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      {/* Right page */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M60 20 C80 15 102 17 110 23 C107 38 86 50 60 62"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      {/* Text lines */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M20 29 C30 28 42 29 50 32"
        stroke="var(--navy)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M22 36 C32 35 44 36 52 39"
        stroke="var(--navy)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Pencil */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M86 12 L46 52"
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M46 52 L41 55 M40 53 L38 57"
        stroke="var(--gold)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

/** Hand-drawn auction gavel — empty-auctions state, draws on reveal */
export function EmptyAuctionGavel({ className, style, size = 120 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={(size * 80) / 120}
      viewBox="0 0 120 80"
      fill="none"
      aria-hidden="true"
    >
      {/* Gavel head — two loose monoline curves */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M13 24 C15 13 36 8 54 11 C66 13 68 22 60 25"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M13 24 C22 31 42 32 58 26"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Handle */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M38 22 C45 34 53 46 59 58"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Sound block / podium */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M28 64 L88 64"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M32 70 L84 70"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M28 64 L32 70 M88 64 L84 70"
        stroke="var(--navy)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Gold bid paddle accent */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M92 10 C100 12 106 16 108 22"
        stroke="var(--gold)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M92 10 L92 30"
        stroke="var(--gold)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

/** Hand-drawn road line — connects the pre-order steps, draws on reveal */
export function RoadDraw({ className, style }: DecoProps) {
  return (
    <svg
      className={`deco-svg ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width="100%"
      height="40"
      viewBox="0 0 600 60"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {/* Road edges */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M0 24 C 100 16, 200 32, 300 24 C 400 16, 500 32, 600 24"
        stroke="var(--navy)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M0 36 C 100 28, 200 44, 300 36 C 400 28, 500 44, 600 36"
        stroke="var(--navy)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Dashed centreline — dashes light up left to right */}
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M30 30 L80 30 M130 30 L180 30 M230 30 L280 30 M330 30 L380 30 M430 30 L480 30 M530 30 L580 30"
        stroke="var(--navy)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  )
}

/** Hand-drawn fork-in-the-road — draws on scroll reveal */
export function ForkRoad({ className, style, size = 140 }: DecoProps & { size?: number }) {
  return (
    <svg
      className={`deco-svg ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width={size}
      height={(size * 120) / 140}
      viewBox="0 0 140 120"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M70 118 C69 100 71 84 70 70 M70 70 C54 50 34 28 20 10 M70 70 C86 50 106 28 120 10"
        stroke="var(--navy)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.32"
      />
      <circle
        className="deco-draw-reveal"
        pathLength={1}
        cx="20" cy="9" r="3.2"
        stroke="var(--gold)"
        strokeWidth="1.4"
        opacity="0.5"
      />
      <circle
        className="deco-draw-reveal"
        pathLength={1}
        cx="120" cy="9" r="3.2"
        stroke="var(--gold)"
        strokeWidth="1.4"
        opacity="0.5"
      />
    </svg>
  )
}

/** Hand-drawn underline swoosh — draws on scroll reveal */
export function UnderlineFlourish({ className, style }: DecoProps) {
  return (
    <svg
      className={`deco-svg ${className ?? ''}`.trim()}
      style={{ display: 'block', ...style }}
      width="200"
      height="16"
      viewBox="0 0 200 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="deco-draw-reveal"
        pathLength={1}
        d="M6 11 C 44 5, 84 3, 128 5 C 156 6, 176 9, 194 13 C 186 10, 172 8, 150 8 C 110 8, 64 10, 8 13"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  )
}


