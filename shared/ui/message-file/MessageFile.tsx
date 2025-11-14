'use client';

import {
  getFileIcon,
  getFileTypeCategory,
  getFileColor,
  formatFileSize,
} from '@/shared/config/file-types';

interface MessageFileProps {
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

export function MessageFile({ url, fileName, fileSize, mimeType }: MessageFileProps) {
  const fileCategory = mimeType ? getFileTypeCategory(mimeType) : 'unknown';
  const fileIcon = mimeType ? getFileIcon(mimeType) : '📎';
  const fileColor = getFileColor(fileCategory);
  const formattedSize = fileSize ? formatFileSize(fileSize) : '';

  const downloadLabel = '다운로드';

  return (
    <div className='flex w-full max-w-[270px] flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm'>
      {/* 파일 정보 */}
      <div className='flex items-start gap-3'>
        {/* 파일 아이콘 */}
        <div
          className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl'
          style={{ backgroundColor: `${fileColor}20` }}
        >
          {fileIcon}
        </div>

        {/* 파일명 및 크기 */}
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium text-gray-900' title={fileName}>
            {fileName}
          </p>
          {formattedSize && <p className='text-xs text-gray-500'>{formattedSize}</p>}
        </div>
      </div>

      {/* 다운로드 버튼 */}
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200'
      >
        <svg
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
          />
        </svg>
        {downloadLabel}
      </a>
    </div>
  );
}
