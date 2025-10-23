import { BannerRepository } from '../infrastructure/repositories/banner-repository';
import { BannerImageRepository } from '../infrastructure/repositories/banner-image-repository';

export class DeleteBannerUseCase {
  constructor(
    private bannerRepository: BannerRepository,
    private bannerImageRepository: BannerImageRepository,
  ) {}

  async execute(id: string) {
    if (!id) {
      throw new Error('Banner ID is required');
    }

    // 기존 배너 존재 확인
    const existingBanner = await this.bannerRepository.findById(id);
    if (!existingBanner) {
      throw new Error('Banner not found');
    }

    // 관련 이미지들 먼저 삭제
    await this.bannerImageRepository.deleteByBannerId(id);

    // 배너 삭제
    await this.bannerRepository.delete(id);
  }
}
