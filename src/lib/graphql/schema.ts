// GraphQL Schema Definition for Points Companion App
// Consolidates REST API endpoints into a unified GraphQL API

export const typeDefs = `#graphql
  # Enums
  enum RewardCategory {
    DINING
    TRAVEL
    GROCERY
    GAS
    ENTERTAINMENT
    DEPARTMENT_STORE
    HOTEL
    AIRLINE
    CREDIT_CARD
    OTHER
  }

  enum BusinessCategory {
    RESTAURANT
    HOTEL
    GAS_STATION
    GROCERY_STORE
    DEPARTMENT_STORE
    ENTERTAINMENT
    TRAVEL
    OTHER
  }

  enum SortOrder {
    ASC
    DESC
  }

  enum CacheStrategy {
    NETWORK_ONLY
    CACHE_FIRST
    CACHE_ONLY
  }

  # Input Types
  input LocationInput {
    lat: Float!
    lng: Float!
  }

  input BusinessFilters {
    category: BusinessCategory
    radius: Int
    minRating: Float
    maxPrice: Int
    openNow: Boolean
  }

  input CardRecommendationFilters {
    category: RewardCategory
    businessId: String
    businessName: String
    location: LocationInput
    limit: Int
    sortBy: String
    sortOrder: SortOrder
  }

  input NearbyBusinessQuery {
    location: LocationInput!
    category: BusinessCategory
    filters: BusinessFilters
    limit: Int
    offset: Int
  }

  input CardRecommendationQuery {
    filters: CardRecommendationFilters
    cacheStrategy: CacheStrategy
  }

  # Types
  type Location {
    lat: Float!
    lng: Float!
  }

  type Business {
    id: String!
    name: String!
    address: String!
    category: BusinessCategory!
    location: Location!
    rating: Float
    priceLevel: Int
    distance: Float
    isOpen: Boolean
    photoUrl: String
    placeId: String
    reviews: Int
    phone: String
    website: String
    hours: [String]
  }

  type CardRecommendation {
    id: String!
    name: String!
    issuer: String!
    category: RewardCategory!
    rewardRate: Float!
    annualFee: Float!
    signupBonus: String
    imageUrl: String
    applyUrl: String
    features: [String!]!
    pros: [String!]
    cons: [String!]
    bestFor: [String!]
    matchScore: Float
    monthlyValue: Float
  }

  type LoyaltyProgram {
    id: String!
    name: String!
    issuer: String!
    category: RewardCategory!
    pointsPerDollar: Float!
    signupBonus: String
    annualFee: Float!
    transferPartners: [String!]
    benefits: [String!]
    matchScore: Float
  }

  type AnalyticsData {
    totalCards: Int!
    totalValue: Float!
    monthlyEarnings: Float!
    topCategories: [CategoryAnalytics!]!
    spendingByCategory: [CategorySpending!]!
    recommendationsCount: Int!
  }

  type CategoryAnalytics {
    category: RewardCategory!
    count: Int!
    totalValue: Float!
    averageReward: Float!
  }

  type CategorySpending {
    category: RewardCategory!
    amount: Float!
    rewards: Float!
    netCost: Float!
  }

  type UserProfile {
    id: String!
    email: String!
    name: String
    preferences: UserPreferences!
    cards: [UserCard!]!
    analytics: AnalyticsData!
  }

  type UserPreferences {
    defaultLocation: Location
    favoriteCategories: [RewardCategory!]!
    notificationSettings: NotificationSettings!
  }

  type NotificationSettings {
    email: Boolean!
    push: Boolean!
    sms: Boolean!
  }

  type UserCard {
    id: String!
    cardId: String!
    card: CardRecommendation!
    addedDate: String!
    isActive: Boolean!
    notes: String
  }

  type QueryResponse {
    success: Boolean!
    message: String
    data: String
  }

  type MutationResponse {
    success: Boolean!
    message: String!
    data: String
  }

  # Cache Metadata
  type CacheMetadata {
    hit: Boolean!
    age: Int
    ttl: Int
    source: String!
    timestamp: String!
  }

  # Paginated Results
  type BusinessConnection {
    edges: [BusinessEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type BusinessEdge {
    node: Business!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # Main Query Type
  type Query {
    # Business queries
    nearbyBusinesses(query: NearbyBusinessQuery!): BusinessConnection!
    business(id: String!): Business

    # Card queries
    cardRecommendations(query: CardRecommendationQuery): [CardRecommendation!]!
    card(id: String!): CardRecommendation

    # Loyalty programs
    loyaltyPrograms(category: RewardCategory): [LoyaltyProgram!]!
    loyaltyProgram(id: String!): LoyaltyProgram

    # User queries
    userProfile: UserProfile!
    userCards: [UserCard!]!
    userAnalytics: AnalyticsData!

    # Health check
    health: QueryResponse!
  }

  # Main Mutation Type
  type Mutation {
    # User mutations
    updateUserProfile(input: UpdateUserProfileInput!): MutationResponse!
    updateUserPreferences(input: UpdateUserPreferencesInput!): MutationResponse!

    # Card mutations
    addUserCard(input: AddUserCardInput!): MutationResponse!
    removeUserCard(cardId: String!): MutationResponse!
    updateUserCard(input: UpdateUserCardInput!): MutationResponse!

    # Analytics mutations
    trackSpending(input: TrackSpendingInput!): MutationResponse!
    updateAnalytics: MutationResponse!
  }

  # Mutation Input Types
  input UpdateUserProfileInput {
    name: String
    email: String
  }

  input UpdateUserPreferencesInput {
    defaultLocation: LocationInput
    favoriteCategories: [RewardCategory!]
    notificationSettings: NotificationSettingsInput
  }

  input NotificationSettingsInput {
    email: Boolean
    push: Boolean
    sms: Boolean
  }

  input AddUserCardInput {
    cardId: String!
    notes: String
  }

  input UpdateUserCardInput {
    cardId: String!
    isActive: Boolean
    notes: String
  }

  input TrackSpendingInput {
    amount: Float!
    category: RewardCategory!
    businessId: String
    businessName: String
    location: LocationInput
    date: String
  }
`;
