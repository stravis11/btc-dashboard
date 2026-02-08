import { NextResponse } from 'next/server';
import { fetchFearGreed } from '@/lib/api';

export async function GET() {
  try {
    const data = await fetchFearGreed();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fear & Greed API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fear & greed data' },
      { status: 500 }
    );
  }
}
