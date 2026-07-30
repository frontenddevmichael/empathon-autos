import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ContentBlock {
  id: string
  page_key: string
  title: string
  body: string
  media: unknown[]
}

/**
 * Fetches content blocks for a given page key from the content_blocks table.
 * Falls back gracefully to empty data if Supabase isn't configured.
 */
export function useSiteContent(pageKey: string) {
  const [content, setContent] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let cancelled = false
    ;(async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('page_key', pageKey)
          .order('id')
        if (cancelled) return
        if (dbError) {
          console.error(`[useSiteContent] Error loading content for '${pageKey}':`, dbError.message)
          setError(dbError.message)
        } else if (data) {
          setContent(data)
        }
      } catch (err) {
        if (cancelled) return
        console.error(`[useSiteContent] Unexpected error for '${pageKey}':`, err)
        setError('Failed to load content')
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [pageKey])

  return { content, loading, error }
}

/**
 * Parses JSON body from a content block.
 * Used for structured content like leadership teams or client lists.
 * Falls back to `defaults` when no block is found or parsing fails.
 */
export function parseJsonContent<T>(blocks: ContentBlock[], key: string, defaults: T[] = []): T[] {
  const block = blocks.find(b => b.title === key)
  if (!block?.body) return defaults
  try {
    return JSON.parse(block.body) as T[]
  } catch {
    return defaults
  }
}

/**
 * Gets the plain text body from a content block by title.
 */
export function getTextContent(blocks: ContentBlock[], title: string): string {
  return blocks.find(b => b.title === title)?.body || ''
}
