jest.mock('@apollo/client/core', () => ({
  // Provide a minimal gql tagged template stub so the module can evaluate in tests
  gql: (strings: TemplateStringsArray) => strings.join(''),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(() => ({ data: undefined, loading: false, error: null })),
}));

const useGraphQLExports = require('../../lib/graphql/useGraphQL');

describe('useGraphQL export inspection', () => {
  it('exports the expected symbols', () => {
    expect(Object.keys(useGraphQLExports)).toEqual(
      expect.arrayContaining([
        'useBusinessesQuery',
        'useBusinessDetailsQuery',
        'useNearbyBusinessesQuery',
        'BUSINESSES_QUERY',
        'BUSINESS_DETAILS_QUERY',
        'NEARBY_BUSINESSES_QUERY',
      ])
    );
  });
});
