import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Section } from '@/components/PageLayout'

export function Terms() {
  return (
    <Section style={{ maxWidth: 720, position: 'relative' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--stone)', marginBottom: 'var(--space-2)' }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>
      <h2>Terms of Service</h2>
      <p style={{ marginBottom: 'var(--space-2)', color: 'var(--stone)' }}>Last updated: July 2026</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>General</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>Empathon Autos provides vehicle import, pre-order, and sales services. All prices are in Nigerian Naira (₦) and subject to availability.</p>
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>Pre-Orders</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>Pre-order details, timelines, and pricing are confirmed at the time of agreement. A deposit may be required to secure your order.</p>
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>Auctions</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>All bids are binding. The highest bid at auction close wins, subject to the reserve price being met. Winning bidders will be contacted within 24 hours.</p>
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>Limitation of Liability</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>Empathon Autos is not liable for delays caused by shipping, customs, or force majeure. Vehicle specifications may vary from published images.</p>
        </div>
      </div>
    </Section>
  )
}
