// src/app/auth/page.tsx - Simple version to test first
'use client'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Points Companion</h2>
          <p className="text-gray-600 mb-8">Authentication page is working!</p>
          
          {/* Simple form for testing */}
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Sign In
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-600">
            Don't have an account? <span className="text-blue-600 cursor-pointer">Sign up</span>
          </p>
        </div>
      </div>
    </div>
  )
}