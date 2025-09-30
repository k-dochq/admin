import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, UserRoleType, UserGenderType, UserLocale, UserStatusType } from '@prisma/client';
import type { CreateReviewRequest } from '@/features/review-management/api/entities/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateReviewRequest = await request.json();

    // 필수 필드 검증
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: '평점은 1-5 사이여야 합니다.' }, { status: 400 });
    }

    if (!body.medicalSpecialtyId) {
      return NextResponse.json({ error: '시술부위를 선택해주세요.' }, { status: 400 });
    }

    if (!body.hospitalId) {
      return NextResponse.json({ error: '병원을 선택해주세요.' }, { status: 400 });
    }

    if (!body.userId && !body.userData) {
      return NextResponse.json({ error: '사용자 정보가 필요합니다.' }, { status: 400 });
    }

    // 시술부위 존재 확인
    const medicalSpecialty = await prisma.medicalSpecialty.findUnique({
      where: { id: body.medicalSpecialtyId },
    });

    if (!medicalSpecialty) {
      return NextResponse.json({ error: '시술부위를 찾을 수 없습니다.' }, { status: 400 });
    }

    // 병원 존재 확인
    const hospital = await prisma.hospital.findUnique({
      where: { id: body.hospitalId },
    });

    if (!hospital) {
      return NextResponse.json({ error: '병원을 찾을 수 없습니다.' }, { status: 400 });
    }

    let userId: string;

    // 사용자 처리
    if (body.userId) {
      // 기존 사용자 사용
      const existingUser = await prisma.user.findUnique({
        where: { id: body.userId },
      });

      if (!existingUser) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 400 });
      }

      userId = body.userId;
    } else if (body.userData) {
      // 새 사용자 생성
      const newUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: body.userData.name,
          displayName: body.userData.displayName,
          email: body.userData.email,
          phoneNumber: body.userData.phoneNumber,
          drRoleType: body.userData.drRoleType as UserRoleType | undefined,
          genderType: body.userData.genderType as UserGenderType | undefined,
          locale: (body.userData.locale as UserLocale) || UserLocale.ko_KR,
          age: body.userData.age,
          userStatusType: (body.userData.userStatusType as UserStatusType) || UserStatusType.ACTIVE,
          advertPush: body.userData.advertPush || false,
          communityAlarm: body.userData.communityAlarm || false,
          postAlarm: body.userData.postAlarm || false,
          collectPersonalInfo: body.userData.collectPersonalInfo || false,
          profileImgUrl: body.userData.profileImgUrl,
        },
      });

      userId = newUser.id;
    } else {
      return NextResponse.json({ error: '사용자 정보가 필요합니다.' }, { status: 400 });
    }

    // 리뷰 생성
    const review = await prisma.review.create({
      data: {
        id: crypto.randomUUID(),
        rating: body.rating,
        title: body.title as Prisma.InputJsonValue,
        content: body.content as Prisma.InputJsonValue,
        concernsMultilingual: body.concernsMultilingual as Prisma.InputJsonValue,
        isRecommended: body.isRecommended || false,
        userId: userId,
        hospitalId: body.hospitalId,
        medicalSpecialtyId: body.medicalSpecialtyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
        medicalSpecialty: {
          select: {
            id: true,
            name: true,
            specialtyType: true,
          },
        },
        reviewImages: {
          orderBy: [{ imageType: 'asc' }, { order: 'asc' }],
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: '리뷰 생성에 실패했습니다.' }, { status: 500 });
  }
}
