# Enterprise UX/UI & Design Agent

## Principles

Deliver **clarity**, **speed**, and **trust** across all devices. Build a consistent, accessible, and performant design system.

## Design System

### Tokens
Centralize all design decisions in a single source of truth:

```typescript
// src/design/tokens.ts
export const tokens = {
  colors: {
    primary: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' },
    neutral: { 50: '#fafafa', 500: '#737373', 900: '#171717' },
    success: { 500: '#22c55e' },
    error: { 500: '#ef4444' },
    warning: { 500: '#f59e0b' },
  },
  spacing: {
    0: '0', 1: '0.25rem', 2: '0.5rem', 4: '1rem', 8: '2rem', 16: '4rem',
  },
  radius: {
    none: '0', sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
  typography: {
    fontFamily: { sans: 'Inter, system-ui, sans-serif' },
    fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' },
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
  },
};
```

### Component Library

All components must include:
- All states: default, hover, focus, active, disabled, loading, error
- Proper ARIA attributes
- Keyboard interaction support
- Documentation with usage examples

| Component | States Required |
|-----------|----------------|
| Button | default, hover, focus, active, disabled, loading |
| Input | default, hover, focus, error, disabled |
| Card | default, hover, selected |
| Modal | open, closing animation |
| Toast | info, success, warning, error |
| Skeleton | animated loading state |

### Theme Support

```css
/* Light mode (default) */
:root {
  --bg-primary: #ffffff;
  --text-primary: #171717;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #171717;
    --text-primary: #fafafa;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Icons

- Use a consistent icon library (Heroicons, Lucide)
- Decorative icons: `aria-hidden="true"`
- Meaningful icons: `aria-label="Description"`
- Consistent sizing: 16px (sm), 20px (md), 24px (lg)

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- All interactive elements reachable via Tab
- Logical tab order (follows visual flow)
- Escape closes modals/dropdowns
- Arrow keys navigate within components

### Focus Indicators
```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default outline when using :focus-visible */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Color Contrast
- Text on background: minimum 4.5:1
- Large text (18px+): minimum 3:1
- UI components: minimum 3:1
- Use tools: WebAIM Contrast Checker

### Form Accessibility
```tsx
<label htmlFor="email" className="block text-sm font-medium">
  Email address
</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
  className="..."
/>
{error && (
  <p id="email-error" className="text-red-600 text-sm" role="alert">
    {error}
  </p>
)}
```

## Layout & Responsiveness

### Grid System
```tsx
// 12-column fluid grid
<div className="grid grid-cols-12 gap-4">
  <main className="col-span-12 lg:col-span-8">
    {/* Primary content */}
  </main>
  <aside className="col-span-12 lg:col-span-4">
    {/* Secondary content */}
  </aside>
</div>
```

### Content-First Breakpoints
Don't use arbitrary breakpoints. Let content dictate when layout should change.

### Preventing Layout Shift
```tsx
// ✅ Reserve space for images
<div className="aspect-video bg-gray-100">
  <Image src={...} fill />
</div>

// ✅ Skeleton with same dimensions
<div className="h-48 w-full animate-pulse bg-gray-200" />
```

## E‑commerce UX Patterns

### Product Display Page (PDP)
- [ ] Clear product image(s) with zoom
- [ ] Price prominently displayed
- [ ] Variant selectors (size, color)
- [ ] Stock availability indicator
- [ ] Shipping/returns info
- [ ] Add to cart CTA (prominent)
- [ ] Trust indicators (reviews, guarantees)

### Cart
- [ ] Inline editing (quantity, remove)
- [ ] Running total visible
- [ ] Shipping/tax estimates
- [ ] Promo code field
- [ ] Continue shopping link
- [ ] Proceed to checkout CTA

### Checkout
- [ ] Progress indicator
- [ ] Guest checkout option
- [ ] Address autocomplete
- [ ] Clear error recovery
- [ ] Order summary visible
- [ ] Trust badges (security, payment)

### Post-Purchase
- [ ] Order confirmation page
- [ ] Email receipt
- [ ] Order tracking link
- [ ] Relevant recommendations

## Performance & Telemetry

### Core Web Vitals Budgets
- LCP ≤ 2.5s
- CLS ≤ 0.1
- TBT ≤ 300ms

### Analytics Events (No PII)
```typescript
// Track UI interactions
posthog.capture('button_clicked', {
  component: 'add_to_cart',
  page: 'pdp',
  correlationId,
});
```

### Error Logging
```typescript
// Log UI errors with context
logger.error('Component render failed', {
  component: 'CardRecommendation',
  correlationId,
  error: error.message,
});
```

## Documentation Requirements

Each component needs:
- Props interface with descriptions
- All state variations
- Usage do's and don'ts
- Accessibility notes

## Guiding Principle

**Favor predictable, tested components over novelty. Accessibility and speed always win.**
