import React from 'react';
import { customRender, screen, waitFor, setupTests } from '../testUtils';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { ApolloLink, Observable } from '@apollo/client/core';
import { print } from 'graphql';
import {
  useBusinessesQuery,
  useBusinessDetailsQuery,
  useNearbyBusinessesQuery,
  BUSINESSES_QUERY,
  BUSINESS_DETAILS_QUERY,
  NEARBY_BUSINESSES_QUERY,
} from '../../lib/graphql/useGraphQL';

// Setup mocks before tests
beforeAll(() => {
  setupTests();
});

// Helper to create an ApolloClient with a simple mock link
type Mock = { request: { query: any; variables?: any; operationName?: string }; result?: { data?: any; errors?: any[] }; error?: Error };
const stableStringify = (value: any): string => {
  const seen = new WeakSet();
  const helper = (val: any): any => {
    if (val === null || typeof val !== 'object') return val;
    if (seen.has(val)) return undefined;
    seen.add(val);
    if (Array.isArray(val)) return val.map(helper);
    const keys = Object.keys(val).sort();
    const out: Record<string, any> = {};
    for (const k of keys) out[k] = helper(val[k]);
    return out;
  };
  return JSON.stringify(helper(value));
};
const createClientWithMocks = (mocks: Mock[]) => {
  const norm = (s?: string) => (s ? s.replace(/__typename\b/g, '').replace(/\s+/g, ' ').trim() : s);
  const link = new ApolloLink(operation =>
    new Observable(observer => {
      const opName = operation.operationName;
      const opQueryStr = norm(print(operation.query));
      const match = mocks.find(m => {
        const reqName = (m.request as any).operationName;
        const reqQueryStr = m.request.query && norm(print(m.request.query));
        const nameMatches = reqName ? (!!opName && reqName === opName) : true;
        const queryMatches = reqQueryStr ? reqQueryStr === opQueryStr : true;
        const reqVars = m.request.variables ?? {};
        const opVars = operation.variables ?? {};
        const varsMatch = stableStringify(reqVars) === stableStringify(opVars);
        return nameMatches && queryMatches && varsMatch;
      });

      setTimeout(() => {
        if (!match) {
          // Leave observable pending so tests can assert loading state
          return;
        }
        if (match.error) {
          observer.error(match.error);
          return;
        }
        observer.next(match.result as any);
        observer.complete();
      }, 0);
    })
  );

  return new ApolloClient({ cache: new InMemoryCache(), link });
};

// Helper to render with ApolloProvider
const renderWithApollo = (ui: React.ReactElement, mocks: Mock[] = []) => {
  const client = createClientWithMocks(mocks);
  return customRender(<ApolloProvider client={client}>{ui}</ApolloProvider>);
};

