'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function Editor({
  content = '',
  onChange,
  placeholder = '내용을 입력하세요...',
  className,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      CodeBlockLowlight.configure({
        lowlight: createLowlight(),
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  if (!editor) {
    return (
      <div className={cn('rounded-lg border', className)}>
        <div className='flex min-h-[200px] items-center justify-center'>
          <div className='text-muted-foreground text-sm'>에디터를 로딩 중...</div>
        </div>
      </div>
    );
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size='sm'
      onClick={onClick}
      title={title}
      className='h-8 w-8 p-0'
    >
      {children}
    </Button>
  );

  return (
    <div className={cn('rounded-lg border', className)}>
      {/* 툴바 */}
      <div className='flex items-center gap-1 border-b p-2'>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title='굵게'
        >
          <Bold className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title='기울임'
        >
          <Italic className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title='취소선'
        >
          <Strikethrough className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title='인라인 코드'
        >
          <Code className='h-4 w-4' />
        </ToolbarButton>

        <Separator orientation='vertical' className='h-6' />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title='제목 1'
        >
          <Heading1 className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title='제목 2'
        >
          <Heading2 className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title='제목 3'
        >
          <Heading3 className='h-4 w-4' />
        </ToolbarButton>

        <Separator orientation='vertical' className='h-6' />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title='순서 없는 목록'
        >
          <List className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title='순서 있는 목록'
        >
          <ListOrdered className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title='인용구'
        >
          <Quote className='h-4 w-4' />
        </ToolbarButton>

        <Separator orientation='vertical' className='h-6' />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title='실행 취소'>
          <Undo className='h-4 w-4' />
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title='다시 실행'>
          <Redo className='h-4 w-4' />
        </ToolbarButton>
      </div>

      {/* 에디터 내용 */}
      <EditorContent editor={editor} />

      {/* 글자 수 표시 */}
      <div className='text-muted-foreground flex justify-end border-t p-2 text-xs'>
        {editor.storage.characterCount.characters()} 글자
      </div>
    </div>
  );
}
