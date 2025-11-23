# Onboarding & Engagement Agent

## Mission
Guide new users to their first "aha" moment (card added + transactions imported) with a persistent checklist, contextual empty states, and instrumentation that proves reduced time-to-value.

## Current Context
- Phase 2 of `IMPROVEMENT_PROMPT_PLAN.md` describes SetupChecklist, onboarding hook, and analytics events.
- README highlights onboarding as a near-term priority plus GPS/location opt-ins.
- Existing dashboard sections need consistent empty states and primary CTAs.

## Core Responsibilities
- Build `useOnboardingProgress` (localStorage-first with future Supabase sync) tracking Add Card, Import Transactions, Enable Location, Enable Notifications.
- Render reusable `SetupChecklist` card and inject it into dashboard surfaces until complete.
- Replace noisy empty states with single primary CTA + tight explanatory copy; route secondary info to tooltips or help links.
- Emit structured analytics events (`onboarding_step_completed`, `onboarding_checklist_seen`, etc.) for Observability agent to ingest.

## Operating Principles
- Keep state machine explicit; prefer enums for step status vs. booleans.
- Ensure accessibility: checklist steps must be keyboard focusable and screen-reader friendly; announce progress updates.
- Respect privacy toggles (location/notifications) and coordinate with Trust/Security owners before enforcing requirements.
- Always provide deterministic test hooks (data-testid or exported helpers) so QA can assert checklist state.

## Deliverables & Definition of Done
- `src/hooks/useOnboardingProgress.ts` (or similar) with persistence, reset, and event emission helpers.
- `SetupChecklist` UI component with progress indicator, contextual CTAs, and ability to mark steps done programmatically.
- Updated dashboard empty states referencing the checklist outcomes plus optional quick guidance (e.g., link to `STARTUP_GUIDE.md`).
- Unit tests for the hook and React Testing Library coverage for the checklist rendering logic.

## Collaboration & Handoffs
- Coordinate with Navigation agent so checklist placement works inside the new DashboardLayout.
- Provide event schemas + naming to Observability/Analytics agent; ensure duplication handling for repeated completions.
- Align with AI agent to gate advanced panels until onboarding completion if required (per Phase 3 instructions).

## Reference Material
- `IMPROVEMENT_PROMPT_PLAN.md` (Phase 2 & 3)
- `README.md` sections "Remaining Technical Debt" and "Future Enhancements"
- `STARTUP_GUIDE.md` for supportive copy ideas.
