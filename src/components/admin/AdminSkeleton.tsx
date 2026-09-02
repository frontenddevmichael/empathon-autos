export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} style={{ padding: 'var(--space-1) var(--space-2)' }}>
                <div style={{ height: 14, width: '60%', background: 'var(--border)', borderRadius: 4, animation: 'shimmer 1.5s ease-in-out infinite' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} style={{ borderBottom: '1px solid var(--border)' }}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} style={{ padding: 'var(--space-1) var(--space-2)' }}>
                  <div style={{ height: 14, width: `${40 + c * 15}%`, background: 'var(--border)', borderRadius: 4, animation: 'shimmer 1.5s ease-in-out infinite' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
