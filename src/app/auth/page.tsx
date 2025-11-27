// src/app/auth/page.tsx - Airbnb-inspired auth page
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import AuthDiagnostics from '@/components/auth/AuthDiagnostics'
import { Loader2, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import TextLogo from '@/components/branding/TextLogo'

type AuthMode = 'login' | 'signup' | 'forgot-password'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
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
    <div className="min-h-screen bg-gradient-to-b from-[#faf8ff] via-white to-[#f5f0ff]">
      <AuthDiagnostics />
      {/* Header */}
      <div className="w-full border-b border-neutral-100 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-900 text-lg">
            <TextLogo className="text-xl sm:text-2xl" withLink={false} />
          </Link>
          <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto md:max-w-5xl px-4 md:px-0 py-10 md:py-16">
        <div className="w-full max-w-md mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {mode === 'login' && 'Welcome back'}
              {mode === 'signup' && 'Join PointAdvisor'}
              {mode === 'forgot-password' && 'Reset password'}
            </h1>
            <p className="text-neutral-600">
              {mode === 'login' && 'Sign in to continue optimizing your rewards'}
              {mode === 'signup' && 'Start maximizing your credit card rewards today'}
              {mode === 'forgot-password' && 'We\'ll send you a link to reset your password'}
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(82,47,174,0.12)] border border-neutral-100 p-8">
            {mode === 'login' && (
              <LoginForm 
                onToggleMode={() => setMode('signup')} 
                onForgotPassword={() => setMode('forgot-password')}
              />
            )}
            {mode === 'signup' && (
              <SignupForm onToggleMode={() => setMode('login')} />
            )}
            {mode === 'forgot-password' && (
              <ForgotPasswordForm onBack={() => setMode('login')} />
            )}
          </div>

          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">Smart Card Management</h3>
                  <p className="text-sm text-neutral-600">Track all your cards in one place</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">AI-Powered Recommendations</h3>
                  <p className="text-sm text-neutral-600">Get personalized card suggestions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500 mb-4">Trusted by thousands of smart spenders</p>
            <div className="flex items-center justify-center gap-6 text-neutral-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs">Bank-level security</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                <span className="text-xs">Privacy protected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-400 rounded-full"></div>
                <span className="text-xs">Always free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}