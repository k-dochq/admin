import { NextResponse } from 'next/server';
import { getSpecialtyReviewStats } from '@/lib/queries/dashboard';

export async function GET() {
  try {
    const stats = await getSpecialtyReviewStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching specialty review stats:', error);
    return NextResponse.json({ error: 'Failed to fetch specialty review stats' }, { status: 500 });
  }
}
