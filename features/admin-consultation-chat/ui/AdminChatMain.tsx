'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AdminMessageList } from './AdminMessageList';
import { AdminChatInput } from './AdminChatInput';
import { AdminChatHeader } from './AdminChatHeader';
import { AdminCreateReservationModal } from '@/features/reservation-management/ui/AdminCreateReservationModal';
import { ConsultationMemoPanel } from '@/features/consultation-memo';
import { type AdminChatMessage } from '@/lib/types/admin-chat';
import { type CreateReservationRequest } from '@/features/reservation-management/api/entities/types';

interface AdminChatMainProps {
  hospitalName: string;
  userName: string;
  hospitalImageUrl?: string;
  medicalSpecialties?: Array<{
    id: string;
    specialtyType: string;
    name: string;
  }>;
  hospitalId: string;
  userId: string;
  messages: AdminChatMessage[];
  isLoadingHistory: boolean;
  isConnected: boolean;
  onSendMessage: (content: string) => void;
  onSendTyping: (isTyping: boolean) => void;
  typingUsers: string[];
  onCreateReservation?: (data: CreateReservationRequest) => Promise<void>;
}

export function AdminChatMain({
  hospitalName,
  userName,
  hospitalImageUrl,
  medicalSpecialties,
  hospitalId,
  userId,
  messages,
  isLoadingHistory: _isLoadingHistory,
  isConnected,
  onSendMessage,
  onSendTyping,
  typingUsers,
  onCreateReservation,
}: AdminChatMainProps) {
  const router = useRouter();
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [isMemoPanelOpen, setIsMemoPanelOpen] = useState(false);

  const handleBack = () => {
    router.push('/admin/consultations');
  };

  const handleCreateReservation = () => {
    setIsReservationModalOpen(true);
  };

  const handleReservationSubmit = async (data: CreateReservationRequest) => {
    if (!onCreateReservation) return;

    try {
      setIsCreatingReservation(true);
      await onCreateReservation(data);
      setIsReservationModalOpen(false);
    } catch (error) {
      console.error('예약 생성 실패:', error);
      // 에러 처리는 상위 컴포넌트에서 처리
    } finally {
      setIsCreatingReservation(false);
    }
  };

  return (
    <div className='flex h-screen flex-col'>
      {/* 헤더 - k-doc 스타일 */}
      <div className='border-b bg-white px-4 py-3'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' onClick={handleBack}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <AdminChatHeader
            hospitalName={hospitalName}
            userName={userName}
            hospitalImageUrl={hospitalImageUrl}
            medicalSpecialties={medicalSpecialties}
            isConnected={isConnected}
            typingUsers={typingUsers}
            onCreateReservation={handleCreateReservation}
            onOpenMemo={() => setIsMemoPanelOpen(true)}
          />
        </div>
      </div>

      {/* 메시지 리스트 - k-doc 스타일 */}
      <AdminMessageList messages={messages} />

      {/* 채팅 입력 - k-doc 스타일 */}
      <AdminChatInput
        onSendMessage={onSendMessage}
        onSendTyping={onSendTyping}
        disabled={!isConnected}
        placeholder='관리자 메시지를 입력하세요...'
        userId={userId}
      />
      {!isConnected && (
        <div className='bg-white px-5 pb-2'>
          <p className='text-muted-foreground text-sm'>연결 중... 잠시만 기다려주세요.</p>
        </div>
      )}

      {/* 예약 생성 모달 */}
      <AdminCreateReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        onSubmit={handleReservationSubmit}
        hospitalId={hospitalId}
        userId={userId}
        hospitalName={hospitalName}
        isLoading={isCreatingReservation}
      />

      {/* 메모 패널 */}
      <ConsultationMemoPanel
        userId={userId}
        hospitalId={hospitalId}
        open={isMemoPanelOpen}
        onOpenChange={setIsMemoPanelOpen}
      />
    </div>
  );
}
