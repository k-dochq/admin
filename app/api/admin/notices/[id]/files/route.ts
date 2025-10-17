import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  UploadNoticeFileUseCase,
  DeleteNoticeFileUseCase,
  NoticeRepository,
  type UploadNoticeFileRequest,
  type DeleteNoticeFileRequest,
} from '@/features/notice-management/api';

const noticeRepository = new NoticeRepository();
const uploadNoticeFileUseCase = new UploadNoticeFileUseCase(noticeRepository);
const deleteNoticeFileUseCase = new DeleteNoticeFileUseCase(noticeRepository);

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;
    const alt = formData.get('alt') as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: '파일이 필요합니다.',
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

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: '파일 크기는 10MB를 초과할 수 없습니다.',
        },
        { status: 400 },
      );
    }

    // 파일 확장자 검증
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedAttachmentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
    ];

    const isImage = fileType === 'IMAGE';
    const allowedTypes = isImage ? allowedImageTypes : allowedAttachmentTypes;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: isImage
            ? '이미지 파일만 업로드할 수 있습니다. (JPEG, PNG, GIF, WebP)'
            : '지원되는 첨부파일 형식이 아닙니다. (PDF, DOC, DOCX, TXT, ZIP, RAR)',
        },
        { status: 400 },
      );
    }

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `notices/${id}/${fileName}`;

    // Supabase Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        {
          success: false,
          error: '파일 업로드에 실패했습니다.',
        },
        { status: 500 },
      );
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage.from('files').getPublicUrl(filePath);

    // 데이터베이스에 파일 정보 저장
    const requestData: UploadNoticeFileRequest = {
      noticeId: id,
      fileType: fileType as 'IMAGE' | 'ATTACHMENT',
      fileName: file.name,
      fileUrl: urlData.publicUrl,
      fileSize: file.size,
      mimeType: file.type,
      alt: alt || file.name,
      order: 0, // 기본값
    };

    const savedFile = await uploadNoticeFileUseCase.execute(requestData);

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
