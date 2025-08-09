"use client"
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { authenticator } from 'otplib'

export default function TwoFactorSetup() {
  const { user } = useAuth()
  const supabase = createClient()
  const [enabled, setEnabled] = useState(false)
  const [secret, setSecret] = useState('')
  const [qr, setQr] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'error' | 'saved'>('idle')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase.from('user_totp_secrets').select('enabled').eq('user_id', user.id).maybeSingle()
      if (data) setEnabled(data.enabled)
      setLoading(false)
    })()
  }, [user, supabase])

  const begin = async () => {
    if (!user) return
    const { default: QRCode } = await import('qrcode')
    const newSecret = authenticator.generateSecret()
    setSecret(newSecret)
    const otpauth = authenticator.keyuri(user.email || '', 'Points Companion', newSecret)
    const dataUrl = await QRCode.toDataURL(otpauth, { width: 180 })
    setQr(dataUrl)
  }

  const verify = async () => {
    if (!user || !secret) return
    setStatus('verifying')
    const ok = authenticator.check(code, secret)
    if (!ok) { setStatus('error'); return }
    const { error } = await supabase.from('user_totp_secrets').upsert({ user_id: user.id, secret, enabled: true, updated_at: new Date().toISOString() })
    if (error) { setStatus('error'); return }
    setEnabled(true)
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  const disable = async () => {
    if (!user) return
    await supabase.from('user_totp_secrets').update({ enabled: false }).eq('user_id', user.id)
    setEnabled(false)
    setSecret('')
    setQr(null)
  }

  if (!user) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication (TOTP)</h4>
        {enabled ? <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">Enabled</span> : <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">Disabled</span>}
      </div>
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {!loading && !enabled && !qr && (
        <button onClick={begin} className="text-xs inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-black/90">Enable 2FA</button>
      )}
      {!loading && !enabled && qr && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Scan this QR code in Google Authenticator or a compatible app, then enter the 6-digit code.</p>
          {/* Replaced img with optimized Image */}
          {qr && (
            <Image src={qr} alt="TOTP QR Code" width={180} height={180} className="border rounded-lg p-2 bg-white" />
          )}
          <div className="flex items-center gap-2">
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="123456" className="px-3 py-2 border rounded-lg text-sm w-32 tracking-widest" maxLength={6} />
            <button onClick={verify} disabled={status==='verifying'} className="text-xs inline-flex items-center px-3 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50">{status==='verifying' ? 'Verifying…' : 'Verify'}</button>
            {status==='error' && <span className="text-xs text-rose-600">Invalid code</span>}
            {status==='saved' && <span className="text-xs text-emerald-600">Enabled</span>}
          </div>
        </div>
      )}
      {!loading && enabled && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600">2FA is active on this account.</p>
          <button onClick={disable} className="text-xs inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 font-medium">Disable</button>
        </div>
      )}
    </div>
  )
}
