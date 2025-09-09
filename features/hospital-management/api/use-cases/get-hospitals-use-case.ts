import { IGetHospitalsUseCase } from './types';
import { IHospitalRepository } from '../infrastructure/repositories';
import { GetHospitalsRequest, GetHospitalsResponse } from '../entities';

export class GetHospitalsUseCase implements IGetHospitalsUseCase {
  constructor(private hospitalRepository: IHospitalRepository) {}

  async execute(request: GetHospitalsRequest): Promise<GetHospitalsResponse> {
    const { page = 1, limit = 20 } = request;

    const { hospitals, total } = await this.hospitalRepository.findManyWithFilters(request);

    return {
      hospitals,
      total,
      page,
      limit,
    };
  }
}
