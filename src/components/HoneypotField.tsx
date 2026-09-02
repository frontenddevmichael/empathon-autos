import { useRef } from 'react'

export function HoneypotField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true" tabIndex={-1}>
      <label htmlFor="hp-field">Do not fill this field</label>
      <input id="hp-field" name="hp_field" type="text" value={value} onChange={e => onChange(e.target.value)} autoComplete="off" tabIndex={-1} />
    </div>
  )
}
