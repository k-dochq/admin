import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { type AdminChatApiResponse } from '@/lib/types/admin-chat';
import { type HospitalLocale } from '@/shared/lib/types/locale';
import {
  getEmailTemplate,
  buildChatUrl,
} from '@/features/admin-consultation-chat/api/entities/email-templates';
import { routeErrorLogger, formatErrorResponse, formatSuccessResponse } from 'shared/lib';

interface SendNotificationEmailRequest {
  hospitalId: string;
  userId: string;
  language: HospitalLocale;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const endpoint = '/api/admin/consultations/send-notification-email';
  const method = 'POST';

  try {
    const body: SendNotificationEmailRequest = await request.json();
    const { hospitalId, userId, language } = body;

    // 필수 필드 검증
    if (!hospitalId || !userId || !language) {
      return formatErrorResponse('hospitalId, userId, language are required', undefined, 400);
    }

    // 사용자 정보 조회 (이메일 포함)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return formatErrorResponse('User not found', undefined, 404);
    }

    if (!user.email) {
      return formatErrorResponse('User email not found', undefined, 400);
    }

    // 병원 정보 조회
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: {
        id: true,
      },
    });

    if (!hospital) {
      return formatErrorResponse('Hospital not found', undefined, 404);
    }

    // 이메일 템플릿 가져오기
    const chatUrl = buildChatUrl(hospitalId, language);
    const template = getEmailTemplate(language, chatUrl);

    // Resend API 호출
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      const requestId = routeErrorLogger.logError({
        error: new Error('RESEND_API_KEY is not configured'),
        endpoint,
        method,
        request,
      });
      return formatErrorResponse('Email service is not configured', requestId, 500);
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'K-DOC <noreply@k-doc.kr>',
        to: [user.email],
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({}));
      const requestId = routeErrorLogger.logError({
        error: new Error(`Resend API error: ${JSON.stringify(errorData)}`),
        endpoint,
        method,
        request,
      });
      return formatErrorResponse('Failed to send email', requestId, 500);
    }

    return formatSuccessResponse({ success: true }, 'Notification email sent successfully');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    return formatErrorResponse('Internal server error', requestId, 500);
  }
}
