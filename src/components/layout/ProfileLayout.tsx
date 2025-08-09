"use client"
import Link from 'next/link'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <header className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
        <h1 className="text-2xl font-semibold">Profile & Settings</h1>
        <p className="text-white/80 mt-1">Manage your account, preferences, privacy, and integrations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <nav aria-label="Profile sections" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <ul className="space-y-1 text-sm">
              <li><a href="#personal" className="block px-3 py-2 rounded-lg hover:bg-gray-50">Personal Info</a></li>
              <li><a href="#preferences" className="block px-3 py-2 rounded-lg hover:bg-gray-50">Dashboard Preferences</a></li>
              <li><a href="#privacy" className="block px-3 py-2 rounded-lg hover:bg-gray-50">Privacy & Security</a></li>
              <li><a href="#integrations" className="block px-3 py-2 rounded-lg hover:bg-gray-50">Integrations</a></li>
            </ul>
          </nav>
        </aside>
        <main className="lg:col-span-3">
          {children}
        </main>
      </div>
    </div>
  )
}
