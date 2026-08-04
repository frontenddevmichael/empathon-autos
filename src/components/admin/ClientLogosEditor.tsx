import { useState } from 'react'
import { Trash2, Plus, ImageOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MediaUploader } from '@/components/admin/MediaUploader'

export interface ClientEntry {
  name: string
  logo?: string | null
}

interface ClientLogosEditorProps {
  value: ClientEntry[]
  onChange: (clients: ClientEntry[]) => void
}

export function ClientLogosEditor({ value, onChange }: ClientLogosEditorProps) {
  const [clients, setClients] = useState<ClientEntry[]>(value)

  const update = (next: ClientEntry[]) => {
    setClients(next)
    onChange(next)
  }

  const updateClient = (index: number, patch: Partial<ClientEntry>) => {
    update(clients.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  const removeClient = (index: number) => {
    update(clients.filter((_, i) => i !== index))
  }

  const addClient = () => {
    update([...clients, { name: '' }])
  }

  const addLogo = (index: number, url: string) => {
    updateClient(index, { logo: url })
  }

  return (
    <div>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--stone)', marginBottom: 6 }}>
        Clients <span style={{ fontWeight: 400, color: 'var(--stone-light)' }}>(name + optional logo image)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
        {clients.map((client, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)', padding: 'var(--space-1-5)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}
          >
            {client.logo ? (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={client.logo} alt={client.name || 'client logo'} style={{ width: 64, height: 40, objectFit: 'contain', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: '#fff' }} />
                <button
                  type="button"
                  aria-label="Remove logo"
                  onClick={() => updateClient(i, { logo: null })}
                  style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--error)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                  title="Remove logo"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div style={{ width: 64, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--stone-light)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                <ImageOff size={16} />
              </div>
            )}
            <Input
              value={client.name}
              onChange={e => updateClient(i, { name: e.target.value })}
              placeholder="Company name"
              style={{ flex: 1, minWidth: 0 }}
            />
            <MediaUploader bucket="client-logos" folder="clients" onUploaded={m => addLogo(i, m.url)} />
            <Button type="button" variant="ghost" size="sm" onClick={() => removeClient(i)} style={{ color: 'var(--error)', flexShrink: 0 }} aria-label="Remove client">
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'var(--space-1-5)' }}>
        <Button type="button" variant="secondary" size="sm" onClick={addClient}>
          <Plus size={14} style={{ marginRight: 4 }} /> Add Client
        </Button>
      </div>
    </div>
  )
}
