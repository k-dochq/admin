import { NextResponse } from 'next/server';
import { getMonthlyReviewStats } from '@/lib/queries/dashboard';

export async function GET() {
  try {
    const stats = await getMonthlyReviewStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching monthly review stats:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly review stats' }, { status: 500 });
  }
}
