import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  type HospitalImageType,
  type LocalizedText,
  IMAGE_TYPE_LIMITS,
} from '@/features/hospital-edit/api/entities/types';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: hospitalId } = await params;

    // JSON 데이터에서 메타데이터 추출 (클라이언트에서 이미 업로드 완료된 상태)
    const body = await request.json();
    const { imageType, imageUrl, alt, order, localizedLinks, title } = body;

    if (!imageType || !Object.keys(IMAGE_TYPE_LIMITS).includes(imageType)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 이미지 타입입니다.' },
        { status: 400 },
      );
    }

    // PROCEDURE_DETAIL, VIDEO_THUMBNAIL, VIDEO 타입의 경우 upsert 방식으로 처리
    const isLocalizedImageType = ['PROCEDURE_DETAIL', 'VIDEO_THUMBNAIL', 'VIDEO'].includes(
      imageType,
    );

    // localizedLinks가 없는 경우에만 imageUrl 검증
    if (!isLocalizedImageType || !localizedLinks) {
      if (!imageUrl) {
        return NextResponse.json(
          { success: false, error: '이미지 URL이 제공되지 않았습니다.' },
          { status: 400 },
        );
      }
    }

    // localizedLinks가 있는 경우, 최소한 하나의 URL이 있어야 함
    if (isLocalizedImageType && localizedLinks) {
      const links = localizedLinks as LocalizedText;
      const hasAnyUrl =
        links.en_US ||
        links.ko_KR ||
        links.th_TH ||
        links.zh_TW ||
        links.ja_JP ||
        links.hi_IN ||
        links.tl_PH ||
        links.ar_SA ||
        links.ru_RU ||
        imageUrl;
      if (!hasAnyUrl) {
        return NextResponse.json(
          { success: false, error: '이미지 URL이 제공되지 않았습니다.' },
          { status: 400 },
        );
      }
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

    if (isLocalizedImageType && localizedLinks) {
      // 같은 이미지 타입의 기존 레코드 찾기 (localizedLinks가 있는 레코드 우선)
      // 먼저 모든 레코드를 가져와서 localizedLinks가 있는 것 중 가장 오래된 것 선택
      const allImages = await prisma.hospitalImage.findMany({
        where: {
          hospitalId,
          imageType,
          isActive: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      // localizedLinks가 있는 레코드 우선 선택
      const existingImage =
        allImages.find((img) => img.localizedLinks !== null) || allImages[0] || null;

      if (existingImage) {
        // 기존 localizedLinks 가져오기
        const existingLocalizedLinks =
          (existingImage.localizedLinks as LocalizedText | null) || ({} as LocalizedText);

        // 새로운 localizedLinks와 병합
        const mergedLocalizedLinks: LocalizedText = {
          ...existingLocalizedLinks,
          ...(localizedLinks as LocalizedText),
        };

        // imageUrl 결정: 영어 우선, 없으면 다른 언어
        const finalImageUrl =
          mergedLocalizedLinks.en_US ||
          mergedLocalizedLinks.ko_KR ||
          mergedLocalizedLinks.th_TH ||
          mergedLocalizedLinks.zh_TW ||
          mergedLocalizedLinks.ja_JP ||
          mergedLocalizedLinks.hi_IN ||
          mergedLocalizedLinks.tl_PH ||
          mergedLocalizedLinks.ar_SA ||
          mergedLocalizedLinks.ru_RU ||
          imageUrl;

        // title 병합 (기존 title에 새 title 덮어쓰기)
        const existingTitle =
          (existingImage.title as LocalizedText | null) || ({} as LocalizedText);
        const mergedTitle: LocalizedText = title
          ? { ...existingTitle, ...(title as LocalizedText) }
          : existingTitle;

        // 기존 레코드 업데이트
        const hospitalImage = await prisma.hospitalImage.update({
          where: { id: existingImage.id },
          data: {
            imageUrl: finalImageUrl,
            localizedLinks: mergedLocalizedLinks,
            title: Object.keys(mergedTitle).length > 0 ? mergedTitle : Prisma.JsonNull,
            alt: alt || null,
            order: order || existingImage.order,
          },
        });

        return NextResponse.json({
          success: true,
          hospitalImage,
          imageUrl: finalImageUrl,
        });
      }
    }

    // 기존 레코드가 없거나 localizedLinks가 없는 경우 새로 생성
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

    // imageUrl 결정: localizedLinks가 있으면 영어 우선, 없으면 전달받은 imageUrl
    let finalImageUrl = imageUrl;
    if (isLocalizedImageType && localizedLinks) {
      const links = localizedLinks as LocalizedText;
      finalImageUrl =
        links.en_US || links.ko_KR || links.th_TH || links.zh_TW || links.ja_JP || imageUrl;
    }

    // title: LocalizedText 형태면 그대로, 빈 객체면 Prisma.JsonNull
    const titleToSave =
      title && typeof title === 'object' && Object.keys(title).length > 0
        ? title
        : Prisma.JsonNull;

    // 데이터베이스에 이미지 정보 저장
    const hospitalImage = await prisma.hospitalImage.create({
      data: {
        hospitalId,
        imageType,
        imageUrl: finalImageUrl,
        alt: alt || null,
        order: order || null,
        localizedLinks: localizedLinks || null,
        title: titleToSave,
      },
    });

    return NextResponse.json({
      success: true,
      hospitalImage,
      imageUrl: finalImageUrl,
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
