'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { AlertCircle } from 'lucide-react'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Invalid reset link</h2>
          <p className="text-sm text-gray-600">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <Link
          href="/auth"
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return <ResetPasswordForm token={token} />
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}
