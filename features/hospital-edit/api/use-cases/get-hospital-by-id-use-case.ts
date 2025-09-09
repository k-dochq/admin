import { IHospitalEditRepository } from '../infrastructure/repositories/hospital-edit-repository';
import { GetHospitalByIdRequest, GetHospitalByIdResponse } from '../entities/types';

export interface IGetHospitalByIdUseCase {
  execute(request: GetHospitalByIdRequest): Promise<GetHospitalByIdResponse>;
}

export class GetHospitalByIdUseCase implements IGetHospitalByIdUseCase {
  constructor(private hospitalEditRepository: IHospitalEditRepository) {}

  async execute(request: GetHospitalByIdRequest): Promise<GetHospitalByIdResponse> {
    const hospital = await this.hospitalEditRepository.findById(request);

    if (!hospital) {
      throw new Error('Hospital not found');
    }

    return {
      hospital,
    };
  }
}
