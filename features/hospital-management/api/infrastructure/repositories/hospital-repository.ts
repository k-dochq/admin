import { PrismaClient, Prisma } from '@prisma/client';
import { GetHospitalsRequest, HospitalWithDistrict } from '../../entities';

export interface IHospitalRepository {
  findManyWithFilters(request: GetHospitalsRequest): Promise<{
    hospitals: HospitalWithDistrict[];
    total: number;
  }>;
}

export class HospitalRepository implements IHospitalRepository {
  constructor(private prisma: PrismaClient) {}

  async findManyWithFilters(request: GetHospitalsRequest): Promise<{
    hospitals: HospitalWithDistrict[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      approvalStatus,
      districtId,
      enableJp,
      hasClone,
    } = request;
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Prisma.HospitalWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            path: ['ko_KR'],
            string_contains: search,
          },
        },
        {
          name: {
            path: ['en_US'],
            string_contains: search,
          },
        },
        {
          phoneNumber: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
          },
        },
      ];
    }

    if (approvalStatus) {
      where.approvalStatusType = approvalStatus;
    }

    if (districtId) {
      where.districtId = districtId;
    }

    if (enableJp !== undefined) {
      where.enableJp = enableJp;
    }

    if (hasClone !== undefined) {
      where.hasClone = hasClone;
    }

    // 병원 데이터 조회 (District 정보 포함)
    const [hospitals, total] = await Promise.all([
      this.prisma.hospital.findMany({
        where,
        include: {
          district: {
            select: {
              id: true,
              name: true,
              countryCode: true,
            },
          },
          products: {
            select: {
              id: true,
              name: true,
              description: true,
            },
            where: {
              isActive: true,
            },
            take: 5, // 최대 5개의 제품만 가져오기
          },
          hospitalSpecialties: {
            select: {
              id: true,
              medicalSpecialty: {
                select: {
                  id: true,
                  name: true,
                  specialtyType: true,
                  order: true,
                },
              },
            },
            where: {
              medicalSpecialty: {
                isActive: true,
              },
            },
            orderBy: {
              medicalSpecialty: {
                order: 'asc',
              },
            },
            take: 5, // 최대 5개의 진료부위만 가져오기
          },
        },
        orderBy: [
          { ranking: 'asc' },
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.hospital.count({ where }),
    ]);

    return {
      hospitals: hospitals as HospitalWithDistrict[],
      total,
    };
  }
}
