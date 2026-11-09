import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import styles from './legal.module.css'

const SECTIONS = [
  {
    heading: 'Information We Collect',
    body: 'We collect personal information you provide when submitting enquiries, pre-orders, or contact forms: name, email, phone number, and company name.',
  },
  {
    heading: 'How We Use Your Information',
    body: 'We use your information solely to respond to your enquiries, process vehicle pre-orders, and provide customer support. We do not share your data with third parties.',
  },
  {
    heading: 'Data Retention',
    body: 'We retain lead data for the duration of the business relationship plus 12 months. You may request deletion at any time by contacting us.',
  },
  {
    heading: 'Contact',
    body: 'For privacy-related enquiries, email privacy@emphatonautos.com.',
  },
]

export function Privacy() {
  return (
    <Section containerSize="narrow" space="md">
      <Link to="/" className={styles.back}>
        <ArrowLeft size={14} /> Back to Home
      </Link>
      <h1 className={styles.title}>Privacy Policy</h1>
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
