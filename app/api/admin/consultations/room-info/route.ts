import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseLocalizedText, getKoreanText } from '@/lib/types/consultation';
import { type AdminChatApiResponse } from '@/lib/types/admin-chat';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');
    const userId = searchParams.get('userId');

    if (!hospitalId || !userId) {
      return NextResponse.json(
        { success: false, error: 'hospitalId and userId are required' } as AdminChatApiResponse,
        { status: 400 },
      );
    }

    // 병원 정보 조회 (시술부위 포함)
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: {
        id: true,
        name: true,
        hospitalImages: {
          where: {
            imageType: 'THUMBNAIL',
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
          take: 1,
        },
        hospitalSpecialties: {
          include: {
            medicalSpecialty: true,
          },
        },
      },
    });

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        name: true,
        email: true,
      },
    });

    if (!hospital || !user) {
      return NextResponse.json(
        { success: false, error: 'Hospital or user not found' } as AdminChatApiResponse,
        { status: 404 },
      );
    }

    // 시술부위 정보 추출 및 정렬
    const medicalSpecialties = hospital.hospitalSpecialties
      .map((hs) => ({
        id: hs.medicalSpecialty.id,
        specialtyType: hs.medicalSpecialty.specialtyType,
        name: getKoreanText(parseLocalizedText(hs.medicalSpecialty.name)),
        order: hs.medicalSpecialty.order ?? 0,
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(({ id, specialtyType, name }) => ({ id, specialtyType, name }));

    // 썸네일 이미지 URL 추출
    const hospitalImageUrl =
      hospital.hospitalImages.length > 0 ? hospital.hospitalImages[0].imageUrl : null;

    const response: AdminChatApiResponse = {
      success: true,
      data: {
        hospitalName: getKoreanText(parseLocalizedText(hospital.name)),
        userName: user.displayName || user.name || '사용자',
        userEmail: user.email || null,
        hospitalImageUrl,
        medicalSpecialties,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in admin room info API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as AdminChatApiResponse,
      { status: 500 },
    );
  }
}
