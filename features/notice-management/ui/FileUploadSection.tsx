'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Upload, X, FileImage, FileText, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { type NoticeFile, type NoticeFileType } from '@/features/notice-management/api';
import { useUploadNoticeFile, useDeleteNoticeFile } from '@/lib/mutations/notice-file-upload';
import { useNoticeFiles } from '@/lib/queries/notices';

interface FileUploadSectionProps {
  noticeId: string;
}

interface FilePreviewProps {
  file: NoticeFile;
  onDelete: (fileId: string) => void;
  isDeleting?: boolean;
}

function FilePreview({ file, onDelete, isDeleting }: FilePreviewProps) {
  const getFileIcon = (fileType: NoticeFileType) => {
    return fileType === 'IMAGE' ? (
      <FileImage className='h-4 w-4' />
    ) : (
      <FileText className='h-4 w-4' />
    );
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className='flex items-center justify-between rounded-lg border p-3'>
      <div className='flex items-center space-x-3'>
        {getFileIcon(file.fileType)}
        <div>
          <p className='text-sm font-medium'>{file.fileName}</p>
          <div className='text-muted-foreground flex items-center space-x-2 text-xs'>
            <Badge variant='secondary'>{file.fileType}</Badge>
            <span>{formatFileSize(file.fileSize)}</span>
          </div>
        </div>
      </div>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => onDelete(file.id)}
        disabled={isDeleting}
        className='text-destructive hover:text-destructive'
      >
        {isDeleting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
      </Button>
    </div>
  );
}

export function FileUploadSection({ noticeId }: FileUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 목록을 직접 가져오기
  const { data: files = [], refetch } = useNoticeFiles(noticeId);

  const uploadFileMutation = useUploadNoticeFile();
  const deleteFileMutation = useDeleteNoticeFile();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(selectedFiles)) {
        // 파일 타입 결정
        const fileType: NoticeFileType = file.type.startsWith('image/') ? 'IMAGE' : 'ATTACHMENT';

        // mutation을 사용하여 파일 업로드 (클라이언트에서 직접 Supabase Storage 업로드)
        const uploadedFile = await uploadFileMutation.mutateAsync({
          file,
          noticeId,
          fileType,
        });

        // 파일 목록 새로고침
        refetch();
      }
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      // 삭제할 파일 정보 찾기
      const fileToDeleteInfo = files.find((file) => file.id === fileToDelete);

      // mutation을 사용하여 파일 삭제
      await deleteFileMutation.mutateAsync({
        noticeId,
        fileId: fileToDelete,
        path: fileToDeleteInfo?.fileUrl ? extractPathFromUrl(fileToDeleteInfo.fileUrl) : undefined,
      });

      // 파일 목록 새로고침
      refetch();

      setDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error('File delete error:', error);
    }
  };

  // URL에서 파일 경로 추출하는 헬퍼 함수
  const extractPathFromUrl = (url: string): string | undefined => {
    try {
      // URL에서 파일 경로 부분만 추출
      // 예: https://xxx.supabase.co/storage/v1/object/public/kdoc-storage/notices/123/image/uuid.png
      // -> notices/123/image/uuid.png
      const urlParts = url.split('/');
      const storageIndex = urlParts.findIndex((part) => part === 'kdoc-storage');
      if (storageIndex !== -1 && storageIndex + 1 < urlParts.length) {
        return urlParts.slice(storageIndex + 1).join('/');
      }
    } catch (error) {
      console.warn('Failed to extract path from URL:', error);
    }
    return undefined;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const imageFiles = files.filter((file) => file.fileType === 'IMAGE');
  const attachmentFiles = files.filter((file) => file.fileType === 'ATTACHMENT');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>첨부 파일</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 업로드 버튼 */}
          <div className='flex items-center justify-between'>
            <div>
              <Label htmlFor='file-upload'>파일 선택</Label>
              <p className='text-muted-foreground text-sm'>
                이미지와 첨부파일을 업로드할 수 있습니다.
              </p>
            </div>
            <Button onClick={handleUploadClick} disabled={isUploading}>
              {isUploading ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Upload className='mr-2 h-4 w-4' />
              )}
              파일 업로드
            </Button>
          </div>

          <Input
            ref={fileInputRef}
            id='file-upload'
            type='file'
            multiple
            accept='image/*,.pdf,.doc,.docx,.txt,.zip,.rar'
            onChange={handleFileSelect}
            className='hidden'
          />

          {/* 이미지 파일 목록 */}
          {imageFiles.length > 0 && (
            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>이미지 파일</h4>
              <div className='space-y-2'>
                {imageFiles.map((file) => (
                  <FilePreview
                    key={file.id}
                    file={file}
                    onDelete={handleDeleteClick}
                    isDeleting={deleteFileMutation.isPending && fileToDelete === file.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 첨부파일 목록 */}
          {attachmentFiles.length > 0 && (
            <div className='space-y-2'>
              {imageFiles.length > 0 && <Separator />}
              <h4 className='text-sm font-medium'>첨부 파일</h4>
              <div className='space-y-2'>
                {attachmentFiles.map((file) => (
                  <FilePreview
                    key={file.id}
                    file={file}
                    onDelete={handleDeleteClick}
                    isDeleting={deleteFileMutation.isPending && fileToDelete === file.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 파일이 없을 때 */}
          {files.length === 0 && (
            <div className='flex items-center justify-center py-8 text-center'>
              <div>
                <Upload className='text-muted-foreground mx-auto h-12 w-12' />
                <h3 className='text-muted-foreground mt-2 text-sm font-medium'>
                  첨부 파일이 없습니다
                </h3>
                <p className='text-muted-foreground mt-1 text-xs'>
                  파일을 업로드하려면 위의 버튼을 클릭하세요.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>파일 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
