import { Link } from 'react-router-dom'
import { Section } from '@/components/layout/Section'
import styles from './legal.module.css'

const SECTIONS = [
  {
    heading: 'General',
    body: 'Empathon Autos provides vehicle import, pre-order, and sales services. All prices are in Nigerian Naira (₦) and subject to availability.',
  },
  {
    heading: 'Pre-Orders',
    body: 'Pre-order details, timelines, and pricing are confirmed at the time of agreement. A deposit may be required to secure your order.',
  },
  {
    heading: 'Auctions',
    body: 'All bids are binding. The highest bid at auction close wins, subject to the reserve price being met. Winning bidders will be contacted within 24 hours.',
  },
  {
    heading: 'Limitation of Liability',
    body: 'Empathon Autos is not liable for delays caused by shipping, customs, or force majeure. Vehicle specifications may vary from published images.',
  },
]

export function Terms() {
  return (
    <Section containerSize="narrow" space="md">
      <Link to="/" className={styles.back}>
        Back to home
      </Link>
      <h1 className={styles.title}>Terms of Service</h1>
      <p className={styles.updated}>Last updated: July 2026</p>
      <div className={styles.body}>
        {SECTIONS.map(section => (
          <div key={section.heading} className={styles.block}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
