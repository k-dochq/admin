'use client';

import { type ChatRoom, getKoreanText } from '@/lib/types/consultation';
import { AdminChatRoomThumbnail } from './AdminChatRoomThumbnail';
import { AdminChatRoomInfo } from './AdminChatRoomInfo';
import { Card } from '@/components/ui/card';

interface AdminChatRoomCardProps {
  chatRoom: ChatRoom;
}

export function AdminChatRoomCard({ chatRoom }: AdminChatRoomCardProps) {
  // admin에서는 한국어로 고정 (k-doc과 달리 다국어 지원 불필요)
  const hospitalName = getKoreanText(chatRoom.hospitalName) || '병원명 없음';

  return (
    <Card className='cursor-pointer p-4 transition-shadow hover:shadow-md'>
      <div className='flex gap-4'>
        <AdminChatRoomThumbnail
          thumbnailUrl={chatRoom.hospitalThumbnailUrl}
          hospitalName={hospitalName}
        />
        <AdminChatRoomInfo chatRoom={chatRoom} />
      </div>
    </Card>
  );
}
