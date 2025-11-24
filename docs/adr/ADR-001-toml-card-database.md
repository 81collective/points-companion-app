# ADR-001: TOML-Based Credit Card Database

## Status

Accepted

## Context

We needed a format for storing the credit card database that would be:
- Human-readable and easily editable by non-developers
- Version-controllable with meaningful diffs
- Easy to parse programmatically
- Flexible enough for complex nested data (rewards, categories, offers)
- Not requiring database infrastructure for relatively static data

The card database contains 110+ US rewards cards with detailed reward structures, current offers, and metadata.

## Decision

Use TOML (Tom's Obvious, Minimal Language) files organized by issuer in `config/cards/`:

```
config/cards/
├── chase.toml
├── amex.toml
├── capital-one.toml
├── citi.toml
├── other-issuers.toml
├── business.toml
├── airlines.toml
└── hotels.toml
```

Current offers are managed separately in `config/offers/current-offers.toml`.

## Consequences

### Positive

- Easy to edit without database access or migrations
- Git history provides full audit trail of card changes
- No database queries needed for card lookups (loaded at build time)
- Strongly typed with TypeScript interfaces
- Works well with caching (reload on deploy)

### Negative

- Requires rebuild/redeploy to update card data
- No query capability (must load all cards into memory)
- File size grows linearly with card count
- No relational queries (e.g., "find all cards with travel rewards > 3x")

### Neutral

- Caching layer added to prevent repeated file parsing
- Fuzzy matching added separately for merchant categorization

## Alternatives Considered

### Option A: JSON Files
- Pros: Native JS parsing, widely understood
- Cons: Less readable for complex nested data, no comments, verbose syntax

### Option B: YAML Files
- Pros: Human-readable, supports comments
- Cons: Indentation-sensitive (error-prone), security concerns with arbitrary code execution

### Option C: Database (Postgres)
- Pros: Full query capability, real-time updates, relational data
- Cons: Overkill for ~100 relatively static records, requires migrations for schema changes

### Option D: Headless CMS
- Pros: Non-technical editing, preview environments
- Cons: Additional service dependency, cost, sync complexity

## References

- [TOML Specification](https://toml.io/)
- `src/lib/cards/tomlCardLoader.ts` - Loader implementation
- `src/lib/cards/tomlBridge.ts` - Type conversion

---

## Metadata

- **Date:** 2025-11-24
- **Author:** Development Team
- **Reviewers:** —
