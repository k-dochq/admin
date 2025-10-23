import { prisma } from '@/lib/prisma';
import { type EventBanner, type EventBannerImage, type EventBannerLocale } from '@prisma/client';
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
    orderBy?: 'createdAt' | 'order' | 'startDate';
    orderDirection?: 'asc' | 'desc';
  }) {
    const { page, limit, isActive, orderBy = 'order', orderDirection = 'asc' } = params;
    const skip = (page - 1) * limit;

    const where: {
      isActive?: boolean;
    } = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
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
    const banner = await prisma.eventBanner.create({
      data: {
        title: data.title,
        linkUrl: data.linkUrl,
        order: data.order,
        isActive: data.isActive,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      include: {
        bannerImages: true,
      },
    });

    return banner as EventBannerWithImages;
  }

  async update(id: string, data: Partial<CreateBannerRequest>): Promise<EventBannerWithImages> {
    const banner = await prisma.eventBanner.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
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
