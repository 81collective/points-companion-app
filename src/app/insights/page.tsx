"use client"

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { redirect } from 'next/navigation'

export default function InsightsPage() {
  redirect('/dashboard/insights')
}
