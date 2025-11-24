import { NextRequest, NextResponse } from 'next/server';
import getRequestUrl from '@/lib/getRequestUrl';
import { getAllPrograms, getProgramById, getProgramsByCategory } from '@/lib/loyaltyPrograms';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = getRequestUrl(request);
    const category = searchParams.get('category');
    const programId = searchParams.get('id');
    const search = searchParams.get('search');

    // Get specific program by ID
    if (programId) {
      const program = getProgramById(programId);
      if (!program) {
        return NextResponse.json(
          { success: false, error: 'Program not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: program });
    }

    // Get all programs or filter by category
    let programs = category && category !== 'all' 
      ? getProgramsByCategory(category as 'airline' | 'hotel' | 'credit_card' | 'dining' | 'shopping' | 'other')
      : getAllPrograms();

    // Apply search filter if provided
    if (search) {
      const searchTerm = search.toLowerCase();
      programs = programs.filter(program =>
        program.name.toLowerCase().includes(searchTerm) ||
        program.pointsName.toLowerCase().includes(searchTerm) ||
        program.category.toLowerCase().includes(searchTerm)
      );
    }

    return NextResponse.json({
      success: true,
      data: programs,
      total: programs.length
    });

  } catch (error) {
    console.error('Error in loyalty programs API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
