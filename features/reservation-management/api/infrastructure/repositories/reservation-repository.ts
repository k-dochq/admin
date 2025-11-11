import { PrismaClient, Prisma, ReservationStatus } from '@prisma/client';
import { GetReservationsRequest, ReservationForList } from '../../entities/types';

export interface IReservationRepository {
  findManyWithFilters(request: GetReservationsRequest): Promise<{
    reservations: ReservationForList[];
    total: number;
  }>;
}

export class ReservationRepository implements IReservationRepository {
  constructor(private prisma: PrismaClient) {}

  async findManyWithFilters(request: GetReservationsRequest): Promise<{
    reservations: ReservationForList[];
    total: number;
  }> {
    const { page = 1, limit = 20, search, status, hospitalId, userId, dateFrom, dateTo } = request;
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Prisma.ReservationWhereInput = {};

    // 검색 조건 (예약 ID만 검색 - 최소한의 기능, UUID 정확 일치)
    if (search) {
      where.id = search;
    }

    // 상태 필터
    if (status) {
      where.status = status;
    }

    // 병원 필터
    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    // 사용자 필터
    if (userId) {
      where.userId = userId;
    }

    // 날짜 범위 필터
    if (dateFrom || dateTo) {
      where.reservationDate = {};
      if (dateFrom) {
        where.reservationDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.reservationDate.lte = new Date(dateTo);
      }
    }

    // 예약 데이터 조회 (관계 데이터 포함)
    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        include: {
          hospital: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
              email: true,
              phoneNumber: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              tid: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      reservations: reservations as ReservationForList[],
      total,
    };
  }
}
