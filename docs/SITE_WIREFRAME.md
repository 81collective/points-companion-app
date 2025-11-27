# PointAdvisor Site Wireframe & Navigation Map

## Site Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC PAGES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /                     Homepage (Chat-First Hero)               │
│  ├── #how-it-works     Anchor: 3-step process                   │
│  ├── #features         Anchor: Feature grid                     │
│  └── #security         Anchor: Trust & privacy section          │
│                                                                  │
│  /auth                 Login / Signup / Forgot Password         │
│  └── /auth/reset-password  Password reset flow                  │
│                                                                  │
│  /offline              PWA offline fallback page                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATED DASHBOARD                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /dashboard            Main dashboard (Overview + Cards)        │
│  │                                                              │
│  ├── /dashboard/cards      My Cards - Add/Edit/Delete cards     │
│  │                                                              │
│  ├── /dashboard/analytics  Spending analytics & charts          │
│  │                                                              │
│  ├── /dashboard/insights   AI-powered insights & tips           │
│  │                                                              │
│  ├── /dashboard/profile    Settings & preferences               │
│  │                                                              │
│  ├── /dashboard/ai-assistant  Full AI chat experience           │
│  │                                                              │
│  └── /dashboard/transactions  Transaction history & import      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      LEGACY/TEST PAGES                           │
├─────────────────────────────────────────────────────────────────┤
│  /cards                Legacy cards page (redirects to dash)    │
│  /analytics            Legacy analytics (redirects to dash)     │
│  /insights             Legacy insights (redirects to dash)      │
│  /transactions         Legacy transactions                      │
│  /loyalty              Loyalty programs (feature flag)          │
│  /gamification         Gamification features (experimental)     │
│  /security             Security info page                       │
│  /test                 Development test page                    │
└─────────────────────────────────────────────────────────────────┘
```

## Navigation Components

### 1. Homepage Navigation (Public)
```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] PointAdvisor    How it works | Features | Security      │
│                                              [Sign in] [Get started]
└────────────────────────────────────────────────────────────────┘
```

### 2. Dashboard Shell (Authenticated)
```
┌────────────────────────────────────────────────────────────────┐
│ [≡] [Logo] PointAdvisor                           [User Menu ▼]│
├────────────┬───────────────────────────────────────────────────┤
│            │                                                   │
│ Dashboard  │                                                   │
│ My Cards   │              Page Content                         │
│ Analytics  │                                                   │
│ Insights   │                                                   │
│ Profile    │                                                   │
│            │                                                   │
│            │                                                   │
│ v1.0       │                                                   │
└────────────┴───────────────────────────────────────────────────┘
```

### 3. User Dropdown Menu
```
┌─────────────────────┐
│ user@email.com      │
│ Free Plan           │
├─────────────────────┤
│ ⚙ Settings          │
│ 💳 My Cards         │
│ 📊 Analytics        │
├─────────────────────┤
│ 🚪 Sign out         │
└─────────────────────┘
```

## Internal Links Map

### From Homepage (`/`)
| Element              | Destination           | Type        |
|---------------------|-----------------------|-------------|
| Logo                | `/`                   | Link        |
| "How it works"      | `#how-it-works`       | Anchor      |
| "Features"          | `#features`           | Anchor      |
| "Security"          | `#security`           | Anchor      |
| "Sign in"           | `/auth`               | Button      |
| "Get started"       | `/auth`               | Button      |
| CTA Buttons         | `/auth`               | Button      |

### From Auth (`/auth`)
| Element              | Destination           | Type        |
|---------------------|-----------------------|-------------|
| Logo                | `/`                   | Link        |
| "Back to home"      | `/`                   | Link        |
| On login success    | `/dashboard`          | Redirect    |

### From Dashboard (`/dashboard/*`)
| Element              | Destination           | Type        |
|---------------------|-----------------------|-------------|
| Logo                | `/dashboard`          | Link        |
| Dashboard (nav)     | `/dashboard`          | Link        |
| My Cards (nav)      | `/dashboard/cards`    | Link        |
| Analytics (nav)     | `/dashboard/analytics`| Link        |
| Insights (nav)      | `/dashboard/insights` | Link        |
| Profile (nav)       | `/dashboard/profile`  | Link        |
| Settings (menu)     | `/dashboard/profile`  | Link        |
| My Cards (menu)     | `/dashboard/cards`    | Link        |
| Analytics (menu)    | `/dashboard/analytics`| Link        |
| Sign out            | `/` (after logout)    | Action      |

## Design System Tokens

### Colors (Violet/Lilac Brand)
```css
--brand-50:  #f5f0ff   /* Lightest tint */
--brand-100: #ede5ff   /* Light backgrounds */
--brand-200: #d4c4ff   /* Borders, subtle accents */
--brand-300: #b89dff   /* Hover states */
--brand-400: #9d7aff   /* Secondary actions */
--brand-500: #8d63ff   /* Primary brand color */
--brand-600: #703ff1   /* Primary buttons */
--brand-700: #5c2fd1   /* Darker variant */
```

### Typography
- Font Family: `Geist, Arial, sans-serif`
- Display: `font-display` class for headings
- Body: Default weight 400

### Component Patterns
- Cards: `rounded-2xl border border-neutral-100 bg-white shadow-sm`
- Buttons Primary: `rounded-full bg-gradient-to-r from-brand-600 to-brand-500`
- Buttons Secondary: `rounded-full border border-neutral-200 bg-white`
- Inputs: `rounded-xl border border-neutral-200`

## Page Responsibilities

| Page                    | Purpose                                    |
|------------------------|--------------------------------------------|
| `/`                    | Marketing, AI chat demo, conversion        |
| `/auth`                | Authentication (login/signup/reset)        |
| `/dashboard`           | Overview metrics, quick actions            |
| `/dashboard/cards`     | CRUD for user's credit cards              |
| `/dashboard/analytics` | Spending charts, trends, insights          |
| `/dashboard/insights`  | AI-generated recommendations              |
| `/dashboard/profile`   | User settings, preferences, security       |

