import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const medicalSpecialties = await prisma.medicalSpecialty.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({
      medicalSpecialties,
    });
  } catch (error) {
    console.error('Error fetching medical specialties:', error);
    return NextResponse.json({ error: 'Failed to fetch medical specialties' }, { status: 500 });
  }
}
