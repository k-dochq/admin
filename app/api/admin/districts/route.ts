import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const districts = await prisma.district.findMany({
      select: {
        id: true,
        name: true,
        countryCode: true,
      },
      orderBy: [{ countryCode: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
