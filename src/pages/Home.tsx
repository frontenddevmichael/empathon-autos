import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getHomePageData } from '@/lib/queries'
import type { Vehicle, VehicleMedia, Testimonial } from '@/types'
import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { VehicleCard } from '@/components/ui/VehicleCard'
import { VehicleCardSkeleton } from '@/components/ui/Skeleton'
import { ScrollReveal } from '@/components/ScrollReveal'
import { TextReveal } from '@/components/TextReveal'
import { Ripple } from '@/components/Ripple'
import { MagneticButton } from '@/components/MagneticButton'
import { useParallax } from '@/hooks/useParallax'
import { useInView } from '@/hooks/useInView'
import { DecoGrain } from '@/components/deco/DecoGrain'
import {
  HeroMark, IconSourcing, IconVerified, IconReach,
  IconExplore, IconEnquire, IconDrive, ProcessConnector,
} from '@/components/deco/BrandMarks'

const perks = [
  { icon: IconSourcing, title: 'Sourced Globally', desc: 'North America, Europe, the Gulf, and the Far East.' },
  { icon: IconVerified, title: 'Inspected, Not Assumed', desc: 'Every unit checked before it reaches you.' },
  { icon: IconReach, title: 'Lagos Since 2019', desc: 'Delivered wherever you are in Nigeria.' },
]

const steps = [
  { Icon: IconExplore, title: 'Explore', desc: 'Browse vehicles sourced from four continents.' },
  { Icon: IconEnquire, title: 'Consult', desc: 'Honest, specific guidance — not a sales script.' },
  { Icon: IconDrive, title: 'Own It', desc: 'Walk in or pre-order. Support continues after the sale.' },
]

