# Contributing to Points Companion App

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/81collective/points-companion-app.git
cd points-companion-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Development Workflow

### 1. Read the Agent Files

Before making changes, read the relevant agent skill files in `/agents/`:

| Changing | Read |
|----------|------|
| API endpoints | `AGENTS.md`, `agents/integrations/AGENTS.md`, `agents/security/AGENTS.md` |
| UI components | `agents/web/AGENTS.md`, `agents/design/AGENTS.md` |
| Database schema | `agents/data/AGENTS.md` |
| Tests | `agents/testing/AGENTS.md` |

See [`agents/README.md`](agents/README.md) for the full index.

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Your Changes

Follow the standards in the agent files:
- TypeScript strict mode
- Zod validation on APIs
- No PII in logs
- Tests for new logic

### 4. Test Your Changes

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Unit tests
npm run test

# Build check
npm run build
```

### 5. Submit a Pull Request

- Fill out the PR template completely
- Reference any related issues
- Check the relevant agent skill files
- Complete the applicable checklists

## Code Style

### TypeScript
- Strict mode enabled
- No `any` without justification (add `// eslint-disable-next-line` with reason)
- Prefer `interface` over `type` for object shapes
- Use `const` assertions where applicable

### React/Next.js
- Server Components by default
- Client Components only for interactivity (`'use client'`)
- Use `next/image` for images
- Use `next/font` for fonts

### Formatting
- Prettier handles formatting (runs on commit via lint-staged)
- ESLint for code quality

## Testing

### Unit Tests
- Use Jest
- Mock external dependencies
- Test edge cases

### E2E Tests
- Use Playwright
- Test critical user flows
- Use `data-testid` for selectors

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add card comparison feature
fix: correct reward calculation for rotating categories
docs: update API documentation
refactor: extract merchant matching to shared utility
test: add unit tests for fuzzy matcher
chore: update dependencies
```

## Architecture Decisions

Significant changes should be documented as ADRs (Architecture Decision Records):

1. Copy `docs/adr/ADR-000-template.md`
2. Fill in the sections
3. Submit with your PR

## Questions?

- Check existing issues and discussions
- Open a new issue for bugs or feature requests
- Tag maintainers for urgent questions

## License

By contributing, you agree that your contributions will be licensed under the project's license.