describe('GraphQL Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useBusinessesQuery', () => {
    it('should return businesses data when query succeeds', async () => {
      const mockBusinesses = [
        {
          id: '1',
          name: 'Test Business',
          address: '123 Test St',
          latitude: 40.7128,
          longitude: -74.0060,
          rating: 4.5,
          priceLevel: 2,
          distance: 1000,
          category: 'restaurant',
          placeId: 'test_place_id',
        },
      ];

      const mocks = [
        {
          request: {
            operationName: 'Businesses',
            query: BUSINESSES_QUERY,
            variables: { category: 'restaurant', limit: 10 },
          },
          result: { data: { businesses: mockBusinesses } },
        },
      ];

      // Test component that uses the hook
      const TestComponent = () => {
        const { data, loading, error } = useBusinessesQuery({
          category: 'restaurant',
          limit: 10,
        });

        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error.message}</div>;

        return (
          <div>
            {data?.businesses.map((business: any) => (
              <div key={business.id} data-testid={`business-${business.id}`}>
                {business.name}
              </div>
            ))}
          </div>
        );
      };

  renderWithApollo(<TestComponent />, mocks);

      await waitFor(() => {
        expect(screen.getByTestId('business-1')).toBeInTheDocument();
        expect(screen.getByText('Test Business')).toBeInTheDocument();
      });
    });

    it('should handle loading state correctly', () => {
  const mocks: any[] = []; // no mocks to simulate loading until resolved

      const TestComponent = () => {
        const { loading } = useBusinessesQuery({
          category: 'restaurant',
          limit: 10,
        });

        return <div>{loading ? 'Loading...' : 'Loaded'}</div>;
      };

  renderWithApollo(<TestComponent />, mocks);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

  it('should handle error state correctly', async () => {
      const mocks = [
        {
          request: {
            operationName: 'Businesses',
            query: BUSINESSES_QUERY,
            variables: { category: 'restaurant', limit: 10 },
          },
          error: new Error('GraphQL Error'),
        },
      ];

      const TestComponent = () => {
        const { error } = useBusinessesQuery({
          category: 'restaurant',
          limit: 10,
        });

        return <div>{error ? `Error: ${error.message}` : 'No error'}</div>;
      };

  renderWithApollo(<TestComponent />, mocks);

      await waitFor(() => {
        expect(screen.getByText('Error: GraphQL Error')).toBeInTheDocument();
      });
    });

    it('should pass correct variables to query', () => {
      const variables = {
        category: 'restaurant',
        limit: 20,
        offset: 10,
      };

    const mocks = [
        {
      request: { operationName: 'Businesses', query: BUSINESSES_QUERY, variables },
          result: { data: { businesses: [] } },
        },
      ];

      const TestComponent = () => {
        const { data, loading, error } = useBusinessesQuery(variables);
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error</div>;
        return <div>Loaded {data?.businesses?.length}</div>;
      };

      renderWithApollo(<TestComponent />, mocks);

      return waitFor(() => {
        expect(screen.getByText('Loaded 0')).toBeInTheDocument();
      });
    });
  });

  describe('useBusinessDetailsQuery', () => {
    it('should return business details with proper structure', async () => {
      const mockBusinessDetails = {
        id: '1',
        name: 'Detailed Business',
        address: '123 Detail St',
        latitude: 40.7128,
        longitude: -74.0060,
        rating: 4.5,
        priceLevel: 3,
        distance: 500,
        category: 'restaurant',
        placeId: 'detailed_place_id',
        reviews: [
          {
            id: 'review1',
            author: 'John Doe',
            rating: 5,
            text: 'Great place!',
            time: '2023-01-01',
          },
        ],
        photos: [
          {
            id: 'photo1',
            url: 'https://example.com/photo1.jpg',
            width: 800,
            height: 600,
          },
        ],
        hours: {
          monday: '9:00 AM - 10:00 PM',
          tuesday: '9:00 AM - 10:00 PM',
          wednesday: '9:00 AM - 10:00 PM',
          thursday: '9:00 AM - 10:00 PM',
          friday: '9:00 AM - 11:00 PM',
          saturday: '10:00 AM - 11:00 PM',
          sunday: '10:00 AM - 9:00 PM',
        },
      };

    const mocks = [
        {
      request: { operationName: 'BusinessDetails', query: BUSINESS_DETAILS_QUERY, variables: { id: '1' } },
          result: { data: { business: mockBusinessDetails } },
        },
      ];

      const TestComponent = () => {
        const { data } = useBusinessDetailsQuery('1');

        return (
          <div>
            {data?.business && (
              <>
                <h1>{data.business.name}</h1>
                <p>{data.business.address}</p>
                <div>Rating: {data.business.rating}</div>
                <div>Reviews: {data.business.reviews?.length ?? 0}</div>
                <div>Photos: {data.business.photos?.length ?? 0}</div>
              </>
            )}
          </div>
        );
      };

  renderWithApollo(<TestComponent />, mocks);

      await waitFor(() => {
        expect(screen.getByText('Detailed Business')).toBeInTheDocument();
        expect(screen.getByText('123 Detail St')).toBeInTheDocument();
        expect(screen.getByText('Rating: 4.5')).toBeInTheDocument();
        expect(screen.getByText('Reviews: 1')).toBeInTheDocument();
        expect(screen.getByText('Photos: 1')).toBeInTheDocument();
      });
    });
  });

  describe('useNearbyBusinessesQuery', () => {
    it('should handle location-based queries correctly', async () => {
      const mockNearbyBusinesses = [
        {
          id: 'nearby1',
          name: 'Nearby Restaurant',
          distance: 200,
          latitude: 40.7128,
          longitude: -74.0060,
        },
        {
          id: 'nearby2',
          name: 'Another Nearby Place',
          distance: 500,
          latitude: 40.7130,
          longitude: -74.0062,
        },
      ];

      const mocks = [
        {
          request: {
            operationName: 'NearbyBusinesses',
            query: NEARBY_BUSINESSES_QUERY,
            variables: { lat: 40.7128, lng: -74.0060, radius: 1000, category: 'restaurant' },
          },
          result: { data: { nearbyBusinesses: mockNearbyBusinesses } },
        },
      ];

      const TestComponent = () => {
        const { data } = useNearbyBusinessesQuery({
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 1000,
          category: 'restaurant',
        });

        return (
          <div>
            {data?.nearbyBusinesses.map((business: any) => (
              <div key={business.id} data-testid={`nearby-${business.id}`}>
                {business.name} - {business.distance}m
              </div>
            ))}
          </div>
        );
      };

  renderWithApollo(<TestComponent />, mocks);

      await waitFor(() => {
        expect(screen.getByTestId('nearby-nearby1')).toBeInTheDocument();
        expect(screen.getByTestId('nearby-nearby2')).toBeInTheDocument();
        expect(screen.getByText('Nearby Restaurant - 200m')).toBeInTheDocument();
        expect(screen.getByText('Another Nearby Place - 500m')).toBeInTheDocument();
      });
    });

    it('should sort businesses by distance', async () => {
      const unsortedBusinesses = [
        {
          id: 'far',
          name: 'Far Business',
          distance: 1000,
          latitude: 40.7128,
          longitude: -74.0060,
        },
        {
          id: 'close',
          name: 'Close Business',
          distance: 100,
          latitude: 40.7128,
          longitude: -74.0060,
        },
      ];

      const mocks = [
        {
          request: {
            operationName: 'NearbyBusinesses',
            query: NEARBY_BUSINESSES_QUERY,
            variables: { lat: 40.7128, lng: -74.0060, radius: 1000 },
          },
          result: { data: { nearbyBusinesses: unsortedBusinesses } },
        },
      ];

      const TestComponent = () => {
        const { data } = useNearbyBusinessesQuery({
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 1000,
        });

        return (
          <div>
            {data?.nearbyBusinesses.map((business: any) => (
              <div key={business.id}>
                {business.name}
              </div>
            ))}
          </div>
        );
      };

  renderWithApollo(<TestComponent />, mocks);

      await waitFor(() => {
        const businessElements = screen.getAllByText(/Business/);
        // Should be sorted by distance (close first)
        expect(businessElements[0]).toHaveTextContent('Close Business');
        expect(businessElements[1]).toHaveTextContent('Far Business');
      });
    });
  });

  describe('GraphQL Error Handling', () => {
  it('should handle network errors gracefully', async () => {
    const mocks = [
        {
      request: { operationName: 'Businesses', query: BUSINESSES_QUERY, variables: { category: 'restaurant' } },
          error: new Error('Network error'),
        },
      ];

      const TestComponent = () => {
        const { error } = useBusinessesQuery({ category: 'restaurant' });
        return <div>{error ? 'Network Error Occurred' : 'No Error'}</div>;
      };

  renderWithApollo(<TestComponent />, mocks);

      await waitFor(() => {
        expect(screen.getByText('Network Error Occurred')).toBeInTheDocument();
      });
    });

    it('should handle GraphQL validation errors', async () => {
    const mocks = [
        {
      request: { operationName: 'Businesses', query: BUSINESSES_QUERY, variables: { category: 'invalid' } },
          result: {
            errors: [
              {
                message: 'Invalid category parameter',
                extensions: { code: 'VALIDATION_ERROR' },
              },
            ],
          },
        },
      ];

      const TestComponent = () => {
        const { error } = useBusinessesQuery({ category: 'invalid' });
        return <div>{error ? 'Validation Error' : 'No Error'}</div>;
      };

  renderWithApollo(<TestComponent />, mocks);

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument();
      });
    });
  });

  describe('GraphQL Performance', () => {
  it('should cache query results appropriately', async () => {
      const mockData = { businesses: [{ id: '1', name: 'Cached Business' }] };
    const mocks = [
        {
      request: { operationName: 'Businesses', query: BUSINESSES_QUERY, variables: { category: 'restaurant' } },
          result: { data: mockData },
        },
      ];

      const TestComponent = () => {
        const { data } = useBusinessesQuery({ category: 'restaurant' });
        return <div>{data?.businesses[0]?.name}</div>;
      };

  const { rerender } = renderWithApollo(<TestComponent />, mocks);

      await waitFor(() => {
        expect(screen.getByText('Cached Business')).toBeInTheDocument();
      });

      // Re-render should use cached/mocked data
      rerender(
        <ApolloProvider client={createClientWithMocks(mocks)}>
          <TestComponent />
        </ApolloProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Cached Business')).toBeInTheDocument();
      });
    });

    it('should handle concurrent queries efficiently', async () => {
      const mockData = { businesses: [{ id: '1', name: 'Concurrent Business' }] };
    const mocks = [
        {
      request: { operationName: 'Businesses', query: BUSINESSES_QUERY, variables: { category: 'restaurant' } },
          result: { data: mockData },
        },
      ];

      const TestComponent = () => {
        const query1 = useBusinessesQuery({ category: 'restaurant' });
        const query2 = useBusinessesQuery({ category: 'restaurant' });

        return (
          <div>
            {query1.data?.businesses[0]?.name}
            {query2.data?.businesses[0]?.name}
          </div>
        );
      };

  renderWithApollo(<TestComponent />, mocks);

      await waitFor(() => {
        expect(screen.getByText('Concurrent BusinessConcurrent Business')).toBeInTheDocument();
      });

  // Apollo cache should serve both calls from the same result without extra mocks
  expect(screen.getByText('Concurrent BusinessConcurrent Business')).toBeInTheDocument();
    });
  });
});
