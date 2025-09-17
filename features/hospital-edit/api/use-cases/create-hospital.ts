import { prisma } from '@/lib/prisma';
import { type CreateHospitalRequest, type CreateHospitalResponse } from '../entities/types';

export async function createHospital(
  request: CreateHospitalRequest,
): Promise<CreateHospitalResponse> {
  try {
    console.log(`[${new Date().toISOString()}] 병원 생성 요청:`, request);

    // 병원 생성
    const hospital = await prisma.hospital.create({
      data: {
        name: request.name,
        address: request.address,
        directions: request.directions,
        phoneNumber: request.phoneNumber,
        email: request.email,
        description: request.description,
        openingHours: request.openingHours,
        memo: request.memo,
        ranking: request.ranking,
        discountRate: request.discountRate,
        districtId: request.districtId,
        prices: request.prices,
        displayLocationName: request.displayLocationName,
        // 기본값 설정
        reviewCount: 0,
        productCount: 0,
        bookmarkCount: 0,
        viewCount: 0,
        rating: request.rating || 0,
        point: 0,
        subPhoneNumbers: [],
        enableJp: false,
        approvalStatusType: 'PENDING', // 새로 생성된 병원은 승인 대기 상태
        hasClone: false,
      },
    });

    // 진료부위 연결
    if (request.medicalSpecialtyIds && request.medicalSpecialtyIds.length > 0) {
      await prisma.hospitalMedicalSpecialty.createMany({
        data: request.medicalSpecialtyIds.map((specialtyId) => ({
          hospitalId: hospital.id,
          medicalSpecialtyId: specialtyId,
        })),
      });
    }

    console.log(`[${new Date().toISOString()}] 병원 생성 완료: ${hospital.id}`);

    return {
      success: true,
      hospital: {
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        phoneNumber: hospital.phoneNumber,
        email: hospital.email,
        approvalStatusType: hospital.approvalStatusType,
        createdAt: hospital.createdAt,
        updatedAt: hospital.updatedAt,
      },
    };
  } catch (error) {
    console.error('병원 생성 중 오류 발생:', error);
    throw new Error(error instanceof Error ? error.message : '병원 생성에 실패했습니다.');
  }
}
