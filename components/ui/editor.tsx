'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';
import { createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Palette,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// FontSize 커스텀 extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: { chain: () => any }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: { chain: () => any }) => {
          return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
        },
    };
  },
});

// 색상 팔레트
const COLORS = [
  { name: '기본', value: null },
  { name: '빨강', value: '#ef4444' },
  { name: '주황', value: '#f97316' },
  { name: '노랑', value: '#eab308' },
  { name: '초록', value: '#22c55e' },
  { name: '파랑', value: '#3b82f6' },
  { name: '보라', value: '#a855f7' },
  { name: '분홍', value: '#ec4899' },
  { name: '회색', value: '#6b7280' },
  { name: '검정', value: '#000000' },
];

// 글자 크기 옵션
const FONT_SIZES = [
  { name: '기본', value: null },
  { name: '10px', value: '10px' },
  { name: '12px (작게)', value: '12px' },
  { name: '14px (보통)', value: '14px' },
  { name: '16px', value: '16px' },
  { name: '18px (크게)', value: '18px' },
  { name: '20px', value: '20px' },
  { name: '24px (아주 크게)', value: '24px' },
  { name: '28px', value: '28px' },
  { name: '32px (특대)', value: '32px' },
  { name: '36px', value: '36px' },
  { name: '48px', value: '48px' },
];

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
      TextStyle,
      Color,
      FontSize,
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

        {/* 색상 선택 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' title='텍스트 색상' className='h-8 w-8 p-0'>
              <Palette className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {COLORS.map((color) => (
              <DropdownMenuItem
                key={color.name}
                onClick={() => {
                  if (color.value) {
                    editor.chain().focus().setColor(color.value).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                }}
              >
                <div className='flex items-center gap-2'>
                  <div
                    className='h-4 w-4 rounded border'
                    style={{ backgroundColor: color.value || '#ffffff' }}
                  />
                  <span>{color.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <Separator className='my-1' />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                const input = document.createElement('input');
                input.type = 'color';
                input.value = '#000000';
                input.onchange = (e) => {
                  const color = (e.target as HTMLInputElement).value;
                  editor.chain().focus().setColor(color).run();
                };
                input.click();
              }}
            >
              <div className='flex items-center gap-2'>
                <div className='h-4 w-4 rounded border bg-gradient-to-r from-red-500 via-green-500 to-blue-500' />
                <span>직접 선택...</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 글자 크기 선택 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' title='글자 크기' className='h-8 w-8 p-0'>
              <Type className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {FONT_SIZES.map((size) => (
              <DropdownMenuItem
                key={size.name}
                onClick={() => {
                  if (size.value) {
                    editor.chain().focus().setFontSize(size.value).run();
                  } else {
                    editor.chain().focus().unsetFontSize().run();
                  }
                }}
              >
                <span
                  style={{
                    fontSize: size.value ? Math.min(parseInt(size.value), 20) + 'px' : '14px',
                  }}
                >
                  {size.name}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
