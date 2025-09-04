// GraphQL API Route for Points Companion App
// Handles all GraphQL queries and mutations

import { handler } from '@/lib/graphql/server';

// App Router handlers: accept only Request (no context needed here)
export async function GET(request: Request) {
	return handler(request);
}

export async function POST(request: Request) {
	return handler(request);
}
