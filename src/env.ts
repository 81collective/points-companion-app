import { z } from 'zod';

// Define required and optional environment variables
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  DATABASE_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success && process.env.NODE_ENV !== 'production') {
  console.error('[env] Invalid environment variables', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success ? parsed.data : ({} as z.infer<typeof schema>);
