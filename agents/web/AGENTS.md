# Web UI Agent (Next.js)

## Responsibilities

- Use React Server Components by default
- Implement Islands pattern for interactivity
- Build mobile-first responsive layouts
- Apply design tokens consistently
- Ensure WCAG AA accessibility compliance
- Use skeleton loaders for async data
- Preconnect and preload critical assets

## Component Architecture

### Server Components (Default)
```tsx
// ✅ Server Component - no 'use client' directive
async function CardList({ userId }: { userId: string }) {
  const cards = await getCardsForUser(userId);
  
  return (
    <div className="grid gap-4">
      {cards.map(card => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
}
```

### Client Components (Islands)
```tsx
'use client';

// ✅ Client Component - only when interactivity needed
function CardInteractions({ cardId }: { cardId: string }) {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <button 
      onClick={() => setIsLiked(!isLiked)}
      aria-pressed={isLiked}
    >
      {isLiked ? '❤️' : '🤍'}
    </button>
  );
}
```

## Design Tokens

```css
/* Use CSS custom properties from design system */
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-success: #22c55e;
  --color-error: #ef4444;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  
  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  
  /* Radii */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

## Responsive Design

```tsx
// Mobile-first breakpoints
<div className="
  grid
  grid-cols-1        /* Mobile: 1 column */
  md:grid-cols-2     /* Tablet: 2 columns */
  lg:grid-cols-3     /* Desktop: 3 columns */
  gap-4
">
```

### Breakpoints
| Name | Width | Use Case |
|------|-------|----------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

## Loading States

```tsx
// Skeleton loader for cards
function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded-lg" />
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

// Use with Suspense
<Suspense fallback={<CardSkeleton />}>
  <CardDetails cardId={cardId} />
</Suspense>
```

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Visible focus indicators (`:focus-visible`)
- [ ] Form inputs have associated labels
- [ ] Images have descriptive alt text
- [ ] Color contrast meets AA (4.5:1 text, 3:1 UI)
- [ ] Reduced motion respected (`prefers-reduced-motion`)
- [ ] ARIA labels for icon-only buttons

```tsx
// ✅ Accessible button
<button
  aria-label="Add Chase Sapphire Preferred to wallet"
  className="focus-visible:ring-2 focus-visible:ring-primary"
>
  <PlusIcon aria-hidden="true" />
</button>
```

## Performance Optimizations

### Images
```tsx
import Image from 'next/image';

<Image
  src="/cards/chase-sapphire.png"
  alt="Chase Sapphire Preferred card"
  width={300}
  height={190}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurHash}
/>
```

### Fonts
```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

### Preloading
```tsx
// In layout.tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preload" href="/critical.css" as="style" />
<link rel="preload" href="/hero-image.webp" as="image" />
```

## Error States

```tsx
function CardError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div role="alert" className="p-4 bg-red-50 rounded-lg">
      <h3 className="font-semibold text-red-800">
        Unable to load cards
      </h3>
      <p className="text-red-600 text-sm mt-1">
        {error.message}
      </p>
      <button
        onClick={retry}
        className="mt-2 text-red-700 underline"
      >
        Try again
      </button>
    </div>
  );
}
```

## When Unsure

Server-render by default. Add client interactivity only where needed. Test on slow connections.
