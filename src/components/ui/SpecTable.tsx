import type { ReactNode } from 'react'
import styles from './SpecTable.module.css'

export interface SpecRow {
  label: string
  value: ReactNode
}

interface SpecTableProps {
  rows: SpecRow[]
  className?: string
}

/**
 * Hairline spec rows: label left in stone, value right in ink.
 * No boxes, no zebra stripes — the rule is the only separator.
 */
export function SpecTable({ rows, className = '' }: SpecTableProps) {
  return (
    <dl className={`${styles.table} ${className}`.trim()}>
      {rows.map(row => (
        <div key={row.label} className={styles.row}>
          <dt className={styles.label}>{row.label}</dt>
          <dd className={styles.value}>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
