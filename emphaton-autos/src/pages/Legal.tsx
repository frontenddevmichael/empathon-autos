import { Link } from 'react-router-dom'
import { Section } from '@/components/PageLayout'

export function Privacy() {
  return (
    <Section>
      <Link to="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--navy)', display: 'inline-block', marginBottom: 'var(--space-2)' }}>&larr; Back to Home</Link>
      <h1>Privacy Policy</h1>
      <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>Last updated: 2025</p>
        <div>
          <h3>Information We Collect</h3>
          <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>We collect information you provide when you fill out forms on our website — including your name, email address, phone number, and company name. We also collect browsing data through standard analytics tools.</p>
        </div>
        <div>
          <h3>How We Use Your Information</h3>
          <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>To respond to your enquiries, process pre-order requests, provide corporate quotes, and improve our website experience. We do not sell your personal information to third parties.</p>
        </div>
        <div>
          <h3>Data Retention</h3>
          <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>We retain your data only as long as necessary to fulfil the purposes described in this policy, or as required by law.</p>
        </div>
        <div>
          <h3>Contact</h3>
          <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>For privacy-related enquiries, contact us at empathonautos@gmail.com or visit our showroom at 123 Ajao Road, Ikeja, Lagos.</p>
        </div>
      </div>
    </Section>
  )
}

export function Terms() {
  return (
    <Section>
      <Link to="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--navy)', display: 'inline-block', marginBottom: 'var(--space-2)' }}>&larr; Back to Home</Link>
      <h1>Terms of Use</h1>
      <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>Last updated: 2025</p>
        <div>
          <h3>General</h3>
          <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>By accessing this website, you agree to these terms. Empathon Autos reserves the right to update these terms at any time.</p>
        </div>
        <div>
          <h3>Vehicle Listings</h3>
          <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>All vehicle listings are subject to availability. Prices are indicative and may change without notice. We make every effort to ensure accuracy but cannot guarantee all specifications are error-free.</p>
        </div>
        <div>
          <h3>Pre-Orders</h3>
          <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>Pre-order deposits are refundable under the terms agreed at the time of order. Delivery timelines are estimates and may be affected by factors outside our control.</p>
        </div>
        <div>
          <h3>Limitation of Liability</h3>
          <p style={{ color: 'var(--stone)', fontSize: 'var(--text-sm)' }}>Empathon Autos shall not be liable for any indirect or consequential losses arising from the use of this website or the purchase of vehicles.</p>
        </div>
      </div>
    </Section>
  )
}
