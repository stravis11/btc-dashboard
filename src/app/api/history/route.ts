import { NextResponse } from 'next/server';
import { fetchPriceHistory } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    // Validate days parameter
    const validDays = [7, 30, 90, 365];
    const actualDays = validDays.includes(days) ? days : 30;
    
    const data = await fetchPriceHistory(actualDays);
    return NextResponse.json(data);
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }
}
