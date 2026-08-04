import { useEffect, useState, useMemo, type ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContentBlock } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { ClientLogosEditor, type ClientEntry } from '@/components/admin/ClientLogosEditor'
import { CheckCircle, XCircle, Code, Eye, EyeOff, AlignLeft, Zap } from 'lucide-react'

// ─── JSON helpers ───────────────────────────────────────────────

/** Parse a clients content block body into client entries (name + logo). */
function parseClientsBody(body: string): ClientEntry[] {
  const trimmed = body.trim()
  if (!trimmed) return [{ name: '' }]
  try {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) return [{ name: '' }]
    return parsed.map((c: unknown) => {
      const row = c as { name?: unknown; logo?: unknown }
      return {
        name: typeof row?.name === 'string' ? row.name : '',
        logo: typeof row?.logo === 'string' ? row.logo : null,
      }
    })
  } catch {
    return [{ name: '' }]
  }
}

type JsonStatus =
  | { kind: 'plain' }
  | { kind: 'valid'; parsed: unknown }
  | { kind: 'invalid'; error: string }

function analyzeJson(body: string): JsonStatus {
  const trimmed = body.trim()
  if (!trimmed) return { kind: 'plain' }
  // Only attempt JSON parsing if it starts with [ or {
  if (trimmed[0] !== '[' && trimmed[0] !== '{') return { kind: 'plain' }
  try {
    const parsed = JSON.parse(trimmed)
    return { kind: 'valid', parsed }
  } catch (e) {
    return { kind: 'invalid', error: (e as Error).message }
  }
}

function formatJson(body: string): string {
  try { return JSON.stringify(JSON.parse(body), null, 2) }
  catch { return body }
}

function countLines(s: string): number {
  if (!s) return 1
  let count = 1
  for (let i = 0; i < s.length; i++) if (s[i] === '\n') count++
  return count
}

// ─── Preview helpers ────────────────────────────────────────────

function jsonTypeLabel(v: unknown): string {
  if (v === null) return 'null'
  if (Array.isArray(v)) return `Array[${v.length}]`
  return typeof v
}

function isSimpleValue(v: unknown): v is string | number | boolean | null {
  return v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
}

const MAX_PREVIEW_DEPTH = 8

