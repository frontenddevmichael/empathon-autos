import { supabase } from '@/lib/supabase'

type EntityType = 'vehicle' | 'lead' | 'lot' | 'blog_post' | 'testimonial' | 'content_block'

/**
 * Log an admin activity to the admin_activity_log table.
 * Call this after successful create/update/delete operations.
 */
export async function logActivity(
  action: string,
  entityType?: EntityType,
  entityId?: string,
  details?: Record<string, unknown>
) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return // Don't log if not authenticated

    await supabase.from('admin_activity_log').insert({
      user_id: session.user.id,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      details: details || {},
    })
  } catch (err) {
    // Don't let logging failures break the app
    console.error('[ActivityLog] Failed to log activity:', err)
  }
}

/** Convenience helpers for common actions */
export const activity = {
  vehicle: {
    created: (id: string, data?: Record<string, unknown>) => logActivity('created', 'vehicle', id, data),
    updated: (id: string, data?: Record<string, unknown>) => logActivity('updated', 'vehicle', id, data),
    deleted: (id: string) => logActivity('deleted', 'vehicle', id),
    published: (id: string) => logActivity('published', 'vehicle', id),
    unpublished: (id: string) => logActivity('unpublished', 'vehicle', id),
  },
  lead: {
    updated: (id: string, data?: Record<string, unknown>) => logActivity('updated', 'lead', id, data),
    deleted: (id: string) => logActivity('deleted', 'lead', id),
    statusChanged: (id: string, from: string, to: string) => logActivity('status_changed', 'lead', id, { from, to }),
  },
  lot: {
    created: (id: string, data?: Record<string, unknown>) => logActivity('created', 'lot', id, data),
    updated: (id: string, data?: Record<string, unknown>) => logActivity('updated', 'lot', id, data),
    deleted: (id: string) => logActivity('deleted', 'lot', id),
    closed: (id: string) => logActivity('closed', 'lot', id),
  },
  blog: {
    created: (id: string, data?: Record<string, unknown>) => logActivity('created', 'blog_post', id, data),
    updated: (id: string, data?: Record<string, unknown>) => logActivity('updated', 'blog_post', id, data),
    deleted: (id: string) => logActivity('deleted', 'blog_post', id),
    published: (id: string) => logActivity('published', 'blog_post', id),
    unpublished: (id: string) => logActivity('unpublished', 'blog_post', id),
  },
  testimonial: {
    created: (id: string, data?: Record<string, unknown>) => logActivity('created', 'testimonial', id, data),
    updated: (id: string, data?: Record<string, unknown>) => logActivity('updated', 'testimonial', id, data),
    deleted: (id: string) => logActivity('deleted', 'testimonial', id),
  },
  content: {
    created: (id: string, data?: Record<string, unknown>) => logActivity('created', 'content_block', id, data),
    updated: (id: string, data?: Record<string, unknown>) => logActivity('updated', 'content_block', id, data),
    deleted: (id: string) => logActivity('deleted', 'content_block', id),
  },
}
