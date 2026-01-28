'use client';

import React, { useState } from 'react';
import { type AdminChatMessage } from '@/lib/types/admin-chat';
import {
  analyzeMessageContent,
  getMessageDisplayType,
  type MessageDisplayType,
} from '../lib/message-content-handler';
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

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminMessageBubble({
  message,
  isFromAdmin,
  showHeader = true,
  onEdit,
  onDelete,
}: AdminMessageBubbleProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const formattedTime = formatTime(message.timestamp);
  const contentAnalysis = analyzeMessageContent(message.content);
  const displayType: MessageDisplayType = getMessageDisplayType(contentAnalysis);
  const returnUrl =
    typeof window !== 'undefined' ? window.location.pathname : undefined;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isFromAdmin) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleEdit = () => {
    setContextMenu(null);
    onEdit?.(message);
  };

  const handleDelete = () => {
    setContextMenu(null);
    onDelete?.(message.id);
  };

  if (!isFromAdmin) {
    switch (displayType) {
      case 'picture':
        return (
          <UserPictureMessage
            pictures={contentAnalysis.pictures}
            formattedTime={formattedTime}
          />
        );
      case 'file':
        return (
          <UserFileMessage
            files={contentAnalysis.files}
            formattedTime={formattedTime}
          />
        );
      case 'editor':
        return (
          <UserEditorMessage
            editorContent={contentAnalysis.editorContent!}
            formattedTime={formattedTime}
          />
        );
      case 'text':
        return (
          <UserTextMessage
            content={message.content}
            formattedTime={formattedTime}
            returnUrl={returnUrl}
          />
        );
    }
  }

  const adminCommon = {
    formattedTime,
    showHeader,
    isRead: message.isRead,
    adminName: message.adminName,
  };

  const renderAdminContent = () => {
    switch (displayType) {
      case 'picture':
        return (
          <AdminPictureMessage
            pictures={contentAnalysis.pictures}
            {...adminCommon}
          />
        );
      case 'file':
        return (
          <AdminFileMessage files={contentAnalysis.files} {...adminCommon} />
        );
      case 'editor':
        return (
          <AdminEditorMessage
            editorContent={contentAnalysis.editorContent!}
            {...adminCommon}
          />
        );
      case 'text':
        return (
          <AdminTextMessage
            content={message.content}
            returnUrl={returnUrl}
            {...adminCommon}
          />
        );
    }
  };

  return (
    <>
      <div onContextMenu={handleContextMenu}>{renderAdminContent()}</div>
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
}