/** Render a parsed JSON value as a readable preview. */
function JsonPreview({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (depth > MAX_PREVIEW_DEPTH) {
    return <span style={{ color: 'var(--stone-light)', fontStyle: 'italic' }}>…</span>
  }
  const indent = { marginLeft: depth * 16 }

  if (data === null) return <span style={{ color: 'var(--stone-light)', fontStyle: 'italic' }}>null</span>
  if (typeof data === 'boolean') return <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{String(data)}</span>
  if (typeof data === 'number') return <span className="tabular-nums" style={{ color: 'var(--gold)' }}>{data}</span>
  if (typeof data === 'string') {
    // Truncate long strings in preview
    const max = 120
    return <span style={{ color: 'var(--success)' }}>"{data.length > max ? data.slice(0, max) + '…' : data}"</span>
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span style={{ color: 'var(--stone-light)', fontStyle: 'italic' }}>[]</span>

    // If all items are simple values, show a compact inline list
    if (data.every(isSimpleValue)) {
      return (
        <span style={{ color: 'var(--stone)' }}>
          [{data.map((item, i) => (
            <span key={i}>{i > 0 ? ', ' : ''}<JsonPreview data={item} depth={depth} /></span>
          ))}]
        </span>
      )
    }

    // If all items are objects with the same keys, render a mini-table
    if (data.length > 0 && data.every(d => typeof d === 'object' && d !== null && !Array.isArray(d))) {
      const allKeys = [...new Set(data.flatMap(d => Object.keys(d as Record<string, unknown>)))]
      // Only show table if reasonable
      if (allKeys.length <= 6 && data.length <= 20) {
        return (
          <div style={{ overflowX: 'auto', fontSize: 'var(--text-2xs)', lineHeight: 1.6 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--stone)', fontWeight: 600 }}>
                  <th style={{ padding: '3px 8px', textAlign: 'left' }}>#</th>
                  {allKeys.map(k => <th key={k} style={{ padding: '3px 8px', textAlign: 'left' }}>{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {(data as Record<string, unknown>[]).map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(10,10,10,0.04)' }}>
                    <td style={{ padding: '3px 8px', color: 'var(--stone-light)', fontFamily: 'var(--font-mono)' }}>{i + 1}</td>
                    {allKeys.map(k => (
                      <td key={k} style={{ padding: '3px 8px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <JsonPreview data={(item as Record<string, unknown>)[k]} depth={depth + 1} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    }

    // Fallback: numbered list
    return (
      <div style={indent}>
        {data.map((item, i) => (
          <div key={i} style={{ marginBottom: 4, display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--stone-light)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', minWidth: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
            <div style={{ flex: 1 }}><JsonPreview data={item} depth={depth + 1} /></div>
          </div>
        ))}
      </div>
    )
  }

  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>)
    if (entries.length === 0) return <span style={{ color: 'var(--stone-light)', fontStyle: 'italic' }}>{'{}'}</span>
    return (
      <div style={indent}>
        {entries.map(([key, val]) => (
          <div key={key} style={{ marginBottom: 3, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--navy)', fontWeight: 600, minWidth: 80, flexShrink: 0, fontSize: 'var(--text-2xs)' }}>{key}</span>
            <div style={{ flex: 1, minWidth: 0 }}><JsonPreview data={val} depth={depth + 1} /></div>
          </div>
        ))}
      </div>
    )
  }

  return <span>{String(data)}</span>
}

// ─── Content Body Editor ────────────────────────────────────────

interface ContentBodyEditorProps {
  value: string
  onChange: (value: string) => void
}

function ContentBodyEditor({ value, onChange }: ContentBodyEditorProps) {
  const [showPreview, setShowPreview] = useState(true)

  const analysis = useMemo(() => analyzeJson(value), [value])
  const lineCount = useMemo(() => countLines(value), [value])

  const StatusIcon = analysis.kind === 'valid' ? CheckCircle
    : analysis.kind === 'invalid' ? XCircle
    : AlignLeft
  const statusColor = analysis.kind === 'valid' ? 'var(--success)'
    : analysis.kind === 'invalid' ? 'var(--error)'
    : 'var(--stone)'
  const statusLabel = analysis.kind === 'valid' ? 'Valid JSON'
    : analysis.kind === 'invalid' ? analysis.error
    : 'Plain text'

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)

  return (
    <div>
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--stone)' }}>Body</label>
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--stone-light)' }}>{lineCount} line{lineCount > 1 ? 's' : ''}</span>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 4, alignItems: 'center',
        marginBottom: 2, flexWrap: 'wrap',
      }}>
        {analysis.kind !== 'plain' && (
          <button
            type="button"
            onClick={() => onChange(formatJson(value))}
            title="Format JSON (prettify)"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', fontSize: 'var(--text-2xs)', fontWeight: 600,
              color: 'var(--navy)', background: 'var(--navy-light)',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              transition: 'all 150ms var(--ease-out)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,51,102,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--navy-light)' }}
          >
            <Code size={11} /> Format
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowPreview(p => !p)}
          title={showPreview ? 'Hide preview' : 'Show preview'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', fontSize: 'var(--text-2xs)', fontWeight: 600,
            color: showPreview ? 'var(--navy)' : 'var(--stone)',
            background: showPreview ? 'var(--navy-light)' : 'transparent',
            border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            transition: 'all 150ms var(--ease-out)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy-light)' }}
          onMouseLeave={e => { if (!showPreview) e.currentTarget.style.background = 'transparent' }}
        >
          {showPreview ? <EyeOff size={11} /> : <Eye size={11} />}
          {showPreview ? 'Hide Preview' : 'Preview'}
        </button>

        {analysis.kind === 'valid' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 'auto', fontSize: 'var(--text-2xs)', color: statusColor, fontWeight: 600 }}>
            <StatusIcon size={11} />
            {statusLabel}
          </span>
        )}

        {analysis.kind === 'invalid' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 'auto', fontSize: 'var(--text-2xs)', color: statusColor, fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>
            <XCircle size={11} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={statusLabel}>{statusLabel}</span>
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={handleChange}
        rows={10}
        spellCheck={false}
        aria-label="Body"
        placeholder="Enter plain text or JSON data…"
        style={{
          width: '100%',
          padding: 'var(--space-1-5) var(--space-1-5)',
          fontFamily: analysis.kind === 'plain' ? 'var(--font-body)' : 'var(--font-mono)',
          fontSize: analysis.kind === 'plain' ? 'var(--text-sm)' : 'var(--text-xs)',
          lineHeight: 1.6,
          color: 'var(--ink)',
          background: 'var(--surface)',
          border: analysis.kind === 'invalid'
            ? '1.5px solid var(--error)'
            : '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          resize: 'vertical',
          outline: 'none',
          minHeight: 160,
          transition: 'border-color 150ms var(--ease-out)',
        }}
        onFocus={e => {
          if (analysis.kind !== 'invalid') {
            e.currentTarget.style.borderColor = 'var(--navy)'
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,51,102,0.08)'
          }
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = analysis.kind === 'invalid' ? 'var(--error)' : 'var(--border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />

      {/* Validation hint inline (below textarea) */}
      {analysis.kind === 'valid' && showPreview && (
        <div style={{
          marginTop: 6,
          padding: 'var(--space-1-5)',
          border: '1px solid rgba(21,128,61,0.2)',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(21,128,61,0.03)',
          fontSize: 'var(--text-xs)',
          maxHeight: 280,
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, color: 'var(--success)', fontWeight: 600, fontSize: 'var(--text-2xs)' }}>
            <Zap size={11} />
            Parsed Preview
            <span style={{ color: 'var(--stone-light)', fontWeight: 400, marginLeft: 'auto', fontSize: 'var(--text-2xs)' }}>
              {jsonTypeLabel(analysis.parsed)}
            </span>
          </div>
          <div style={{ lineHeight: 1.7 }}>
            <JsonPreview data={analysis.parsed} />
          </div>
        </div>
      )}

      {analysis.kind === 'invalid' && value.trim() && (
        <div style={{
          marginTop: 6,
          padding: '6px 10px',
          border: '1px solid rgba(197,48,48,0.2)',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(197,48,48,0.04)',
          fontSize: 'var(--text-2xs)',
          color: 'var(--error)',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.6,
        }}>
          {statusLabel}
        </div>
      )}
    </div>
  )
}

// ─── Admin Content Page ─────────────────────────────────────────

export function AdminContent() {
  const { showToast } = useToast()
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [editBlock, setEditBlock] = useState<ContentBlock | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ page_key: '', title: '', body: '' })

  const fetch = () => {
    setLoading(true)
    ;(async () => {
      try {
        const { data, error } = await supabase.from('content_blocks').select('*').order('page_key')
        if (error) { showToast(`Failed to load content blocks: ${error.message}`, 'error'); return }
        if (data) setBlocks(data)
      } catch (e) {
        showToast(`Error connecting to database: ${e instanceof Error ? e.message : 'Unknown error'}`, 'error')
      }
      setLoading(false)
    })()
  }

  useEffect(() => { fetch() }, [])

  const openNew = () => {
    setForm({ page_key: '', title: '', body: '' })
    setCreating(true)
    setEditBlock(null)
  }

  const openEdit = (b: ContentBlock) => {
    setForm({ page_key: b.page_key, title: b.title, body: b.body })
    setEditBlock(b)
    setCreating(false)
  }

  const close = () => { setEditBlock(null); setCreating(false) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.page_key) return
    setSaving(true)
    let result
    if (editBlock) {
      result = await supabase.from('content_blocks').update({ title: form.title, body: form.body }).eq('id', editBlock.id)
    } else {
      result = await supabase.from('content_blocks').insert({ page_key: form.page_key, title: form.title, body: form.body })
    }
    setSaving(false)
    if (result.error) {
      const msg = result.error.message.includes('duplicate key')
        ? `A block with page key "${form.page_key}" and title "${form.title}" already exists.`
        : result.error.message
      showToast(`Failed to save: ${msg}`, 'error')
      return
    }
    close()
    fetch()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('content_blocks').delete().eq('id', id)
    if (error) { showToast(`Failed to delete: ${error.message}`, 'error'); return }
    showToast('Content block deleted')
    fetch()
  }

  /** Quick-inject snippet buttons for common JSON structures */
  const injectTemplate = (template: string, pageKey?: string, title?: string) => {
    setForm(f => ({
      ...f,
      ...(pageKey !== undefined ? { page_key: pageKey } : {}),
      ...(title !== undefined ? { title } : {}),
      body: template,
    }))
  }

  const modalOpen = editBlock !== null || creating

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <h2>Content Blocks</h2>
        <Button size="sm" onClick={openNew}>New Block</Button>
      </div>

      {loading ? <TableSkeleton rows={6} cols={4} /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-1) var(--space-2)', fontWeight: 600 }}>Page Key</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-1) var(--space-2)', fontWeight: 600 }}>Title</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-1) var(--space-2)', fontWeight: 600 }}>Body Preview</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-1) var(--space-2)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blocks.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--stone)' }}>No content blocks yet.</td></tr>
              )}
              {blocks.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>{b.page_key}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)' }}>{b.title || '—'}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', color: 'var(--stone)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.body?.slice(0, 80)}{(b.body?.length || 0) > 80 ? '...' : ''}</td>
                  <td style={{ padding: 'var(--space-1) var(--space-2)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)} style={{ color: 'var(--error)' }}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={close} title={creating ? 'New Block' : 'Edit Block'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
          <Input label="Page Key *" value={form.page_key} onChange={e => setForm(f => ({ ...f, page_key: e.target.value }))} required disabled={!!editBlock} placeholder="e.g. home" />
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. clients, hero, about" />

          {/* Snippet templates (only when creating) */}
          {creating && !form.body && (
            <div>
              <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--stone)', marginBottom: 4 }}>Quick templates</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  { label: 'Hero Image URL', value: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1400&q=90&fit=crop', pageKey: 'home', title: 'hero_image' },
                  { label: 'Client Logos', value: '[{"name": "Company Name"}]', pageKey: 'home', title: 'clients' },
                  { label: 'Team Members', value: '[{"name": "Full Name", "role": "Title"}]' },
                  { label: 'Feature List', value: '[{"title": "Feature", "desc": "Description"}]' },
                ].map(t => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => injectTemplate(t.value, 'pageKey' in t ? t.pageKey : undefined, 'title' in t ? t.title : undefined)}
                    style={{
                      padding: '3px 10px', fontSize: 'var(--text-2xs)', fontWeight: 500,
                      color: 'var(--navy)', background: 'var(--navy-light)',
                      border: '1px solid rgba(0,51,102,0.08)', borderRadius: 'var(--radius-full)',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      transition: 'all 150ms var(--ease-out)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,51,102,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,51,102,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--navy-light)'; e.currentTarget.style.borderColor = 'rgba(0,51,102,0.08)' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.title === 'clients' ? (
            <ClientLogosEditor
              value={parseClientsBody(form.body)}
              onChange={clients => setForm(f => ({ ...f, body: JSON.stringify(clients, null, 2) }))}
            />
          ) : (
            <ContentBodyEditor value={form.body} onChange={v => setForm(f => ({ ...f, body: v }))} />
          )}
          <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end', marginTop: 'var(--space-1)' }}>
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" loading={saving}>{editBlock ? 'Save Changes' : 'Create Block'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
