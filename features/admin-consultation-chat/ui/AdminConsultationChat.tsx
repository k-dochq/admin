'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useAdminRealtimeChat } from '../model/useAdminRealtimeChat';
import { fetchAdminChatRoomInfo } from '../api/admin-chat-api-client';
import { AdminChatMain } from './AdminChatMain';
import { AdminChatLoading } from './AdminChatLoading';
import { AdminChatError } from './AdminChatError';
import { type CreateReservationRequest } from '@/features/reservation-management/api/entities/types';

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

  // 메인 채팅 UI
  return (
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
    />
  );
}
