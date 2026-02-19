'use client';

import { useRouter } from 'next/navigation';
import { type ChatRoom, getKoreanText } from '@/lib/types/consultation';
import { AdminChatRoomThumbnail } from './AdminChatRoomThumbnail';
import { AdminChatRoomInfo } from './AdminChatRoomInfo';
import { Card } from '@/components/ui/card';

interface AdminChatRoomCardProps {
  chatRoom: ChatRoom;
  returnToListPath: string;
}

export function AdminChatRoomCard({ chatRoom, returnToListPath }: AdminChatRoomCardProps) {
  const router = useRouter();

  // admin에서는 한국어로 고정 (k-doc과 달리 다국어 지원 불필요)
  const hospitalName = getKoreanText(chatRoom.hospitalName) || '병원명 없음';

  const handleClick = () => {
    router.push(
      `/admin/consultations/${chatRoom.hospitalId}/${chatRoom.userId}?returnTo=${encodeURIComponent(returnToListPath)}`,
    );
  };

  return (
    <Card
      className='cursor-pointer overflow-hidden p-3 transition-shadow hover:shadow-md sm:p-4'
      onClick={handleClick}
    >
      <div className='flex min-w-0 gap-3 sm:gap-4'>
        <AdminChatRoomThumbnail
          thumbnailUrl={chatRoom.hospitalThumbnailUrl}
          hospitalName={hospitalName}
        />
        <AdminChatRoomInfo chatRoom={chatRoom} />
      </div>
    </Card>
  );
}
