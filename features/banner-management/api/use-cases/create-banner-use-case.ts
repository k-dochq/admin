import { BannerRepository } from '../infrastructure/repositories/banner-repository';
import { type CreateBannerRequest } from '../entities/types';

export class CreateBannerUseCase {
  constructor(private bannerRepository: BannerRepository) {}

  async execute(data: CreateBannerRequest) {
    // 유효성 검증
    this.validateBannerData(data);

    // 중복 순서 체크 (선택사항)
    // const existingBanner = await this.bannerRepository.findByOrder(data.order);
    // if (existingBanner) {
    //   throw new Error('Banner with this order already exists');
    // }

    return this.bannerRepository.create(data);
  }

  private validateBannerData(data: CreateBannerRequest) {
    if (!data.title || !data.title.ko || !data.title.en || !data.title.th) {
      throw new Error('Title is required for all languages');
    }

    if (!data.linkUrl) {
      throw new Error('Link URL is required');
    }

    if (data.order < 0) {
      throw new Error('Order must be non-negative');
    }

    if (data.endDate && data.endDate <= data.startDate) {
      throw new Error('End date must be after start date');
    }
  }
}
