import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  type Notice,
  type NoticeFile,
  type NoticeWithFiles,
  type GetNoticesRequest,
  type GetNoticesResponse,
  type CreateNoticeRequest,
  type UpdateNoticeRequest,
  type DeleteNoticeRequest,
  type UploadNoticeFileRequest,
  type DeleteNoticeFileRequest,
} from '../../entities';

export interface INoticeRepository {
  getNotices(request: GetNoticesRequest): Promise<GetNoticesResponse>;
  getNoticeById(id: string): Promise<NoticeWithFiles | null>;
  createNotice(request: CreateNoticeRequest): Promise<Notice>;
  updateNotice(request: UpdateNoticeRequest): Promise<Notice>;
  deleteNotice(request: DeleteNoticeRequest): Promise<void>;
  uploadNoticeFile(request: UploadNoticeFileRequest): Promise<NoticeFile>;
  deleteNoticeFile(request: DeleteNoticeFileRequest): Promise<void>;
  getNoticeFiles(noticeId: string): Promise<NoticeFile[]>;
}

export class NoticeRepository implements INoticeRepository {
  async getNotices(request: GetNoticesRequest): Promise<GetNoticesResponse> {
    const { page, limit, search, isActive } = request;
    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: Prisma.NoticeWhereInput = {};

    if (search) {
      where.OR = [
        { title: { path: ['ko_KR'], string_contains: search } },
        { title: { path: ['en_US'], string_contains: search } },
        { title: { path: ['th_TH'], string_contains: search } },
        { content: { path: ['ko_KR'], string_contains: search } },
        { content: { path: ['en_US'], string_contains: search } },
        { content: { path: ['th_TH'], string_contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 공지사항 목록과 총 개수를 병렬로 조회
    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        include: {
          noticeFiles: {
            where: {
              isActive: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.notice.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      notices,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  async getNoticeById(id: string): Promise<NoticeWithFiles | null> {
    const notice = await prisma.notice.findUnique({
      where: { id },
      include: {
        noticeFiles: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return notice;
  }

  async createNotice(request: CreateNoticeRequest): Promise<Notice> {
    const { title, content, type, isActive = true, createdBy } = request;

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        type,
        isActive,
        createdBy,
        updatedBy: createdBy,
      },
    });

    return notice;
  }

  async updateNotice(request: UpdateNoticeRequest): Promise<Notice> {
    const { id, title, content, type, isActive, updatedBy } = request;

    const updateData: Prisma.NoticeUpdateInput = {};

    if (title !== undefined) {
      updateData.title = title;
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    if (type !== undefined) {
      updateData.type = type;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (updatedBy !== undefined) {
      updateData.updatedBy = updatedBy;
    }

    const notice = await prisma.notice.update({
      where: { id },
      data: updateData,
    });

    return notice;
  }

  async deleteNotice(request: DeleteNoticeRequest): Promise<void> {
    const { id } = request;

    // 트랜잭션으로 관련 파일들과 공지사항을 함께 삭제
    await prisma.$transaction(async (tx) => {
      // 먼저 관련 파일들을 삭제
      await tx.noticeFile.deleteMany({
        where: { noticeId: id },
      });

      // 공지사항 삭제
      await tx.notice.delete({
        where: { id },
      });
    });
  }

  async uploadNoticeFile(request: UploadNoticeFileRequest): Promise<NoticeFile> {
    const { noticeId, fileType, fileName, fileUrl, fileSize, mimeType, alt, order } = request;

    const file = await prisma.noticeFile.create({
      data: {
        noticeId,
        fileType,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
        alt,
        order,
      },
    });

    return file;
  }

  async deleteNoticeFile(request: DeleteNoticeFileRequest): Promise<void> {
    const { noticeId, fileId } = request;

    await prisma.noticeFile.delete({
      where: {
        id: fileId,
        noticeId: noticeId,
      },
    });
  }

  async getNoticeFiles(noticeId: string): Promise<NoticeFile[]> {
    const files = await prisma.noticeFile.findMany({
      where: {
        noticeId,
        isActive: true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return files;
  }
}
