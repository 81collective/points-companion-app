"use client"
import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function AvatarUploader() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const { profile, updateProfile } = useAuth()
  const supabase = createClient()

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${profile.id}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const publicUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
      await updateProfile({ avatar_url: publicUrl })
    } catch (err) {
      console.error('Avatar upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 text-sm border border-gray-200">
        {profile?.avatar_url ? (
          <Image src={profile.avatar_url} alt="Avatar" width={80} height={80} className="object-cover h-full w-full" />
        ) : (
          'IMG'
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-900 text-white font-medium text-xs hover:bg-black/90 disabled:opacity-50">
            {uploading ? 'Uploading…' : 'Upload avatar'}
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onSelect} />
        </div>
        <p className="text-gray-500">PNG or JPG up to 2MB.</p>
      </div>
    </div>
  )
}
