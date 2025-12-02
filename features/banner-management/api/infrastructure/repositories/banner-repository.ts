import { prisma } from '@/lib/prisma';
import {
  type EventBanner,
  type EventBannerImage,
  type EventBannerLocale,
  type EventBannerType,
  Prisma,
} from '@prisma/client';
import {
  type EventBannerWithImages,
  type CreateBannerRequest,
  type UpdateBannerRequest,
} from '../../entities/types';

export class BannerRepository {
  async findAll(params: {
    page: number;
    limit: number;
    isActive?: boolean;
    type?: EventBannerType;
    orderBy?: 'createdAt' | 'order' | 'startDate';
    orderDirection?: 'asc' | 'desc';
  }) {
    const { page, limit, isActive, type, orderBy = 'order', orderDirection = 'asc' } = params;
    const skip = (page - 1) * limit;

    const where: {
      isActive?: boolean;
      type?: EventBannerType;
    } = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (type !== undefined) {
      where.type = type;
    }

    const [banners, total] = await Promise.all([
      prisma.eventBanner.findMany({
        where,
        include: {
          bannerImages: true,
        },
        orderBy: {
          [orderBy]: orderDirection,
        },
        skip,
        take: limit,
      }),
      prisma.eventBanner.count({ where }),
    ]);

    return {
      banners: banners as EventBannerWithImages[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<EventBannerWithImages | null> {
    const banner = await prisma.eventBanner.findUnique({
      where: { id },
      include: {
        bannerImages: true,
      },
    });

    return banner as EventBannerWithImages | null;
  }

  async create(data: CreateBannerRequest): Promise<EventBannerWithImages> {
    const trimmedLinkUrl = data.linkUrl?.trim();

    const createData = {
      title: data.title,
      order: data.order,
      isActive: data.isActive,
      startDate: data.startDate,
      endDate: data.endDate,
      type: data.type,
      // linkUrl: nullable 필드 - Prisma Client 타입이 재생성되지 않았을 수 있으므로 타입 체크 우회
      linkUrl: trimmedLinkUrl || null,
    };

    const banner = await prisma.eventBanner.create({
      data: createData,
      include: {
        bannerImages: true,
      },
    });

    return banner as EventBannerWithImages;
  }

  async update(id: string, data: Partial<CreateBannerRequest>): Promise<EventBannerWithImages> {
    // 업데이트할 데이터 구성
    const updateData: Prisma.EventBannerUpdateInput = {
      updatedAt: new Date(),
    };

    // 다른 필드 복사
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.order !== undefined) {
      updateData.order = data.order;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate;
    }

    // linkUrl 처리: 명시적으로 전달된 경우에만 처리
    if ('linkUrl' in data) {
      const trimmedLinkUrl = data.linkUrl?.trim();
      // nullable 필드 - Prisma Client 타입이 재생성되지 않았을 수 있으므로 타입 체크 우회
      updateData.linkUrl = trimmedLinkUrl || null;
    }

    // type 처리: 명시적으로 전달된 경우에만 처리
    if (data.type !== undefined) {
      updateData.type = data.type;
    }

    const banner = await prisma.eventBanner.update({
      where: { id },
      data: updateData,
      include: {
        bannerImages: true,
      },
    });

    return banner as EventBannerWithImages;
  }

  async delete(id: string): Promise<void> {
    await prisma.eventBanner.delete({
      where: { id },
    });
  }

  async updateOrder(id: string, order: number): Promise<EventBannerWithImages> {
    const banner = await prisma.eventBanner.update({
      where: { id },
      data: { order },
      include: {
        bannerImages: true,
      },
    });

    return banner as EventBannerWithImages;
  }

  async toggleActive(id: string): Promise<EventBannerWithImages> {
    const banner = await prisma.eventBanner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new Error('Banner not found');
    }

    return this.update(id, { isActive: !banner.isActive });
  }
}
