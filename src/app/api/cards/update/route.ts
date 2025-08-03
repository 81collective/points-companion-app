import { NextRequest, NextResponse } from 'next/server';
import { CardDataUpdater } from '@/lib/cardDataUpdater';

export async function POST(request: NextRequest) {
  try {
    // Get latest card data
    const latestCards = await CardDataUpdater.fetchLatestCards();
    
    // Update the database
    await CardDataUpdater.updateDatabase();
    
    // Get current quarterly categories
    const quarterlyCategories = await CardDataUpdater.getCurrentQuarterlyCategories();
    
    return NextResponse.json({
      success: true,
      message: 'Card database updated successfully',
      data: {
        cardsUpdated: latestCards.length,
        quarterlyCategories,
        lastUpdated: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error updating card database:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update card database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get latest card data without updating
    const latestCards = await CardDataUpdater.fetchLatestCards();
    
    return NextResponse.json({
      success: true,
      data: {
        cards: latestCards,
        count: latestCards.length,
        lastChecked: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching card data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch card data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
