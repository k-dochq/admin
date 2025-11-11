import { GetReservationsRequest, GetReservationsResponse } from '../entities/types';

export interface IGetReservationsUseCase {
  execute(request: GetReservationsRequest): Promise<GetReservationsResponse>;
}
