# Repo‑Wide Agent Operating Guide

## Priorities

1. **Security + Data Integrity** — Never compromise user data or expose secrets
2. **UX Performance + Accessibility** — Fast, usable experiences for everyone
3. **Maintainability + Test Coverage** — Code that lasts and can be safely changed

## Guardrails

- **TypeScript:** Strict mode enabled; no `any` without explicit justification
- **Validation:** Zod schemas at all API boundaries
- **Logging:** No PII in logs; redact emails, tokens, card data
- **Feature Flags:** Use flags for risky changes; enable gradual rollout
- **Error Handling:** Typed error objects; correlation IDs for tracing

## PostHog Events (Standard Schema)

All events should include `correlation_id`, `timestamp`, and `user_id` (hashed if needed).

| Event | Description |
|-------|-------------|
| `auth_login` | User successfully authenticated |
| `auth_logout` | User logged out |
| `product_view` | Product detail page viewed |
| `add_to_cart` | Item added to cart |
| `remove_from_cart` | Item removed from cart |
| `checkout_started` | Checkout flow initiated |
| `purchase_completed` | Order successfully placed |
| `refund_issued` | Refund processed |
| `email_sent` | Transactional email dispatched |
| `email_bounced` | Email delivery failed |
| `card_added` | Credit card added to wallet |
| `recommendation_shown` | Card recommendation displayed |
| `recommendation_clicked` | User clicked a recommendation |

## Code Style

- Follow SOLID principles
- Prefer composition over inheritance
- Pure functions where possible
- Explicit over implicit
- Document public APIs with JSDoc

## When Unsure

- Choose the more secure option
- Choose the more testable pattern
- Ask for clarification before making irreversible changes
