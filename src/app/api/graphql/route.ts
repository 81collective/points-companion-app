// GraphQL API Route for Points Companion App
// Handles all GraphQL queries and mutations

import { handler } from '@/lib/graphql/server';

// Next.js App Router expects GET/POST with (request, context)
type RouteContext = { params: Record<string, string> };

export async function GET(request: Request, _context: RouteContext) {
	return handler(request);
}

export async function POST(request: Request, _context: RouteContext) {
	return handler(request);
}
