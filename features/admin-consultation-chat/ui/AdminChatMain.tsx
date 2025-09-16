'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AdminMessageList } from './AdminMessageList';
import { AdminChatInput } from './AdminChatInput';
import { AdminChatHeader } from './AdminChatHeader';
import { type AdminChatMessage } from '@/lib/types/admin-chat';

interface AdminChatMainProps {
  hospitalName: string;
  userName: string;
  hospitalImageUrl?: string;
  messages: AdminChatMessage[];
  isLoadingHistory: boolean;
  isConnected: boolean;
  onSendMessage: (content: string) => void;
  onSendTyping: (isTyping: boolean) => void;
  typingUsers: string[];
}

export function AdminChatMain({
  hospitalName,
  userName,
  hospitalImageUrl,
  messages,
  isLoadingHistory,
  isConnected,
  onSendMessage,
  onSendTyping,
  typingUsers,
}: AdminChatMainProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/admin/consultations');
  };

  return (
    <div className='flex h-screen flex-col'>
      {/* 헤더 */}
      <div className='border-b bg-white px-4 py-3'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' onClick={handleBack}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <AdminChatHeader
            hospitalName={hospitalName}
            userName={userName}
            hospitalImageUrl={hospitalImageUrl}
            isConnected={isConnected}
            typingUsers={typingUsers}
          />
        </div>
      </div>

      {/* 메시지 리스트 */}
      <div className='flex-1 overflow-hidden'>
        <AdminMessageList messages={messages} />
      </div>

      {/* 채팅 입력 */}
      <div className='border-t bg-white p-4'>
        <AdminChatInput
          onSendMessage={onSendMessage}
          onSendTyping={onSendTyping}
          disabled={!isConnected}
          placeholder='관리자 메시지를 입력하세요...'
        />
        {!isConnected && (
          <p className='text-muted-foreground mt-2 text-sm'>연결 중... 잠시만 기다려주세요.</p>
        )}
      </div>
    </div>
  );
}
