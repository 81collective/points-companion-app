import type { RecommendationRequest, RecommendationResponse } from '@/types/recommendation.types'

export async function fetchRecommendations(data: RecommendationRequest): Promise<RecommendationResponse> {
  const res = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to fetch recommendations')
  }
  return res.json()
}
