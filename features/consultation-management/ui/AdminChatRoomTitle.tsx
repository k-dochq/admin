'use client';

interface AdminChatRoomTitleProps {
  hospitalName: string;
}

export function AdminChatRoomTitle({ hospitalName }: AdminChatRoomTitleProps) {
  return <h3 className='text-foreground truncate text-lg font-semibold'>{hospitalName}</h3>;
}
