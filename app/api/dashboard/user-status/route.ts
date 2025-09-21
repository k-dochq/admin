import { NextResponse } from 'next/server';
import { getUserStatusStats } from '@/lib/queries/dashboard';

export async function GET() {
  try {
    const stats = await getUserStatusStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user status stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user status stats' }, { status: 500 });
  }
}
