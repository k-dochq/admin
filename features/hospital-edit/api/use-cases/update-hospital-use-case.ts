import { IHospitalEditRepository } from '../infrastructure/repositories/hospital-edit-repository';
import { UpdateHospitalRequest, HospitalForEdit } from '../entities/types';

export interface IUpdateHospitalUseCase {
  execute(request: UpdateHospitalRequest): Promise<HospitalForEdit>;
}

export class UpdateHospitalUseCase implements IUpdateHospitalUseCase {
  constructor(private hospitalEditRepository: IHospitalEditRepository) {}

  async execute(request: UpdateHospitalRequest): Promise<HospitalForEdit> {
    // 병원이 존재하는지 확인
    const existingHospital = await this.hospitalEditRepository.findById({ id: request.id });

    if (!existingHospital) {
      throw new Error('Hospital not found');
    }

    // 병원 정보 업데이트
    const updatedHospital = await this.hospitalEditRepository.update(request);

    return updatedHospital;
  }
}
