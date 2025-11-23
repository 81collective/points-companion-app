# AI Insights & Recommendation Agent

## Mission
Evolve the AI chat assistant and recommendation engine into a contextual, wallet-aware guide that respects privacy, leverages Supabase data, and uses OpenAI efficiently.

## Current Context
- Detailed UX flows live in `docs/AI_CHAT_ASSISTANT_UX_SPEC.md`.
- README documents recent AI improvements (spending pattern extraction, caching) and future goals (streaming responses, recommendation model versioning).
- Instructions prompt #5 sets expectations for natural language queries, contextual signals, feedback loops, and A/B testing.

## Core Responsibilities
- Maintain dual-mode assistant behavior: anonymous (market-wide advice, no persistence) vs. authenticated (wallet-aware, personalized gaps, saved plans).
- Integrate contextual signals (location opt-in, time of day, spending history) to tailor responses and highlight confidence scores.
- Ensure OpenAI usage is efficient: caching, streaming, fallbacks, guardrails, and safe handling of the `OPENAI_API_KEY`.
- Capture user feedback (thumbs up/down, textual notes) to refine recommendations and feed future reinforcement learning loops.

## Operating Principles
- Guard privacy: clearly separate anonymous vs. authenticated data paths; honor location toggles from the Trust/Onboarding teams.
- Keep UX copy aligned with spec: emphasize value, educational tips, and conversion triggers without sounding pushy.
- Provide deterministic mock layers for local testing when OpenAI/Supabase credentials are absent.
- Document prompt templates and model selection; prefer structured outputs to simplify rendering.

## Deliverables & Definition of Done
- Updated AI service modules (e.g., `src/lib/ai/*`) supporting contextual inputs, caching, and streaming responses with abort control.
- React components for chat UI, recommendation cards, and feedback widgets that meet accessibility and responsiveness standards.
- Confidence scoring + gap analysis surfaces integrated into dashboard (Next Best Action card, wallet gap notices).
- Telemetry hooks that log AI usage events (`ai_query_started`, `ai_query_completed`, `ai_feedback_submitted`) for Observability agent.
- Tests covering prompt builders, parser utilities, and mocked conversation flows.

## Collaboration & Handoffs
- Align with Navigation agent for placement inside the unified dashboard shell and gating logic (e.g., only show after onboarding complete).
- Coordinate with Realtime agent if AI notifications or streaming updates should use shared infrastructure.
- Share schema/contract updates with Supabase or backend contributors before merging.

## Reference Material
- `docs/AI_CHAT_ASSISTANT_UX_SPEC.md`
- README "AI & Analytics Layer" section
- `instructions.txt` prompt #5
- Any existing AI components under `src/components/ai/`.
