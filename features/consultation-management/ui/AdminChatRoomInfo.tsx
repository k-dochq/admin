'use client';

import { type ChatRoom, getKoreanText } from '@/lib/types/consultation';
import { AdminChatRoomHeader } from './AdminChatRoomHeader';
import { AdminChatRoomTitle } from './AdminChatRoomTitle';
import { AdminChatRoomMessage } from './AdminChatRoomMessage';

interface AdminChatRoomInfoProps {
  chatRoom: ChatRoom;
}

export function AdminChatRoomInfo({ chatRoom }: AdminChatRoomInfoProps) {
  const hospitalName = getKoreanText(chatRoom.hospitalName) || '병원명 없음';
  const districtName = chatRoom.districtName ? getKoreanText(chatRoom.districtName) : '';

  return (
    <div className='flex min-w-0 flex-1 flex-col justify-center'>
      <AdminChatRoomHeader
        districtName={districtName}
        lastMessageDate={chatRoom.lastMessageDate}
        userDisplayName={chatRoom.userDisplayName}
      />
      <div className='h-[2px]' />
      <AdminChatRoomTitle hospitalName={hospitalName} />
      <div className='h-2' />
      <AdminChatRoomMessage
        lastMessageContent={chatRoom.lastMessageContent}
        lastMessageSenderType={chatRoom.lastMessageSenderType}
        unreadCount={chatRoom.unreadCount}
      />
    </div>
  );
}
