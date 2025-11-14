'use client';

import { MessageFile } from '@/shared/ui/message-file';
import { type FileData } from '@/shared/lib/file-parser';

interface FileMessageProps {
  files: FileData[];
  align?: 'start' | 'end';
}

export function FileMessage({ files, align = 'end' }: FileMessageProps) {
  return (
    <div className={`flex flex-col gap-2 ${align === 'end' ? 'items-end' : 'items-start'}`}>
      {files.map((file, index) => (
        <MessageFile
          key={`file-${index}`}
          url={file.url}
          fileName={file.fileName || 'Unknown file'}
          fileSize={file.fileSize}
          mimeType={file.mimeType}
        />
      ))}
    </div>
  );
}
