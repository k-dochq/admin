'use client';

import { MessageBubble, MessageTail, MessageTime } from '@/shared/ui/message-bubble';
import { EditorContentRenderer } from './EditorContentRenderer';

interface UserEditorMessageProps {
  editorContent: string;
  formattedTime: string;
}

export function UserEditorMessage({ editorContent, formattedTime }: UserEditorMessageProps) {
  return (
    <div className='relative flex w-full shrink-0 flex-col content-stretch items-end gap-1 sm:flex-row sm:items-end sm:justify-end sm:gap-2'>
      <div className='relative flex max-w-[85%] min-w-0 shrink-0 items-end justify-end sm:max-w-[80%]'>
        <div className='flex flex-row items-end justify-end'>
          <MessageBubble variant='user' className='h-full items-end justify-start'>
            <div className="relative shrink-0 font-['Pretendard:Regular',_sans-serif] text-[14px] leading-[20px] break-words text-neutral-50 not-italic">
              <EditorContentRenderer htmlContent={editorContent} />
            </div>
          </MessageBubble>
        </div>
        <MessageTail variant='user' />
      </div>
      <MessageTime time={formattedTime} />
    </div>
  );
}
