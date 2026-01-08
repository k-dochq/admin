'use client';

import { type AdminChatMessage } from '@/lib/types/admin-chat';
import { analyzeMessageContent } from '../lib/message-content-handler';
import { AdminPictureMessage } from './AdminPictureMessage';
import { AdminFileMessage } from './AdminFileMessage';
import { AdminEditorMessage } from './AdminEditorMessage';
import { AdminTextMessage } from './AdminTextMessage';
import { UserPictureMessage } from './UserPictureMessage';
import { UserFileMessage } from './UserFileMessage';
import { UserEditorMessage } from './UserEditorMessage';
import { UserTextMessage } from './UserTextMessage';

interface AdminMessageBubbleProps {
  message: AdminChatMessage;
  isFromAdmin: boolean;
  showHeader?: boolean;
}

export function AdminMessageBubble({
  message,
  isFromAdmin,
  showHeader = true,
}: AdminMessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formattedTime = formatTime(message.timestamp);
  const contentAnalysis = analyzeMessageContent(message.content);

  // returnUrl을 현재 URL의 경로로 설정 (pathname만)
  const returnUrl = typeof window !== 'undefined' ? window.location.pathname : undefined;

  if (isFromAdmin) {
    // Admin 메시지 (k-doc의 HospitalMessage 스타일)
    if (contentAnalysis.hasOnlyPictures) {
      return (
        <AdminPictureMessage
          pictures={contentAnalysis.pictures}
          formattedTime={formattedTime}
          showHeader={showHeader}
        />
      );
    }

    if (contentAnalysis.hasOnlyFiles) {
      return (
        <AdminFileMessage
          files={contentAnalysis.files}
          formattedTime={formattedTime}
          showHeader={showHeader}
        />
      );
    }

    if (contentAnalysis.hasEditor && contentAnalysis.editorContent) {
      return (
        <AdminEditorMessage
          editorContent={contentAnalysis.editorContent}
          formattedTime={formattedTime}
          showHeader={showHeader}
        />
      );
    }

    return (
      <AdminTextMessage
        content={message.content}
        formattedTime={formattedTime}
        returnUrl={returnUrl}
        showHeader={showHeader}
      />
    );
  } else {
    // User 메시지 (k-doc의 UserMessage 스타일)
    if (contentAnalysis.hasOnlyPictures) {
      return (
        <UserPictureMessage pictures={contentAnalysis.pictures} formattedTime={formattedTime} />
      );
    }

    if (contentAnalysis.hasOnlyFiles) {
      return <UserFileMessage files={contentAnalysis.files} formattedTime={formattedTime} />;
    }

    if (contentAnalysis.hasEditor && contentAnalysis.editorContent) {
      return (
        <UserEditorMessage
          editorContent={contentAnalysis.editorContent}
          formattedTime={formattedTime}
        />
      );
    }

    return (
      <UserTextMessage
        content={message.content}
        formattedTime={formattedTime}
        returnUrl={returnUrl}
      />
    );
  }
}
