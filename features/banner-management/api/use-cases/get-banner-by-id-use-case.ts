import { BannerRepository } from '../infrastructure/repositories/banner-repository';

export class GetBannerByIdUseCase {
  constructor(private bannerRepository: BannerRepository) {}

  async execute(id: string) {
    if (!id) {
      throw new Error('Banner ID is required');
    }

    const banner = await this.bannerRepository.findById(id);

    if (!banner) {
      throw new Error('Banner not found');
    }

    return banner;
  }
}
