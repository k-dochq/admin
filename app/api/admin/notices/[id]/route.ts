import { NextRequest, NextResponse } from 'next/server';
import {
  GetNoticeByIdUseCase,
  UpdateNoticeUseCase,
  DeleteNoticeUseCase,
  NoticeRepository,
  type UpdateNoticeRequest,
  type DeleteNoticeRequest,
} from '@/features/notice-management/api';

const noticeRepository = new NoticeRepository();
const getNoticeByIdUseCase = new GetNoticeByIdUseCase(noticeRepository);
const updateNoticeUseCase = new UpdateNoticeUseCase(noticeRepository);
const deleteNoticeUseCase = new DeleteNoticeUseCase(noticeRepository);

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;

    const notice = await getNoticeByIdUseCase.execute(id);

    if (!notice) {
      return NextResponse.json(
        {
          success: false,
          error: '공지사항을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '공지사항을 불러오는데 실패했습니다.',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, type, isActive, updatedBy } = body;

    // 다국어 필드 검증
    if (title && !title.ko_KR && !title.en_US && !title.th_TH) {
      return NextResponse.json(
        {
          success: false,
          error: '최소 하나의 언어로 제목을 입력해주세요.',
        },
        { status: 400 },
      );
    }

    if (content && !content.ko_KR && !content.en_US && !content.th_TH) {
      return NextResponse.json(
        {
          success: false,
          error: '최소 하나의 언어로 내용을 입력해주세요.',
        },
        { status: 400 },
      );
    }

    const requestData: UpdateNoticeRequest = {
      id,
      title,
      content,
      type,
      isActive,
      updatedBy,
    };

    await updateNoticeUseCase.execute(requestData);

    return NextResponse.json({
      success: true,
      message: '공지사항이 성공적으로 수정되었습니다.',
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '공지사항 수정에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;

    const requestData: DeleteNoticeRequest = {
      id,
    };

    await deleteNoticeUseCase.execute(requestData);

    return NextResponse.json({
      success: true,
      message: '공지사항이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '공지사항 삭제에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
