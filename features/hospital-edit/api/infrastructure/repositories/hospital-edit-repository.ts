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
      },
    });

    return hospital as HospitalForEdit | null;
  }

  async update(request: UpdateHospitalRequest): Promise<HospitalForEdit> {
    const { id, ...updateData } = request;

    // JSON 필드들을 Prisma.JsonValue로 변환
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
      openingHours: updateData.openingHours
        ? (updateData.openingHours as Prisma.InputJsonValue)
        : undefined,
      email: updateData.email && updateData.email.trim() !== '' ? updateData.email : null,
      lineId: updateData.lineId,
      memo: updateData.memo,
      reviewUrl: updateData.reviewUrl,
      ranking: updateData.ranking,
      discountRate: updateData.discountRate,
      approvalStatusType: updateData.approvalStatusType || 'PENDING',
      rejectReason: updateData.rejectReason || null,
      district: updateData.districtId
        ? { connect: { id: updateData.districtId } }
        : { disconnect: true },
      updatedAt: new Date(),
    };

    const updatedHospital = await this.prisma.hospital.update({
      where: { id },
      data: prismaUpdateData,
      include: {
        district: {
          select: {
            id: true,
            name: true,
            countryCode: true,
          },
        },
      },
    });

    return updatedHospital as HospitalForEdit;
  }
}
