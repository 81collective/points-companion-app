// Welcome Bonus API Routes
// Points Companion - Welcome Bonus Management

import { NextRequest, NextResponse } from 'next/server';
import { WelcomeBonusTracker } from '@/types/welcomeBonus';

// Mock data for development - replace with Supabase queries
const mockBonuses: WelcomeBonusTracker[] = [
  {
    id: 'bonus-1',
    userId: 'user-1',
    cardId: 'chase-sapphire-preferred',
    cardName: 'Chase Sapphire Preferred',
    cardIssuer: 'Chase',
    requiredSpend: 4000,
    currentSpend: 2800,
    deadline: '2025-03-15',
    bonusAmount: 60000,
    bonusType: 'points',
    bonusDescription: '60,000 points after spending $4,000 in first 3 months',
    progress: 70,
    status: 'active',
    startDate: '2024-12-15',
    applicationDate: '2024-12-10',
    milestones: [
      {
        id: 'milestone-1',
        threshold: 1000,
        reward: '5,000 bonus points',
        achieved: true,
        achievedDate: '2025-01-05',
        pointsValue: 5000,
        cashValue: 50
      },
      {
        id: 'milestone-2',
        threshold: 2500,
        reward: '10,000 bonus points',
        achieved: true,
        achievedDate: '2025-01-20',
        pointsValue: 10000,
        cashValue: 100
      },
      {
        id: 'milestone-3',
        threshold: 4000,
        reward: '60,000 points total',
        achieved: false,
        pointsValue: 60000,
        cashValue: 600
      }
    ],
    tags: ['travel', 'premium'],
    priority: 'high',
    estimatedValue: 750,
    notes: 'Good for travel and dining purchases'
  },
  {
    id: 'bonus-2',
    userId: 'user-1',
    cardId: 'amex-gold',
    cardName: 'American Express Gold Card',
    cardIssuer: 'American Express',
    requiredSpend: 4000,
    currentSpend: 1200,
    deadline: '2025-04-01',
    bonusAmount: 60000,
    bonusType: 'points',
    bonusDescription: '60,000 Membership Rewards points after $4,000 spend',
    progress: 30,
    status: 'active',
    startDate: '2025-01-01',
    applicationDate: '2024-12-28',
    milestones: [
      {
        id: 'milestone-4',
        threshold: 1000,
        reward: '$100 statement credit',
        achieved: true,
        achievedDate: '2025-01-15',
        cashValue: 100
      },
      {
        id: 'milestone-5',
        threshold: 4000,
        reward: '60,000 MR points',
        achieved: false,
        pointsValue: 60000,
        cashValue: 600
      }
    ],
    tags: ['dining', 'groceries'],
    priority: 'medium',
    estimatedValue: 700,
    notes: 'Great for dining and grocery spending'
  },
  {
    id: 'bonus-3',
    userId: 'user-1',
    cardId: 'citi-double-cash',
    cardName: 'Citi Double Cash Card',
    cardIssuer: 'Citi',
    requiredSpend: 1500,
    currentSpend: 1500,
    deadline: '2025-02-28',
    bonusAmount: 200,
    bonusType: 'cashback',
    bonusDescription: '$200 cash back after $1,500 spend',
    progress: 100,
    status: 'completed',
    startDate: '2024-11-28',
    applicationDate: '2024-11-25',
    completedDate: '2025-01-25',
    milestones: [
      {
        id: 'milestone-6',
        threshold: 1500,
        reward: '$200 cash back',
        achieved: true,
        achievedDate: '2025-01-25',
        cashValue: 200
      }
    ],
    tags: ['cashback', 'everyday'],
    priority: 'low',
    estimatedValue: 200,
    notes: 'Completed successfully'
  },
  {
    id: 'bonus-4',
    userId: 'user-1',
    cardId: 'capital-one-venture',
    cardName: 'Capital One Venture Rewards',
    cardIssuer: 'Capital One',
    requiredSpend: 3000,
    currentSpend: 500,
    deadline: '2025-02-10',
    bonusAmount: 75000,
    bonusType: 'miles',
    bonusDescription: '75,000 miles after $3,000 spend',
    progress: 16.7,
    status: 'active',
    startDate: '2024-11-10',
    applicationDate: '2024-11-05',
    milestones: [
      {
        id: 'milestone-7',
        threshold: 3000,
        reward: '75,000 miles',
        achieved: false,
        pointsValue: 75000,
        cashValue: 750
      }
    ],
    tags: ['travel', 'urgent'],
    priority: 'urgent',
    estimatedValue: 750,
    notes: 'Deadline approaching - need to increase spending'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const status = searchParams.get('status')?.split(',') || ['active'];
    const priority = searchParams.get('priority')?.split(',');
    const bonusType = searchParams.get('bonusType')?.split(',');
    const sortBy = searchParams.get('sortBy') || 'deadline';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Filter bonuses
    const filteredBonuses = mockBonuses.filter(bonus => {
      // Status filter
      if (!status.includes(bonus.status)) return false;
      
      // Priority filter
      if (priority && !priority.includes(bonus.priority)) return false;
      
      // Bonus type filter
      if (bonusType && !bonusType.includes(bonus.bonusType)) return false;
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          bonus.cardName.toLowerCase().includes(searchLower) ||
          bonus.cardIssuer.toLowerCase().includes(searchLower) ||
          bonus.bonusDescription.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Sort bonuses
    filteredBonuses.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'value':
          comparison = a.estimatedValue - b.estimatedValue;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'name':
          comparison = a.cardName.localeCompare(b.cardName);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBonuses = filteredBonuses.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedBonuses,
      pagination: {
        page,
        limit,
        total: filteredBonuses.length,
        totalPages: Math.ceil(filteredBonuses.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching welcome bonuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch welcome bonuses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['cardName', 'cardIssuer', 'requiredSpend', 'deadline', 'bonusAmount', 'bonusType'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new bonus
    const newBonus: WelcomeBonusTracker = {
      id: `bonus-${Date.now()}`,
      userId: 'user-1', // Replace with actual user ID from auth
      cardId: body.cardId || `card-${Date.now()}`,
      cardName: body.cardName,
      cardIssuer: body.cardIssuer,
      requiredSpend: parseFloat(body.requiredSpend),
      currentSpend: 0,
      deadline: body.deadline,
      bonusAmount: parseInt(body.bonusAmount),
      bonusType: body.bonusType,
      bonusDescription: body.bonusDescription || `${body.bonusAmount} ${body.bonusType} after spending $${body.requiredSpend}`,
      progress: 0,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      applicationDate: body.applicationDate,
      milestones: body.milestones || [],
      tags: body.tags || [],
      priority: body.priority || 'medium',
      estimatedValue: parseFloat(body.estimatedValue) || 0,
      notes: body.notes
    };

    // In a real implementation, save to Supabase
    // const { data, error } = await supabase
    //   .from('welcome_bonuses')
    //   .insert([newBonus])
    //   .select()
    //   .single();

    return NextResponse.json({
      success: true,
      data: newBonus
    });

  } catch (error) {
    console.error('Error creating welcome bonus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create welcome bonus' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Bonus ID is required' },
        { status: 400 }
      );
    }

    // Find and update bonus
    const bonusIndex = mockBonuses.findIndex(b => b.id === id);
    if (bonusIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Bonus not found' },
        { status: 404 }
      );
    }

    const updatedBonus = {
      ...mockBonuses[bonusIndex],
      ...updates,
      progress: updates.currentSpend ? 
        (updates.currentSpend / mockBonuses[bonusIndex].requiredSpend) * 100 : 
        mockBonuses[bonusIndex].progress
    };

    // Update status if bonus is completed
    if (updatedBonus.progress >= 100 && updatedBonus.status === 'active') {
      updatedBonus.status = 'completed';
      updatedBonus.completedDate = new Date().toISOString().split('T')[0];
    }

    mockBonuses[bonusIndex] = updatedBonus;

    return NextResponse.json({
      success: true,
      data: updatedBonus
    });

  } catch (error) {
    console.error('Error updating welcome bonus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update welcome bonus' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Bonus ID is required' },
        { status: 400 }
      );
    }

    const bonusIndex = mockBonuses.findIndex(b => b.id === id);
    if (bonusIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Bonus not found' },
        { status: 404 }
      );
    }

    mockBonuses.splice(bonusIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Bonus deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting welcome bonus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete welcome bonus' },
      { status: 500 }
    );
  }
}
