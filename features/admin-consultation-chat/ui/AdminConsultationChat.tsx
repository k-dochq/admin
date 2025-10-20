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
    clearError,
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
    onSuccess: (data) => {
      console.log('예약 생성 성공:', data);
      alert('예약이 성공적으로 생성되었습니다.');
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
      hospitalId={hospitalId}
      userId={userId}
      messages={messages}
      isLoadingHistory={isLoadingHistory}
      isConnected={isConnected}
      onSendMessage={sendMessage}
      onSendTyping={sendTyping}
      typingUsers={typingUsers}
      onCreateReservation={handleCreateReservation}
    />
  );
}
