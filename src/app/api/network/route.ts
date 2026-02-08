import { NextResponse } from 'next/server';
import { fetchNetworkStats } from '@/lib/api';

export async function GET() {
  try {
    const data = await fetchNetworkStats();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Network API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network stats' },
      { status: 500 }
    );
  }
}
