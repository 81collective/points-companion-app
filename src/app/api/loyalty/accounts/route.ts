import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LoyaltyAccount, LoyaltyAccountsResponse } from '@/types/loyalty';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const category = searchParams.get('category');
    const syncStatus = searchParams.get('syncStatus');
    const hasExpiringPoints = searchParams.get('hasExpiringPoints') === 'true';
    const hasCertificates = searchParams.get('hasCertificates') === 'true';
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
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
    const transformedAccounts: LoyaltyAccount[] = mockAccounts.map((account: any) => ({
      id: account.id,
      userId: account.user_id,
      programId: account.program_id,
      accountNumber: account.account_number,
      accountName: account.account_name,
      balance: {
        current: account.balance_current,
        pending: account.balance_pending,
        lifetime: account.balance_lifetime
      },
      expirationDate: account.expiration_date,
      expiringPoints: account.expiring_points || [],
      eliteStatus: account.elite_status,
      certificates: account.loyalty_certificates?.map((cert: any) => ({
        id: cert.id,
        type: cert.certificate_type,
        name: cert.name,
        description: cert.description,
        expirationDate: cert.expiration_date,
        restrictions: [],
        estimatedValue: cert.estimated_value,
        transferable: false
      })) || [],
      lastUpdated: account.updated_at,
      syncEnabled: account.sync_enabled,
      syncFrequency: account.sync_frequency,
      credentials: {
        encrypted: !!account.credentials_encrypted,
        lastSync: account.last_sync,
        syncStatus: account.sync_status
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
    console.error('Error in loyalty accounts API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
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
    console.error('Error in loyalty accounts POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
