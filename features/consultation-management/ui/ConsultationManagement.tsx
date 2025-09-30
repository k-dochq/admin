'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAdminChatRooms } from '@/lib/queries/consultation-chat-rooms';
import { AdminChatRoomCard } from './AdminChatRoomCard';
import { AdminChatRoomSkeleton } from './AdminChatRoomSkeleton';
import { AdminChatRoomErrorState } from './AdminChatRoomErrorState';
import { AdminChatRoomEmptyState } from './AdminChatRoomEmptyState';
import { Pagination } from '@/components/ui/pagination';

export function ConsultationManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // 페이지당 아이템 수

  const { data, isLoading, error, refetch, isFetching } = useAdminChatRooms(currentPage, limit);

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
    setCurrentPage(page);
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
    <div className='space-y-6'>
      {/* 로딩 오버레이 */}
      {isFetching && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/20 backdrop-blur-[1px]'>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <div className='h-3 w-3 animate-spin rounded-full border-b-2 border-gray-400'></div>
            로딩 중...
          </div>
        </div>
      )}

      <div className='space-y-4'>
        {chatRooms.map((chatRoom) => (
          <AdminChatRoomCard
            key={`${chatRoom.hospitalId}-${chatRoom.userId}`}
            chatRoom={chatRoom}
          />
        ))}
      </div>

      {pagination && (
        <div className='flex flex-col items-center gap-4'>
          <div className='text-sm text-gray-600'>
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
