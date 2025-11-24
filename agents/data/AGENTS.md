# Database & Data Modeling Agent

## Responsibilities

- Create reliable, reversible schema migrations
- Use audit fields on all tables
- Implement soft deletes where appropriate
- Prevent relational integrity issues
- Optimize common queries with indexes
- Propose caching strategies for expensive queries

## Schema Standards

### Required Fields (All Tables)
```prisma
model Example {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // For soft delete support
  deletedAt DateTime?
}
```

### Naming Conventions
- Tables: PascalCase singular (`User`, `CreditCard`)
- Columns: camelCase (`firstName`, `createdAt`)
- Foreign keys: `{relation}Id` (`userId`, `cardId`)
- Indexes: `idx_{table}_{column}` or `idx_{table}_{column1}_{column2}`
- Unique constraints: `uniq_{table}_{column}`

### Relationships
```prisma
// One-to-many
model User {
  id    String @id
  cards Card[]
}

model Card {
  id     String @id
  userId String
  user   User   @relation(fields: [userId], references: [id])
  
  @@index([userId]) // Always index foreign keys
}
```

## Migration Guidelines

### Before Creating a Migration
- [ ] Document the reason for the change
- [ ] Consider backward compatibility
- [ ] Plan for rollback scenario
- [ ] Estimate data migration time for large tables

### Migration Checklist
- [ ] Add new columns as nullable or with defaults first
- [ ] Backfill data if needed
- [ ] Add constraints after backfill
- [ ] Test migration on production-like data volume

### Dangerous Operations
Require extra review:
- Dropping columns/tables
- Changing column types
- Adding NOT NULL to existing columns
- Large data migrations

## Query Optimization

### Indexing Strategy
```sql
-- Index columns used in:
-- 1. WHERE clauses
-- 2. JOIN conditions
-- 3. ORDER BY clauses
-- 4. Frequently filtered combinations

-- Composite index (order matters!)
CREATE INDEX idx_cards_user_created ON cards(user_id, created_at DESC);
```

### Query Patterns
```typescript
// ✅ Good: Select only needed fields
const cards = await prisma.card.findMany({
  where: { userId },
  select: { id: true, name: true, issuer: true },
});

// ❌ Bad: Fetching entire rows when not needed
const cards = await prisma.card.findMany({
  where: { userId },
});
```

### Pagination
```typescript
// Cursor-based (preferred for large datasets)
const cards = await prisma.card.findMany({
  take: 20,
  skip: 1, // Skip the cursor
  cursor: { id: lastCardId },
  orderBy: { createdAt: 'desc' },
});

// Offset-based (simpler, fine for small datasets)
const cards = await prisma.card.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' },
});
```

## Caching Strategy

| Query Type | Cache Duration | Invalidation |
|------------|----------------|--------------|
| Card database (TOML) | 1 hour | On deploy |
| User cards | 5 minutes | On mutation |
| Recommendations | 15 minutes | On card change |
| Static lookups | 24 hours | On deploy |

## When Unsure

Prefer explicit, verbose schemas over clever abstractions. Future maintainers will thank you.
