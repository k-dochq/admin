'use client';

import { useQuery } from '@tanstack/react-query';
import { useAdminRealtimeChat } from '../model/useAdminRealtimeChat';
import { fetchAdminChatRoomInfo } from '../api/admin-chat-api-client';
import { AdminChatMain } from './AdminChatMain';
import { AdminChatLoading } from './AdminChatLoading';
import { AdminChatError } from './AdminChatError';

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

  // 메인 채팅 UI
  return (
    <AdminChatMain
      hospitalName={hospitalName}
      userName={userName}
      hospitalImageUrl={hospitalImageUrl}
      messages={messages}
      isLoadingHistory={isLoadingHistory}
      isConnected={isConnected}
      onSendMessage={sendMessage}
      onSendTyping={sendTyping}
      typingUsers={typingUsers}
    />
  );
}
