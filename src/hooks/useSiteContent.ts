import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface ContentBlock {
  id: string
  page_key: string
  title: string
  body: string
  media: unknown[]
}

/**
 * Fetches content blocks for a given page key from the content_blocks table.
 * Falls back gracefully to empty data if Supabase isn't configured or table is missing.
 */
export function useSiteContent(pageKey: string) {
  const [content, setContent] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
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
          // Gracefully handle missing table or column errors (400/404)
          if (dbError.code === 'PGRST204' || dbError.message?.includes('does not exist') || dbError.code?.startsWith('42')) {
            // Table or column doesn't exist yet — not an error, just empty
            setContent([])
          } else {
            console.error(`[useSiteContent] Error loading content for '${pageKey}':`, dbError.message)
            setError(dbError.message)
          }
        } else if (data) {
          setContent(data)
        }
      } catch (err) {
        if (cancelled) return
        // Silently handle network errors — content_blocks is optional
        console.debug(`[useSiteContent] Could not load content for '${pageKey}':`, err)
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
