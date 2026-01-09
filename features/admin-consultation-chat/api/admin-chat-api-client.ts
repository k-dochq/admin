'use client';

import { type RealtimeChannel } from '@supabase/supabase-js';
import {
  type AdminChatMessage,
  type AdminChatApiResponse,
  type AdminChatHistoryResponse,
} from '@/lib/types/admin-chat';
import { type HospitalLocale } from '@/shared/lib/types/locale';

/**
 * 채팅 히스토리 조회 (admin용)
 */
export async function fetchAdminChatHistory(
  hospitalId: string,
  userId: string,
  options?: { limit?: number; cursor?: string | null },
): Promise<{ messages: AdminChatMessage[]; hasMore: boolean; nextCursor: string | null }> {
  try {
    const params = new URLSearchParams();
    params.set('hospitalId', hospitalId);
    params.set('userId', userId);
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.cursor) params.set('cursor', options.cursor);

    const response = await fetch(`/api/admin/consultations/chat-history?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AdminChatApiResponse<AdminChatHistoryResponse> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch chat history');
    }

    // DB 메시지를 AdminChatMessage 형태로 변환
    const messages =
      result.data?.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        userId: msg.userId,
        userName: msg.User?.displayName || msg.User?.name || '사용자',
        timestamp: msg.createdAt.toString(),
        type: msg.senderType,
        senderType: msg.senderType,
        adminName: msg.adminName ?? undefined,
        isRead: msg.isRead ?? undefined,
        readAt: msg.readAt?.toString() ?? undefined,
      })) || [];

    return {
      messages,
      hasMore: result.data?.hasMore ?? false,
      nextCursor: result.data?.nextCursor ?? null,
    };
  } catch (error) {
    console.error('❌ Failed to fetch admin chat history:', error);
    return { messages: [], hasMore: false, nextCursor: null };
  }
}

/**
 * 메시지 전송 (admin용)
 */
export async function sendAdminChatMessage(
  channel: RealtimeChannel,
  hospitalId: string,
  userId: string,
  message: AdminChatMessage,
): Promise<AdminChatApiResponse> {
  try {
    // 1. 데이터베이스에 메시지 저장
    const response = await fetch('/api/admin/consultations/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hospitalId,
        userId,
        content: message.content,
        senderType: 'ADMIN', // admin에서 보내는 메시지는 항상 ADMIN
        adminName: message.adminName, // 관리자 이름 또는 이메일
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AdminChatApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to save message');
    }

    // 2. 실시간으로 브로드캐스트 (k-doc 형식에 맞춰 변환)
    const broadcastPayload = {
      ...message,
      type: 'admin', // k-doc에서 기대하는 소문자 형식
    };

    const broadcastResult = await channel.send({
      type: 'broadcast',
      event: 'message',
      payload: broadcastPayload,
    });

    if (broadcastResult !== 'ok') {
      console.warn('⚠️ Failed to broadcast message, but saved to DB');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send admin chat message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 타이핑 상태 전송 (admin용)
 */
export async function sendAdminTypingStatus(
  channel: RealtimeChannel,
  adminName: string,
  isTyping: boolean,
): Promise<AdminChatApiResponse> {
  try {
    const typingEvent = {
      userId: 'admin', // admin은 특별한 userId 사용
      userName: adminName,
      isTyping,
    };

    const result = await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: typingEvent,
    });

    if (result !== 'ok') {
      throw new Error('Failed to send typing status');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send admin typing status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 채팅방 정보 (병원명, 사용자명, 시술부위) 조회
 */
export async function fetchAdminChatRoomInfo(
  hospitalId: string,
  userId: string,
): Promise<{
  hospitalName: string;
  userName: string;
  userEmail: string | null;
  hospitalImageUrl?: string | null;
  medicalSpecialties?: Array<{
    id: string;
    specialtyType: string;
    name: string;
  }>;
}> {
  const response = await fetch(
    `/api/admin/consultations/room-info?hospitalId=${hospitalId}&userId=${userId}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch admin chat room info');
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch admin chat room info');
  }

  return result.data;
}

/**
 * 상담 답변 확인 메일 발송
 */
export async function sendNotificationEmail(
  hospitalId: string,
  userId: string,
  language: HospitalLocale,
): Promise<AdminChatApiResponse> {
  try {
    const response = await fetch('/api/admin/consultations/send-notification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hospitalId,
        userId,
        language,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send notification email');
    }

    const result: AdminChatApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to send notification email');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send notification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 메시지 수정
 */
export async function updateChatMessage(
  messageId: string,
  content: string,
  hospitalId?: string,
  userId?: string,
): Promise<AdminChatApiResponse> {
  try {
    const response = await fetch(`/api/admin/consultations/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, hospitalId, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update message',
    };
  }
}

/**
 * 메시지 삭제
 */
export async function deleteChatMessage(
  messageId: string,
  hospitalId?: string,
  userId?: string,
): Promise<AdminChatApiResponse> {
  try {
    const params = new URLSearchParams();
    if (hospitalId) params.set('hospitalId', hospitalId);
    if (userId) params.set('userId', userId);

    const url = `/api/admin/consultations/messages/${messageId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to delete message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete message',
    };
  }
}
