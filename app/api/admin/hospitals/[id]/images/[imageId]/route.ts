import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  try {
    const { id: hospitalId, imageId } = await params;

    // 이미지 정보 조회
    const hospitalImage = await prisma.hospitalImage.findFirst({
      where: {
        id: imageId,
        hospitalId,
        isActive: true,
      },
    });

    if (!hospitalImage) {
      return NextResponse.json(
        { success: false, error: '이미지를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // URL에서 스토리지 경로 추출하여 반환 (클라이언트에서 삭제 처리)
    const url = new URL(hospitalImage.imageUrl);
    const pathParts = url.pathname.split('/');
    const storagePathIndex = pathParts.findIndex((part) => part === 'kdoc-storage');

    let storagePath = '';
    if (storagePathIndex !== -1) {
      storagePath = pathParts.slice(storagePathIndex + 1).join('/');
    }

    // 데이터베이스에서 이미지 정보 삭제 (soft delete)
    await prisma.hospitalImage.update({
      where: { id: imageId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: '이미지가 성공적으로 삭제되었습니다.',
      storagePath, // 클라이언트에서 스토리지 삭제에 사용
    });
  } catch (error) {
    console.error('Hospital image delete error:', error);
    return NextResponse.json(
      { success: false, error: '이미지 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
