import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const medicalSpecialties = await prisma.medicalSpecialty.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        specialtyType: true,
        order: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(medicalSpecialties);
  } catch (error) {
    console.error('Error fetching medical specialties:', error);
    return NextResponse.json({ error: 'Failed to fetch medical specialties' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
