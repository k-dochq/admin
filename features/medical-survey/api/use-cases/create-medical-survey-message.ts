import { prisma } from '@/lib/prisma';
import { MedicalSurveyMessageService } from '../services/medical-survey-message-service';
import {
  type CreateMedicalSurveyMessageRequest,
  type CreateMedicalSurveyMessageResponse,
  type SurveyButtonData,
  SURVEY_BUTTON_TEXTS,
} from '../entities/types';

/**
 * 의료설문 메시지 생성 Use Case
 * 메시지 생성 및 데이터베이스 저장
 */
export class CreateMedicalSurveyMessageUseCase {
  /**
   * 의료설문 메시지 생성 실행
   */
  static async execute(
    request: CreateMedicalSurveyMessageRequest,
  ): Promise<CreateMedicalSurveyMessageResponse> {
    try {
      console.log(`[${new Date().toISOString()}] 의료설문 메시지 생성 요청:`, request);

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

      // consultationId 생성
      const consultationId = MedicalSurveyMessageService.createConsultationId(
        request.hospitalId,
        request.userId,
      );

      // 버튼 데이터 생성
      const buttonData: SurveyButtonData = {
        consultationId,
        userId: request.userId,
        hospitalId: request.hospitalId,
        language: request.language,
        buttonText: SURVEY_BUTTON_TEXTS[request.language],
      };

      // 메시지 생성
      const messageContent = MedicalSurveyMessageService.generateMedicalSurveyMessage(
        {
          language: request.language,
          buttonText: SURVEY_BUTTON_TEXTS[request.language],
        },
        buttonData,
      );

      console.log('[Message] 생성된 메시지:', messageContent);

      // 데이터베이스에 메시지 저장
      const message = await prisma.consultationMessage.create({
        data: {
          hospitalId: request.hospitalId,
          userId: request.userId,
          content: messageContent,
          senderType: 'ADMIN',
        },
        include: {
          User: {
            select: {
              id: true,
              displayName: true,
              name: true,
            },
          },
        },
      });

      const timestamp = message.createdAt.toISOString();

      return {
        success: true,
        message: {
          id: message.id,
          content: message.content,
          timestamp,
          createdAt: message.createdAt,
        },
      };
    } catch (error) {
      console.error('의료설문 메시지 생성 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 입력 데이터 검증
   */
  private static validateRequest(request: CreateMedicalSurveyMessageRequest): void {
    if (!request.hospitalId || !request.userId || !request.language) {
      throw new Error('필수 필드가 누락되었습니다.');
    }

    // 언어 검증
    const validLanguages = ['ko_KR', 'en_US', 'th_TH', 'zh_TW', 'ja_JP'];
    if (!validLanguages.includes(request.language)) {
      throw new Error('올바른 언어가 아닙니다.');
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
}

/**
 * 의료설문 메시지 생성 함수 (Use Case 래퍼)
 */
export async function createMedicalSurveyMessage(
  request: CreateMedicalSurveyMessageRequest,
): Promise<CreateMedicalSurveyMessageResponse> {
  return CreateMedicalSurveyMessageUseCase.execute(request);
}
