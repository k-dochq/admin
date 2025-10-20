import { prisma } from '@/lib/prisma';
import { ReservationStatus } from '@prisma/client';
import { ReservationMessageService } from '../services/reservation-message-service';
import {
  type CreateReservationRequest,
  type CreateReservationResponse,
  type ReservationMessageData,
  type ReservationLanguage,
} from '../entities/types';

/**
 * 예약 생성 Use Case
 * 비즈니스 로직 처리 및 데이터베이스 트랜잭션 관리
 */
export class CreateReservationUseCase {
  /**
   * 예약 생성 실행
   */
  static async execute(request: CreateReservationRequest): Promise<CreateReservationResponse> {
    try {
      console.log(`[${new Date().toISOString()}] 예약 생성 요청:`, request);

      // 입력 데이터 검증
      this.validateRequest(request);

      // 병원 정보 조회
      const hospital = await this.getHospitalInfo(request.hospitalId);
      if (!hospital) {
        throw new Error('병원을 찾을 수 없습니다.');
      }

      // 사용자 정보 조회
      const user = await this.getUserInfo(request.userId);
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 트랜잭션으로 예약 생성 및 메시지 발송
      const result = await prisma.$transaction(async (tx) => {
        // 1. 예약 생성
        const reservation = await tx.reservation.create({
          data: {
            userId: request.userId,
            hospitalId: request.hospitalId,
            procedureName: request.procedureName,
            reservationDate: new Date(request.reservationDate),
            reservationTime: request.reservationTime,
            depositAmount: request.depositAmount,
            currency: request.currency,
            paymentDeadline: new Date(request.paymentDeadline),
            status: ReservationStatus.PAYMENT_PENDING,
            createdBy: request.userId, // 관리자 ID (추후 수정 필요)
            metadata: {
              category: request.category,
              language: request.language,
              customGuideText: request.customGuideText,
              customDetails: request.customDetails,
              customNotice: request.customNotice,
              buttonText: request.buttonText,
            },
          },
        });

        // 2. 상태 이력 생성 (PENDING → PAYMENT_PENDING)
        await tx.reservationStatusHistory.create({
          data: {
            reservationId: reservation.id,
            fromStatus: ReservationStatus.PENDING,
            toStatus: ReservationStatus.PAYMENT_PENDING,
            changedBy: request.userId, // 관리자 ID (추후 수정 필요)
            reason: '예약 생성 및 결제 대기 상태로 변경',
            metadata: {
              createdBy: 'admin',
              language: request.language,
            },
          },
        });

        // 3. 다국어 메시지 생성
        const messageData: ReservationMessageData = {
          hospitalName: this.extractHospitalName(hospital.name, request.language),
          procedureName: request.procedureName,
          reservationDate: request.reservationDate,
          reservationTime: request.reservationTime,
          depositAmount: request.depositAmount,
          currency: request.currency,
          paymentDeadline: request.paymentDeadline,
          customGuideText: request.customGuideText,
          customDetails: request.customDetails,
          customNotice: request.customNotice,
          buttonText: request.buttonText,
        };

        const messageContent = ReservationMessageService.generateReservationMessage(
          messageData,
          request.language,
        );

        // 4. 상담 메시지 생성
        const consultationMessage = await tx.consultationMessage.create({
          data: {
            userId: request.userId,
            hospitalId: request.hospitalId,
            senderType: 'ADMIN',
            content: messageContent,
          },
        });

        return {
          reservation,
          message: consultationMessage,
        };
      });

      console.log(`[${new Date().toISOString()}] 예약 생성 완료: ${result.reservation.id}`);

      return {
        success: true,
        reservation: {
          id: result.reservation.id,
          status: result.reservation.status,
          procedureName: result.reservation.procedureName,
          reservationDate: result.reservation.reservationDate.toISOString().split('T')[0],
          reservationTime: result.reservation.reservationTime,
          depositAmount: result.reservation.depositAmount,
          currency: result.reservation.currency,
          paymentDeadline: result.reservation.paymentDeadline.toISOString(),
          createdAt: result.reservation.createdAt,
        },
        message: {
          id: result.message.id,
          content: result.message.content,
          timestamp: result.message.createdAt.toISOString(),
          createdAt: result.message.createdAt,
        },
      };
    } catch (error) {
      console.error('예약 생성 중 오류 발생:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '예약 생성에 실패했습니다.',
      };
    }
  }

