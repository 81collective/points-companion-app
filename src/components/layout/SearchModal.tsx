"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface BaseResult { id: string; type: 'card' | 'transaction' | 'insight'; title: string; subtitle?: string; href: string }

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [results, setResults] = useState<BaseResult[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const runSearch = useCallback(async (term: string) => {
    if (!term) { setResults([]); setActive(0); return }
    setLoading(true)
    const lc = term.toLowerCase()

    try {
      const [cardsRes, txRes] = await Promise.all([
        supabase.from('credit_cards').select('id, name, issuer').ilike('name', `%${term}%`).limit(5),
        supabase.from('transactions').select('id, merchant_name, amount, category').ilike('merchant_name', `%${term}%`).limit(5)
      ])

      const cardResults: BaseResult[] = (cardsRes.data || []).map(c => ({
        id: c.id,
        type: 'card',
        title: c.name,
        subtitle: c.issuer ? `Card • ${c.issuer}` : 'Card',
        href: '/dashboard/cards'
      }))

      const txResults: BaseResult[] = (txRes.data || []).map(t => ({
        id: t.id,
        type: 'transaction',
        title: `${t.merchant_name || 'Transaction'} ${t.amount ? `$${Number(t.amount).toFixed(2)}` : ''}`.trim(),
        subtitle: t.category ? `Transaction • ${t.category}` : 'Transaction',
        href: '/dashboard/analytics'
      }))

      // Placeholder insights matching
      const insightResults: BaseResult[] = lc.includes('dining') ? [{ id: 'insight-dining', type: 'insight', title: 'Optimize dining this week', subtitle: 'Insight • AI', href: '/dashboard/insights' }] : []

      const combined = [...cardResults, ...txResults, ...insightResults]
      setResults(combined)
      setActive(0)
  } catch (_e) {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(q), 250)
  }, [q, runSearch, open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter') {
      const r = results[active]
      if (r) window.location.href = r.href
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="absolute inset-x-0 top-20 mx-auto w-full max-w-2xl p-4">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search cards, transactions, insights…"
              className="w-full outline-none text-gray-900 placeholder:text-gray-400"
              aria-label="Global search"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {loading && <div className="p-4 text-sm text-gray-500">Searching…</div>}
            {!loading && results.length === 0 && q && <div className="p-4 text-sm text-gray-500">No results</div>}
            {!loading && results.length === 0 && !q && <div className="p-4 text-sm text-gray-500">Type to search. Shortcuts: / or Ctrl/Cmd+K</div>}
            {!loading && results.map((r, i) => (
              <a key={r.id} href={r.href} className={`flex items-start gap-3 p-4 text-sm ${i === active ? 'bg-gray-50' : ''}`} onMouseEnter={() => setActive(i)}>
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-gray-600 text-[10px] uppercase">{r.type[0]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium truncate">{r.title}</p>
                  {r.subtitle ? <p className="text-gray-500 truncate">{r.subtitle}</p> : null}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
