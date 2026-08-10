import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Shield, CheckCircle, ArrowRight } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Input, TextArea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/PageLayout'
import { SplitHeading } from '@/components/SplitHeading'
import { HeroSection } from '@/components/HeroSection'
import { useToast } from '@/context/ToastContext'
import { config } from '@/lib/config'

export function KYCRegistration() {
  const { showToast } = useToast()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    occupation: '',
    address: '',
    idType: 'nin',
    idNumber: '',
    howHeard: '',
    consent: false,
    honeypot: '',
  })
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return
    if (!form.fullName || !form.email || !form.phone) {
      showToast('Please fill in required fields', 'error')
      return
    }
    if (!form.consent) {
      showToast('Please agree to the terms and conditions', 'error')
      return
    }
    if (!isSupabaseConfigured()) {
      showToast('Registration is not available right now. Please try again later.', 'error')
      return
    }

    setSaving(true)
    
    // Store KYC data as a lead with type 'kyc-registration'
    const { error } = await supabase.from('leads').insert({
      type: 'enquiry',
      name: form.fullName,
      email: form.email,
      phone: form.phone,
      company: form.company || null,
      message: `KYC Registration — Occupation: ${form.occupation || 'N/A'}, Address: ${form.address || 'N/A'}, ID Type: ${form.idType}, ID Number: ${form.idNumber || 'N/A'}, How heard: ${form.howHeard || 'N/A'}`,
      source_page: '/register',
    })

    setSaving(false)
    
    if (error) {
      showToast('Registration failed. Please try again.', 'error')
      return
    }

    setSubmitted(true)
    showToast('Registration submitted successfully!')
  }

  if (submitted) {
    return (
      <>
        <HeroSection
          images={[{ url: 'https://images.unsplash.com/photo-1780296269675-169390638617?w=1400&q=90&fit=crop' }]}
          label="Registration"
          title="Welcome Aboard!"
          subtitle="Your registration has been submitted successfully."
          deco="dots"
        />
        <Section>
          <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: 'var(--success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-3)'
            }}>
              <CheckCircle size={40} style={{ color: 'var(--success)' }} />
            </div>
            <h2 style={{ marginBottom: 'var(--space-2)' }}>Registration Complete!</h2>
            <p style={{ color: 'var(--stone)', marginBottom: 'var(--space-4)' }}>
              Thank you for registering with {config.company.name}. Our team will review your information and reach out to you shortly.
            </p>
            <p style={{ color: 'var(--stone)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              You can now participate in auctions and our team can contact you for corporate opportunities.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
              <Link to="/auctions">
                <Button>Browse Auctions <ArrowRight size={14} /></Button>
              </Link>
              <Link to="/">
                <Button variant="secondary">Return Home</Button>
              </Link>
            </div>
          </div>
        </Section>
      </>
    )
  }

  return (
    <>
      <HeroSection
        images={[{ url: 'https://images.unsplash.com/photo-1780296269675-169390638617?w=1400&q=90&fit=crop' }]}
        label="Registration"
        title="Register to Bid"
        subtitle="Complete your KYC registration to participate in auctions and receive personalised offers."
        deco="dots"
      />

      <Section>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <SplitHeading as="h2" style={{ marginBottom: 'var(--space-1)' }}>Account Registration</SplitHeading>
            <div className="section-divider" />
            <p style={{ color: 'var(--stone)', marginTop: 'var(--space-1)' }}>
              Fill in your details below. This information helps us verify your identity and provide you with the best service.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ 
            padding: 'var(--space-4)', 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-premium)'
          }}>
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input tabIndex={-1} value={form.honeypot} onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))} />
            </div>

            {/* Personal Information */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <User size={18} /> Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                <Input 
                  label="Full Name *" 
                  value={form.fullName} 
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} 
                  required 
                  placeholder="Enter your full name"
                />
                <Input 
                  label="Email *" 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                  required 
                  placeholder="your@email.com"
                />
                <Input 
                  label="Phone *" 
                  type="tel" 
                  value={form.phone} 
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                  required 
                  placeholder="+234 xxx xxx xxxx"
                />
                <Input 
                  label="Company / Organisation" 
                  value={form.company} 
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))} 
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Additional Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                <Input 
                  label="Occupation" 
                  value={form.occupation} 
                  onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} 
                  placeholder="e.g. Business Owner"
                />
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--stone)', marginBottom: 4, display: 'block' }}>
                    ID Type
                  </label>
                  <select
                    value={form.idType}
                    onChange={e => setForm(f => ({ ...f, idType: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      background: 'var(--surface)',
                    }}
                  >
                    <option value="nin">National ID (NIN)</option>
                    <option value="vin">Voter's Card (VIN)</option>
                    <option value="passport">International Passport</option>
                    <option value="drivers">Driver's License</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <Input 
                  label="ID Number" 
                  value={form.idNumber} 
                  onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))} 
                  placeholder="Enter your ID number"
                />
              </div>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <TextArea 
                  label="Address" 
                  value={form.address} 
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
                  rows={2}
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* How did you hear about us */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Input 
                label="How did you hear about us?" 
                value={form.howHeard} 
                onChange={e => setForm(f => ({ ...f, howHeard: e.target.value }))} 
                placeholder="e.g. Google, Social Media, Referral"
              />
            </div>

            {/* Consent */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-1-5)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
                  style={{ marginTop: 4, width: 16, height: 16 }}
                  required
                />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)', lineHeight: 1.6 }}>
                  I agree to the <Link to="/terms" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>Privacy Policy</Link>. 
                  I consent to {config.company.name} processing my personal data for the purpose of auction participation and service delivery.
                </span>
              </label>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <Link to="/">
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
              <Button type="submit" loading={saving}>
                <Shield size={16} /> Complete Registration
              </Button>
            </div>
          </form>

          {/* Info Box */}
          <div style={{ 
            marginTop: 'var(--space-3)', 
            padding: 'var(--space-3)', 
            background: 'var(--navy-light)', 
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(0,51,102,0.1)'
          }}>
            <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)', color: 'var(--navy)' }}>
              Why register?
            </h4>
            <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', lineHeight: 1.8, paddingLeft: 'var(--space-2)' }}>
              <li>• Participate in live auctions and place bids</li>
              <li>• Receive personalised vehicle recommendations</li>
              <li>• Get priority access to new inventory</li>
              <li>• Our team can reach out for corporate opportunities</li>
              <li>• Track your bidding history and status</li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  )
}
