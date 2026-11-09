import { AnimatedCounter } from '@/components/AnimatedCounter'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { config } from '@/lib/config'
import { useSiteContent, parseJsonContent } from '@/hooks/useSiteContent'
import styles from './About.module.css'

interface TeamMember {
  name: string
  role: string
  photo?: string
}

const STATS_FALLBACK = [
  { value: 7, suffix: '+', label: 'Years active' },
  { value: 500, suffix: '+', label: 'Vehicles delivered' },
  { value: 4, suffix: '', label: 'Countries sourced' },
  { value: 98, suffix: '%', label: 'Client satisfaction' },
]

const PROCESS_STEPS_FALLBACK = [
  { title: 'Source', desc: 'We scout Japan, Dubai, Europe and the US for the right vehicle at the right price.' },
  { title: 'Inspect', desc: 'Every vehicle goes through a multi-point inspection before it is approved for import.' },
  { title: 'Import', desc: 'We handle logistics, customs and documentation, end to end.' },
  { title: 'Deliver', desc: 'You collect your car with full paperwork, a warranty and a team behind you.' },
]

const WHY_US_FALLBACK = [
  {
    heading: 'Global sourcing, local trust',
    desc: 'We work directly with exporters in Japan, Dubai, Europe and the US. No middlemen, no hidden markups. Just honest pricing on good cars.',
  },
  {
    heading: 'Every vehicle, verified',
    desc: 'Before a car reaches the lot it passes a multi-point inspection. Our reputation depends on every vehicle we deliver.',
  },
]

export function About() {
  const { content: aboutContent } = useSiteContent('about')
  const stats = parseJsonContent(aboutContent, 'stats', STATS_FALLBACK)
  const processSteps = parseJsonContent<{ title: string; desc: string }>(
    aboutContent,
    'process_steps',
    PROCESS_STEPS_FALLBACK,
  )
  const whyUs = parseJsonContent(aboutContent, 'why_us', WHY_US_FALLBACK)
  const leadership = parseJsonContent<TeamMember>(aboutContent, 'leadership', [
    { name: 'Hassan', role: 'Team member', photo: '/team/Hassan.jpeg' },
    { name: 'Jimoh', role: 'Team member', photo: '/team/Jimoh.jpeg' },
    { name: 'Saheed Akintunde', role: 'Team member', photo: '/team/Saheed Akintunde.jpeg' },
    { name: 'Tolani', role: 'Team member', photo: '/team/Tolani.jpeg' },
  ])

  return (
    <>
      <Section tone="paper" space="sm">
        <SectionHeader
          as="h1"
          size="lg"
          label="About"
          title="Premium vehicles, sourced globally."
          desc="Cars sourced from Tokyo, Dubai, Europe and the US, then brought to Nigerian driveways. No shortcuts, no surprises."
        />
      </Section>

      <Section tone="paper" space="sm">
        <div className={styles.story}>
          <div className={styles.storyMedia}>
            <img src="/heroimg.jpg" alt="An Empathon Autos vehicle at the Lagos showroom" className={styles.storyImage} loading="lazy" />
          </div>
          <div className={styles.storyText}>
            <p>
              Empathon Autos started with a simple frustration: buying a good car in Nigeria meant navigating
              opaque importers, inflated prices and paperwork nobody would explain.
            </p>
            <p>
              We built the opposite. Direct relationships with exporters, inspection before shipping, duties
              calculated up front, and a showroom in Ikeja where you can see and drive the car before it's yours.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="warm" space="sm">
        <dl className={styles.stats}>
          {stats.map(stat => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="paper" space="md">
        <SectionHeader label="How it works" title="Our process" />
        <ol className={styles.steps}>
          {processSteps.map((step, i) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepIndex}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="paper" space="md">
        <SectionHeader label="Why Empathon" title="Built on trust, driven by quality" />
        <div className={styles.why}>
          {whyUs.map(block => (
            <div key={block.heading} className={styles.whyBlock}>
              <h3 className={styles.whyHeading}>{block.heading}</h3>
              <p className={styles.whyDesc}>{block.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {leadership.length > 0 && (
        <Section tone="paper" space="md">
          <SectionHeader label="Our people" title="The team" />
          <div className={`scroll-reveal stagger-fade-in ${styles.team}`}>
            {leadership.map(person => (
              <figure key={person.name} className={styles.member}>
                {person.photo ? (
                  <img src={person.photo} alt={person.name} className={styles.photo} loading="lazy" />
                ) : (
                  <div className={styles.initials} aria-hidden="true">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <figcaption>
                  <p className={styles.name}>{person.name}</p>
                  <p className={styles.role}>{person.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      <Section tone="navy" space="md">
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to find your next car?</h2>
          <p className={styles.ctaText}>
            Buying your first car or building a fleet? We'll help. No pressure, just honest guidance.
          </p>
          <div className={styles.ctaActions}>
            <Link to="/inventory">
              <Button variant="white" size="md">Browse inventory</Button>
            </Link>
            <a
              href={config.whatsapp.getDeepLink("Hi Empathon Autos! I'd like to know more.")}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaLink}
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}
