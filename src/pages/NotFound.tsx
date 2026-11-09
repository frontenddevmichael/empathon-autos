import { Link } from 'react-router-dom'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import styles from './NotFound.module.css'

export function NotFound() {
  return (
    <Section tone="paper" space="lg" className={styles.wrap}>
      <div className={styles.inner}>
        <p className={styles.message}>This page doesn&rsquo;t exist.</p>
        <Link to="/">
          <Button size="lg">Back to home</Button>
        </Link>
      </div>
    </Section>
  )
}
