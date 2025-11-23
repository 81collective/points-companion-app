// Regression tests for /api/recommendations route covering Prisma-backed GET and POST handlers

const mockFindMany = jest.fn();
const mockCreate = jest.fn(() => Promise.resolve({ id: 'rec-persisted' }));
const mockTransaction = jest.fn(async (operations: Promise<unknown>[]) => Promise.all(operations));
const mockRequireSession = jest.fn();
const mockOptionalSession = jest.fn();
const mockChatCompletion = jest.fn(async () => ({
  choices: [
    { message: { content: JSON.stringify([{ cardId: 'card-1', cardName: 'Card One', reason: 'Best for dining', score: 123 }]) } }
  ]
}));
const mockGetOpenAIClient = jest.fn(() => ({
  chat: {
    completions: {
      create: mockChatCompletion
    }
  }
}));

jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status ?? 200 }) },
  NextRequest: class {}
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    recommendation: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args)
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args)
  }
}));

jest.mock('@/lib/auth/session', () => ({
  requireServerSession: (...args: unknown[]) => mockRequireSession(...args),
  getOptionalServerSession: (...args: unknown[]) => mockOptionalSession(...args)
}));

jest.mock('@/lib/openai-server', () => ({
  getOpenAIClient: () => mockGetOpenAIClient(),
  isOpenAIConfigured: true
}));

import { GET, POST } from '@/app/api/recommendations/route';

function buildRequest(url: string) {
  return { url } as any;
}

describe('/api/recommendations route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireSession.mockResolvedValue({ user: { id: 'user-123' } });
    mockOptionalSession.mockResolvedValue(null);
  });

  it('GET returns serialized recommendation history for the session user', async () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    mockFindMany.mockResolvedValue([
      {
        id: 'rec-1',
        userId: 'user-123',
        transactionId: null,
        transactionDetails: { merchant: 'Cafe', category: 'dining' },
        recommendedCard: 'Card One',
        actualCardUsed: null,
        pointsEarned: 200,
        feedback: null,
        feedbackScore: null,
        createdAt
      }
    ]);

    const res: any = await GET(buildRequest('https://test.local/api/recommendations?limit=5'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    expect(data.recommendations).toEqual([
      {
        id: 'rec-1',
        userId: 'user-123',
        transactionId: null,
        transactionDetails: { merchant: 'Cafe', category: 'dining' },
        recommendedCard: 'Card One',
        actualCardUsed: null,
        pointsEarned: 200,
        feedback: null,
        feedbackScore: null,
        createdAt: createdAt.toISOString()
      }
    ]);
  });

  it('POST uses OpenAI output and persists recommendations when a session exists', async () => {
    mockOptionalSession.mockResolvedValue({ user: { id: 'user-123' } });
    const requestBody = {
      transactions: [{ id: 'tx-1', amount: 42, date: new Date().toISOString(), merchant: 'Cafe', category: 'dining' }],
      cards: []
    };

    const res: any = await POST({
      json: async () => requestBody
    } as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(mockGetOpenAIClient).toHaveBeenCalled();
    expect(data.recommendations).toHaveLength(1);
    expect(mockCreate).toHaveBeenCalled();
    expect(mockTransaction).toHaveBeenCalled();
  });
});
