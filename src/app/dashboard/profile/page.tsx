"use client"
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useDashboardPreferences, type DashboardPreferences } from '@/hooks/useDashboardPreferences'
import ProfileLayout from '@/components/layout/ProfileLayout'
import { useAuth } from '@/contexts/AuthContext'
import AvatarUploader from '@/components/profile/AvatarUploader'
import TwoFactorSetup from '@/components/profile/TwoFactorSetup'
import type { } from '@/contexts/AuthContext' // ensure module resolution for types

// Bring in Profile type from AuthContext via re-declaration (cannot import directly if not exported)
interface ProfileShape { id: string; email: string; first_name: string | null; last_name: string | null; avatar_url: string | null; created_at: string; updated_at: string }

export default function ProfileSettingsPage() {
  const { preferences, setPreferences, save, loading, defaultPreferences } = useDashboardPreferences()
  const { updateProfile, profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!saving && saved) {
      const t = setTimeout(() => setSaved(false), 1500)
      return () => clearTimeout(t)
    }
  }, [saving, saved])

  const onToggle = <K extends keyof DashboardPreferences>(key: K) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({ ...preferences, [key]: e.target.checked })
  }

  const onSelect = <K extends keyof DashboardPreferences>(key: K) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Cast ensured by generic K mapping to valid key
    setPreferences({ ...preferences, [key]: e.target.value as DashboardPreferences[K] })
  }

  const onSave = async () => {
    setSaving(true)
    await save(preferences)
    setSaving(false)
    setSaved(true)
  }

  const onReset = async () => {
    setSaving(true)
    await save(defaultPreferences)
    setSaving(false)
    setSaved(true)
  }

  return (
    <ProtectedRoute>
      <ProfileLayout>
        <section id="personal" className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Profile & Preferences</h1>
            <p className="text-gray-600 mt-1">Control account info, dashboard experience, privacy, and integrations.</p>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal information</h2>
            <div className="mb-6"><AvatarUploader /></div>
            <PersonalInfoForm profile={profile as ProfileShape | null} updateProfile={updateProfile as (u: Partial<ProfileShape>) => Promise<{ error?: string }>} />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="preferences">
          {/* Preferences */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Dashboard sections</h2>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-gray-500">Loading…</p>
                ) : (
                  <>
                    <ToggleItem label="Credit cards" checked={preferences.showCreditCards} onChange={onToggle('showCreditCards')} />
                    <ToggleItem label="Analytics" checked={preferences.showAnalytics} onChange={onToggle('showAnalytics')} />
                    <ToggleItem label="AI insights" checked={preferences.showAIInsights} onChange={onToggle('showAIInsights')} />
                    <ToggleItem label="Transactions" checked={preferences.showTransactions} onChange={onToggle('showTransactions')} />
                    <ToggleItem label="Notifications" checked={preferences.showNotifications} onChange={onToggle('showNotifications')} />
                    <ToggleItem label="Location services" checked={preferences.showLocationServices} onChange={onToggle('showLocationServices')} />
                  </>
                )}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Display</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectItem
                  label="Default view"
                  value={preferences.defaultDashboardView}
                  onChange={onSelect('defaultDashboardView')}
                  options={[
                    { label: 'Overview', value: 'overview' },
                    { label: 'Cards', value: 'cards' },
                    { label: 'Analytics', value: 'analytics' },
                  ]}
                />
                <SelectItem
                  label="Card layout"
                  value={preferences.cardDisplayMode}
                  onChange={onSelect('cardDisplayMode')}
                  options={[
                    { label: 'Grid', value: 'grid' },
                    { label: 'List', value: 'list' },
                  ]}
                />
                <SelectItem
                  label="Analytics range"
                  value={preferences.analyticsTimeRange}
                  onChange={onSelect('analyticsTimeRange')}
                  options={[
                    { label: 'Last 30 days', value: '30d' },
                    { label: 'Last 90 days', value: '90d' },
                    { label: 'Last 12 months', value: '1y' },
                  ]}
                />
              </div>
            </section>
          </div>

          {/* Actions */}
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-3">Actions</h3>
              <div className="flex flex-col gap-2">
                <button onClick={onSave} disabled={saving} className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-black/90 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button onClick={onReset} disabled={saving} className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
                  Reset to defaults
                </button>
                {saved ? <span className="text-xs text-emerald-600">Saved!</span> : null}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" id="privacy">
              <h3 className="font-medium text-gray-900 mb-3">Privacy & Security</h3>
              <TwoFactorSetup />
              <ul className="space-y-3 text-sm text-gray-600 mb-4 mt-6">
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 mt-1 rounded-full bg-emerald-500" />Device/session management (planned)</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 mt-1 rounded-full bg-emerald-500" />Export / delete data self-service (roadmap)</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 mt-1 rounded-full bg-emerald-500" />Granular notification categories (planned)</li>
              </ul>
              <p className="text-xs text-gray-500">Security features are being rolled out incrementally.</p>
            </div>
          </aside>
        </div>

        {/* Integrations */}
        <section id="integrations" className="space-y-6 mt-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Integrations</h2>
            <p className="text-sm text-gray-600 mb-4">Manage connected data sources and services.</p>
            <ul className="divide-y divide-gray-100 text-sm">
              <li className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Bank & Card Connections</p>
                  <p className="text-gray-500 text-xs">Direct issuer connections (coming soon)</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">Planned</span>
              </li>
              <li className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Location Services</p>
                  <p className="text-gray-500 text-xs">Enable nearby recommendations</p>
                </div>
                <button className="text-xs font-medium text-rose-600 hover:text-rose-700">Manage</button>
              </li>
              <li className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">API Access</p>
                  <p className="text-gray-500 text-xs">Developer keys (future)</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">Planned</span>
              </li>
            </ul>
          </div>
        </section>
      </ProfileLayout>
    </ProtectedRoute>
  )
}

function ToggleItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <span className="text-gray-800">{label}</span>
      <input type="checkbox" className="h-5 w-9" checked={checked} onChange={onChange} />
    </label>
  )
}

function SelectItem({ label, value, onChange, options }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: Array<{ label: string; value: string }> }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-gray-600">{label}</span>
      <select value={value} onChange={onChange} className="rounded-lg border border-gray-200 px-3 py-2 bg-white text-gray-900">
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  )
}

function PersonalInfoForm({ profile, updateProfile }: { profile: ProfileShape | null; updateProfile: (u: Partial<ProfileShape>) => Promise<{ error?: string }> }) {
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
