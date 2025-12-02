import { BannerRepository } from '../infrastructure/repositories/banner-repository';
import {
  type GetBannersRequest,
  type CreateBannerRequest,
  type UpdateBannerRequest,
} from '../entities/types';

export class GetBannersUseCase {
  constructor(private bannerRepository: BannerRepository) {}

  async execute(request: GetBannersRequest) {
    const {
      page = 1,
      limit = 20,
      isActive,
      type,
      orderBy = 'order',
      orderDirection = 'asc',
    } = request;

    return this.bannerRepository.findAll({
      page,
      limit,
      isActive,
      type,
      orderBy,
      orderDirection,
    });
  }
}
