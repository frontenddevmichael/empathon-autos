import { useEffect } from 'react'
import { config } from '@/lib/config'

interface SeoHeadProps {
  title?: string
  description?: string
  ogImage?: string
}

export function SeoHead({ title, description, ogImage }: SeoHeadProps) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — ${config.company.name}`
      : config.seo.defaultTitle

    document.title = fullTitle

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        const attr = name.startsWith('og:') ? 'property' : 'name'
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', description || config.seo.defaultDescription)
    setMeta('og:title', fullTitle)
    setMeta('og:description', description || config.seo.defaultDescription)
    if (ogImage) setMeta('og:image', ogImage)
    setMeta('og:url', window.location.href)
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description || config.seo.defaultDescription)
    if (ogImage) setMeta('twitter:image', ogImage)
  }, [title, description, ogImage])

  return null
}
