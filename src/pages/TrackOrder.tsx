import { useState, useRef, type FormEvent } from 'react'
import { Check, Package, Ship, Search, Truck, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Section } from '@/components/PageLayout'
import { useToast } from '@/context/ToastContext'
import { RippleButton } from '@/components/RippleButton'
import { SplitHeading } from '@/components/SplitHeading'
import { HeroSection } from '@/components/HeroSection'
import { lookupOrder, validateReference, ORDER_STAGES } from '@/lib/mockOrders'
import type { TrackedOrder } from '@/lib/mockOrders'
import styles from './TrackOrder.module.css'

const stageIcons = [Package, Package, Ship, ShieldCheck, Truck]

function Timeline({ order }: { order: TrackedOrder }) {
  const current = order.stageIndex
  return (
    <ol className={styles.timeline} aria-label="Order progress">
      {ORDER_STAGES.map((stage, i) => {
        const Icon = stageIcons[i]
        const done = i < current
        const isCurrent = i === current
        return (
          <li
            key={stage}
            className={`${styles.step} ${done ? styles.stepDone : ''} ${isCurrent ? styles.stepCurrent : ''}`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <div className={styles.stepTrack}>
              <span className={styles.stepDot}>
                {done ? <Check size={14} strokeWidth={3} /> : <Icon size={16} />}
              </span>
              {i < ORDER_STAGES.length - 1 && <span className={styles.stepLine} />}
            </div>
            <div className={styles.stepLabel}>
              <span className={styles.stepTitle}>{stage}</span>
              {isCurrent && <span className={styles.stepTag}>In progress</span>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function TrackOrder() {
  const { showToast } = useToast()
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const value = reference.trim()
    if (!value) {
      setError('Please enter an order reference')
      showToast('Please enter an order reference', 'error')
      return
    }
    if (!validateReference(value)) {
      setError('That doesn\u2019t look right. Use the format EA-XXXXXX (e.g. EA-202418).')
      showToast('Invalid reference format', 'error')
      setOrder(null)
      return
    }
    setError('')
    const result = lookupOrder(value)
    setOrder(result)
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  return (
    <>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1400&q=90&fit=crop' },
          { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1400&q=90&fit=crop' },
        ]}
        label="Track Order"
        title="Where's My Vehicle?"
        subtitle="Enter the order reference we sent you and follow your vehicle from sourcing all the way to your driveway."
        deco="car"
      />

      <Section style={{ position: 'relative' }}>
        <div className={styles.lookup} style={{ maxWidth: 640, margin: '0 auto' }}>
          <SplitHeading as="h2" style={{ marginBottom: 'var(--space-2)', textAlign: 'center' }}>
            Track Your Order
          </SplitHeading>
          <div className="section-divider section-divider-center" />
          <p style={{ color: 'var(--stone)', marginBottom: 'var(--space-3)', textAlign: 'center' }}>
            Your reference looks like <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>EA-XXXXXX</strong> and is on your order confirmation.
          </p>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Input
              label="Order Reference"
              placeholder="EA-XXXXXX"
              value={reference}
              onChange={e => { setReference(e.target.value); if (error) setError('') }}
              error={error || undefined}
              aria-describedby={error ? 'track-error' : undefined}
            />
            <RippleButton type="submit" variant="primary" magnetic>
              <Search size={16} style={{ marginRight: 8 }} aria-hidden="true" />
              Track Order
            </RippleButton>
          </form>
          {!order && !error && (
            <p className={styles.hint}>
              Don&apos;t have a reference? Try <button type="button" className={styles.sample} onClick={() => setReference('EA-202418')}>EA-202418</button> to see the flow.
            </p>
          )}
        </div>

        {order && (
          <div ref={resultRef} className={`scroll-reveal ${styles.result}`} style={{ maxWidth: 960, margin: 'var(--space-5) auto 0' }}>
            <div className={styles.resultHeader}>
              <div>
                <p className={styles.refLabel}>Order Reference</p>
                <p className={styles.refValue} style={{ fontFamily: 'var(--font-mono)' }}>{order.reference}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className={styles.refLabel}>Current Status</p>
                <p className={styles.refStatus}>{order.stage}</p>
              </div>
            </div>

            <div className={styles.resultGrid}>
              <div className={styles.summary}>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Order Summary</h3>
                <dl className={styles.details}>
                  <div>
                    <dt>Vehicle</dt>
                    <dd>{order.vehicle.make} {order.vehicle.model}</dd>
                  </div>
                  <div>
                    <dt>Colour</dt>
                    <dd>{order.vehicle.colour}</dd>
                  </div>
                  <div>
                    <dt>Year</dt>
                    <dd>{order.vehicle.year}</dd>
                  </div>
                  <div>
                    <dt>Order Placed</dt>
                    <dd>{order.placedDate}</dd>
                  </div>
                  <div>
                    <dt>Estimated Pickup</dt>
                    <dd>{order.estimatedPickup}</dd>
                  </div>
                </dl>
              </div>
              <Timeline order={order} />
            </div>
          </div>
        )}
      </Section>
    </>
  )
}
