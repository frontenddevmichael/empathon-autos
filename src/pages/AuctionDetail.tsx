import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Section } from '@/components/PageLayout'
import { useToast } from '@/context/ToastContext'
import { getLotById, getVehicleById, placeBid, subscribeToLot } from '@/lib/queries'
import styles from './AuctionDetail.module.css'

export function AuctionDetail() {
  const { lotId } = useParams()
  const { showToast } = useToast()
  const [lot, setLot] = useState<import('@/types').Lot | null>(null)
  const [vehicle, setVehicle] = useState<import('@/types').Vehicle | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bidding, setBidding] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!lotId) return
    ;(async () => {
      try {
        const data = await getLotById(lotId)
        if (data) {
          setLot(data)
          setBidAmount(String(data.current_bid + (data.current_bid > 0 ? data.opening_bid * 0.05 : data.opening_bid)))
          setTimeLeft(new Date(data.closes_at).getTime() - Date.now())
          const v = await getVehicleById(data.vehicle_id)
          if (v) setVehicle(v)
        }
      } catch (e) { showToast('Failed to load auction', 'error') }
    })()
  }, [lotId])

  // Real-time bid updates via Supabase Realtime
  useEffect(() => {
    if (!lotId) return
    return subscribeToLot(lotId, (updatedLot) => {
      setLot(updatedLot)
      setTimeLeft(new Date(updatedLot.closes_at).getTime() - Date.now())
    })
  }, [lotId])

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(prev => prev - 1000), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleBid = async () => {
    if (!lot || !bidAmount) return
    const amount = +bidAmount
    if (amount <= lot.current_bid) { showToast('Bid must be higher than current bid', 'error'); return }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { showToast('Sign in required to place a bid', 'error'); return }

    setBidding(true)
    const { error } = await placeBid(lot.id, session.user.id, amount, lot.current_bid)
    setBidding(false)

    if (error) { showToast('Bid failed — someone may have bid first', 'error'); return }
    showToast(`Bid of ₦${amount.toLocaleString()} placed`)
  }

  const days = Math.max(0, Math.floor(timeLeft / 86400000))
  const hours = Math.max(0, Math.floor((timeLeft % 86400000) / 3600000))
  const mins = Math.max(0, Math.floor((timeLeft % 3600000) / 60000))
  const secs = Math.max(0, Math.floor((timeLeft % 60000) / 1000))

  if (!lot) return <Section><p>Loading auction...</p></Section>

  const img = vehicle?.media?.find((m: import('@/types').VehicleMedia) => m.is_primary) ?? vehicle?.media?.[0]
  const vehicleAlt = vehicle ? `${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} ${vehicle.year}` : ''

  return (
    <Section>
      <div className={styles.layout}>
        <div>
          {img ? (
            <img src={img.url} alt={vehicleAlt} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}>No image</div>
          )}
        </div>
        <div>
          <Badge variant="live" />
          <h1 className={styles.title}>{vehicle?.make} {vehicle?.model}</h1>
          <p className={styles.subtitle}>{vehicle?.year} &middot; {vehicle?.mileage?.toLocaleString()} km &middot; {vehicle?.transmission}</p>

          {timeLeft > 0 ? (
            <div className={styles.timer}>
              {[{ v: days, l: 'Days' }, { v: hours, l: 'Hours' }, { v: mins, l: 'Mins' }, { v: secs, l: 'Secs' }].map(t => (
                <div key={t.l} className={styles.timerBlock}>
                  <p className={styles.timerValue}>{String(t.v).padStart(2, '0')}</p>
                  <p className={styles.timerLabel}>{t.l}</p>
                </div>
              ))}
            </div>
          ) : <p className={styles.ended}>Auction has ended</p>}

          <div className={styles.bidBox}>
            <p className={styles.bidLabel}>Current Bid</p>
            <p className={styles.bidAmount}>₦{(lot.current_bid / 1_000_000).toFixed(2)}M</p>
            <p className={styles.bidOpening}>Opening bid: ₦{(lot.opening_bid / 1_000_000).toFixed(1)}M</p>
          </div>

          {timeLeft > 0 && (
            <div>
              <div className={styles.bidRow}>
                <Input value={bidAmount} onChange={e => setBidAmount(e.target.value)} type="number" placeholder="Your bid (₦)" min={lot.current_bid + 1} />
                <Button onClick={handleBid} loading={bidding}>Place Bid</Button>
              </div>
              <p className={styles.bidMin}>Minimum bid: ₦{(lot.current_bid + lot.opening_bid * 0.05).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
