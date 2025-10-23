import { prisma } from '@/lib/prisma';
import { type EventBannerImage, type EventBannerLocale } from '@prisma/client';
import { type EventBannerImageWithBanner } from '../../entities/types';

export class BannerImageRepository {
  async findByBannerId(bannerId: string): Promise<EventBannerImage[]> {
    return prisma.eventBannerImage.findMany({
      where: { bannerId },
      orderBy: { locale: 'asc' },
    });
  }

  async findByBannerIdAndLocale(
    bannerId: string,
    locale: EventBannerLocale,
  ): Promise<EventBannerImage | null> {
    return prisma.eventBannerImage.findUnique({
      where: {
        bannerId_locale: {
          bannerId,
          locale,
        },
      },
    });
  }

  async create(data: {
    bannerId: string;
    locale: EventBannerLocale;
    imageUrl: string;
    alt?: string;
  }): Promise<EventBannerImageWithBanner> {
    const image = await prisma.eventBannerImage.create({
      data,
      include: {
        banner: true,
      },
    });

    return image as EventBannerImageWithBanner;
  }

  async update(
    id: string,
    data: {
      imageUrl?: string;
      alt?: string;
    },
  ): Promise<EventBannerImageWithBanner> {
    const image = await prisma.eventBannerImage.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        banner: true,
      },
    });

    return image as EventBannerImageWithBanner;
  }

  async delete(id: string): Promise<void> {
    await prisma.eventBannerImage.delete({
      where: { id },
    });
  }

  async deleteByBannerId(bannerId: string): Promise<void> {
    await prisma.eventBannerImage.deleteMany({
      where: { bannerId },
    });
  }

  async upsert(data: {
    bannerId: string;
    locale: EventBannerLocale;
    imageUrl: string;
    alt?: string;
  }): Promise<EventBannerImageWithBanner> {
    const image = await prisma.eventBannerImage.upsert({
      where: {
        bannerId_locale: {
          bannerId: data.bannerId,
          locale: data.locale,
        },
      },
      update: {
        imageUrl: data.imageUrl,
        alt: data.alt,
        updatedAt: new Date(),
      },
      create: data,
      include: {
        banner: true,
      },
    });

    return image as EventBannerImageWithBanner;
  }
}
