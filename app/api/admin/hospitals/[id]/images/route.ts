import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  type HospitalImageType,
  IMAGE_TYPE_LIMITS,
} from '@/features/hospital-edit/api/entities/types';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: hospitalId } = await params;

    // JSON 데이터에서 메타데이터 추출 (클라이언트에서 이미 업로드 완료된 상태)
    const body = await request.json();
    const { imageType, imageUrl, alt, order, localizedLinks } = body;

    if (!imageType || !Object.keys(IMAGE_TYPE_LIMITS).includes(imageType)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 이미지 타입입니다.' },
        { status: 400 },
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: '이미지 URL이 제공되지 않았습니다.' },
        { status: 400 },
      );
    }

    // 병원 존재 확인
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      return NextResponse.json(
        { success: false, error: '병원을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 해당 타입의 기존 이미지 개수 확인
    const existingImagesCount = await prisma.hospitalImage.count({
      where: {
        hospitalId,
        imageType,
        isActive: true,
      },
    });

    const limit = IMAGE_TYPE_LIMITS[imageType as HospitalImageType];
    if (existingImagesCount >= limit) {
      return NextResponse.json(
        {
          success: false,
          error: `${imageType} 타입은 최대 ${limit}장까지만 업로드할 수 있습니다.`,
        },
        { status: 400 },
      );
    }

    // 데이터베이스에 이미지 정보 저장
    const hospitalImage = await prisma.hospitalImage.create({
      data: {
        hospitalId,
        imageType,
        imageUrl,
        alt: alt || null,
        order: order || null,
        localizedLinks: localizedLinks || null,
      },
    });

    return NextResponse.json({
      success: true,
      hospitalImage,
      imageUrl,
    });
  } catch (error) {
    console.error('Hospital image save error:', error);
    return NextResponse.json(
      { success: false, error: '이미지 정보 저장 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: hospitalId } = await params;

    const hospitalImages = await prisma.hospitalImage.findMany({
      where: {
        hospitalId,
        isActive: true,
      },
      orderBy: [{ imageType: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      hospitalImages,
    });
  } catch (error) {
    console.error('Hospital images fetch error:', error);
    return NextResponse.json(
      { success: false, error: '이미지 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
