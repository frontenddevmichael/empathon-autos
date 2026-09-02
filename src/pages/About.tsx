import { Section } from '@/components/PageLayout'
import { ScrollReveal } from '@/components/ScrollReveal'
import { CountUp } from '@/components/CountUp'
import { SeoHead } from '@/components/SeoHead'
import { DecoLine } from '@/components/deco/DecoLine'
import styles from './About.module.css'

// TODO: placeholder figures — confirm real numbers with the client before launch.
const stats = [
  { label: 'Years in Operation', end: 7, suffix: '+' },
  { label: 'Sourcing Regions', end: 4, suffix: '' },
]

const team = [
  { name: 'Tolani Abdullateef Balogun', role: 'Managing Director' },
  { name: 'Jimoh Bolakale Ajao', role: 'Executive Partner' },
  { name: 'Hassan Kayode Balogun', role: 'Financial Consultant' },
  { name: 'Akintunde Saheed Adesokan', role: 'Head of Sales' },
]

export function About() {
  return (
    <>
      <SeoHead title="About" description="Nigeria's trusted automotive partner since 2019. Premium vehicle imports, pre-orders, and corporate fleet solutions." />
      <section className={styles.hero}>
        <Section as="div" className={styles.heroInner}>
          <p className={styles.heroLabel}>About</p>
          <h2 className={styles.heroTitle}>Nigeria's Trusted <br />Automotive Partner</h2>
          <DecoLine width={80} />
          <p className={styles.heroDesc}>
            Empathon Autos has been delivering premium vehicles and exceptional service to Nigerian buyers since 2019.
            We specialise in vehicle imports, pre-orders, and corporate fleet solutions.
          </p>
        </Section>
      </section>

      <Section>
        <div className={styles.statsGrid}>
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 100}>
              <div className={styles.statCard}>
                <p className={styles.statValue}><CountUp end={s.end} suffix={s.suffix} duration={1600} /></p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200}>
          <div className={styles.story}>
            <h3>Our Story</h3>
            <p>
              Founded in Lagos, Empathon Autos began with a simple mission: make premium vehicle ownership
              accessible and transparent for Nigerian buyers. What started as a boutique import service
              has grown into a full-service automotive company serving hundreds of individual and
              corporate clients across the country.
            </p>
            <p>
              We partner with trusted international dealers and manufacturers to bring you vehicles
              that meet global standards, backed by local support you can rely on.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div>
            <h3 className={styles.teamTitle}>Leadership</h3>
            <div className={styles.teamGrid}>
              {team.map((m, i) => (
                <ScrollReveal key={m.name} delay={500 + i * 100}>
                  <div className={styles.teamCard}>
                    <p className={styles.teamName}>{m.name}</p>
                    <p className={styles.teamRole}>{m.role}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Section>
    </>
  )
}
