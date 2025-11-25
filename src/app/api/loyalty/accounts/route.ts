import { NextRequest, NextResponse } from 'next/server';
import getRequestUrl from '@/lib/getRequestUrl';
import { LoyaltyAccount, LoyaltyAccountsResponse } from '@/types/loyalty';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = getRequestUrl(request);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // For now, return mock data since we don't have real authentication yet
    // TODO: Replace with real Supabase queries once auth is implemented
    
    const mockAccounts = [
      {
        id: '1',
        user_id: 'user1',
        program_id: 'chase-ultimate-rewards',
        account_number: '****1234',
        account_name: 'My Chase Sapphire',
        balance_current: 125000,
        balance_pending: 5000,
        balance_lifetime: 450000,
        expiration_date: null,
        expiring_points: [],
        elite_status: null,
        sync_enabled: true,
        sync_frequency: 'weekly',
        credentials_encrypted: null,
        last_sync: '2025-01-15T10:30:00Z',
        sync_status: 'connected',
        updated_at: '2025-01-15T10:30:00Z',
        loyalty_certificates: [
          {
            id: 'cert1',
            certificate_type: 'free-night',
            name: 'Anniversary Free Night',
            description: 'Up to 50,000 points per night',
            expiration_date: '2025-03-15',
            estimated_value: 400,
            used: false
          }
        ]
      },
      {
        id: '2',
        user_id: 'user1',
        program_id: 'marriott-bonvoy',
        account_number: '****5678',
        account_name: 'Marriott Account',
        balance_current: 85000,
        balance_pending: 2500,
        balance_lifetime: null,
        expiration_date: '2026-01-15',
        expiring_points: [{ amount: 15000, expirationDate: '2025-04-30' }],
        elite_status: {
          currentTier: 'Gold',
          qualifyingActivity: 35,
          nextTierRequirement: 50,
          yearEndDate: '2025-12-31'
        },
        sync_enabled: true,
        sync_frequency: 'daily',
        credentials_encrypted: null,
        last_sync: '2025-01-14T08:15:00Z',
        sync_status: 'connected',
        updated_at: '2025-01-14T08:15:00Z',
        loyalty_certificates: []
      }
    ];

    // Transform data to match frontend types
    const transformedAccounts: LoyaltyAccount[] = mockAccounts.map((account: {
      id: string;
      user_id: string;
      program_id: string;
      account_number: string;
      account_name?: string;
      balance_current: number;
      balance_pending?: number;
      balance_lifetime?: number | null;
      expiration_date?: string | null;
      expiring_points?: Array<{ amount: number; expirationDate: string }>;
      elite_status?: {
        currentTier: string;
        qualifyingActivity: number;
        nextTierRequirement?: number;
        yearEndDate: string;
      } | null;
      loyalty_certificates?: Array<{
        id: string;
        certificate_type: string;
        name: string;
        description: string;
        expiration_date: string;
        estimated_value: number;
      }>;
      updated_at: string;
      sync_enabled: boolean;
      sync_frequency: string;
      credentials_encrypted?: boolean | null;
      last_sync?: string;
      sync_status: string;
    }) => ({
      id: account.id,
      userId: account.user_id,
      programId: account.program_id,
      accountNumber: account.account_number,
      accountName: account.account_name,
      balance: {
        current: account.balance_current,
        pending: account.balance_pending,
        lifetime: account.balance_lifetime || undefined
      },
      expirationDate: account.expiration_date || undefined,
      expiringPoints: account.expiring_points || [],
      eliteStatus: account.elite_status || undefined,
      certificates: account.loyalty_certificates?.map((cert: {
        id: string;
        certificate_type: string;
        name: string;
        description: string;
        expiration_date: string;
        estimated_value: number;
      }) => ({
        id: cert.id,
        type: cert.certificate_type as 'free-night' | 'companion' | 'upgrade' | 'lounge-access' | 'other',
        name: cert.name,
        description: cert.description,
        expirationDate: cert.expiration_date,
        restrictions: [],
        estimatedValue: cert.estimated_value,
        transferable: false
      })) || [],
      lastUpdated: account.updated_at,
      syncEnabled: account.sync_enabled,
      syncFrequency: account.sync_frequency as 'manual' | 'daily' | 'weekly' | 'monthly',
      credentials: {
        encrypted: !!account.credentials_encrypted,
        lastSync: account.last_sync,
        syncStatus: account.sync_status as 'connected' | 'error' | 'pending' | 'disconnected'
      }
    }));

    const response: LoyaltyAccountsResponse = {
      success: true,
      data: transformedAccounts,
      pagination: {
        page,
        limit,
        total: mockAccounts.length
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Error in loyalty accounts API', { error, route: '/api/loyalty/accounts' });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { programId, accountNumber, accountName, syncEnabled = false, syncFrequency = 'manual' } = body;
    
    if (!programId || !accountNumber) {
      return NextResponse.json(
        { success: false, error: 'Program ID and account number are required' },
        { status: 400 }
      );
    }

    // For now, return mock response since we don't have real authentication yet
    // TODO: Replace with real Supabase operations once auth is implemented
    
    const mockAccount = {
      id: `account_${Date.now()}`,
      user_id: 'user1',
      program_id: programId,
      account_number: accountNumber,
      account_name: accountName || `${programId} Account`,
      balance_current: 0,
      balance_pending: 0,
      balance_lifetime: 0,
      expiration_date: null,
      expiring_points: [],
      elite_status: null,
      sync_enabled: syncEnabled,
      sync_frequency: syncFrequency,
      credentials_encrypted: null,
      last_sync: null,
      sync_status: syncEnabled ? 'pending' : 'disconnected',
      updated_at: new Date().toISOString()
    };

    // Transform data to match frontend types
    const transformedAccount: LoyaltyAccount = {
      id: mockAccount.id,
      userId: mockAccount.user_id,
      programId: mockAccount.program_id,
      accountNumber: mockAccount.account_number,
      accountName: mockAccount.account_name,
      balance: {
        current: mockAccount.balance_current,
        pending: mockAccount.balance_pending,
        lifetime: mockAccount.balance_lifetime
      },
      expirationDate: mockAccount.expiration_date || undefined,
      expiringPoints: mockAccount.expiring_points || [],
      eliteStatus: mockAccount.elite_status || undefined,
      certificates: [],
      lastUpdated: mockAccount.updated_at,
      syncEnabled: mockAccount.sync_enabled,
      syncFrequency: mockAccount.sync_frequency as 'manual' | 'daily' | 'weekly' | 'monthly',
      credentials: {
        encrypted: !!mockAccount.credentials_encrypted,
        lastSync: mockAccount.last_sync || undefined,
        syncStatus: mockAccount.sync_status as 'connected' | 'error' | 'pending' | 'disconnected'
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedAccount
    });

  } catch (error) {
    logger.error('Error in loyalty accounts POST API', { error, route: '/api/loyalty/accounts' });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
