/**
 * Bonuses API Route
 * 
 * Returns active welcome bonuses and elevated offers from the TOML database.
 * Used by DealOfTheDay component and other promotional displays.
 * 
 * @module api/bonuses
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import TOML from 'toml';
import logger from '@/lib/logger';

const log = logger.child({ component: 'api-bonuses' });

interface ElevatedBonus {
  card_id: string;
  bonus_amount: number;
  bonus_type: string;
  spend_required?: number;
  time_months?: number;
  start_date: string;
  end_date: string;
  offer_url?: string;
  notes?: string;
  via_referral?: boolean;
}

interface CardMeta {
  issuer: string;
  issuer_code: string;
}

interface CardInfo {
  name: string;
  annual_fee: number;
}

interface BonusResponse {
  id: string;
  cardName: string;
  cardIssuer: string;
  bonusAmount: number;
  bonusType: 'points' | 'miles' | 'cashback';
  estimatedValue: number;
  spendRequired?: number;
  timeMonths?: number;
  deadline?: string;
  notes?: string;
  offerUrl?: string;
  viaReferral?: boolean;
}

// Point value estimates in cents per point
const POINT_VALUES: Record<string, number> = {
  'chase': 2.0,        // Ultimate Rewards
  'amex': 2.0,         // Membership Rewards
  'capital-one': 1.85, // Capital One miles
  'citi': 1.8,         // ThankYou Points
  'wells-fargo': 1.5,  // Autograph points
  'default': 1.25,
};

function estimateValue(bonus: ElevatedBonus, issuerCode: string): number {
  const cpp = (POINT_VALUES[issuerCode] || POINT_VALUES.default) / 100;
  
  if (bonus.bonus_type === 'cash' || bonus.bonus_type === 'cashback') {
    return bonus.bonus_amount;
  }
  
  return Math.round(bonus.bonus_amount * cpp);
}

function normalizeType(type: string): 'points' | 'miles' | 'cashback' {
  const t = type.toLowerCase();
  if (t === 'cash' || t === 'cashback') return 'cashback';
  if (t === 'miles') return 'miles';
  return 'points';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const sortBy = searchParams.get('sortBy') || 'value';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Load current offers
    const offersPath = path.join(process.cwd(), 'config', 'offers', 'current-offers.toml');
    
    if (!fs.existsSync(offersPath)) {
      log.warn('Offers file not found', { path: offersPath });
      return NextResponse.json({ success: true, data: [] });
    }

    const offersContent = fs.readFileSync(offersPath, 'utf-8');
    const offersData = TOML.parse(offersContent);

    // Load card data to get card names and issuers
    const cardsDir = path.join(process.cwd(), 'config', 'cards');
    const cardFiles = fs.readdirSync(cardsDir).filter(f => f.endsWith('.toml'));
    
    const cardInfo: Record<string, { name: string; issuer: string; issuerCode: string }> = {};
    
    for (const file of cardFiles) {
      try {
        const content = fs.readFileSync(path.join(cardsDir, file), 'utf-8');
        const data = TOML.parse(content);
        const meta = data.meta as CardMeta | undefined;
        const cards = data.cards as Record<string, CardInfo> | undefined;
        
        if (meta && cards) {
          for (const [cardKey, card] of Object.entries(cards)) {
            cardInfo[cardKey] = {
              name: card.name,
              issuer: meta.issuer,
              issuerCode: meta.issuer_code,
            };
          }
        }
      } catch (err) {
        log.warn('Failed to parse card file', { file, error: String(err) });
      }
    }

    // Process elevated bonuses
    const elevatedBonuses = offersData.elevated_bonuses as Record<string, ElevatedBonus> | undefined;
    const now = new Date();
    
    const bonuses: BonusResponse[] = [];
    
    if (elevatedBonuses) {
      for (const [key, bonus] of Object.entries(elevatedBonuses)) {
        const cardId = bonus.card_id || key;
        const card = cardInfo[cardId];
        
        // Filter by status
        if (status === 'active') {
          const startDate = new Date(bonus.start_date);
          const endDate = new Date(bonus.end_date);
          
          if (now < startDate || now > endDate) {
            continue;
          }
        }
        
        const issuerCode = card?.issuerCode || 'default';
        
        bonuses.push({
          id: key,
          cardName: card?.name || cardId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          cardIssuer: card?.issuer || 'Unknown',
          bonusAmount: bonus.bonus_amount,
          bonusType: normalizeType(bonus.bonus_type),
          estimatedValue: estimateValue(bonus, issuerCode),
          spendRequired: bonus.spend_required,
          timeMonths: bonus.time_months,
          deadline: bonus.end_date,
          notes: bonus.notes,
          offerUrl: bonus.offer_url,
          viaReferral: bonus.via_referral,
        });
      }
    }

    // Sort bonuses
    bonuses.sort((a, b) => {
      let aVal: number;
      let bVal: number;
      
      switch (sortBy) {
        case 'value':
          aVal = a.estimatedValue;
          bVal = b.estimatedValue;
          break;
        case 'amount':
          aVal = a.bonusAmount;
          bVal = b.bonusAmount;
          break;
        case 'deadline':
          aVal = a.deadline ? new Date(a.deadline).getTime() : 0;
          bVal = b.deadline ? new Date(b.deadline).getTime() : 0;
          break;
        default:
          aVal = a.estimatedValue;
          bVal = b.estimatedValue;
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Apply limit
    const result = bonuses.slice(0, limit);

    log.info('Bonuses retrieved', { count: result.length, status, sortBy });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        total: bonuses.length,
        returned: result.length,
        status,
        sortBy,
        sortOrder,
      },
    });

  } catch (error) {
    log.error('Failed to fetch bonuses', { error: String(error) });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bonuses' },
      { status: 500 }
    );
  }
}
