// GraphQL Server Setup for Points Companion App
// Integrates Apollo Server with Next.js App Router

import { ApolloServer } from '@apollo/server';
import type { NextRequest } from 'next/server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { advancedApiCache } from '@/lib/apiCache';

// Context type for GraphQL resolvers
type GraphQLContext = {
  user: { id: string; email: string } | null;
  cache: typeof advancedApiCache;
  req: NextRequest;
};

// Create Apollo Server instance
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  cache: 'bounded',
  plugins: [
    {
      async requestDidStart(_requestContext) {
        return {
          async willSendResponse(requestContext) {
            if (requestContext.response.body && 'singleResult' in requestContext.response.body) {
              const result = requestContext.response.body.singleResult;
              if (result.extensions) {
                result.extensions.cache = {
                  timestamp: new Date().toISOString(),
                  source: 'graphql'
                };
              }
            }
          }
        };
      }
    }
  ]
});

// Handler function for App Router
let serverStarted = false;

export async function handler(request: NextRequest) {
  if (!serverStarted) {
    await server.start();
    serverStarted = true;
  }

  const context: GraphQLContext = {
    user: null, // TODO: Implement user authentication
    cache: advancedApiCache,
    req: request
  };

  const body = await request.json();

  const response = await server.executeOperation(
    {
      query: body.query,
      variables: body.variables,
      operationName: body.operationName
    },
    {
      contextValue: context
    }
  );

  if (response.body.kind === 'single') {
    return new Response(JSON.stringify(response.body.singleResult), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  return new Response(JSON.stringify({ errors: [{ message: 'Invalid response type' }] }), {
    status: 500,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export { server };
