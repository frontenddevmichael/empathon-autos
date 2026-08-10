import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Gavel, Clock, CheckCircle, XCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Section } from '@/components/PageLayout'
import { HeroSection } from '@/components/HeroSection'
import { config } from '@/lib/config'

interface BidHistory {
  id: string
  amount: number
  placed_at: string
  outcome: string | null
  lot: {
    id: string
    title: string
    make: string
    model: string
    status: string
    current_bid: number
    closes_at: string
  } | null
}

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  created_at: string
}

export function UserDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [bids, setBids] = useState<BidHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'bids' | 'profile'>('bids')

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setLoading(false); return }

        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser({
            ...profile,
            email: session.user.email || '',
          })
        }

        // Fetch bid history
        const { data: bidData } = await supabase
          .from('bids')
          .select('*, lot:lot_id(id, title, make, model, status, current_bid, closes_at)')
          .eq('bidder_id', session.user.id)
          .order('placed_at', { ascending: false })
          .limit(20)

        if (bidData) setBids(bidData as unknown as BidHistory[])
      } catch (err) {
        console.error('[UserDashboard] Error:', err)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <Section>
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-2)' }} />
          <p style={{ color: 'var(--stone)' }}>Loading your dashboard...</p>
        </div>
      </Section>
    )
  }

  return (
    <>
      <HeroSection
        images={[
          { url: 'https://images.unsplash.com/photo-1780296269675-169390638617?w=1400&q=90&fit=crop' },
        ]}
        label="Dashboard"
        title="Your Account"
        subtitle="Track your bids, manage your profile, and stay updated on auction activity."
        deco="dots"
      />

      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
          {/* Sidebar */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + var(--space-3))' }}>
            <div style={{ 
              padding: 'var(--space-3)', 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-premium)'
            }}>
              {/* User Info */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-hover) 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-2)',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 700,
                }}>
                  {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{user?.full_name || 'User'}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <button
                  onClick={() => setActiveTab('bids')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1-5)',
                    padding: 'var(--space-1-5) var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'bids' ? 'var(--navy-light)' : 'transparent',
                    color: activeTab === 'bids' ? 'var(--navy)' : 'var(--stone)',
                    fontWeight: activeTab === 'bids' ? 600 : 400,
                    fontSize: 'var(--text-sm)',
                    textAlign: 'left',
                    transition: 'all 150ms var(--ease-out)',
                  }}
                >
                  <Gavel size={16} /> My Bids
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1-5)',
                    padding: 'var(--space-1-5) var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'profile' ? 'var(--navy-light)' : 'transparent',
                    color: activeTab === 'profile' ? 'var(--navy)' : 'var(--stone)',
                    fontWeight: activeTab === 'profile' ? 600 : 400,
                    fontSize: 'var(--text-sm)',
                    textAlign: 'left',
                    transition: 'all 150ms var(--ease-out)',
                  }}
                >
                  <User size={16} /> Profile
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div>
            {activeTab === 'bids' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <h2 style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>Bid History</h2>
                  <Link to="/auctions">
                    <Button variant="secondary" size="sm">
                      Browse Auctions <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>

                {bids.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 'var(--space-6)', 
                    background: 'var(--surface)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-xl)' 
                  }}>
                    <Gavel size={48} style={{ color: 'var(--stone-light)', marginBottom: 'var(--space-2)' }} />
                    <h3 style={{ marginBottom: 'var(--space-1)' }}>No bids yet</h3>
                    <p style={{ color: 'var(--stone)', marginBottom: 'var(--space-3)' }}>
                      Start bidding on auction lots to see your history here.
                    </p>
                    <Link to="/auctions">
                      <Button>Browse Auctions</Button>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {bids.map(bid => (
                      <div
                        key={bid.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-3)',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-lg)',
                          transition: 'all 200ms var(--ease-out)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(0,51,102,0.15)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginBottom: 4 }}>
                            <p style={{ fontWeight: 600 }}>{bid.lot?.title || `${bid.lot?.make} ${bid.lot?.model}`}</p>
                            {bid.lot?.status && (
                              <Badge variant={bid.lot.status === 'open' ? 'live' : 'draft'} />
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--stone)' }}>
                            <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--navy)' }}>
                              Your bid: {formatPrice(bid.amount)}
                            </span>
                            <span>•</span>
                            <span>Current: {formatPrice(bid.lot?.current_bid || 0)}</span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={12} /> {formatTimeAgo(bid.placed_at)}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {bid.outcome === 'accepted' ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                              <CheckCircle size={14} /> Winning
                            </span>
                          ) : bid.outcome === 'rejected' ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--error)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                              <XCircle size={14} /> Outbid
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--stone)', fontSize: 'var(--text-xs)' }}>
                              <TrendingUp size={14} /> Pending
                            </span>
                          )}
                          <Link to={`/auctions/${bid.lot?.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Profile Settings</h2>
                <div style={{ 
                  padding: 'var(--space-4)', 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-xl)' 
                }}>
                  <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                    <div>
                      <label style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginBottom: 4, display: 'block' }}>Full Name</label>
                      <p style={{ fontWeight: 500 }}>{user?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginBottom: 4, display: 'block' }}>Email</label>
                      <p style={{ fontWeight: 500 }}>{user?.email}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginBottom: 4, display: 'block' }}>Phone</label>
                      <p style={{ fontWeight: 500 }}>{user?.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginBottom: 4, display: 'block' }}>Member Since</label>
                      <p style={{ fontWeight: 500 }}>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', marginTop: 'var(--space-3)', fontStyle: 'italic' }}>
                    To update your profile, please contact us at {config.company.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
