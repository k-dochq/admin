import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  DeleteNoticeFileUseCase,
  NoticeRepository,
  type DeleteNoticeFileRequest,
} from '@/features/notice-management/api';

const noticeRepository = new NoticeRepository();
const deleteNoticeFileUseCase = new DeleteNoticeFileUseCase(noticeRepository);

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface RouteParams {
  params: Promise<{ id: string; fileId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id, fileId } = await params;

    // 먼저 파일 정보를 조회하여 Supabase Storage에서 삭제할 파일 경로를 얻습니다
    const file = await noticeRepository
      .getNoticeFiles(id)
      .then((files) => files.find((f) => f.id === fileId));

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: '파일을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    // Supabase Storage에서 파일 삭제
    const filePath = file.fileUrl.split('/').slice(-3).join('/'); // notices/{id}/{filename} 추출
    const { error: storageError } = await supabase.storage.from('files').remove([filePath]);

    if (storageError) {
      console.error('Supabase storage delete error:', storageError);
      // Storage 삭제 실패해도 DB에서 삭제는 진행 (이미 삭제된 파일일 수 있음)
    }

    // 데이터베이스에서 파일 정보 삭제
    const requestData: DeleteNoticeFileRequest = {
      noticeId: id,
      fileId,
    };

    await deleteNoticeFileUseCase.execute(requestData);

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
