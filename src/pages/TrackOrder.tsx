import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Section } from '@/components/layout/Section'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { lookupOrder, validateReference, ORDER_STAGES } from '@/lib/mockOrders'
import type { TrackedOrder } from '@/lib/mockOrders'
import styles from './TrackOrder.module.css'

function Timeline({ order }: { order: TrackedOrder }) {
  const current = order.stageIndex
  return (
    <ol className={styles.timeline} aria-label="Order progress">
      {ORDER_STAGES.map((stage, i) => {
        const done = i < current
        const isCurrent = i === current
        return (
          <li
            key={stage}
            className={`${styles.step} ${done ? styles.stepDone : ''} ${isCurrent ? styles.stepCurrent : ''}`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.stage}>{stage}</span>
            <span className={styles.tag}>{done ? 'Done' : isCurrent ? 'In progress' : ''}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function TrackOrder() {
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  const [order, setOrder] = useState<TrackedOrder | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const value = reference.trim()
    if (!value) {
      setError('Please enter an order reference.')
      setOrder(null)
      return
    }
    if (!validateReference(value)) {
      setError('That doesn\u2019t look right. Use the format EA-XXXXXX (for example EA-202418).')
      setOrder(null)
      return
    }
    setError('')
    setOrder(lookupOrder(value))
  }

  return (
    <>
      <PageHero
        label="Track order"
        title="Where's my vehicle?"
        subtitle="Enter the reference from your order confirmation and follow the car from sourcing to your driveway."
        images={[{ url: '/heroimg.jpg' }, { url: '/heroimg2.jpg' }]}
        overlay="left"
      />

      <Section tone="paper" space="sm">
        <div className={styles.lookup}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Input
              label="Order reference"
              placeholder="EA-XXXXXX"
              value={reference}
              onChange={e => { setReference(e.target.value); if (error) setError('') }}
              error={error || undefined}
            />
            <Button type="submit">Track order</Button>
          </form>
          <p className={styles.hint}>
            Don't have a reference? Try{' '}
            <button type="button" className={styles.sample} onClick={() => { setReference('EA-202418'); setError(''); setOrder(lookupOrder('EA-202418')) }}>
              EA-202418
            </button>{' '}
            to see the flow.
          </p>
        </div>

        {order && (
          <div className={`scroll-reveal ${styles.result}`}>
            <div className={styles.resultHead}>
              <div>
                <p className={styles.label}>Reference</p>
                <p className={styles.reference}>{order.reference}</p>
              </div>
              <div>
                <p className={styles.label}>Status</p>
                <p className={styles.status}>{order.stage}</p>
              </div>
            </div>

            <div className={styles.resultGrid}>
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
                  <dt>Order placed</dt>
                  <dd>{order.placedDate}</dd>
                </div>
                <div>
                  <dt>Estimated pickup</dt>
                  <dd>{order.estimatedPickup}</dd>
                </div>
              </dl>
              <Timeline order={order} />
            </div>
          </div>
        )}

        <p className={styles.footnote}>
          Reference not working? <Link to="/contact">Contact us</Link> and we'll look it up.
        </p>
      </Section>
    </>
  )
}
