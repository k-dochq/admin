'use client';

import React, { useState } from 'react';
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
import { MessageContextMenu } from './MessageContextMenu';

interface AdminMessageBubbleProps {
  message: AdminChatMessage;
  isFromAdmin: boolean;
  showHeader?: boolean;
  onEdit?: (message: AdminChatMessage) => void;
  onDelete?: (messageId: string) => void;
}

export function AdminMessageBubble({
  message,
  isFromAdmin,
  showHeader = true,
  onEdit,
  onDelete,
}: AdminMessageBubbleProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isFromAdmin) return; // 관리자 메시지만

    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleEdit = () => {
    setContextMenu(null);
    if (onEdit) {
      onEdit(message);
    }
  };

  const handleDelete = () => {
    setContextMenu(null);
    if (onDelete) {
      onDelete(message.id);
    }
  };
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
    return (
      <>
        <div onContextMenu={handleContextMenu}>
          {contentAnalysis.hasOnlyPictures && (
            <AdminPictureMessage
              pictures={contentAnalysis.pictures}
              formattedTime={formattedTime}
              showHeader={showHeader}
              isRead={message.isRead}
            />
          )}
          {contentAnalysis.hasOnlyFiles && (
            <AdminFileMessage
              files={contentAnalysis.files}
              formattedTime={formattedTime}
              showHeader={showHeader}
              isRead={message.isRead}
            />
          )}
          {contentAnalysis.hasEditor && contentAnalysis.editorContent && (
            <AdminEditorMessage
              editorContent={contentAnalysis.editorContent}
              formattedTime={formattedTime}
              showHeader={showHeader}
              isRead={message.isRead}
            />
          )}
          {!contentAnalysis.hasOnlyPictures &&
            !contentAnalysis.hasOnlyFiles &&
            !contentAnalysis.hasEditor && (
              <AdminTextMessage
                content={message.content}
                formattedTime={formattedTime}
                returnUrl={returnUrl}
                showHeader={showHeader}
                isRead={message.isRead}
              />
            )}
        </div>
        {contextMenu && (
          <MessageContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={() => setContextMenu(null)}
          />
        )}
      </>
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
