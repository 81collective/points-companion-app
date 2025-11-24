## Description

<!-- Brief description of what this PR does -->

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📚 Documentation update
- [ ] 🔧 Refactor (no functional changes)
- [ ] 🚀 Performance improvement

## Agent Skill Files Consulted

<!-- Check the agent files you referenced while making this change -->

- [ ] [`AGENTS.md`](../AGENTS.md) - Root priorities and guardrails
- [ ] [`agents/architecture/AGENTS.md`](../agents/architecture/AGENTS.md) - Code quality
- [ ] [`agents/security/AGENTS.md`](../agents/security/AGENTS.md) - Security rules
- [ ] [`agents/performance/AGENTS.md`](../agents/performance/AGENTS.md) - Performance
- [ ] [`agents/data/AGENTS.md`](../agents/data/AGENTS.md) - Database
- [ ] [`agents/testing/AGENTS.md`](../agents/testing/AGENTS.md) - Testing
- [ ] [`agents/web/AGENTS.md`](../agents/web/AGENTS.md) - UI patterns
- [ ] [`agents/design/AGENTS.md`](../agents/design/AGENTS.md) - UX/Accessibility
- [ ] [`agents/seo/AGENTS.md`](../agents/seo/AGENTS.md) - SEO
- [ ] [`agents/payments/AGENTS.md`](../agents/payments/AGENTS.md) - Stripe
- [ ] [`agents/integrations/AGENTS.md`](../agents/integrations/AGENTS.md) - APIs
- [ ] [`agents/release/AGENTS.md`](../agents/release/AGENTS.md) - Deployment

## Checklist

### Code Quality
- [ ] TypeScript strict mode - no `any` without justification
- [ ] Zod validation on API boundaries
- [ ] No PII in logs
- [ ] Error handling with correlation IDs

### Testing
- [ ] Unit tests for new logic
- [ ] Integration tests for API changes
- [ ] E2E tests for critical flows (if affected)

### Performance
- [ ] Core Web Vitals not negatively impacted
- [ ] No unnecessary client-side JavaScript added
- [ ] Images optimized with next/image

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels on interactive elements
- [ ] Color contrast AA compliant

### Security
- [ ] Input validation in place
- [ ] No secrets in code
- [ ] Webhook signatures verified (if applicable)

## Release Checklists (if applicable)

- [ ] [`docs/seo-checklist.md`](../docs/seo-checklist.md) completed
- [ ] [`docs/ux-checklist.md`](../docs/ux-checklist.md) completed

## Screenshots (if UI change)

<!-- Add screenshots or screen recordings -->

## Related Issues

<!-- Link to related issues: Fixes #123, Relates to #456 -->
