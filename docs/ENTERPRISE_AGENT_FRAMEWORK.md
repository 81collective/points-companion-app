# Enterprise Agent Framework Implementation Guide

## Overview

This document provides a complete blueprint for implementing an agent-friendly development framework in any software project. It establishes standards, tooling, and documentation practices that enable efficient collaboration between AI agents and human developers.

**Created:** 2025-11-24  
**Version:** 1.0.0

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Agent Skill Files](#agent-skill-files)
3. [GitHub Configuration](#github-configuration)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Documentation Standards](#documentation-standards)
6. [Quality Gates](#quality-gates)
7. [File Structure](#file-structure)
8. [Implementation Checklist](#implementation-checklist)

---

## Philosophy

### Core Principles

1. **Explicit over Implicit**: Document all decisions, patterns, and conventions
2. **Context is King**: Agents work best with clear, accessible context
3. **Fail Fast**: Catch issues before they reach production
4. **Handoff-Ready**: Every session should leave a clean state for the next agent

### Agent Collaboration Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT COLLABORATION FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CONTEXT GATHERING                                           │
│     └─> Read AGENTS.md (root priorities)                        │
│     └─> Read agents/{domain}/AGENTS.md (specific rules)         │
│     └─> Read docs/CURRENT_STATE.md (project state)              │
│                                                                  │
│  2. TASK EXECUTION                                               │
│     └─> Follow agent rules for domain                           │
│     └─> Use established patterns                                 │
│     └─> Document decisions as you go                            │
│                                                                  │
│  3. VALIDATION                                                   │
│     └─> Pre-commit hooks validate rules                         │
│     └─> CI pipeline runs quality gates                          │
│     └─> Lighthouse checks performance                           │
│                                                                  │
│  4. HANDOFF                                                      │
│     └─> Update CURRENT_STATE.md                                 │
│     └─> Create ADR for major decisions                          │
│     └─> Commit with descriptive message                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Agent Skill Files

Agent skill files provide domain-specific rules and context for AI agents.

### File Structure

```
project/
├── AGENTS.md                    # Root-level priorities and guardrails
├── agents/
│   ├── README.md                # Index of all agent files
│   ├── architecture/
│   │   └── AGENTS.md            # Code quality, SOLID, patterns
│   ├── security/
│   │   └── AGENTS.md            # Security rules, validation, auth
│   ├── performance/
│   │   └── AGENTS.md            # Core Web Vitals, optimization
│   ├── data/
│   │   └── AGENTS.md            # Database, migrations, queries
│   ├── testing/
│   │   └── AGENTS.md            # Test pyramid, coverage
│   ├── integrations/
│   │   └── AGENTS.md            # API design, retry patterns
│   ├── release/
│   │   └── AGENTS.md            # Deployment, feature flags
│   ├── web/
│   │   └── AGENTS.md            # UI patterns, components
│   ├── design/
│   │   └── AGENTS.md            # UX/UI, accessibility
│   ├── seo/
│   │   └── AGENTS.md            # Technical SEO
│   ├── payments/
│   │   └── AGENTS.md            # Payment integration
│   └── docs/
│       └── AGENTS.md            # Documentation standards
```

### Root AGENTS.md Template

```markdown
# Repo‑Wide Agent Operating Guide

## Priorities

1. **Security + Data Integrity** — Never compromise user data
2. **UX Performance + Accessibility** — Fast, usable experiences
3. **Maintainability + Test Coverage** — Code that lasts

## Guardrails

- TypeScript strict mode
- Zod validation at boundaries
- No PII in logs
- Feature flags for risky changes
- Typed error objects with correlation IDs

## Standard Events (Analytics)

| Event | Description |
|-------|-------------|
| `auth_login` | User authenticated |
| `product_view` | Product page viewed |
| `checkout_started` | Checkout initiated |
| `purchase_completed` | Order placed |

## When Unsure

- Choose the more secure option
- Choose the more testable pattern
- Ask for clarification
```

### Domain Agent Template

```markdown
# {Domain} Agent

## Responsibilities

- Responsibility 1
- Responsibility 2

## Standards

### Rule Category 1
- Rule 1
- Rule 2

### Rule Category 2
- Rule 1
- Rule 2

## Patterns

\`\`\`typescript
// Example pattern
\`\`\`

## Checklist

- [ ] Check 1
- [ ] Check 2

## When Unsure

Guidance for ambiguous situations.
```

---

## GitHub Configuration

### CODEOWNERS

```
# .github/CODEOWNERS

# Default owners
*                     @org/maintainers

# Domain-specific
/src/app/api/         @org/backend
/src/components/      @org/frontend
/prisma/              @org/backend
/.github/             @org/devops
/agents/              @org/maintainers
/docs/                @org/maintainers
```

### PR Template

```markdown
<!-- .github/PULL_REQUEST_TEMPLATE.md -->

## Description

## Agent Files Consulted

- [ ] `AGENTS.md`
- [ ] `agents/{domain}/AGENTS.md`

## Checklist

### Code Quality
- [ ] TypeScript strict - no `any`
- [ ] Zod validation on APIs
- [ ] Tests for new logic

### Performance
- [ ] Core Web Vitals not impacted
- [ ] No unnecessary client JS

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels present
```

### Issue Templates

Create `.github/ISSUE_TEMPLATE/`:
- `bug_report.yml` - Structured bug reports
- `feature_request.yml` - Feature proposals

### Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      framework:
        patterns: ["next", "react", "react-dom"]
      testing:
        patterns: ["jest", "playwright", "@testing-library/*"]
      linting:
        patterns: ["eslint", "prettier"]
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - run: npx playwright install
      - run: npm run test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

### Lighthouse Configuration

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

---

## Documentation Standards

### Required Documents

| Document | Purpose | Location |
|----------|---------|----------|
| README.md | Project overview, setup | Root |
| CONTRIBUTING.md | Contributor guidelines | Root |
| CHANGELOG.md | Version history | Root |
| AGENTS.md | Agent priorities | Root |
| agents/README.md | Agent file index | agents/ |
| docs/CURRENT_STATE.md | Project status | docs/ |
| docs/AGENT_HANDOFF_GUIDE.md | Handoff standards | docs/ |
| docs/adr/*.md | Architecture decisions | docs/adr/ |

### Commit Message Format

```
<type>(<scope>): <description>

<body - explain WHY>

<footer - references>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`

### ADR Template

```markdown
# ADR-XXX: Title

## Status
Draft | Accepted | Deprecated

## Context
Why is this decision needed?

## Decision
What was decided?

## Consequences
### Positive
### Negative

## Alternatives Considered
```

---

## Quality Gates

### Pre-commit Checks

```javascript
// scripts/pre-commit-validate.mjs
const checks = [
  { name: 'No console.log', pattern: /console\.log/ },
  { name: 'No hardcoded secrets', pattern: /sk_live_|password\s*=/ },
  { name: 'API routes have validation', check: checkZodImport },
];
```

### CI Quality Matrix

| Check | When | Blocks PR |
|-------|------|-----------|
| Type check | Always | Yes |
| Lint | Always | Yes |
| Unit tests | Always | Yes |
| Build | Always | Yes |
| E2E tests | PRs only | Yes |
| Lighthouse | PRs only | Warnings |
| Security audit | Always | Warnings |

### Performance Budgets

| Metric | Target | Critical |
|--------|--------|----------|
| LCP | ≤ 2.5s | > 4.0s |
| CLS | ≤ 0.1 | > 0.25 |
| TBT | ≤ 300ms | > 600ms |

---

## File Structure

### Recommended Layout

```
project/
├── .github/
│   ├── workflows/ci.yml
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── dependabot.yml
│   └── ISSUE_TEMPLATE/
├── .storybook/           # Component documentation
├── agents/               # Agent skill files
├── config/               # App configuration
├── docs/
│   ├── adr/              # Architecture decisions
│   ├── CURRENT_STATE.md
│   ├── AGENT_HANDOFF_GUIDE.md
│   ├── seo-checklist.md
│   └── ux-checklist.md
├── prisma/               # Database schema
├── public/               # Static assets
├── scripts/              # Build/dev scripts
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Core libraries
├── AGENTS.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── README.md
├── lighthouserc.js
└── package.json
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create root `AGENTS.md`
- [ ] Create `agents/README.md` index
- [ ] Create `.github/copilot-instructions.md`
- [ ] Set up `CONTRIBUTING.md`

### Phase 2: Agent Skill Files
- [ ] `agents/architecture/AGENTS.md`
- [ ] `agents/security/AGENTS.md`
- [ ] `agents/performance/AGENTS.md`
- [ ] `agents/data/AGENTS.md`
- [ ] `agents/testing/AGENTS.md`
- [ ] `agents/integrations/AGENTS.md`
- [ ] `agents/release/AGENTS.md`
- [ ] Domain-specific agents as needed

### Phase 3: GitHub Configuration
- [ ] `.github/CODEOWNERS`
- [ ] `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] `.github/ISSUE_TEMPLATE/bug_report.yml`
- [ ] `.github/ISSUE_TEMPLATE/feature_request.yml`
- [ ] `.github/dependabot.yml`

### Phase 4: CI/CD
- [ ] `.github/workflows/ci.yml`
- [ ] `lighthouserc.js`
- [ ] Pre-commit validation script
- [ ] Storybook configuration (optional)

### Phase 5: Documentation
- [ ] `docs/CURRENT_STATE.md`
- [ ] `docs/AGENT_HANDOFF_GUIDE.md`
- [ ] `docs/adr/ADR-000-template.md`
- [ ] Release checklists

### Phase 6: Ongoing
- [ ] Create ADRs for major decisions
- [ ] Update `CURRENT_STATE.md` regularly
- [ ] Add to agent files when patterns emerge
- [ ] Maintain `CHANGELOG.md`

---

## Quick Start for New Projects

1. Copy the `agents/` directory structure
2. Copy GitHub configuration files
3. Customize agent files for your stack
4. Set up CI/CD pipeline
5. Create initial documentation
6. Train team on handoff practices

---

## Maintenance

### Weekly
- Review and merge Dependabot PRs
- Check CI failure trends

### Per Session
- Update `CURRENT_STATE.md`
- Create ADRs for decisions
- Follow handoff documentation guide

### Monthly
- Review agent files for accuracy
- Update checklists based on incidents
- Archive superseded ADRs

---

## License

This framework is provided as-is. Adapt to your project's needs.

---

*Document generated: 2025-11-24*
