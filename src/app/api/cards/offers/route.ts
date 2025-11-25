/**
 * API Endpoint: Update Card Offers
 * 
 * POST /api/cards/offers - Update current offers from external feed
 * GET /api/cards/offers - Get all active offers
 * 
 * This endpoint allows programmatic updates to the offers database
 * without requiring code deployments.
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import TOML from 'toml';
import { logger } from '@/lib/logger';

// Simple auth check - in production, use proper API key validation
const API_KEY = process.env.CARD_OFFERS_API_KEY;

interface OfferUpdate {
  type: 'elevated_bonus' | 'spending_promo' | 'merchant_offer' | 'transfer_bonus';
  key: string;
  data: Record<string, unknown>;
}

interface BulkUpdate {
  source: string;
  timestamp: string;
  updates: OfferUpdate[];
}

// GET - Retrieve current offers
export async function GET() {
  try {
    const offersPath = path.join(process.cwd(), 'config', 'offers', 'current-offers.toml');
    
    if (!fs.existsSync(offersPath)) {
      return NextResponse.json({ error: 'Offers file not found' }, { status: 404 });
    }
    
    const content = fs.readFileSync(offersPath, 'utf-8');
    const offers = TOML.parse(content);
    
    // Filter to only active offers
    const now = new Date();
    const filterActive = (obj: Record<string, Record<string, unknown>> | undefined) => {
      if (!obj) return {};
      return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => {
          const start = v.start_date ? new Date(v.start_date as string) : new Date(0);
          const end = v.end_date ? new Date(v.end_date as string) : new Date('2099-12-31');
          return now >= start && now <= end;
        })
      );
    };
    
    const activeOffers = {
      meta: offers.meta,
      elevated_bonuses: filterActive(offers.elevated_bonuses),
      spending_promos: filterActive(offers.spending_promos),
      amex_offers: filterActive(offers.amex_offers),
      chase_offers: filterActive(offers.chase_offers),
      transfer_bonuses: filterActive(offers.transfer_bonuses),
    };
    
    return NextResponse.json({
      success: true,
      data: activeOffers,
      counts: {
        elevated_bonuses: Object.keys(activeOffers.elevated_bonuses).length,
        spending_promos: Object.keys(activeOffers.spending_promos).length,
        merchant_offers: Object.keys(activeOffers.amex_offers).length + Object.keys(activeOffers.chase_offers).length,
        transfer_bonuses: Object.keys(activeOffers.transfer_bonuses).length,
      },
    });
  } catch (error) {
    logger.error('Error reading offers', { error, route: '/api/cards/offers' });
    return NextResponse.json({ error: 'Failed to read offers' }, { status: 500 });
  }
}

// POST - Update offers (requires API key)
export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const authHeader = request.headers.get('authorization');
    const providedKey = authHeader?.replace('Bearer ', '');
    
    if (!API_KEY || providedKey !== API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body: BulkUpdate = await request.json();
    
    if (!body.updates || !Array.isArray(body.updates)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const offersPath = path.join(process.cwd(), 'config', 'offers', 'current-offers.toml');
    
    // Read existing offers
    let existingContent = '';
    if (fs.existsSync(offersPath)) {
      existingContent = fs.readFileSync(offersPath, 'utf-8');
    }
    
    const existing = existingContent ? TOML.parse(existingContent) : {};
    
    // Apply updates
    let updatedCount = 0;
    for (const update of body.updates) {
      const section = getSectionForType(update.type);
      if (!section) continue;
      
      if (!existing[section]) {
        existing[section] = {};
      }
      
      existing[section][update.key] = update.data;
      updatedCount++;
    }
    
    // Update meta
    existing.meta = {
      ...existing.meta,
      last_updated: new Date().toISOString(),
      source: body.source || 'api_feed',
    };
    
    // Write back as TOML
    const newContent = objectToTOML(existing);
    fs.writeFileSync(offersPath, newContent, 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} offers`,
      timestamp: existing.meta.last_updated,
    });
  } catch (error) {
    logger.error('Error updating offers', { error, route: '/api/cards/offers' });
    return NextResponse.json({ error: 'Failed to update offers' }, { status: 500 });
  }
}

function getSectionForType(type: string): string | null {
  switch (type) {
    case 'elevated_bonus':
      return 'elevated_bonuses';
    case 'spending_promo':
      return 'spending_promos';
    case 'merchant_offer':
      return 'amex_offers'; // Or chase_offers based on data
    case 'transfer_bonus':
      return 'transfer_bonuses';
    default:
      return null;
  }
}

/**
 * Simple object to TOML converter
 * Note: For production, use a proper TOML serializer library
 */
function objectToTOML(obj: Record<string, unknown>, prefix = ''): string {
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // Check if it's a simple object or needs a section header
      const hasNestedObjects = Object.values(value).some(
        v => typeof v === 'object' && v !== null && !Array.isArray(v)
      );
      
      if (hasNestedObjects || prefix === '') {
        lines.push(`\n[${fullKey}]`);
        lines.push(objectToTOML(value as Record<string, unknown>, '').trim());
      } else {
        // Inline table for simple objects
        lines.push(`\n[${fullKey}]`);
        for (const [k, v] of Object.entries(value)) {
          lines.push(formatTOMLValue(k, v));
        }
      }
    } else {
      lines.push(formatTOMLValue(key, value));
    }
  }
  
  return lines.join('\n');
}

function formatTOMLValue(key: string, value: unknown): string {
  if (typeof value === 'string') {
    return `${key} = "${value}"`;
  } else if (typeof value === 'number') {
    return `${key} = ${value}`;
  } else if (typeof value === 'boolean') {
    return `${key} = ${value}`;
  } else if (Array.isArray(value)) {
    const items = value.map(v => typeof v === 'string' ? `"${v}"` : String(v));
    return `${key} = [${items.join(', ')}]`;
  } else if (value instanceof Date) {
    return `${key} = ${value.toISOString().split('T')[0]}`;
  }
  return '';
}
