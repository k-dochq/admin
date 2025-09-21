import { NextResponse } from 'next/server';
import { getMonthlyUserStats } from '@/lib/queries/dashboard';

export async function GET() {
  try {
    const stats = await getMonthlyUserStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching monthly user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly user stats' }, { status: 500 });
  }
}
