# Testing & QA Agent

## Responsibilities

- Add unit tests for new business logic
- Add E2E tests for critical user flows
- Implement integration tests for API endpoints
- Enforce deterministic, reliable tests
- Add accessibility checks to test suite

## Test Pyramid

```
        ╱╲
       ╱  ╲      E2E Tests (few, slow, high confidence)
      ╱────╲
     ╱      ╲    Integration Tests (moderate, test boundaries)
    ╱────────╲
   ╱          ╲  Unit Tests (many, fast, focused)
  ╱────────────╲
```

## Testing Standards

### Unit Tests
- One assertion per test (prefer)
- Descriptive test names: `should_returnError_when_invalidInput`
- Mock external dependencies
- Test edge cases and error paths

```typescript
describe('fuzzyMatcher', () => {
  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('should return string length for empty comparison', () => {
      expect(levenshteinDistance('hello', '')).toBe(5);
    });

    it('should handle case differences', () => {
      expect(levenshteinDistance('Hello', 'hello')).toBe(1);
    });
  });
});
```

### Integration Tests
- Test API endpoints with real database (test instance)
- Verify request/response contracts
- Test authentication and authorization

```typescript
describe('GET /api/cards/recommendations', () => {
  it('should return recommendations for valid business', async () => {
    const response = await request(app)
      .get('/api/cards/recommendations')
      .query({ businessName: 'Marriott Hotel' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.recommendations).toHaveLength(3);
  });

  it('should return 400 for missing parameters', async () => {
    const response = await request(app)
      .get('/api/cards/recommendations');
    
    expect(response.status).toBe(400);
  });
});
```

### E2E Tests (Playwright)
- Test critical user journeys
- Run in CI before deploy
- Use stable selectors (`data-testid`)

```typescript
test('user can add card to wallet', async ({ page }) => {
  await page.goto('/dashboard/cards');
  await page.click('[data-testid="add-card-button"]');
  await page.selectOption('[data-testid="card-select"]', 'chase_sapphire_preferred');
  await page.click('[data-testid="confirm-add"]');
  
  await expect(page.locator('[data-testid="card-list"]'))
    .toContainText('Chase Sapphire Preferred');
});
```

## Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('card recommendation page has no a11y violations', async () => {
  const { container } = render(<RecommendationPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Test Data

### Fixtures
- Keep test data in `__fixtures__` directories
- Use factories for complex objects
- Never use production data

```typescript
// __fixtures__/cards.ts
export const mockCard = {
  id: 'test-card-1',
  name: 'Test Sapphire Preferred',
  issuer: 'chase',
  annualFee: 95,
  rewards: [{ category: 'travel', multiplier: 2 }],
};

export const createMockCard = (overrides = {}) => ({
  ...mockCard,
  id: `test-card-${Date.now()}`,
  ...overrides,
});
```

## Coverage Requirements

| Area | Minimum Coverage |
|------|------------------|
| Business logic (`lib/`) | 80% |
| API routes | 70% |
| Components | 60% |
| Utilities | 90% |

## CI Test Matrix

```yaml
tests:
  - unit: npm run test:unit
  - integration: npm run test:integration
  - e2e: npx playwright test
  - a11y: npm run test:a11y
  - lint: npm run lint
  - types: npm run typecheck
```

## When Unsure

Test the critical path first. A flaky test is worse than no test.
