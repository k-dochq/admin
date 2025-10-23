import { BannerRepository } from '../infrastructure/repositories/banner-repository';
import { type UpdateBannerRequest, type MultilingualTitle } from '../entities/types';

export class UpdateBannerUseCase {
  constructor(private bannerRepository: BannerRepository) {}

  async execute(data: UpdateBannerRequest) {
    const { id, ...updateData } = data;

    if (!id) {
      throw new Error('Banner ID is required');
    }

    // 기존 배너 존재 확인
    const existingBanner = await this.bannerRepository.findById(id);
    if (!existingBanner) {
      throw new Error('Banner not found');
    }

    // 유효성 검증
    if (updateData.title) {
      this.validateTitle(updateData.title);
    }

    if (updateData.endDate && updateData.startDate && updateData.endDate <= updateData.startDate) {
      throw new Error('End date must be after start date');
    }

    return this.bannerRepository.update(id, updateData);
  }

  private validateTitle(title: MultilingualTitle) {
    if (!title.ko || !title.en || !title.th) {
      throw new Error('Title is required for all languages');
    }
  }
}
