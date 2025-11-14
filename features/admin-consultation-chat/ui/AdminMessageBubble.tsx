'use client';

import React from 'react';
import { MessageBubble, MessageTail, MessageTime } from '@/shared/ui/message-bubble';
import { type AdminChatMessage } from '@/lib/types/admin-chat';
import { parseCombinedMessage } from '@/shared/lib/message-parser';
import { analyzeMessageContent } from '../lib/message-content-handler';
import { PictureMessage } from './PictureMessage';
import { FileMessage } from './FileMessage';

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
    // Picture만 있는 경우: 버블 없이 이미지만 표시
    if (contentAnalysis.hasOnlyPictures) {
      return (
        <div className='relative flex w-full shrink-0 flex-col content-stretch items-start justify-start gap-1'>
          {showHeader && (
            <div className='flex items-center gap-2'>
              <span className="font-['Pretendard:Medium',_sans-serif] text-[14px] leading-[20px] text-neutral-900">
                관리자
              </span>
            </div>
          )}
          <div className='relative box-border flex w-full shrink-0 content-stretch items-end justify-start gap-2 py-0 pr-0 pl-[38px]'>
            <div className='relative flex min-w-0 shrink-0 content-stretch items-start justify-start'>
              <PictureMessage pictures={contentAnalysis.pictures} align='start' />
            </div>
            <MessageTime time={formattedTime} />
          </div>
        </div>
      );
    }

    // File만 있는 경우: 버블 없이 파일만 표시
    if (contentAnalysis.hasOnlyFiles) {
      return (
        <div className='relative flex w-full shrink-0 flex-col content-stretch items-start justify-start gap-1'>
          {showHeader && (
            <div className='flex items-center gap-2'>
              <span className="font-['Pretendard:Medium',_sans-serif] text-[14px] leading-[20px] text-neutral-900">
                관리자
              </span>
            </div>
          )}
          <div className='relative box-border flex w-full shrink-0 content-stretch items-end justify-start gap-2 py-0 pr-0 pl-[38px]'>
            <div className='relative flex min-w-0 shrink-0 content-stretch items-start justify-start'>
              <FileMessage files={contentAnalysis.files} align='start' />
            </div>
            <MessageTime time={formattedTime} />
          </div>
        </div>
      );
    }

    // 텍스트만 있는 경우: 기존처럼 버블로 표시
    return (
      <div className='relative flex w-full shrink-0 flex-col content-stretch items-start justify-start gap-1'>
        {showHeader && (
          <div className='flex items-center gap-2'>
            <span className="font-['Pretendard:Medium',_sans-serif] text-[14px] leading-[20px] text-neutral-900">
              관리자
            </span>
          </div>
        )}
        <div className='relative box-border flex w-full shrink-0 content-stretch items-end justify-start gap-2 py-0 pr-0 pl-[38px]'>
          <div className='relative flex shrink-0 content-stretch items-start justify-start'>
            <div className='relative flex shrink-0 items-center justify-center'>
              <div className='flex-none scale-y-[-100%]'>
                <MessageTail variant='hospital' />
              </div>
            </div>
            <MessageBubble variant='hospital' className='self-stretch'>
              <div className="relative shrink-0 font-['Pretendard:Regular',_sans-serif] text-[14px] leading-[20px] whitespace-pre-wrap text-neutral-900 not-italic">
                {parseCombinedMessage({
                  message: message.content,
                  returnUrl,
                }).map((item, index) => {
                  if (typeof item === 'string') {
                    return <span key={`text-${index}`}>{item}</span>;
                  }
                  // React 요소는 이미 key가 있으므로 그대로 반환
                  return item;
                })}
              </div>
            </MessageBubble>
          </div>
          <MessageTime time={formattedTime} />
        </div>
      </div>
    );
  } else {
    // User 메시지 (k-doc의 UserMessage 스타일)
    // Picture만 있는 경우: 버블 없이 이미지만 표시
    if (contentAnalysis.hasOnlyPictures) {
      return (
        <div className='relative flex w-full shrink-0 content-stretch items-end justify-end gap-2'>
          <MessageTime time={formattedTime} />
          <div className='relative flex shrink-0 content-stretch items-end justify-end'>
            <PictureMessage pictures={contentAnalysis.pictures} align='end' />
          </div>
        </div>
      );
    }

    // File만 있는 경우: 버블 없이 파일만 표시
    if (contentAnalysis.hasOnlyFiles) {
      return (
        <div className='relative flex w-full shrink-0 content-stretch items-end justify-end gap-2'>
          <MessageTime time={formattedTime} />
          <div className='relative flex shrink-0 content-stretch items-end justify-end'>
            <FileMessage files={contentAnalysis.files} align='end' />
          </div>
        </div>
      );
    }

    // 텍스트만 있는 경우: 기존처럼 버블로 표시
    return (
      <div className='relative flex w-full shrink-0 content-stretch items-end justify-end gap-2'>
        <MessageTime time={formattedTime} />
        <div className='relative flex shrink-0 content-stretch items-end justify-end'>
          <div className='flex flex-row items-end self-stretch'>
            <MessageBubble variant='user' className='h-full items-end justify-start'>
              <div className="relative shrink-0 font-['Pretendard:Regular',_sans-serif] text-[14px] leading-[20px] whitespace-pre-wrap text-neutral-50 not-italic">
                {parseCombinedMessage({
                  message: message.content,
                  returnUrl,
                }).map((item, index) => {
                  if (typeof item === 'string') {
                    return <span key={`text-${index}`}>{item}</span>;
                  }
                  // React 요소는 이미 key가 있으므로 그대로 반환
                  return item;
                })}
              </div>
            </MessageBubble>
          </div>
          <MessageTail variant='user' />
        </div>
      </div>
    );
  }
}
