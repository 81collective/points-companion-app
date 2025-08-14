// src/app/auth/page.tsx - Airbnb-inspired auth page
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import AuthDiagnostics from '@/components/auth/AuthDiagnostics'
import { Loader2, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AuthDiagnostics />
      {/* Header */}
      <div className="w-full border-b border-gray-800 bg-black/90 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-gray-900 flex items-center justify-center text-white text-base font-bold">PC</div>
            <span className="hidden sm:inline">Points Companion</span>
          </Link>
          <Link href="/" className="text-sm text-white/80 hover:text-white transition-colors flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto md:max-w-5xl px-4 md:px-0 py-6 md:py-10">
        <div className="w-full max-w-md mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome back' : 'Join Points Companion'}
            </h1>
            <p className="text-white/70">
              {isLogin 
                ? 'Sign in to continue optimizing your rewards' 
                : 'Start maximizing your credit card rewards today'
              }
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
              <SignupForm onToggleMode={() => setIsLogin(true)} />
            )}
          </div>

          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Smart Card Management</h3>
                  <p className="text-sm text-white/70">Track all your cards in one place</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">AI</span>
                </div>
                <div>
                  <h3 className="font-medium text-white">AI-Powered Recommendations</h3>
                  <p className="text-sm text-white/70">Get personalized card suggestions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/70 mb-4">Trusted by thousands of smart spenders</p>
            <div className="flex items-center justify-center space-x-6 text-white/60">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">Bank-level security</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs">Privacy protected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs">Always free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}