export function Home() {
  const [vehicles, setVehicles] = useState<(Vehicle & { media: VehicleMedia[] })[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [processRef, stepsInView] = useInView({ threshold: 0.2 })
  const heroParallax = useParallax(0.25)

  useEffect(() => {
    getHomePageData()
      .then(({ vehicles: v, testimonials: t }) => {
        setVehicles(v)
        setTestimonials(t)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SeoHead />
      <style>{`@media(max-width:768px){.hero-grid{grid-template-columns:1fr!important;text-align:center}.hero-grid>div{display:flex;flex-direction:column;align-items:center}}`}</style>
      <DecoGrain opacity={0.025} />

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100dvh',
        background: 'var(--ink)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 var(--space-4)',
          width: '100%', position: 'relative', zIndex: 1,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 0.7fr',
            gap: 'var(--space-5)',
            alignItems: 'center',
          }} className="hero-grid">
            <div>
              <p style={{
                fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.15em', color: 'rgba(196,168,130,0.5)',
                marginBottom: 'var(--space-2)',
              }}>
                Trust · Fit · Drive
              </p>

              <h1 style={{
                fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 0.98,
                color: 'white',
                marginBottom: 'var(--space-2)',
              }}>
                <TextReveal text="Own it with" as="span" delay={200} speed={55} /><br />
                <span style={{ color: 'var(--gold-dust)' }}>
                  <TextReveal text="no surprises." as="span" delay={700} speed={55} />
                </span>
              </h1>

              <p style={{
                fontSize: 'var(--text-base)',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: 'var(--space-3)',
                maxWidth: 440,
                lineHeight: 1.7,
              }}>
                Empathon Autos sources, inspects, and delivers vehicles from four
                continents — priced the same for everyone, explained in plain terms.
              </p>

              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Link to="/inventory">
                  <MagneticButton strength={0.1}>
                    <Ripple>
                      <Button style={{
                        background: 'var(--clay)',
                        color: 'var(--ink)',
                        fontWeight: 600,
                        height: 44,
                        padding: '0 var(--space-3)',
                        border: 'none',
                      }}>
                        Browse Inventory <ArrowRight size={16} />
                      </Button>
                    </Ripple>
                  </MagneticButton>
                </Link>
                <Link to="/pre-order">
                  <Button variant="ghost" style={{
                    color: 'rgba(255,255,255,0.6)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    height: 44,
                  }}>
                    Pre-Order a Vehicle
                  </Button>
                </Link>
              </div>
            </div>

            <div ref={heroParallax} style={{ position: 'relative', display: 'flex', justifyContent: 'center', willChange: 'transform' }}>
              <HeroMark size={320} delay={500} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PERKS ─── */}
      <section style={{
        background: 'var(--paper-light)',
        borderBottom: '1px solid var(--border)',
        marginTop: -1,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: 'var(--space-3) var(--space-4)',
          display: 'grid', gap: 'var(--space-2)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}>
          {perks.map(p => (
            <div key={p.title} style={{ display: 'flex', gap: 'var(--space-1-5)', alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'var(--gold-dust-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                color: 'var(--gold-dust)',
              }}>
                <p.icon size={18} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--ink)', marginBottom: 1 }}>{p.title}</p>
                <p style={{ fontSize: 'var(--text-xs)' }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED ─── */}
      <section>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: 'var(--space-7) var(--space-4)',
        }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: 'var(--clay-deep)', marginBottom: 'var(--space-0-5)',
            }}>
              Collection
            </p>
            <h2>Featured Vehicles</h2>
            <p style={{ marginTop: 'var(--space-0-5)' }}>Handpicked and ready to drive.</p>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
            </div>
          ) : vehicles.length > 0 ? (
            <>
              <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
              <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                <Link to="/inventory"><Button variant="secondary">View All Vehicles <ArrowRight size={14} /></Button></Link>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section style={{ background: 'var(--paper-warm)' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: 'var(--space-7) var(--space-4)',
        }}>
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <p style={{
              fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: 'var(--clay-deep)', marginBottom: 'var(--space-0-5)',
            }}>
              Process
            </p>
            <h2>Simple, on purpose.</h2>
          </div>

          <div ref={processRef} style={{ position: 'relative' }}>
            <ProcessConnector drawn={stepsInView} />
            <div style={{
              display: 'grid', gap: 'var(--space-3)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              position: 'relative', zIndex: 1,
            }}>
              {steps.map((s, i) => (
                <ScrollReveal key={s.title} delay={i * 150}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto var(--space-2)', color: 'var(--gold-dust)',
                    }}>
                      <s.Icon size={22} />
                    </div>
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-0-5)' }}>{s.title}</h3>
                    <p style={{ fontSize: 'var(--text-sm)' }}>{s.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      {testimonials.length > 0 && (
        <section>
          <div style={{
            maxWidth: 1280, margin: '0 auto',
            padding: 'var(--space-7) var(--space-4)',
          }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{
                fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: 'var(--clay-deep)', marginBottom: 'var(--space-0-5)',
              }}>
                Testimonials
              </p>
              <h2>What buyers say</h2>
            </div>

            <div style={{
              display: 'grid', gap: 'var(--space-3)',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}>
              {testimonials.map(t => (
                <div key={t.id} style={{
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--surface)',
                }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 'var(--space-1)' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="12" height="12" viewBox="0 0 20 20" fill={i < t.rating ? 'var(--gold-dust)' : 'var(--border)'}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    lineHeight: 1.7,
                    marginBottom: 'var(--space-2)',
                    fontStyle: 'italic',
                    color: 'var(--ink)',
                  }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</p>
                    {t.company && <p style={{ fontSize: 'var(--text-xs)' }}>{t.company}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section style={{ background: 'var(--ink)' }}>
        <div style={{
          maxWidth: 640, margin: '0 auto',
          padding: 'var(--space-7) var(--space-4)',
          textAlign: 'center',
        }}>
          <h2 style={{ color: 'white', marginBottom: 'var(--space-1)' }}>
            Ready when you are.
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.55)',
            marginBottom: 'var(--space-3)',
          }}>
            Browse our inventory or start a pre-order.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/inventory">
              <MagneticButton strength={0.1}>
                <Ripple>
                  <Button style={{
                    background: 'var(--clay)',
                    color: 'var(--ink)',
                    fontWeight: 600,
                    border: 'none',
                    height: 44,
                    padding: '0 var(--space-3)',
                  }}>
                    Browse Inventory
                  </Button>
                </Ripple>
              </MagneticButton>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.1)', height: 44 }}>
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
