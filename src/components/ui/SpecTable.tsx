import styles from './SpecTable.module.css'

interface SpecTableProps {
  specs: Record<string, string | number | null | undefined>
}

export function SpecTable({ specs }: SpecTableProps) {
  const rows = Object.entries(specs).filter(([, v]) => v != null && v !== '')

  if (rows.length === 0) return null

  return (
    <table className={styles.table}>
      <tbody>
        {rows.map(([key, value]) => (
          <tr key={key} className={styles.row}>
            <td className={`${styles.cell} ${styles.label}`}>{key.replace(/_/g, ' ')}</td>
            <td className={`${styles.cell} ${styles.value}`}>{String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
