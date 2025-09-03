// GraphQL Server Setup for Points Companion App
// Integrates Apollo Server with Next.js API routes

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest } from 'next/server';
import type { ContextFunction } from '@apollo/server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { advancedApiCache } from '@/lib/apiCache';

// Create Apollo Server instance
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  cache: 'bounded', // Use Apollo's built-in cache
  plugins: [
    // Add custom plugin for cache integration
    {
      async requestDidStart(_requestContext) {
        return {
          async willSendResponse(requestContext) {
            // Add cache metadata to extensions
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

// Context function for authentication and caching
type HandlerReq = NextApiRequest | NextRequest | Request;
type GraphQLContext = {
  user: { id: string; email: string } | null;
  cache: typeof advancedApiCache;
  req: HandlerReq;
};

const createContext: ContextFunction<[HandlerReq, NextApiResponse | undefined], GraphQLContext> = async (
  req,
  _res
) => {
  // Extract user from session/token (implement based on your auth system)
  const user: GraphQLContext['user'] = null; // TODO: Implement user authentication

  return {
    user,
    cache: advancedApiCache,
    req
  };
};

// Export the handler for Next.js API routes
export const handler = startServerAndCreateNextHandler<HandlerReq, GraphQLContext>(server, {
  context: createContext
});

// Export for testing
export { server };
