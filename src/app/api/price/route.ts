import { NextResponse } from 'next/server';
import { fetchBtcPrice } from '@/lib/api';

export async function GET() {
  try {
    const data = await fetchBtcPrice();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    );
  }
}
