import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/PageLayout'
import { SeoHead } from '@/components/SeoHead'
import { LostRoadMark } from '@/components/deco/BrandMarks'

export function NotFound() {
  return (
    <Section style={{ position: 'relative', overflow: 'hidden' }}>
      <SeoHead title="Page Not Found" description="The page you are looking for does not exist or has been moved." />
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', textAlign: 'center',
      }}>
        <LostRoadMark size={160} />
        <h2 style={{ marginTop: 'var(--space-3)' }}>Wrong turn.</h2>
        <p style={{ marginBottom: 'var(--space-2)', maxWidth: 360, color: 'var(--stone)' }}>
          That page doesn't exist, or it's moved. Let's get you back on the road.
        </p>
        <Link to="/"><Button>Back to Home</Button></Link>
      </div>
    </Section>
  )
}
