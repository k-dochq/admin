'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AdminMessageList } from './AdminMessageList';
import { AdminChatInput } from './AdminChatInput';
import { AdminChatHeader } from './AdminChatHeader';
import { AdminCreateReservationModal } from '@/features/reservation-management/ui/AdminCreateReservationModal';
import { ConsultationMemoPanel, useConsultationMemos } from '@/features/consultation-memo';
import { LanguageSelectionModal } from '@/features/medical-survey/ui/LanguageSelectionModal';
import { MedicalSurveyLanguageModal } from '@/features/medical-survey/ui/MedicalSurveyLanguageModal';
import { type AdminChatMessage } from '@/lib/types/admin-chat';
import { type CreateReservationRequest } from '@/features/reservation-management/api/entities/types';
import { type HospitalLocale } from '@/shared/lib/types/locale';

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
  hasMore?: boolean;
  onLoadMore?: () => Promise<void> | void;
  onCreateReservation?: (data: CreateReservationRequest) => Promise<void>;
  onCreateMedicalSurvey?: (language: HospitalLocale, cooldownDays?: number) => Promise<void>;
  onSendNotificationEmail?: (language: HospitalLocale) => Promise<void>;
  onEditMessage?: (message: AdminChatMessage) => void;
  onDeleteMessage?: (messageId: string) => void;
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
  hasMore,
  onLoadMore,
  onCreateReservation,
  onCreateMedicalSurvey,
  onSendNotificationEmail,
  onEditMessage,
  onDeleteMessage,
}: AdminChatMainProps) {
  const router = useRouter();
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [isMemoPanelOpen, setIsMemoPanelOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isEmailLanguageModalOpen, setIsEmailLanguageModalOpen] = useState(false);

  // 메모 개수 조회
  const { data: memos } = useConsultationMemos(userId, hospitalId);
  const memoCount = memos?.length ?? 0;

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

  const handleCreateMedicalSurvey = () => {
    setIsLanguageModalOpen(true);
  };

  const handleLanguageSelect = async (language: HospitalLocale, cooldownDays?: number) => {
    if (!onCreateMedicalSurvey) return;

    try {
      await onCreateMedicalSurvey(language, cooldownDays);
      setIsLanguageModalOpen(false);
    } catch (error) {
      console.error('질문생성 실패:', error);
      // 에러 처리는 상위 컴포넌트에서 처리
    }
  };

  const handleSendNotificationEmail = () => {
    setIsEmailLanguageModalOpen(true);
  };

  const handleEmailLanguageSelect = async (language: HospitalLocale) => {
    if (!onSendNotificationEmail) return;

    try {
      await onSendNotificationEmail(language);
      setIsEmailLanguageModalOpen(false);
    } catch (error) {
      console.error('이메일 발송 실패:', error);
      // 에러 처리는 상위 컴포넌트에서 처리
    }
  };

  return (
    <div className='flex h-screen flex-col overflow-hidden'>
      {/* 헤더 - k-doc 스타일 */}
      <div className='border-b bg-white px-3 py-2 sm:px-4 sm:py-3'>
        <div className='flex min-w-0 items-center gap-2 sm:gap-3'>
          <Button variant='ghost' size='sm' onClick={handleBack} className='flex-shrink-0'>
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
            onCreateMedicalSurvey={handleCreateMedicalSurvey}
            onSendNotificationEmail={handleSendNotificationEmail}
            onOpenMemo={() => setIsMemoPanelOpen(true)}
            memoCount={memoCount}
          />
        </div>
      </div>

      {/* 메시지 리스트 - k-doc 스타일 */}
      <AdminMessageList
        messages={messages}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        onEditMessage={onEditMessage}
        onDeleteMessage={onDeleteMessage}
      />

      {/* 채팅 입력 - k-doc 스타일 */}
      <AdminChatInput
        onSendMessage={onSendMessage}
        onSendTyping={onSendTyping}
        disabled={!isConnected}
        placeholder='관리자 메시지를 입력하세요...'
        userId={userId}
      />
      {!isConnected && (
        <div className='bg-white px-3 pb-2 sm:px-5'>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            연결 중... 잠시만 기다려주세요.
          </p>
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

      {/* 언어 선택 모달 (질문생성용) */}
      <MedicalSurveyLanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        onSelect={handleLanguageSelect}
      />

      {/* 언어 선택 모달 (이메일 발송용) */}
      <LanguageSelectionModal
        isOpen={isEmailLanguageModalOpen}
        onClose={() => setIsEmailLanguageModalOpen(false)}
        onSelect={handleEmailLanguageSelect}
        title='메일템플릿 언어 선택'
      />
    </div>
  );
}
