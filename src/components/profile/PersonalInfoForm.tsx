"use client"
import { useState, useEffect } from 'react'

interface ProfileShape { id: string; email: string; first_name: string | null; last_name: string | null; avatar_url: string | null; created_at: string; updated_at: string }

export default function PersonalInfoForm({ profile, updateProfile }: { profile: ProfileShape | null; updateProfile: (u: Partial<ProfileShape>) => Promise<{ error?: string }> }) {
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    setFirstName(profile?.first_name || '')
    setLastName(profile?.last_name || '')
  }, [profile?.first_name, profile?.last_name])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    const { error } = await updateProfile({ first_name: firstName, last_name: lastName })
    setStatus(error ? 'error' : 'saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">First name</span>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2" placeholder="Jane" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600">Last name</span>
            <input value={lastName} onChange={e => setLastName(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2" placeholder="Doe" />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={status==='saving'} className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black/90 disabled:opacity-50">{status==='saving' ? 'Saving…' : 'Save profile'}</button>
        {status==='saved' && <span className="text-xs text-emerald-600">Saved!</span>}
        {status==='error' && <span className="text-xs text-rose-600">Error</span>}
      </div>
    </form>
  )
}
