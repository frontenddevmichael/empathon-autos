import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logActivity, activity } from '../activityLog'

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
      }),
    },
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
  },
}))

describe('logActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs activity with correct parameters', async () => {
    const { supabase } = await import('@/lib/supabase')
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

    await logActivity('created', 'vehicle', 'test-id', { name: 'Test Vehicle' })

    expect(supabase.from).toHaveBeenCalledWith('admin_activity_log')
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'test-user-id',
      action: 'created',
      entity_type: 'vehicle',
      entity_id: 'test-id',
      details: { name: 'Test Vehicle' },
    })
  })

  it('handles missing session gracefully', async () => {
    const { supabase } = await import('@/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
    })

    // Should not throw
    await logActivity('created', 'vehicle', 'test-id')
  })
})

describe('activity helpers', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Restore the default session — the 'missing session' test above mutates
    // the shared getSession mock, and clearAllMocks does not reset
    // implementations, so without this the helper tests would see no session.
    const { supabase } = await import('@/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
    })
  })

  it('vehicle.created logs correctly', async () => {
    const { supabase } = await import('@/lib/supabase')
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

    await activity.vehicle.created('vehicle-123', { make: 'Toyota' })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'created',
        entity_type: 'vehicle',
        entity_id: 'vehicle-123',
      })
    )
  })

  it('lead.statusChanged logs correctly', async () => {
    const { supabase } = await import('@/lib/supabase')
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

    await activity.lead.statusChanged('lead-456', 'new', 'contacted')

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'status_changed',
        entity_type: 'lead',
        entity_id: 'lead-456',
        details: { from: 'new', to: 'contacted' },
      })
    )
  })
})
