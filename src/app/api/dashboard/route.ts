import { NextResponse } from 'next/server';
import { fetchDashboardData } from '@/lib/api';

export async function GET() {
  try {
    const data = await fetchDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// Revalidate every 5 minutes
export const revalidate = 300;
