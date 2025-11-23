"use client"
import { useState, useRef } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function AvatarUploader() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { profile, updateProfile } = useAuth()

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) {
        throw new Error('Upload failed')
      }
      const data = (await res.json()) as { avatarUrl?: string }
      if (data.avatarUrl) {
        await updateProfile({ avatarUrl: data.avatarUrl })
      }
    } catch (err) {
      console.error('Avatar upload failed', err)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 text-sm border border-gray-200">
        {profile?.avatarUrl ? (
          <Image src={profile.avatarUrl} alt="Avatar" width={80} height={80} className="object-cover h-full w-full" />
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
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  )
}
