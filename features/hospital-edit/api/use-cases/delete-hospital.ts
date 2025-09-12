import { prisma } from '@/lib/prisma';

export interface DeleteHospitalRequest {
  id: string;
}

export interface DeleteHospitalResponse {
  success: boolean;
  message: string;
}

export async function deleteHospital(
  request: DeleteHospitalRequest,
): Promise<DeleteHospitalResponse> {
  try {
    console.log(`[${new Date().toISOString()}] 병원 삭제 요청: ${request.id}`);

    // 병원 존재 여부 확인
    const existingHospital = await prisma.hospital.findUnique({
      where: { id: request.id },
    });

    if (!existingHospital) {
      throw new Error('Hospital not found');
    }

    // 관련 데이터 삭제 (Cascade 삭제가 설정되어 있지만 명시적으로 처리)
    await prisma.$transaction(async (tx) => {
      // 병원 이미지 삭제
      await tx.hospitalImage.deleteMany({
        where: { hospitalId: request.id },
      });

      // 병원-진료부위 관계 삭제
      await tx.hospitalMedicalSpecialty.deleteMany({
        where: { hospitalId: request.id },
      });

      // 병원 좋아요 삭제
      await tx.hospitalLike.deleteMany({
        where: { hospitalId: request.id },
      });

      // 상담 메시지 삭제
      await tx.consultationMessage.deleteMany({
        where: { hospitalId: request.id },
      });

      // 의사 삭제 (의사와 관련된 데이터도 함께 삭제됨)
      await tx.doctor.deleteMany({
        where: { hospitalId: request.id },
      });

      // 상품 삭제
      await tx.product.deleteMany({
        where: { hospitalId: request.id },
      });

      // 리뷰 삭제 (리뷰 이미지와 좋아요도 함께 삭제됨)
      await tx.review.deleteMany({
        where: { hospitalId: request.id },
      });

      // 마지막으로 병원 삭제
      await tx.hospital.delete({
        where: { id: request.id },
      });
    });

    console.log(`[${new Date().toISOString()}] 병원 삭제 완료: ${request.id}`);

    return {
      success: true,
      message: '병원이 성공적으로 삭제되었습니다.',
    };
  } catch (error) {
    console.error('병원 삭제 중 오류 발생:', error);

    if (error instanceof Error && error.message === 'Hospital not found') {
      throw new Error('삭제할 병원을 찾을 수 없습니다.');
    }

    throw new Error(error instanceof Error ? error.message : '병원 삭제에 실패했습니다.');
  }
}
