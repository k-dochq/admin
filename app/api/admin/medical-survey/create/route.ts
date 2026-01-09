import { NextRequest, NextResponse } from 'next/server';
import { createMedicalSurveyMessage } from '@/features/medical-survey/api/use-cases/create-medical-survey-message';
import { type CreateMedicalSurveyMessageRequest } from '@/features/medical-survey/api/entities/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateMedicalSurveyMessageRequest = await request.json();
    const { hospitalId, userId, language, cooldownDays } = body;

    // 필수 필드 검증
    if (!hospitalId || !userId || !language) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // 메시지 생성
    const result = await createMedicalSurveyMessage({
      hospitalId,
      userId,
      language,
      cooldownDays,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in medical survey create API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
