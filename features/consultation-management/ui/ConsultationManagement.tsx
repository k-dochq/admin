'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useAdminChatRooms } from '@/lib/queries/consultation-chat-rooms';
import { useAdminListUrl } from '@/lib/hooks/use-admin-list-url';
import { AdminChatRoomCard } from './AdminChatRoomCard';
import { AdminChatRoomSkeleton } from './AdminChatRoomSkeleton';
import { AdminChatRoomErrorState } from './AdminChatRoomErrorState';
import { AdminChatRoomEmptyState } from './AdminChatRoomEmptyState';
import { Pagination } from '@/components/ui/pagination';

interface ConsultationManagementProps {
  excludeTestAccounts?: boolean;
}

export function ConsultationManagement({
  excludeTestAccounts = true,
}: ConsultationManagementProps) {
  const { updateURL, returnToListPath, searchParams } = useAdminListUrl('consultations');
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = 10; // 페이지당 아이템 수

  const { data, isLoading, error, refetch, isFetching } = useAdminChatRooms(
    currentPage,
    limit,
    excludeTestAccounts,
  );

  // 필터 변경 시에만 페이지를 1로 리셋 (마운트 시 URL 덮어쓰지 않음)
  const prevExcludeTestAccounts = useRef(excludeTestAccounts);
  useEffect(() => {
    if (prevExcludeTestAccounts.current !== excludeTestAccounts) {
      prevExcludeTestAccounts.current = excludeTestAccounts;
      updateURL({ page: '1' });
    }
  }, [excludeTestAccounts, updateURL]);

  const chatRooms = useMemo(() => data?.chatRooms || [], [data?.chatRooms]);
  const pagination = data?.pagination;

  // 첫 로딩 여부 확인 (데이터가 없고 로딩 중일 때)
  const isInitialLoading = isLoading && !data;

  useEffect(() => {
    if (chatRooms) {
      console.log('📱 Admin Chat Rooms Data:', chatRooms);
      console.log('📊 Total chat rooms:', chatRooms.length);

      chatRooms.forEach((room, index) => {
        console.log(`🏥 Chat Room ${index + 1}:`, {
          hospitalId: room.hospitalId,
          userId: room.userId,
          hospitalName: room.hospitalName,
          userDisplayName: room.userDisplayName,
          districtName: room.districtName,
          thumbnailUrl: room.hospitalThumbnailUrl,
          lastMessage: room.lastMessageContent,
          lastMessageDate: room.lastMessageDate,
          senderType: room.lastMessageSenderType,
        });
      });
    }
  }, [chatRooms]);

  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching admin chat rooms:', error);
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      console.log('⏳ Loading admin chat rooms...');
    }
  }, [isLoading]);

  const handleRetry = () => {
    refetch();
  };

  const handlePageChange = (page: number) => {
    updateURL({ page: page === 1 ? null : String(page) });
  };

  if (error) {
    return <AdminChatRoomErrorState onRetry={handleRetry} />;
  }

  if (isInitialLoading) {
    return <AdminChatRoomSkeleton count={5} />;
  }

  if (!chatRooms || chatRooms.length === 0) {
    return <AdminChatRoomEmptyState />;
  }

  return (
    <div className='min-w-0 space-y-4 sm:space-y-6'>
      {/* 로딩 오버레이 */}
      {isFetching && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/20 backdrop-blur-[1px]'>
          <div className='flex items-center gap-2 text-xs text-gray-500 sm:text-sm'>
            <div className='h-3 w-3 animate-spin rounded-full border-b-2 border-gray-400'></div>
            로딩 중...
          </div>
        </div>
      )}

      <div className='min-w-0 space-y-3 sm:space-y-4'>
        {chatRooms.map((chatRoom) => (
          <AdminChatRoomCard
            key={`${chatRoom.hospitalId}-${chatRoom.userId}`}
            chatRoom={chatRoom}
            returnToListPath={returnToListPath}
          />
        ))}
      </div>

      {pagination && (
        <div className='flex min-w-0 flex-col items-center gap-3 sm:gap-4'>
          <div className='text-center text-xs text-gray-600 sm:text-sm'>
            총 {pagination.totalCount}개의 채팅방 중 {(currentPage - 1) * limit + 1}-
            {Math.min(currentPage * limit, pagination.totalCount)}개 표시
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onPageChange={handlePageChange}
            isLoading={isFetching}
          />
        </div>
      )}
    </div>
  );
}
