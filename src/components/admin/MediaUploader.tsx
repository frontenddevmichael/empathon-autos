import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'

interface UploadedMedia {
  id?: string
  url: string
  is_primary: boolean
  type: 'image' | 'video'
}

interface MediaUploaderProps {
  vehicleId?: string
  onUploaded: (media: UploadedMedia) => void
  multiple?: boolean
  bucket?: string
  folder?: string
}

export function MediaUploader({ vehicleId, onUploaded, multiple = false, bucket = 'vehicle-media', folder }: MediaUploaderProps) {
  const { showToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const uploadFile = async (file: File): Promise<{ url: string; is_primary: boolean; type: 'image' | 'video' } | null> => {
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
    const scope = folder || (vehicleId ? `${vehicleId}` : 'media')
    const path = `${scope}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file)
    if (uploadError) { showToast(`Upload failed: ${uploadError.message}`, 'error'); return null }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
    return { url: publicUrl, is_primary: false, type: file.type.startsWith('video/') ? 'video' : 'image' }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    let succeeded = 0
    for (const file of Array.from(files)) {
      if (vehicleId) {
        const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
        const path = `${vehicleId}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file)
        if (uploadError) { showToast(`Upload failed: ${uploadError.message}`, 'error'); continue }
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
        const { data: dbRow, error: dbError } = await supabase.from('vehicle_media').insert({
          vehicle_id: vehicleId,
          url: publicUrl,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          sort_order: 0,
          is_primary: false,
        }).select('id').single()
        if (dbError) { showToast(`Failed to save media: ${dbError.message}`, 'error'); continue }
        onUploaded({ id: dbRow?.id, url: publicUrl, is_primary: false, type: file.type.startsWith('video/') ? 'video' : 'image' })
        succeeded++
      } else {
        const result = await uploadFile(file)
        if (result) { onUploaded(result); succeeded++ }
      }
    }
    if (succeeded > 0) showToast(`${succeeded} file${succeeded > 1 ? 's' : ''} uploaded`)
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple={multiple} onChange={handleUpload} style={{ display: 'none' }} />
      <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} loading={uploading}>
        <Upload size={14} /> Upload Image{multiple ? 's' : ''}
      </Button>
    </div>
  )
}
