# Product & Codebase Improvement Prompt Plan

A sequenced, actionable set of implementation prompts covering the proposed simplifications and world‑class UX / DX upgrades. Execute strictly in order unless blocking dependencies require reordering. Each section includes: Objective, Success Criteria, Key Changes, Implementation Steps, Risks/Mitigations, Acceptance Checklist, and a Reusable Prompt Template.

---
## Phase 0 – Baseline Confirmation (Pre‑flight)
**Objective**: Ensure current main branch is healthy before transformations.
**Steps**:
1. Run build, lint, tests.
2. Snapshot bundle sizes + lighthouse baseline.
3. Capture DB schema (for migration diffs).
**Acceptance**: All green; baseline metrics stored in `/docs/baseline/`.
**Prompt Template**:
> Validate repo health (build/lint/test), record metrics to /docs/baseline/YYYYMMDD, no functional edits.

---
## 1. Information Architecture & Navigation
**Objective**: Reduce route fragmentation; provide clearer nav mental model.
**Success Criteria**:
- Core dashboard accessible in ≤2 clicks to any primary feature.
- Redundant CTAs removed (≤1 primary action per context block).
**Key Changes**:
- Consolidate multiple dashboard subpages into tabbed segments inside one `/dashboard` root (Overview, Cards, Bonuses, Insights, Analytics consolidated where feasible).
- Add persistent left nav + Command Palette (Cmd/Ctrl+K) skeleton.
- Remove duplicate “View analytics/insights” buttons if same destination is already visible in nav.
**Implementation Steps**:
1. Create `DashboardTabs` component with ARIA roles.
2. Move page bodies into co-located feature modules (e.g. `src/features/dashboard/sections/*`).
3. Replace links in Overview KPI area with internal tab switches.
4. Add minimal command palette shell (searchable list of nav items, no full index yet).
5. Update route redirects (legacy subroutes → /dashboard#tab).
**Risks/Mitigations**:
- Broken deep links → temporary redirect map.
- SEO for public pages unaffected (dashboard is authed).
**Acceptance Checklist**:
- All legacy /dashboard/* routes 301/302 to root with tab preselected.
- Keyboard switching (Left/Right or Ctrl+Alt+Arrow) works.
**Prompt Template**:
> Refactor dashboard IA: introduce DashboardTabs (Overview|Cards|Bonuses|Insights|Analytics). Migrate existing page content into tab panels. Add redirect stubs from old routes. Provide command palette skeleton with static list. Keep tests passing.

---
## 2. Onboarding & First‑Run Experience
**Objective**: Guide new users through initial value path.
**Success Criteria**:
- “Time to first card added” reduced.
- Checklist visible until all core actions complete.
**Key Changes**:
- Reusable `SetupChecklist` component with steps: Add Card, Import Transactions, Enable Location, Enable Notifications.
- Contextual empty states with single primary CTA.
**Implementation Steps**:
1. Create `useOnboardingProgress` hook (localStorage + server fallback future).
2. Render checklist card at top until complete.
3. Replace multi‑CTA empty states.
4. Add instrumentation events `onboarding_step_completed`.
**Acceptance**:
- Checklist progress persists reload.
- All empty states now show ≤1 primary action.
**Prompt Template**:
> Implement SetupChecklist + useOnboardingProgress managing 4 steps. Replace existing dashboard empty states to show only primary CTA. Emit analytics events for each completion.

---
## 3. Core Dashboard Simplification & Progressive Disclosure
**Objective**: Focus above‑the‑fold content on essentials.
**Key Changes**:
- Merge SmartNotifications + NotificationCenter → `ActionInbox` (tabs: All, Spending, Bonus, Alert).
- Defer AI panel until baseline tasks complete.
- Show single “Next Best Action” recommendation card.
**Implementation Steps**:
1. Create ActionInbox component; migrate notification logic.
2. Replace SmartNotifications + NotificationCenter usage.
3. Derive Next Best Action via priority function (bonus expiring > unused category > add card).
4. Conditional render AI panel: require onboarding complete.
**Acceptance**:
- No duplicate notifications surfaces remain.
- AI panel hidden pre-onboarding finish.
**Prompt Template**:
> Introduce ActionInbox (unifying notifications). Replace existing notification components. Add nextBestAction selector. Gate AI panel behind onboarding completion flag.

---
## 4. Interaction & Feedback Clarity
**Objective**: Standardize click states & reduce ambiguity.
**Key Changes**:
- Unified interactive surface styles (hover, focus, active) applied via design tokens.
- Optimistic selection (e.g., business card) with skeleton recs.
- Single entrance animation pattern (fade+translate once).
**Implementation Steps**:
1. Add `interactive-surface` style class composition.
2. Wrap business select in optimistic state; show skeleton while fetching recommendations.
3. Deduplicate inconsistent card classes.
**Acceptance**:
- Lighthouse accessibility: focus indicators visible.
- Business selection feels instant (visual response <50ms).
**Prompt Template**:
> Add unified interactive surface styling token. Apply to business cards, KPI tiles, action items. Introduce optimistic recommendation skeleton on business select.

---
## 5. Realtime & Data Freshness Simplification
**Objective**: Reduce custom channel code duplication.
**Key Changes**:
- Expand existing `createRealtimeChannel` => `useRealtimeHub` supporting named streams.
- Add status badge (SUBSCRIBED, RETRYING, OFFLINE).
- Poll fallback if subscription fails (30s) with debounced log.
**Implementation Steps**:
1. Implement hub managing map of channels.
2. Replace per-component subscriptions with hub usage.
3. Add status indicator component.
4. Poll fallback service.
**Acceptance**:
- All realtime consumers use hub.
- Simulated failure triggers fallback poll.
**Prompt Template**:
> Build useRealtimeHub consolidating channel management + fallback polling. Refactor all components to use hub. Add RealtimeStatusBadge.

---
## 6. Performance & Perceived Speed
**Objective**: Faster meaningful paint & reduced CPU.
**Key Changes**:
- Code split heavy modules (AI, advanced analytics charts).
- Precompute monthly totals server-side (edge function or RPC) and hydrate.
- Replace spinners with shimmering skeletons.
**Implementation Steps**:
1. Add dynamic imports for heavy panels.
2. Create `getMonthlyKPI` RPC/edge function.
3. Add skeleton components for KPIs & recs.
4. Set React Query staleTime for stable datasets.
**Acceptance**:
- First contentful paint unaffected; interactive quickly.
- No spinner flashes for KPIs.
**Prompt Template**:
> Code-split AI + analytics. Implement getMonthlyKPI RPC + integrate in dashboard. Replace KPI spinners with skeletons.

---
## 7. Accessibility & Internationalization Foundations
**Objective**: Prepare for global & inclusive usage.
**Key Changes**:
- Ensure aria-labels for icon buttons.
- Live region for new actions/notifications.
- Central `format.ts` for date/number.
**Implementation Steps**:
1. Accessibility audit pass (axe / testing lib).
2. Add `useAnnouncer` hook.
3. Replace scattered toLocaleString with format helpers.
**Acceptance**:
- Axe scan: zero critical issues.
- Notifications announce in live region.
**Prompt Template**:
> Add useAnnouncer + format utilities. Replace direct formatting usage. Provide aria-labels for all icon-only buttons.

---
## 8. Design System Hardening
**Objective**: Consistency via tokens and primitives.
**Key Changes**:
- Create `tokens.css` (spacing, radius, colors, elevations).
- One Button + Badge + Card abstraction.
- Lint rule to forbid ad hoc gradient classes.
**Implementation Steps**:
1. Introduce tokens & CSS vars.
2. Refactor existing buttons to new component.
3. Build ESLint custom rule (or stylelint) for gradient whitelist.
4. Update docs MD for usage.
**Acceptance**:
- No legacy button variants left.
- CI fails on unauthorized gradient classes.
**Prompt Template**:
> Introduce design tokens + replace all buttons with new <Button>. Add lint rule restricting gradients. Update README design section.

---
## 9. Reliability, Error Handling & Offline Resilience
**Objective**: Graceful degradation.
**Key Changes**:
- Global error boundary with categorized fallback UI.
- Unified `retryableFetch` + offline queue for critical mutations.
- Enhanced service worker: stale-while-revalidate for shell & GET APIs.
**Implementation Steps**:
1. Add ErrorBoundary + useErrorEvents.
2. Build offline queue (IndexedDB) + flush strategy.
3. Extend SW for caching strategies.
4. Visual offline badge (already partial) with detail tooltip.
**Acceptance**:
- Simulated network loss still allows queueing interactions.
- Errors logged with correlation IDs.
**Prompt Template**:
> Add ErrorBoundary + offline mutation queue + SW caching (stale-while-revalidate). Provide offline badge update logic.

---
## 10. Observability & Product Analytics
**Objective**: Insight into user journeys & performance.
**Key Changes**:
- Lightweight event funnel (onboarding, card actions, AI usage).
- Client perf spans instrumentation.
- Server logging for edge functions.
**Implementation Steps**:
1. Extend interaction logger with schema for funnel events.
2. Add perf instrumentation wrapper (mark/measure API).
3. Export weekly metrics script.
**Acceptance**:
- Funnel dashboard queryable (SQL views or Supabase charts).
- Perf metrics appear in console overlay dev flag.
**Prompt Template**:
> Extend interaction logger for funnel events + add perf marks (dashboard_load_start/end). Produce SQL view for funnel metrics.

---
## 11. Codebase & Architectural Simplification
**Objective**: Reduce duplication & cognitive load.
**Key Changes**:
- Extract business selection shared hook.
- Module boundaries: cards/, transactions/, loyalty/ with index exports.
- Event bus for cross-component state.
**Implementation Steps**:
1. Implement `useBusinessSelection` hook consumed by both pages.
2. Create domain module folders & re-export patterns.
3. Introduce tiny event bus (Mitt or custom) + replace ad hoc prop drilling.
**Acceptance**:
- No duplicated business select handlers.
- Import paths simplified (domain index usage ≥80%).
**Prompt Template**:
> Refactor business selection with shared hook; add domain module indices; introduce lightweight event bus and replace direct prop drilling for notifications.

---
## 12. Trust, Security, Privacy Signaling
**Objective**: Reinforce user confidence.
**Key Changes**:
- Privacy & data usage modal first run.
- Location usage indicator & pause toggle.
- Rate-limited interaction logging.
**Implementation Steps**:
1. Add privacy modal gated by local flag.
2. Add location indicator component (on/out). Toggle suppresses geolocation usage.
3. Throttle interaction logger (per event type + minute window).
**Acceptance**:
- Location toggle stops geolocation requests.
- Repeated rapid clicks are collapsed in logs.
**Prompt Template**:
> Implement privacy modal + location indicator toggle + rate-limiting in interaction logger (max 10 same events / 60s per user).

---
## 13. Post‑Implementation Validation & Hardening
**Objective**: Ensure regression-free release.
**Steps**:
1. Update Lighthouse + bundle diff.
2. Run accessibility + perf budgets.
3. Author CHANGELOG summarizing phases.
**Acceptance**: All budgets met, docs updated.
**Prompt Template**:
> Produce final validation report: perf deltas, accessibility results, funnel metrics baseline, updated CHANGELOG.

---
## Execution Sequencing Overview
| Order | Phase | Dependency |
|-------|-------|------------|
| 0 | Baseline | None |
| 1 | IA/Nav | Baseline |
| 2 | Onboarding | 1 |
| 3 | Dashboard Simplification | 2 |
| 4 | Interaction Clarity | 3 |
| 5 | Realtime Simplification | 3 |
| 6 | Performance | 5 |
| 7 | Accessibility & i18n | 3 |
| 8 | Design System | 4 |
| 9 | Reliability & Offline | 5,6 |
| 10 | Observability | 5 |
| 11 | Architecture Simplification | 5,8 |
| 12 | Trust & Privacy | 9 |
| 13 | Validation | All prior |

---
## Usage Instructions
1. Copy the Prompt Template for the next phase.
2. Paste into task issue or agent request.
3. Execute; produce PR referencing phase number.
4. Update this file’s progress table (add status column if desired).

---
## Next Step Right Now
Start Phase 1: IA/Nav refactor using its template.

