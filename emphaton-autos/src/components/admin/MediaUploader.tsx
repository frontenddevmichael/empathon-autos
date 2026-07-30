import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'

interface UploadedMedia {
  url: string
  is_primary: boolean
  type: 'image' | 'video'
}

interface MediaUploaderProps {
  vehicleId?: string
  onUploaded: (media: UploadedMedia) => void
}

export function MediaUploader({ vehicleId, onUploaded }: MediaUploaderProps) {
  const { showToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !vehicleId) return

    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${vehicleId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage.from('vehicle-media').upload(path, file)
    if (uploadError) { showToast('Upload failed', 'error'); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('vehicle-media').getPublicUrl(path)

    const { error: dbError } = await supabase.from('vehicle_media').insert({
      vehicle_id: vehicleId,
      url: publicUrl,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      sort_order: 0,
      is_primary: false,
    }).select().single()

    if (dbError) { showToast('Failed to save media', 'error'); setUploading(false); return }

    onUploaded({ url: publicUrl, is_primary: false, type: file.type.startsWith('video/') ? 'video' : 'image' })
    showToast('Image uploaded')
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*,video/*" onChange={handleUpload} style={{ display: 'none' }} />
      <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} loading={uploading}>
        <Upload size={14} /> Upload Image
      </Button>
    </div>
  )
}