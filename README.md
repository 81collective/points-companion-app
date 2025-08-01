# Points Companion App

## Overview

This project is a **Next.js** application that uses **Supabase** for authentication and data storage. It helps users manage credit cards and transactions and includes AI‑powered recommendations using OpenAI.

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd points-companion-app
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```

## Environment variables

Create an `.env.local` file and provide the following values:

- `OPENAI_API_KEY` – API key for OpenAI requests.
- `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – the anonymous key from Supabase.

These variables are required for both development and production builds.

## Development

Run the application locally with Turbopack:
```bash
npm run dev
```

## Production

Create an optimized build and start it:
```bash
npm run build
npm start
```

## Supabase migrations

The SQL migrations live in `supabase/migrations`. To apply them locally, install the [Supabase CLI](https://supabase.com/docs/guides/cli) and run:
```bash
supabase start      # starts local Supabase containers
supabase db reset   # applies migrations from the migrations folder
```

## Verification scripts

The `scripts/` directory contains Node scripts that verify the Supabase instance. They use Supabase credentials defined in each file. Run them with Node:
```bash
node scripts/check-db.mjs        # checks tables exist
node scripts/check-structure.mjs # prints credit_cards table columns
node scripts/verify-data.mjs     # lists sample rows
node scripts/verify-tables.mjs   # describes table structures
```
Customize the Supabase URL and key in each script (or refactor them to read from environment variables) so that they point to your project.
