import { Children, isValidElement, cloneElement, useRef, useEffect, type ReactNode, type ElementType } from 'react'
import { useInView } from '@/hooks/useInView'

interface ScrollRevealProps {
  children: ReactNode
  as?: ElementType
  className?: string
  threshold?: number
  delay?: number
  stagger?: boolean
  [key: string]: any
}

function useStaggerCallback(threshold = 0.1) {
  const obsRef = useRef<IntersectionObserver | null>(null)

  return (el: HTMLElement | null) => {
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(24px)'

    if (obsRef.current) obsRef.current.disconnect()
    obsRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        obsRef.current?.disconnect()
      }
    }, { threshold })
    obsRef.current.observe(el)
  }
}

export function ScrollReveal({ children, as: Tag = 'div', className = '', threshold, delay = 0, stagger, ...props }: ScrollRevealProps) {
  const [ref, inView] = useInView({ threshold })
  const getRef = useStaggerCallback(threshold)
  const hasPlayed = useRef(false)

  useEffect(() => {
    if (!inView || hasPlayed.current) return
    hasPlayed.current = true
    const el = ref.current
    if (!el || stagger) return
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  }, [inView, ref, stagger])

  // Set initial state (non-stagger)
  useEffect(() => {
    if (stagger) return
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(24px)'
    el.style.transition = `opacity 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
  }, [ref, delay, stagger])

  if (stagger) {
    const kids = Children.toArray(children)
    return (
      <Tag className={className} {...props}>
        {kids.map((child, i) => {
          if (!isValidElement(child)) return child
          return cloneElement(child as any, {
            key: i,
            style: {
              ...((child as any).props?.style || {}),
              opacity: 0,
              transform: 'translateY(24px)',
              transition: `opacity 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay + i * 60 + (i % 3) * 20}ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay + i * 60 + (i % 3) * 20}ms`,
            },
            ref: getRef,
          })
        })}
      </Tag>
    )
  }

  return <Tag ref={ref} className={className} {...props}>{children}</Tag>
}
