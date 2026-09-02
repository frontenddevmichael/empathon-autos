import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Nav } from './ui/Nav'
import { Footer } from './ui/Footer'
import { WhatsAppFloat } from './ui/WhatsAppFloat'
import { DecoGrain } from './deco/DecoGrain'
import styles from './PageLayout.module.css'

export function PageLayout() {
  return (
    <div className={styles.layout}>
      <DecoGrain opacity={0.02} />
      <Nav />
      <main id="main-content" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}

export function Section({ children, className = '', as: Tag = 'section', ...props }: {
  children: ReactNode
  className?: string
  as?: 'section' | 'div'
  [key: string]: any
}) {
  return <Tag className={`${styles.section} ${className}`} {...props}>{children}</Tag>
}
