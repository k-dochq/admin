import { NextRequest, NextResponse } from 'next/server';
import { NoticeRepository } from '@/features/notice-management/api/infrastructure/repositories';
import { DeleteNoticeFileUseCase } from '@/features/notice-management/api/use-cases';

const noticeRepository = new NoticeRepository();
const deleteNoticeFileUseCase = new DeleteNoticeFileUseCase(noticeRepository);

interface RouteParams {
  params: Promise<{ id: string; fileId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id, fileId } = await params;

    // 데이터베이스에서 파일 정보 삭제
    await deleteNoticeFileUseCase.execute({
      noticeId: id,
      fileId,
    });

    return NextResponse.json({
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '파일 삭제에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
