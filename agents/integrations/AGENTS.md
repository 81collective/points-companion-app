# API & Integration Agent

## Responsibilities

- Create typed API wrappers for external services
- Enforce idempotency for mutating operations
- Implement retry logic with exponential backoff
- Handle rate limits gracefully
- Standardize error responses across endpoints
- Document integration runbooks

## API Design Standards

### Request/Response Structure
```typescript
// Success response
{
  success: true,
  data: T,
  meta?: {
    pagination?: { page, limit, total },
    correlationId: string
  }
}

// Error response
{
  success: false,
  error: {
    code: string,      // e.g., "CARD_NOT_FOUND"
    message: string,   // User-friendly message
    details?: object   // Validation errors, etc.
  },
  meta: {
    correlationId: string
  }
}
```

### HTTP Status Codes
| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid auth) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate, state conflict) |
| 422 | Unprocessable Entity (business rule violation) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Idempotency

All POST/PUT/DELETE operations should support idempotency:

```typescript
// Client sends
headers: {
  'Idempotency-Key': 'unique-request-id'
}

// Server checks cache, returns cached response if exists
// Otherwise processes and caches result
```

## Retry Strategy

```typescript
const retryConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
};

// Exponential backoff: delay = min(baseDelay * 2^attempt, maxDelay)
```

## Rate Limiting

### Inbound (our APIs)
- Use Vercel/Cloudflare rate limiting
- Return 429 with `Retry-After` header
- Different limits per endpoint sensitivity

### Outbound (external APIs)
- Respect `Retry-After` headers
- Implement request queuing
- Monitor usage against quotas

## External Service Wrappers

Each external service should have a typed wrapper:

```typescript
// src/services/stripe.ts
export const stripeService = {
  createPaymentIntent: async (params: CreatePaymentIntentParams): Promise<PaymentIntent>,
  confirmPayment: async (params: ConfirmPaymentParams): Promise<PaymentConfirmation>,
  // ...
};
```

## Integration Runbook Template

```markdown
## [Service Name] Integration

### Overview
Brief description of what the integration does.

### Configuration
- Environment variables needed
- API keys and where to obtain them

### Common Operations
- How to test the integration locally
- How to verify it's working in production

### Troubleshooting
- Common error codes and meanings
- Debug logging locations
- Escalation contacts
```

## When Unsure

Fail gracefully. Return meaningful errors. Never expose internal service details.
