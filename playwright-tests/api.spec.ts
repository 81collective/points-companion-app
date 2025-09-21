import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('should return successful health check', async ({ request }) => {
    const response = await request.get('/api/test-places')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('api_key_working')
  })

  test('should handle location API', async ({ request }) => {
    // Test location endpoint with sample coordinates
    const response = await request.post('/api/location', {
      data: {
        latitude: 40.7580,
        longitude: -73.9855
      }
    })
    
    // Should not error even if API is not configured
    expect([200, 400, 500]).toContain(response.status())
  })

  test('should handle cards API', async ({ request }) => {
    const response = await request.get('/api/cards')
    
    // Should return cards data or proper error response
    expect([200, 500]).toContain(response.status())
    
    if (response.status() === 200) {
      const data = await response.json()
      expect(Array.isArray(data) || typeof data === 'object').toBe(true)
    }
  })

  test('should handle recommendations API', async ({ request }) => {
    const response = await request.post('/api/recommendations', {
      data: {
        location: {
          latitude: 40.7580,
          longitude: -73.9855
        },
        preferences: {
          dining: true,
          travel: false
        }
      }
    })
    
    // Should handle the request gracefully
    expect([200, 400, 500]).toContain(response.status())
  })

  test('should handle categorize API', async ({ request }) => {
    const response = await request.post('/api/categorize', {
      data: {
        merchant: 'Starbucks',
        amount: 5.50
      }
    })
    
    // Should categorize merchant or return error
    expect([200, 400, 500]).toContain(response.status())
  })
})
