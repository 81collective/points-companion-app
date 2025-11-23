# Examples directory status

The components in this folder were originally wired to Supabase for realtime streams, notifications, and AI demos. The production app no longer ships any Supabase client or hooks, so these samples are kept for reference only.

- Files such as `components-realtime/*` and `components-ai/SmartNotifications.tsx` now import a local stub from `examples/lib/supabaseStub.ts`. Swap that stub out for your actual realtime client when you are ready to re-enable the demos.
- If you need runnable demos, stub the Supabase calls (e.g., mock websocket events) or migrate the examples to the new Prisma/Neon layer just like the main app.
- Once a replacement backend is identified, feel free to delete this README and re-enable the examples under a new provider-specific namespace.
