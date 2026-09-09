import { useMemo } from 'react'
import styles from './Charts.module.css'

/* ── Bar Chart ── */

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  showLabels?: boolean
  showValues?: boolean
  animated?: boolean
}

export function BarChart({ data, height = 200, showLabels = true, showValues = true, animated = true }: BarChartProps) {
  const max = useMemo(() => Math.max(...data.map(d => d.value), 1), [data])
  const barWidth = Math.min(48, (100 / Math.max(data.length, 1)) * 0.6)
  const gap = Math.min(16, (100 / Math.max(data.length, 1)) * 0.4)

  return (
    <svg
      viewBox={`0 0 ${data.length * (barWidth + gap) + gap} ${height + (showLabels ? 32 : 0)}`}
      style={{ width: '100%', height: 'auto', maxHeight: height + (showLabels ? 32 : 0) }}
      role="img"
      aria-label="Bar chart"
    >
      {data.map((d, i) => {
        const x = gap + i * (barWidth + gap)
        const barH = max > 0 ? (d.value / max) * (height - 10) : 0
        const y = height - barH
        const color = d.color || 'var(--navy)'
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={4}
              fill={color}
              opacity={0.85}
              style={animated ? {
                animation: `${styles.barGrow} 600ms var(--ease-out) ${i * 80}ms both`,
                transformOrigin: `${x + barWidth / 2}px ${height}px`,
              } : undefined}
            />
            {showValues && d.value > 0 && (
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fill="var(--stone)" fontSize="11" fontWeight="600" fontFamily="var(--font-body)">
                {d.value}
              </text>
            )}
            {showLabels && (
              <text x={x + barWidth / 2} y={height + 18} textAnchor="middle" fill="var(--stone)" fontSize="10" fontFamily="var(--font-body)">
                {d.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ── Donut Chart ── */

interface DonutChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
  thickness?: number
  showLegend?: boolean
  centerLabel?: string
  animated?: boolean
}

export function DonutChart({ data, size = 160, thickness = 24, showLegend = true, centerLabel = 'total', animated = true }: DonutChartProps) {
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data])
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  let cumulative = 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Donut chart"
        style={{ flexShrink: 0 }}
      >
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const pct = total > 0 ? d.value / total : 0
          const dashLen = pct * circumference
          const dashOff = -cumulative * circumference
          cumulative += pct
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOff}
              strokeLinecap="round"
              style={animated ? {
                animation: `${styles.donutDraw} 800ms var(--ease-out) ${i * 120}ms both`,
                ['--circumference' as string]: `${circumference}`,
              } : undefined}
            />
          )
        })}
        <text x={center} y={center - 4} textAnchor="middle" fill="var(--ink)" fontSize="20" fontWeight="800" fontFamily="var(--font-display)">{total}</text>
        <text x={center} y={center + 14} textAnchor="middle" fill="var(--stone)" fontSize="11" fontFamily="var(--font-body)">{centerLabel}</text>
      </svg>

      {showLegend && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--stone)' }}>{d.label}</span>
              <span className="tabular-nums" style={{ fontWeight: 600, marginLeft: 'auto' }}>{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Sparkline ── */

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  width?: number
  animated?: boolean
}

export function Sparkline({ data, color = 'var(--navy)', height = 40, width = 120, animated = true }: SparklineProps) {
  if (data.length < 2) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const padding = 2

  // Build points and area path in one pass
  const pointArr = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - (v - min) / range) * (height - padding * 2),
  }))

  const linePoints = pointArr.map(p => `${p.x},${p.y}`).join(' ')
  const last = pointArr[pointArr.length - 1]
  const first = pointArr[0]
  const areaPath = `M${first.x},${height} ` + pointArr.map(p => `L${p.x},${p.y}`).join(' ') + ` L${last.x},${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sparkline" style={{ overflow: 'visible' }}>
      <path
        d={areaPath}
        fill={color}
        opacity={0.08}
        style={animated ? { animation: `${styles.sparkFade} 800ms var(--ease-out) forwards` } : undefined}
      />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animated ? {
          strokeDasharray: 300,
          strokeDashoffset: 300,
          animation: `${styles.sparkDraw} 1s var(--ease-out) forwards`,
        } : undefined}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={3}
        fill={color}
        style={animated ? { animation: `${styles.sparkFade} 300ms var(--ease-out) 800ms forwards`, opacity: 0 } : undefined}
      />
    </svg>
  )
}

/* ── Horizontal Bar Chart ── */

interface HBarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  animated?: boolean
}

export function HBarChart({ data, height = 160, animated = true }: HBarChartProps) {
  const max = useMemo(() => Math.max(...data.map(d => d.value), 1), [data])
  const barHeight = Math.min(28, (height - (data.length - 1) * 6) / Math.max(data.length, 1))
  const labelWidth = 80

  return (
    <svg
      viewBox={`0 0 340 ${data.length * (barHeight + 6)}`}
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label="Horizontal bar chart"
    >
      {data.map((d, i) => {
        const y = i * (barHeight + 6)
        const barW = max > 0 ? (d.value / max) * (340 - labelWidth - 50) : 0
        const color = d.color || 'var(--navy)'
        // Truncate label to fit
        const displayLabel = d.label.length > 10 ? d.label.slice(0, 9) + '…' : d.label
        return (
          <g key={i}>
            <text x={0} y={y + barHeight / 2 + 4} fill="var(--stone)" fontSize="11" fontFamily="var(--font-body)">
              {displayLabel}
            </text>
            <rect x={labelWidth} y={y} width={340 - labelWidth - 50} height={barHeight} rx={4} fill="var(--border)" />
            <rect
              x={labelWidth}
              y={y}
              width={barW}
              height={barHeight}
              rx={4}
              fill={color}
              opacity={0.85}
              style={animated ? {
                animation: `${styles.hBarGrow} 600ms var(--ease-out) ${i * 80}ms both`,
                transformOrigin: `${labelWidth}px ${y + barHeight / 2}px`,
              } : undefined}
            />
            <text x={labelWidth + barW + 8} y={y + barHeight / 2 + 4} fill="var(--ink)" fontSize="11" fontWeight="600" fontFamily="var(--font-body)" className="tabular-nums">
              {d.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
