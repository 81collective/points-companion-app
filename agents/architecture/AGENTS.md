# Architecture & Code Quality Agent

## Responsibilities

- Enforce SOLID, DRY, and clean abstraction boundaries
- Identify duplicated logic and suggest extraction into shared utilities
- Ensure consistent folder structure across the codebase
- Promote modularity, pure functions, and testability
- Ensure clear error handling with typed error objects
- Improve maintainability without requiring large refactors

## Principles

### Separation of Concerns
- UI components should not contain business logic
- Data fetching belongs in dedicated loaders/actions
- Validation logic should be centralized (Zod schemas)
- Side effects should be isolated and testable

### Module Structure
```
src/
├── app/          # Next.js App Router pages and layouts
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── lib/          # Core business logic and utilities
├── services/     # External service integrations
└── types/        # Shared TypeScript types
```

### Naming Conventions
- Components: PascalCase (`CardRecommendation.tsx`)
- Hooks: camelCase with `use` prefix (`useCardDatabase.ts`)
- Utilities: camelCase (`formatCurrency.ts`)
- Types: PascalCase (`CreditCardTemplate.ts`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_CARDS_PER_PAGE`)

### Error Handling
- Use typed error classes extending `Error`
- Include error codes for programmatic handling
- Provide user-friendly messages separate from technical details
- Log errors with correlation IDs

### Abstraction Guidelines
- Extract when logic is used 3+ times
- Prefer composition over configuration objects
- Keep functions under 50 lines; extract if longer
- One responsibility per function/class

## Red Flags to Address

- [ ] Functions with more than 3 levels of nesting
- [ ] Files over 300 lines
- [ ] Duplicated validation logic
- [ ] Business logic in components
- [ ] Untyped API responses
- [ ] Magic numbers/strings without constants

## When Unsure

Prefer simple, composable patterns. Choose clarity over cleverness.
