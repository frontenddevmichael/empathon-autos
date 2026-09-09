import { useRef } from 'react'
import { Button } from './ui/Button'

type Props = React.ComponentProps<typeof Button>

export function RippleButton({ onClick, className, ...props }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = wrapRef.current?.querySelector('button, a') as HTMLElement | null
    if (el) {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--ripple-x', `${e.clientX - r.left}px`)
      el.style.setProperty('--ripple-y', `${e.clientY - r.top}px`)
    }
    onClick?.(e as any)
  }

  return (
    <span ref={wrapRef} className="btn-ripple" style={{ display: 'inline-flex' }} onClick={handleClick}>
      <Button {...props} className={className} />
    </span>
  )
}