  /**
   * 입력 데이터 검증
   */
  private static validateRequest(request: CreateReservationRequest): void {
    if (!request.hospitalId) {
      throw new Error('병원 ID는 필수입니다.');
    }
    if (!request.userId) {
      throw new Error('사용자 ID는 필수입니다.');
    }
    if (!request.procedureName || request.procedureName.trim().length === 0) {
      throw new Error('시술명은 필수입니다.');
    }
    if (!request.reservationDate) {
      throw new Error('예약 날짜는 필수입니다.');
    }
    if (!request.reservationTime) {
      throw new Error('예약 시간은 필수입니다.');
    }
    if (request.depositAmount <= 0) {
      throw new Error('예약금은 0보다 커야 합니다.');
    }
    if (!request.paymentDeadline) {
      throw new Error('입금 기한은 필수입니다.');
    }

    // 날짜 형식 검증
    const reservationDate = new Date(request.reservationDate);
    if (isNaN(reservationDate.getTime())) {
      throw new Error('올바른 예약 날짜 형식이 아닙니다.');
    }

    // 입금 기한 검증
    const paymentDeadline = new Date(request.paymentDeadline);
    if (isNaN(paymentDeadline.getTime())) {
      throw new Error('올바른 입금 기한 형식이 아닙니다.');
    }

    // 입금 기한이 현재 시간보다 미래인지 확인
    if (paymentDeadline <= new Date()) {
      throw new Error('입금 기한은 현재 시간보다 미래여야 합니다.');
    }

    // 예약 날짜가 입금 기한보다 미래인지 확인
    if (reservationDate <= paymentDeadline) {
      throw new Error('예약 날짜는 입금 기한보다 미래여야 합니다.');
    }

    // 시간 형식 검증 (HH:MM)
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(request.reservationTime)) {
      throw new Error('올바른 시간 형식이 아닙니다. (HH:MM)');
    }
  }

  /**
   * 병원 정보 조회
   */
  private static async getHospitalInfo(hospitalId: string) {
    return await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: {
        id: true,
        name: true,
      },
    });
  }

  /**
   * 사용자 정보 조회
   */
  private static async getUserInfo(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        name: true,
      },
    });
  }

  /**
   * 병원명 추출 (JSON에서 문자열로)
   */
  private static extractHospitalName(nameJson: unknown, language: ReservationLanguage): string {
    if (typeof nameJson === 'string') {
      return nameJson;
    }

    if (typeof nameJson === 'object' && nameJson !== null) {
      const nameObj = nameJson as Record<string, unknown>;

      // 선택된 언어에 따라 병원명 추출
      switch (language) {
        case 'ko_KR':
          if (typeof nameObj.ko_KR === 'string' && nameObj.ko_KR.trim()) {
            return nameObj.ko_KR;
          }
          break;
        case 'en_US':
          if (typeof nameObj.en_US === 'string' && nameObj.en_US.trim()) {
            return nameObj.en_US;
          }
          break;
        case 'th_TH':
          if (typeof nameObj.th_TH === 'string' && nameObj.th_TH.trim()) {
            return nameObj.th_TH;
          }
          break;
      }

      // 선택된 언어에 해당하는 값이 없으면 다른 언어로 폴백
      if (typeof nameObj.ko_KR === 'string' && nameObj.ko_KR.trim()) {
        return nameObj.ko_KR;
      }
      if (typeof nameObj.en_US === 'string' && nameObj.en_US.trim()) {
        return nameObj.en_US;
      }
      if (typeof nameObj.th_TH === 'string' && nameObj.th_TH.trim()) {
        return nameObj.th_TH;
      }

      // 다른 문자열 값 찾기
      for (const value of Object.values(nameObj)) {
        if (typeof value === 'string' && value.trim()) {
          return value;
        }
      }
    }

    return '병원';
  }
}

/**
 * 예약 생성 함수 (Use Case 래퍼)
 */
export async function createReservation(
  request: CreateReservationRequest,
): Promise<CreateReservationResponse> {
  return CreateReservationUseCase.execute(request);
}
