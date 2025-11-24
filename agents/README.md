# Agent Skill Index

This directory contains specialized agent skill files that provide context and rules for different aspects of the codebase.

## How to Use

When working on a specific area, read the relevant agent file first to understand the standards and patterns expected.

## Available Agents

| Agent | Path | Use When |
|-------|------|----------|
| **Root Guide** | [`/AGENTS.md`](../AGENTS.md) | Always - core priorities and guardrails |
| **Architecture** | [`architecture/AGENTS.md`](architecture/AGENTS.md) | Refactoring, code organization, abstractions |
| **Security** | [`security/AGENTS.md`](security/AGENTS.md) | Auth, validation, data protection |
| **Performance** | [`performance/AGENTS.md`](performance/AGENTS.md) | Optimization, caching, Core Web Vitals |
| **Integrations** | [`integrations/AGENTS.md`](integrations/AGENTS.md) | External APIs, webhooks, retries |
| **Data** | [`data/AGENTS.md`](data/AGENTS.md) | Database, migrations, queries |
| **Testing** | [`testing/AGENTS.md`](testing/AGENTS.md) | Unit, integration, E2E tests |
| **Release** | [`release/AGENTS.md`](release/AGENTS.md) | Deployment, feature flags, rollbacks |
| **Payments** | [`payments/AGENTS.md`](payments/AGENTS.md) | Stripe, orders, transactions |
| **Web UI** | [`web/AGENTS.md`](web/AGENTS.md) | Components, Server Components, Islands |
| **Design** | [`design/AGENTS.md`](design/AGENTS.md) | UX/UI, accessibility, design system |
| **SEO** | [`seo/AGENTS.md`](seo/AGENTS.md) | Technical SEO, structured data, crawling |
| **Docs** | [`docs/AGENTS.md`](docs/AGENTS.md) | Documentation, ADRs, runbooks |

## Checklists

| Checklist | Path | Use When |
|-----------|------|----------|
| **SEO Release** | [`/docs/seo-checklist.md`](../docs/seo-checklist.md) | Deploying routing/template changes |
| **UX Release** | [`/docs/ux-checklist.md`](../docs/ux-checklist.md) | Deploying UI changes |

## Task-Based Quick Reference

| Task | Read These Agents |
|------|-------------------|
| Adding a new API endpoint | Root, Architecture, Integrations, Security |
| Building a new UI component | Root, Web, Design, Performance |
| Database schema change | Root, Data, Testing |
| Adding Stripe integration | Root, Payments, Security, Integrations |
| Fixing performance issue | Root, Performance, Web |
| Adding new page/route | Root, SEO, Web, Design |
| Writing tests | Root, Testing |
| Deploying to production | Root, Release, SEO checklist, UX checklist |

## Extending Agents

To add a new agent skill file:

1. Create `agents/{domain}/AGENTS.md`
2. Follow the existing format (Responsibilities, Standards, When Unsure)
3. Update this index
4. Commit with message: `docs: Add {domain} agent skill file`
