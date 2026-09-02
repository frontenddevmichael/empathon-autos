import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Section } from '@/components/PageLayout'

export function Privacy() {
  return (
    <Section style={{ maxWidth: 720, position: 'relative' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--stone)', marginBottom: 'var(--space-2)' }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>
      <h2>Privacy Policy</h2>
      <p style={{ marginBottom: 'var(--space-2)', color: 'var(--stone)' }}>Last updated: July 2026</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>Information We Collect</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>We collect personal information you provide when submitting enquiries, pre-orders, or contact forms: name, email, phone number, and company name.</p>
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>How We Use Your Information</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>We use your information solely to respond to your enquiries, process vehicle pre-orders, and provide customer support. We do not share your data with third parties.</p>
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>Data Retention</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>We retain lead data for the duration of the business relationship plus 12 months. You may request deletion at any time by contacting us.</p>
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>Contact</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>For privacy-related enquiries, email privacy@emphatonautos.com.</p>
        </div>
      </div>
    </Section>
  )
}
