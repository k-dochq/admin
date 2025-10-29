import { PrismaClient, Prisma } from '@prisma/client';
import {
  HospitalForEdit,
  GetHospitalByIdRequest,
  UpdateHospitalRequest,
} from '../../entities/types';

export interface IHospitalEditRepository {
  findById(request: GetHospitalByIdRequest): Promise<HospitalForEdit | null>;
  update(request: UpdateHospitalRequest): Promise<HospitalForEdit>;
}

export class HospitalEditRepository implements IHospitalEditRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(request: GetHospitalByIdRequest): Promise<HospitalForEdit | null> {
    const { id } = request;

    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
      include: {
        district: {
          select: {
            id: true,
            name: true,
            countryCode: true,
          },
        },
        hospitalSpecialties: {
          include: {
            medicalSpecialty: true,
          },
        },
      },
    });

    return hospital as HospitalForEdit | null;
  }

  async update(request: UpdateHospitalRequest): Promise<HospitalForEdit> {
    const { id, medicalSpecialtyIds, ...updateData } = request;

    // 트랜잭션으로 병원 정보와 진료부위를 함께 업데이트
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 병원 기본 정보 업데이트
      const prismaUpdateData: Prisma.HospitalUpdateInput = {
        name: updateData.name as Prisma.InputJsonValue,
        address: updateData.address as Prisma.InputJsonValue,
        directions: updateData.directions
          ? (updateData.directions as Prisma.InputJsonValue)
          : undefined,
        phoneNumber: updateData.phoneNumber,
        description: updateData.description
          ? (updateData.description as Prisma.InputJsonValue)
          : undefined,
        email: updateData.email && updateData.email.trim() !== '' ? updateData.email : null,
        memo: updateData.memo,
        ranking: updateData.ranking,
        rating: updateData.rating,
        discountRate: updateData.discountRate,
        approvalStatusType: updateData.approvalStatusType,
        latitude: updateData.latitude,
        longitude: updateData.longitude,
        prices: updateData.prices ? (updateData.prices as Prisma.InputJsonValue) : Prisma.DbNull,
        openingHours: updateData.detailedOpeningHours
          ? (updateData.detailedOpeningHours as Prisma.InputJsonValue)
          : updateData.openingHours
            ? (updateData.openingHours as Prisma.InputJsonValue)
            : Prisma.DbNull,
        displayLocationName: updateData.displayLocationName
          ? (updateData.displayLocationName as Prisma.InputJsonValue)
          : Prisma.DbNull,
        district: updateData.districtId
          ? { connect: { id: updateData.districtId } }
          : { disconnect: true },
        updatedAt: new Date(),
      };

      await tx.hospital.update({
        where: { id },
        data: prismaUpdateData,
      });

      // 2. 진료부위 관계 업데이트 (제공된 경우에만)
      if (medicalSpecialtyIds !== undefined) {
        // 기존 진료부위 관계 모두 삭제
        await tx.hospitalMedicalSpecialty.deleteMany({
          where: { hospitalId: id },
        });

        // 새로운 진료부위 관계 생성
        if (medicalSpecialtyIds.length > 0) {
          await tx.hospitalMedicalSpecialty.createMany({
            data: medicalSpecialtyIds.map((medicalSpecialtyId) => ({
              hospitalId: id,
              medicalSpecialtyId,
            })),
          });
        }
      }

      // 3. 업데이트된 병원 정보 조회 (진료부위 포함)
      const updatedHospital = await tx.hospital.findUnique({
        where: { id },
        include: {
          district: {
            select: {
              id: true,
              name: true,
              countryCode: true,
            },
          },
          hospitalSpecialties: {
            include: {
              medicalSpecialty: true,
            },
          },
        },
      });

      return updatedHospital;
    });

    return result as HospitalForEdit;
  }
}
