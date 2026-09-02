import { useId } from 'react'

interface DecoParticlesProps {
  count?: number
  color?: string
  className?: string
}

export function DecoParticles({ count = 15, color = 'var(--gold-dust)', className = '' }: DecoParticlesProps) {
  const id = useId()
  const particles = Array.from({ length: count }, (_, i) => ({
    cx: 10 + (i / count) * 80,
    cy: 10 + Math.sin(i * 1.7) * 35 + 35,
    r: 1 + (i % 3) * 0.5,
    delay: i * 0.4,
    dur: 3 + (i % 5) * 0.5,
  }))

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id={`glow-${id}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={`${p.cx}%`} cy={`${p.cy}%`} r={p.r}
            fill={color} opacity="0.4" filter={`url(#glow-${id})`}
          >
            <animate attributeName="cy" values={`${p.cy}%;${p.cy + 8}%;${p.cy}%`} dur={`${p.dur}s`} repeatCount="indefinite" begin={`${p.delay}s`} />
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur={`${p.dur}s`} repeatCount="indefinite" begin={`${p.delay}s`} />
          </circle>
        ))}
      </svg>
    </div>
  )
}
