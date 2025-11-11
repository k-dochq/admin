import { IGetReservationsUseCase } from './types';
import { IReservationRepository } from '../infrastructure/repositories';
import { GetReservationsRequest, GetReservationsResponse } from '../entities/types';

export class GetReservationsUseCase implements IGetReservationsUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(request: GetReservationsRequest): Promise<GetReservationsResponse> {
    const { page = 1, limit = 20 } = request;

    const { reservations, total } = await this.reservationRepository.findManyWithFilters(request);

    return {
      reservations,
      total,
      page,
      limit,
    };
  }
}
