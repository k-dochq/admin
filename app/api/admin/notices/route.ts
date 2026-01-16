import { NextRequest, NextResponse } from 'next/server';
import {
  GetNoticesUseCase,
  CreateNoticeUseCase,
  NoticeRepository,
  type GetNoticesRequest,
  type CreateNoticeRequest,
} from '@/features/notice-management/api';

const noticeRepository = new NoticeRepository();
const getNoticesUseCase = new GetNoticesUseCase(noticeRepository);
const createNoticeUseCase = new CreateNoticeUseCase(noticeRepository);

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.get('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined;

    const requestData: GetNoticesRequest = {
      page,
      limit,
      search,
      isActive,
    };

    const result = await getNoticesUseCase.execute(requestData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '공지사항 목록을 불러오는데 실패했습니다.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { title, content, type, isActive = true, createdBy } = body;

    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: '제목과 내용은 필수입니다.',
        },
        { status: 400 },
      );
    }

    // 다국어 필드 검증
    if (
      !title.ko_KR &&
      !title.en_US &&
      !title.th_TH &&
      !title.zh_TW &&
      !title.ja_JP &&
      !title.hi_IN
    ) {
      return NextResponse.json(
        {
          success: false,
          error: '최소 하나의 언어로 제목을 입력해주세요.',
        },
        { status: 400 },
      );
    }

    if (
      !content.ko_KR &&
      !content.en_US &&
      !content.th_TH &&
      !content.zh_TW &&
      !content.ja_JP &&
      !content.hi_IN
    ) {
      return NextResponse.json(
        {
          success: false,
          error: '최소 하나의 언어로 내용을 입력해주세요.',
        },
        { status: 400 },
      );
    }

    const requestData: CreateNoticeRequest = {
      title,
      content,
      type,
      isActive,
      createdBy,
    };

    await createNoticeUseCase.execute(requestData);

    return NextResponse.json({
      success: true,
      message: '공지사항이 성공적으로 생성되었습니다.',
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '공지사항 생성에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
