'use client';

import { useEffect } from 'react';
import { useAdminChatRooms } from '@/lib/queries/consultation-chat-rooms';
import { AdminChatRoomCard } from './AdminChatRoomCard';
import { AdminChatRoomSkeleton } from './AdminChatRoomSkeleton';
import { AdminChatRoomErrorState } from './AdminChatRoomErrorState';
import { AdminChatRoomEmptyState } from './AdminChatRoomEmptyState';

export function ConsultationManagement() {
  const { data: chatRooms, isLoading, error, refetch } = useAdminChatRooms();

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

  if (isLoading) {
    return <AdminChatRoomSkeleton count={5} />;
  }

  if (error) {
    return <AdminChatRoomErrorState onRetry={handleRetry} />;
  }

  if (!chatRooms || chatRooms.length === 0) {
    return <AdminChatRoomEmptyState />;
  }

  return (
    <div className='space-y-4'>
      {chatRooms.map((chatRoom) => (
        <AdminChatRoomCard key={`${chatRoom.hospitalId}-${chatRoom.userId}`} chatRoom={chatRoom} />
      ))}
    </div>
  );
}
