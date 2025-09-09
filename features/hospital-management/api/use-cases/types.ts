import { GetHospitalsRequest, GetHospitalsResponse } from '../entities';

export interface IGetHospitalsUseCase {
  execute(request: GetHospitalsRequest): Promise<GetHospitalsResponse>;
}
