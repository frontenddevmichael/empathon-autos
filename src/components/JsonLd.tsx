import { config } from '@/lib/config'

export function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: config.company.name,
    description: config.seo.defaultDescription,
    url: config.seo.siteUrl,
    telephone: `+${config.whatsapp}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lagos',
      addressCountry: 'NG',
    },
    sameAs: [],
    priceRange: '₦5M–₦150M',
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  )
}
