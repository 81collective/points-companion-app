# Agent Handoff Documentation Guide

## Purpose

This guide establishes standards for documenting work in a way that enables efficient handoffs between agents (AI or human). Good handoff documentation reduces context-gathering time and prevents repeated mistakes.

---

## Core Principles

### 1. **Document Intent, Not Just Implementation**
Explain *why* decisions were made, not just *what* was done.

```markdown
❌ Bad: "Added retry logic to API calls"
✅ Good: "Added retry logic to API calls because Stripe webhooks occasionally 
   fail with 502 during high traffic. Retries 3 times with exponential backoff."
```

### 2. **Leave Breadcrumbs**
Future agents should be able to trace your reasoning.

### 3. **Assume Fresh Context**
The next agent won't have your conversation history. Document as if explaining to someone new.

---

## What to Document

### During Development

| Artifact | When to Create | Location |
|----------|---------------|----------|
| ADR (Architecture Decision Record) | Major technical decisions | `docs/adr/ADR-XXX-*.md` |
| Code Comments | Complex logic, workarounds, non-obvious behavior | Inline in code |
| JSDoc | Public functions, types, components | Inline in code |
| README Updates | New features, changed setup | `README.md` |
| Agent File Updates | New patterns, rules discovered | `agents/*/AGENTS.md` |

### After Completing a Task

| Artifact | Purpose | Location |
|----------|---------|----------|
| Commit Message | Summarize what changed | Git history |
| PR Description | Explain context and decisions | GitHub PR |
| Changelog Entry | User-facing summary | `CHANGELOG.md` |

---

## Commit Message Format

Use Conventional Commits with context:

```
<type>(<scope>): <short description>

<body - explain WHY>

<footer - references>
```

### Examples

```
feat(cards): Add fuzzy merchant matching for recommendations

Previous exact-match approach missed merchants with typos or abbreviations
(e.g., "Starbucks Coffee" vs "STARBUCKS #1234"). Implemented Levenshtein 
distance with 0.7 similarity threshold.

Tested against 500 real transaction descriptions with 94% accuracy.

Refs: #123
```

```
fix(api): Handle null businessName in recommendations endpoint

Users reported 500 errors when location API returned null business names.
Added null coalescing and fallback to MCC category lookup.

Fixes: #456
```

---

## PR Description Template

```markdown
## Context
What problem does this solve? Why now?

## Changes
- Bullet list of what changed
- Include file paths for major changes

## Decisions Made
| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Used TOML | Human-readable, git-friendly | JSON (verbose), YAML (error-prone) |

## Testing
How was this tested? What edge cases were considered?

## Rollback Plan
If this breaks, how do we revert?

## Follow-up Tasks
- [ ] Task 1
- [ ] Task 2
```

---

## Code Comments

### When to Comment

1. **Non-obvious logic**: "Why" comments
2. **Workarounds**: Link to issue or explain constraint
3. **Magic numbers**: Explain significance
4. **Complex algorithms**: High-level explanation
5. **Assumptions**: Document what you assume to be true

### Comment Patterns

```typescript
// HACK: Stripe returns empty string instead of null for missing fields
// See: https://github.com/stripe/stripe-node/issues/1234
const customerId = response.customer || null;

// NOTE: MCC 5812 covers restaurants but excludes fast food (5814)
// We intentionally map both to 'dining' for simplicity
const category = getMCCCategory(mcc);

// TODO(#789): Replace with proper caching once Redis is available
const cards = loadAllCards(); // Loads from disk on every request

// IMPORTANT: Order matters here - hotel brands before generic 'hotel'
// to ensure brand-specific cards get priority
const brandPatterns = [
  'marriott', 'hilton', 'hyatt', // Specific brands first
  'hotel', 'inn', 'suites',      // Generic terms last
];
```

---

## ADR (Architecture Decision Record)

Create an ADR when:
- Choosing between multiple valid approaches
- Making irreversible decisions
- Establishing patterns others will follow

### Template: `docs/adr/ADR-XXX-title.md`

```markdown
# ADR-XXX: [Title]

## Status
[Draft | Proposed | Accepted | Deprecated | Superseded by ADR-YYY]

## Context
What situation prompted this decision?

## Decision
What did we decide?

## Consequences
### Positive
- Benefit 1

### Negative
- Drawback 1

### Neutral
- Side effect

## Alternatives Considered
Why weren't other options chosen?
```

---

## Agent File Updates

When you discover new patterns or rules, update the relevant agent file:

```markdown
# In agents/security/AGENTS.md

## Lessons Learned

### 2025-11-24: Null Business Names
When processing location data, always handle null business names:
```typescript
const name = business?.name?.toLowerCase() ?? 'unknown';
```
The Google Places API occasionally returns null for business names.
```

---

## Session Handoff Notes

At the end of a work session, create a handoff note:

### Template

```markdown
## Session Summary - [Date]

### Completed
- [x] Task 1 - brief description
- [x] Task 2 - brief description

### In Progress
- [ ] Task 3 - what's done, what remains
  - Current state: [description]
  - Next step: [specific action]
  - Blocker (if any): [description]

### Not Started
- [ ] Task 4 - context for why not started

### Key Decisions Made
| Decision | Rationale |
|----------|-----------|
| Decision 1 | Why |

### Files Modified
- `src/lib/matching/fuzzyMatcher.ts` - New file, fuzzy matching algorithms
- `src/app/api/cards/recommendations/route.ts` - Integrated fuzzy matching

### Known Issues
- Issue 1: description and workaround
- Issue 2: needs investigation

### Context for Next Agent
- Important background info
- Gotchas to watch out for
- Suggested approach for remaining work
```

---

## Project State Documentation

Maintain these living documents:

### `docs/CURRENT_STATE.md`

```markdown
# Current Project State

Last updated: [Date]

## Active Work
What's currently being worked on?

## Recent Changes
Last 5-10 significant changes with dates.

## Known Issues
Current bugs or technical debt.

## Upcoming Priorities
What should be worked on next?

## Architecture Overview
High-level system diagram (Mermaid).

## Key Contacts
Who to ask about specific areas.
```

### `CHANGELOG.md`

Keep a running changelog with user-facing changes:

```markdown
# Changelog

## [Unreleased]

### Added
- Fuzzy merchant matching for card recommendations

### Changed
- Improved hotel brand detection accuracy

### Fixed
- Null business name handling in recommendations API

## [1.2.0] - 2025-11-20

### Added
- TOML-based card database with 110+ US rewards cards
```

---

## Quick Reference: Documentation Checklist

Before handing off, verify:

- [ ] Commit messages explain "why"
- [ ] Complex code has explanatory comments
- [ ] New patterns documented in agent files
- [ ] ADR created for major decisions
- [ ] PR description complete
- [ ] README updated if setup changed
- [ ] CHANGELOG updated for user-facing changes
- [ ] Known issues documented
- [ ] Next steps clearly stated

---

## Guiding Principle

**Write documentation for the agent who comes after you with zero context.**

The 5 minutes you spend documenting will save hours of investigation later.
