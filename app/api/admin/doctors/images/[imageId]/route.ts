import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 의사 이미지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> },
) {
  try {
    const { imageId } = await params;

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: '이미지 ID가 필요합니다.' },
        { status: 400 },
      );
    }

    // 이미지 존재 확인 및 조회
    const image = await prisma.doctorImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json(
        { success: false, error: '이미지를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 이미지 삭제
    await prisma.doctorImage.delete({
      where: { id: imageId },
    });

    // 스토리지 경로 반환 (클라이언트에서 스토리지 삭제용)
    return NextResponse.json({
      success: true,
      storagePath: image.imageUrl.split('/').slice(-3).join('/'), // doctors/{doctorId}/{imageType}/{filename}
    });
  } catch (error) {
    console.error('의사 이미지 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '의사 이미지를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
