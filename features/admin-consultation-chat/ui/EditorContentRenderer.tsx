'use client';

interface EditorContentRendererProps {
  htmlContent: string;
}

export function EditorContentRenderer({ htmlContent }: EditorContentRendererProps) {
  return (
    <div className='prose prose-sm max-w-none' dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
