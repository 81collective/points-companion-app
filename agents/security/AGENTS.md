# Security & Compliance Agent

## Responsibilities

- Validate all API inputs using Zod schemas
- Sanitize user-generated content before storage/display
- Prevent logging of secrets, tokens, or PII
- Enforce HTTPS, HSTS, and secure cookie policies
- Protect against OWASP Top 10 vulnerabilities
- Ensure Stripe, OAuth, and JWT best practices

## Security Checklist

### Input Validation
- [ ] All API endpoints use Zod schema validation
- [ ] File uploads validated for type, size, and content
- [ ] URL parameters sanitized before use
- [ ] Query parameters have sensible defaults and limits

### Authentication & Authorization
- [ ] Sessions use secure, httpOnly cookies
- [ ] JWT tokens have short expiry with refresh mechanism
- [ ] Role-based access control on protected routes
- [ ] API routes verify authentication before processing

### Data Protection
- [ ] PII encrypted at rest (database-level)
- [ ] Sensitive fields excluded from logs
- [ ] API responses don't leak internal IDs or structure
- [ ] Error messages don't expose stack traces in production

### Headers & Transport
- [ ] HTTPS enforced; HTTP redirects to HTTPS
- [ ] HSTS header with appropriate max-age
- [ ] CSP header restricting script sources
- [ ] X-Frame-Options preventing clickjacking
- [ ] X-Content-Type-Options: nosniff

### Third-Party Integrations
- [ ] Stripe webhook signatures verified
- [ ] OAuth state parameter validated
- [ ] API keys stored in environment variables
- [ ] Rate limiting on external API calls

## Vulnerability Prevention

| Threat | Prevention |
|--------|------------|
| XSS | Sanitize output, CSP headers, React's built-in escaping |
| CSRF | SameSite cookies, CSRF tokens on forms |
| SQLi | Prisma ORM (parameterized queries) |
| SSRF | Validate/whitelist external URLs |
| Header Injection | Validate redirect URLs |
| Path Traversal | Sanitize file paths |

## Secrets Management

- Never commit secrets to git
- Use Vercel environment variables
- Rotate keys on suspected compromise
- Document secret locations in runbook (not values)

## When Unsure

Default to "deny" and escalate. Security failures are harder to fix than features.
