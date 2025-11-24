# UX/UI Release Checklist

Use this checklist for all deploys affecting user interface or user experience.

## Accessibility

### Keyboard Navigation
- [ ] All interactive elements reachable via **Tab**
- [ ] **Tab order** follows logical visual flow
- [ ] **Visible focus indicators** on all focusable elements
- [ ] **Escape** closes modals, dropdowns, and overlays
- [ ] **Arrow keys** work for navigation components
- [ ] **Enter/Space** activates buttons and links

### Forms
- [ ] All inputs have associated **labels**
- [ ] **Inline error messages** clearly describe the problem
- [ ] **Error states** visually distinct (not color alone)
- [ ] **Required fields** indicated
- [ ] **Success states** confirmed to user
- [ ] **Autocomplete** attributes set appropriately

### Visual
- [ ] **Color contrast** meets AA (4.5:1 for text, 3:1 for UI)
- [ ] Information not conveyed by **color alone**
- [ ] **Focus indicators** visible (not just outline removal)
- [ ] **Text resizes** properly up to 200%
- [ ] **Reduced motion** respected (`prefers-reduced-motion`)

### Screen Readers
- [ ] **Alt text** on meaningful images
- [ ] Decorative images have `aria-hidden="true"`
- [ ] **ARIA labels** on icon-only buttons
- [ ] **Headings** follow logical hierarchy
- [ ] **Live regions** for dynamic content updates

## Responsiveness

### Layout
- [ ] Layout **stable at all breakpoints**:
  - Mobile (< 640px)
  - Tablet (768px)
  - Desktop (1024px+)
- [ ] No **horizontal scrolling** on any viewport
- [ ] **Touch targets** minimum 44x44px on mobile
- [ ] **Content readable** without zooming on mobile

### Loading States
- [ ] **Skeleton loaders** for async content
- [ ] **Placeholders** prevent layout shift
- [ ] **Loading indicators** for actions > 1 second
- [ ] **Progress indicators** for multi-step processes

## Components & States

### Interactive Elements
- [ ] All states present:
  - Default
  - Hover
  - Focus
  - Active/Pressed
  - Disabled
  - Loading
- [ ] **Disabled states** visually obvious
- [ ] **Loading states** prevent double-submission

### Empty & Error States
- [ ] **Empty states** provide helpful guidance
- [ ] **Error states** explain what went wrong
- [ ] **Recovery actions** clearly available
- [ ] **404 pages** help users navigate

### Feedback
- [ ] **Toast notifications** for async actions
- [ ] **Success confirmations** for important actions
- [ ] **Undo options** where appropriate

## E‑commerce Specific

### Product Display Page (PDP)
- [ ] **Price** prominently displayed
- [ ] **Variants** (size, color) selectable
- [ ] **Availability** clearly shown
- [ ] **Shipping info** visible
- [ ] **Add to cart** button prominent
- [ ] **Trust indicators** present (reviews, guarantees)
- [ ] **Images** zoomable/viewable

### Cart
- [ ] **Quantities** editable inline
- [ ] **Remove items** easily accessible
- [ ] **Running total** always visible
- [ ] **Shipping/tax estimates** shown
- [ ] **Promo code** field accessible
- [ ] **Continue shopping** option available

### Checkout
- [ ] **Progress indicator** shows current step
- [ ] **Guest checkout** available
- [ ] **Form validation** immediate and clear
- [ ] **Address autocomplete** functional
- [ ] **Order summary** visible throughout
- [ ] **Payment options** clearly displayed
- [ ] **Security badges** build trust

### Post-Purchase
- [ ] **Confirmation page** shows order details
- [ ] **Email confirmation** sent
- [ ] **Order tracking** link provided

## Performance & Analytics

### Core Web Vitals
- [ ] **LCP** (Largest Contentful Paint) ≤ 2.5s
- [ ] **CLS** (Cumulative Layout Shift) ≤ 0.1
- [ ] **TBT** (Total Blocking Time) ≤ 300ms
- [ ] **FCP** (First Contentful Paint) ≤ 1.8s

### Analytics
- [ ] **UI interaction events** tracked (no PII)
- [ ] **Error events** logged with correlation IDs
- [ ] **Conversion funnel** events in place

## Cross-Browser Testing

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)
- [ ] **Mobile Safari** (iOS)
- [ ] **Chrome Mobile** (Android)

---

## Pre-Deploy Verification

Before deploying, verify:

1. [ ] Visual regression tests passing
2. [ ] Accessibility tests passing (axe, Lighthouse)
3. [ ] Mobile testing completed
4. [ ] Performance budgets met
5. [ ] Error states tested

---

**Sign-off:**

| Role | Name | Date |
|------|------|------|
| Developer | | |
| Design Review | | |
| QA | | |
