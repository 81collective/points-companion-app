import { z } from 'zod'

// Define required and optional environment variables with validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1, 'Google Maps API key missing').optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
})

// Parse and cache environment
let cached: ReturnType<typeof loadEnv> | null = null

function loadEnv() {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[env] Environment validation issues:', parsed.error.flatten().fieldErrors)
    }
    // Provide sane defaults if parsing failed
    return {
      NODE_ENV: process.env.NODE_ENV || 'development',
      isProd: process.env.NODE_ENV === 'production',
      isDev: (process.env.NODE_ENV || 'development') === 'development',
      isTest: process.env.NODE_ENV === 'test',
    }
  }
  const data = parsed.data
  return {
    ...data,
    isProd: data.NODE_ENV === 'production',
    isDev: data.NODE_ENV === 'development',
    isTest: data.NODE_ENV === 'test',
  }
}

export function getEnv() {
  if (!cached) cached = loadEnv()
  return cached
}

export type AppEnv = ReturnType<typeof getEnv>
