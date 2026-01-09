'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAdminRealtimeChat } from '../model/useAdminRealtimeChat';
import {
  fetchAdminChatRoomInfo,
  sendNotificationEmail,
  updateChatMessage,
  deleteChatMessage,
} from '../api/admin-chat-api-client';
import { AdminChatMain } from './AdminChatMain';
import { AdminChatLoading } from './AdminChatLoading';
import { AdminChatError } from './AdminChatError';
import { EditMessageModal } from './EditMessageModal';
import { type CreateReservationRequest } from '@/features/reservation-management/api/entities/types';
import { type HospitalLocale } from '@/shared/lib/types/locale';
import { type CreateMedicalSurveyMessageRequest } from '@/features/medical-survey/api/entities/types';
import { type AdminChatMessage } from '@/lib/types/admin-chat';

interface AdminConsultationChatProps {
  hospitalId: string;
  userId: string;
}

export function AdminConsultationChat({ hospitalId, userId }: AdminConsultationChatProps) {
  // 채팅방 정보 (병원명, 사용자명) 조회
  const {
    data: roomInfo,
    isLoading: roomInfoLoading,
    error: roomInfoError,
  } = useQuery({
    queryKey: ['adminChatRoomInfo', hospitalId, userId],
    queryFn: () => fetchAdminChatRoomInfo(hospitalId, userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 실시간 채팅 훅
  const {
    messages,
    isConnected,
    isLoadingHistory,
    error: chatError,
    sendMessage,
    sendTyping,
    typingUsers,
    hasMore,
    loadMoreHistory,
    clearError,
    channel, // 채널 접근을 위해 추가
  } = useAdminRealtimeChat({
    hospitalId,
    userId,
  });

  // 예약 생성 mutation
  const createReservationMutation = useMutation({
    mutationFn: async (data: CreateReservationRequest) => {
      const response = await fetch('/api/admin/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '예약 생성에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: async (data) => {
      console.log('예약 생성 성공:', data);
      alert('예약이 성공적으로 생성되었습니다.');

      // 실시간으로 메시지 전송
      if (channel && data.message) {
        try {
          const broadcastPayload = {
            id: data.message.id,
            content: data.message.content,
            userId: 'admin',
            userName: '관리자',
            timestamp: data.message.timestamp,
            type: 'admin',
            senderType: 'ADMIN',
          };

          await channel.send({
            type: 'broadcast',
            event: 'message',
            payload: broadcastPayload,
          });

          console.log('예약 메시지 실시간 전송 완료');
        } catch (error) {
          console.error('실시간 메시지 전송 실패:', error);
        }
      }
    },
    onError: (error) => {
      console.error('예약 생성 실패:', error);
      alert(error.message || '예약 생성에 실패했습니다.');
    },
  });

  // 질문생성 mutation
  const createMedicalSurveyMutation = useMutation({
    mutationFn: async (data: CreateMedicalSurveyMessageRequest) => {
      const response = await fetch('/api/admin/medical-survey/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '질문생성에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: async (data) => {
      console.log('질문생성 성공:', data);
      alert('질문이 성공적으로 생성되었습니다.');

      // 실시간으로 메시지 전송
      if (channel && data.message) {
        try {
          const broadcastPayload = {
            id: data.message.id,
            content: data.message.content,
            userId: 'admin',
            userName: '관리자',
            timestamp: data.message.timestamp,
            type: 'admin',
            senderType: 'ADMIN',
          };

          await channel.send({
            type: 'broadcast',
            event: 'message',
            payload: broadcastPayload,
          });

          console.log('질문 메시지 실시간 전송 완료');
        } catch (error) {
          console.error('실시간 메시지 전송 실패:', error);
        }
      }
    },
    onError: (error) => {
      console.error('질문생성 실패:', error);
      alert(error.message || '질문생성에 실패했습니다.');
    },
  });

  // 이메일 발송 mutation
  const sendNotificationEmailMutation = useMutation({
    mutationFn: async (language: HospitalLocale) => {
      const result = await sendNotificationEmail(hospitalId, userId, language);
      if (!result.success) {
        throw new Error(result.error || '이메일 발송에 실패했습니다.');
      }
      return result;
    },
    onSuccess: () => {
      alert('확인 메일이 성공적으로 발송되었습니다.');
    },
    onError: (error) => {
      console.error('이메일 발송 실패:', error);
      alert(error.message || '이메일 발송에 실패했습니다.');
    },
  });

  // 메시지 수정/삭제 관련 상태 (조건부 렌더링 이전에 선언)
  const [editingMessage, setEditingMessage] = useState<AdminChatMessage | null>(null);

  // 로딩 상태
  if (roomInfoLoading || isLoadingHistory) {
    return <AdminChatLoading />;
  }

  // 에러 상태
  if (roomInfoError || chatError) {
    const errorMessage = roomInfoError?.message || chatError || '알 수 없는 오류가 발생했습니다.';
    return <AdminChatError error={errorMessage} onRetry={clearError} />;
  }

  const hospitalName = roomInfo?.hospitalName || '병원';
  const userName = roomInfo?.userName || '사용자';
  const hospitalImageUrl = roomInfo?.hospitalImageUrl || undefined;
  const medicalSpecialties = roomInfo?.medicalSpecialties || [];

  // 예약 생성 핸들러
  const handleCreateReservation = async (data: CreateReservationRequest) => {
    await createReservationMutation.mutateAsync(data);
  };

  // 질문생성 핸들러
  const handleCreateMedicalSurvey = async (language: HospitalLocale, cooldownDays?: number) => {
    await createMedicalSurveyMutation.mutateAsync({
      hospitalId,
      userId,
      language,
      cooldownDays,
    });
  };

  // 이메일 발송 핸들러
  const handleSendNotificationEmail = async (language: HospitalLocale) => {
    await sendNotificationEmailMutation.mutateAsync(language);
  };

  // 메시지 수정 핸들러
  const handleEditMessage = async (newContent: string) => {
    if (!editingMessage) return;

    const result = await updateChatMessage(editingMessage.id, newContent, hospitalId, userId);
    if (result.success && channel) {
      // Realtime 브로드캐스트
      await channel.send({
        type: 'broadcast',
        event: 'message:updated',
        payload: { messageId: editingMessage.id, content: newContent },
      });
    } else {
      console.error('Failed to update message:', result.error);
      alert(result.error || '메시지 수정에 실패했습니다.');
    }
  };

  // 메시지 삭제 핸들러
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const result = await deleteChatMessage(messageId, hospitalId, userId);
    if (result.success && channel) {
      // Realtime 브로드캐스트
      await channel.send({
        type: 'broadcast',
        event: 'message:deleted',
        payload: { messageId },
      });
    } else {
      console.error('Failed to delete message:', result.error);
      alert(result.error || '메시지 삭제에 실패했습니다.');
    }
  };

  // 메인 채팅 UI
  return (
    <>
      <AdminChatMain
        hospitalName={hospitalName}
        userName={userName}
        hospitalImageUrl={hospitalImageUrl}
        medicalSpecialties={medicalSpecialties}
        hospitalId={hospitalId}
        userId={userId}
        messages={messages}
        isLoadingHistory={isLoadingHistory}
        isConnected={isConnected}
        onSendMessage={sendMessage}
        onSendTyping={sendTyping}
        typingUsers={typingUsers}
        hasMore={hasMore}
        onLoadMore={loadMoreHistory}
        onCreateReservation={handleCreateReservation}
        onCreateMedicalSurvey={handleCreateMedicalSurvey}
        onSendNotificationEmail={handleSendNotificationEmail}
        onEditMessage={setEditingMessage}
        onDeleteMessage={handleDeleteMessage}
      />
      <EditMessageModal
        isOpen={!!editingMessage}
        onClose={() => setEditingMessage(null)}
        currentContent={editingMessage?.content || ''}
        onSave={handleEditMessage}
      />
    </>
  );
}
