import { NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/queries/dashboard';

export async function GET() {
  try {
    const activities = await getRecentActivity(8);
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json({ error: 'Failed to fetch recent activities' }, { status: 500 });
  }
}
