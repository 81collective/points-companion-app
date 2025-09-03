import React from 'react';
import { customRender, screen, waitFor, setupTests } from '../testUtils';
import { useBusinessesQuery, useBusinessDetailsQuery, useNearbyBusinessesQuery } from '../../lib/graphql/useGraphQL';

// Setup mocks before tests
beforeAll(() => {
  setupTests();
});

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  gql: jest.fn((template: TemplateStringsArray) => template.join('')),
}));

import { useQuery, useMutation } from '@apollo/client';

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

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

      mockUseQuery.mockReturnValue({
        data: { businesses: mockBusinesses },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

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
            {data?.businesses.map(business => (
              <div key={business.id} data-testid={`business-${business.id}`}>
                {business.name}
              </div>
            ))}
          </div>
        );
      };

      customRender(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('business-1')).toBeInTheDocument();
        expect(screen.getByText('Test Business')).toBeInTheDocument();
      });
    });

    it('should handle loading state correctly', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: true,
        error: undefined,
        refetch: jest.fn(),
      });

      const TestComponent = () => {
        const { loading } = useBusinessesQuery({
          category: 'restaurant',
          limit: 10,
        });

        return <div>{loading ? 'Loading...' : 'Loaded'}</div>;
      };

      customRender(<TestComponent />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle error state correctly', () => {
      const mockError = new Error('GraphQL Error');
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: false,
        error: mockError,
        refetch: jest.fn(),
      });

      const TestComponent = () => {
        const { error } = useBusinessesQuery({
          category: 'restaurant',
          limit: 10,
        });

        return <div>{error ? `Error: ${error.message}` : 'No error'}</div>;
      };

      customRender(<TestComponent />);

      expect(screen.getByText('Error: GraphQL Error')).toBeInTheDocument();
    });

    it('should pass correct variables to query', () => {
      const variables = {
        category: 'restaurant',
        limit: 20,
        offset: 10,
      };

      mockUseQuery.mockReturnValue({
        data: { businesses: [] },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      useBusinessesQuery(variables);

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables,
        })
      );
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

      mockUseQuery.mockReturnValue({
        data: { business: mockBusinessDetails },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      const TestComponent = () => {
        const { data } = useBusinessDetailsQuery('1');

        return (
          <div>
            {data?.business && (
              <>
                <h1>{data.business.name}</h1>
                <p>{data.business.address}</p>
                <div>Rating: {data.business.rating}</div>
                <div>Reviews: {data.business.reviews.length}</div>
                <div>Photos: {data.business.photos.length}</div>
              </>
            )}
          </div>
        );
      };

      customRender(<TestComponent />);

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

      mockUseQuery.mockReturnValue({
        data: { nearbyBusinesses: mockNearbyBusinesses },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      const TestComponent = () => {
        const { data } = useNearbyBusinessesQuery({
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 1000,
          category: 'restaurant',
        });

        return (
          <div>
            {data?.nearbyBusinesses.map(business => (
              <div key={business.id} data-testid={`nearby-${business.id}`}>
                {business.name} - {business.distance}m
              </div>
            ))}
          </div>
        );
      };

      customRender(<TestComponent />);

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

      mockUseQuery.mockReturnValue({
        data: { nearbyBusinesses: unsortedBusinesses },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      const TestComponent = () => {
        const { data } = useNearbyBusinessesQuery({
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 1000,
        });

        return (
          <div>
            {data?.nearbyBusinesses.map(business => (
              <div key={business.id}>
                {business.name}
              </div>
            ))}
          </div>
        );
      };

      customRender(<TestComponent />);

      await waitFor(() => {
        const businessElements = screen.getAllByText(/Business/);
        // Should be sorted by distance (close first)
        expect(businessElements[0]).toHaveTextContent('Close Business');
        expect(businessElements[1]).toHaveTextContent('Far Business');
      });
    });
  });

  describe('GraphQL Error Handling', () => {
    it('should handle network errors gracefully', () => {
      const networkError = new Error('Network error');
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: false,
        error: networkError,
        refetch: jest.fn(),
      });

      const TestComponent = () => {
        const { error } = useBusinessesQuery({ category: 'restaurant' });
        return <div>{error ? 'Network Error Occurred' : 'No Error'}</div>;
      };

      customRender(<TestComponent />);

      expect(screen.getByText('Network Error Occurred')).toBeInTheDocument();
    });

    it('should handle GraphQL validation errors', () => {
      const validationError = {
        message: 'Validation error',
        graphQLErrors: [
          {
            message: 'Invalid category parameter',
            extensions: { code: 'VALIDATION_ERROR' },
          },
        ],
      };

      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: false,
        error: validationError,
        refetch: jest.fn(),
      });

      const TestComponent = () => {
        const { error } = useBusinessesQuery({ category: 'invalid' });
        return <div>{error ? 'Validation Error' : 'No Error'}</div>;
      };

      customRender(<TestComponent />);

      expect(screen.getByText('Validation Error')).toBeInTheDocument();
    });
  });

  describe('GraphQL Performance', () => {
    it('should cache query results appropriately', async () => {
      const mockData = { businesses: [{ id: '1', name: 'Cached Business' }] };

      mockUseQuery.mockReturnValue({
        data: mockData,
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

      const TestComponent = () => {
        const { data } = useBusinessesQuery({ category: 'restaurant' });
        return <div>{data?.businesses[0]?.name}</div>;
      };

      const { rerender } = customRender(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Cached Business')).toBeInTheDocument();
      });

      // Re-render should use cached data
      rerender(<TestComponent />);

      expect(screen.getByText('Cached Business')).toBeInTheDocument();
      expect(mockUseQuery).toHaveBeenCalledTimes(1); // Should not refetch
    });

    it('should handle concurrent queries efficiently', async () => {
      const mockData = { businesses: [{ id: '1', name: 'Concurrent Business' }] };

      mockUseQuery.mockReturnValue({
        data: mockData,
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      });

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

      customRender(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('Concurrent BusinessConcurrent Business')).toBeInTheDocument();
      });

      // Should deduplicate the query
      expect(mockUseQuery).toHaveBeenCalledTimes(1);
    });
  });
});
