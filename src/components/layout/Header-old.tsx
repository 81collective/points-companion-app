// src/components/layout/Header.tsx
'use client'
import { LogOut, User, Settings, Sparkles } from 'lucide-react'
// import { useEffect } from 'react' // Removed unused import
import { fetchRecommendations } from '../../lib/recommendations'
import type { Recommendation } from '@/types/recommendation.types'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showRecModal, setShowRecModal] = useState(false)
  const [loadingRec, setLoadingRec] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [recError, setRecError] = useState<string | null>(null)

  const handleSignOut = async () => {
    await signOut()
    setShowDropdown(false)
  }

  async function handleGetRecommendations() {
    setLoadingRec(true)
    setRecError(null)
    setRecommendations([])
    try {
      // Replace with actual transaction/card data from context or props
      const data = {
        transactions: [],
        cards: [],
      }
      const res = await fetchRecommendations(data)
      setRecommendations(res.recommendations)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRecError(err.message)
      } else {
        setRecError('Unknown error')
      }
    } finally {
      setLoadingRec(false)
    }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-gray-900">PointAdvisor</h1>
            <nav className="hidden md:flex gap-4">
              <a href="/dashboard" className="text-gray-700 hover:text-blue-700 font-medium transition">Dashboard</a>
              <a href="/dashboard/cards" className="text-gray-700 hover:text-blue-700 font-medium transition">My Wallet</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Dashboard CTA removed as requested */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {profile?.firstName ? profile.firstName[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : user?.email}
                </span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => { setShowRecModal(true); setShowDropdown(false); handleGetRecommendations(); }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Get Recommendation</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Modal should be outside header for correct rendering */}
      {showRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowRecModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" /> Card Recommendations
            </h2>
            {loadingRec && <div className="text-gray-500">Loading recommendations...</div>}
            {recError && <div className="text-red-600 mb-2">{recError}</div>}
            {!loadingRec && recommendations.length > 0 && (
              <ul className="mt-2">
                {recommendations.map(rec => (
                  <li key={rec.cardId} className="mb-2">
                    <span className="font-semibold">{rec.cardName}</span>: {rec.reason} <span className="text-xs text-gray-500">(Score: {rec.score})</span>
                  </li>
                ))}
              </ul>
            )}
            {!loadingRec && recommendations.length === 0 && !recError && (
              <div className="text-gray-500">No recommendations found.</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}