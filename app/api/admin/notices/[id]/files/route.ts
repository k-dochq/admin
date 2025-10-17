import { NextRequest, NextResponse } from 'next/server';
import { NoticeRepository } from '@/features/notice-management/api/infrastructure/repositories';
import { UploadNoticeFileUseCase } from '@/features/notice-management/api/use-cases';

const noticeRepository = new NoticeRepository();
const uploadNoticeFileUseCase = new UploadNoticeFileUseCase(noticeRepository);

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;

    // JSON 데이터에서 메타데이터 추출 (클라이언트에서 이미 업로드 완료된 상태)
    const body = await request.json();
    const { fileType, fileName, fileUrl, fileSize, mimeType, alt, order, path } = body;

    // 필수 필드 검증
    if (!fileType || !fileName || !fileUrl) {
      return NextResponse.json(
        {
          success: false,
          error: '파일 타입, 파일명, 파일 URL은 필수입니다.',
        },
        { status: 400 },
      );
    }

    // 파일 타입 검증
    if (!['IMAGE', 'ATTACHMENT'].includes(fileType)) {
      return NextResponse.json(
        {
          success: false,
          error: '올바른 파일 타입을 선택해주세요.',
        },
        { status: 400 },
      );
    }

    // 공지사항 존재 확인
    const notice = await noticeRepository.getNoticeById(id);
    if (!notice) {
      return NextResponse.json(
        {
          success: false,
          error: '공지사항을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    // 데이터베이스에 파일 정보 저장
    const savedFile = await uploadNoticeFileUseCase.execute({
      noticeId: id,
      fileType: fileType as 'IMAGE' | 'ATTACHMENT',
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      alt,
      order: order || 0,
    });

    return NextResponse.json({
      success: true,
      data: savedFile,
      message: '파일이 성공적으로 업로드되었습니다.',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '파일 업로드에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;

    const files = await noticeRepository.getNoticeFiles(id);

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '파일 목록을 불러오는데 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
