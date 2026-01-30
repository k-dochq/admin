'use client';

import { useState } from 'react';
import { Prisma } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import {
  useYoutubeVideoCategories,
  useDeleteYoutubeVideoCategory,
} from '@/lib/queries/youtube-video-categories';
import { YoutubeVideoCategoryForm } from './YoutubeVideoCategoryForm';
import type { YoutubeVideoCategoryForList } from '../api/entities/types';

export function YoutubeVideoCategoryManagement() {
  const [isActive, setIsActive] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<YoutubeVideoCategoryForList | null>(
    null,
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: categoriesData, isLoading } = useYoutubeVideoCategories({
    isActive: isActive === 'all' ? undefined : isActive === 'true',
  });

  const deleteCategoryMutation = useDeleteYoutubeVideoCategory();

  // 다국어 텍스트 추출
  const getLocalizedText = (jsonText: Prisma.JsonValue | null | undefined): string => {
    if (!jsonText) return '';
    if (typeof jsonText === 'string') return jsonText;
    if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
      const textObj = jsonText as Record<string, unknown>;
      return (
        (textObj.ko as string) ||
        (textObj.en as string) ||
        (textObj.th as string) ||
        (textObj.zh as string) ||
        (textObj.ja as string) ||
        (textObj.hi as string) ||
        (textObj.tl as string) ||
        (textObj.ar as string) ||
        ''
      );
    }
    return '';
  };

  // 카테고리 삭제
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategoryMutation.mutateAsync(selectedCategory.id);
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const categories = categoriesData?.categories || [];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>영상 카테고리 관리</h1>
        <Button onClick={() => setAddDialogOpen(true)} className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          카테고리 추가
        </Button>
      </div>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'>활성화 여부:</label>
              <select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value)}
                className='rounded-md border border-gray-300 px-3 py-1.5 text-sm'
              >
                <option value='all'>전체</option>
                <option value='true'>활성화</option>
                <option value='false'>비활성화</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 카테고리 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리 목록 ({categories.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner text='카테고리 목록을 불러오는 중...' />
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>카테고리명</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>정렬순서</TableHead>
                    <TableHead>활성화</TableHead>
                    <TableHead>영상 수</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className='font-medium'>{getLocalizedText(category.name)}</div>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-[300px] truncate'>
                          {category.description ? getLocalizedText(category.description) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>{category.order ?? '-'}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? 'default' : 'secondary'}>
                          {category.isActive ? '활성화' : '비활성화'}
                        </Badge>
                      </TableCell>
                      <TableCell>{category._count.videos}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedCategory(category);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedCategory(category);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={category._count.videos > 0}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 카테고리 추가 다이얼로그 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>카테고리 추가</DialogTitle>
            <DialogDescription>새로운 영상 카테고리를 추가합니다.</DialogDescription>
          </DialogHeader>
          <YoutubeVideoCategoryForm
            onSuccess={() => {
              setAddDialogOpen(false);
            }}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 카테고리 수정 다이얼로그 */}
      {selectedCategory && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>카테고리 수정</DialogTitle>
              <DialogDescription>영상 카테고리 정보를 수정합니다.</DialogDescription>
            </DialogHeader>
            <YoutubeVideoCategoryForm
              categoryId={selectedCategory.id}
              onSuccess={() => {
                setEditDialogOpen(false);
                setSelectedCategory(null);
              }}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedCategory(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 카테고리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              {selectedCategory && selectedCategory._count.videos > 0 && (
                <span className='text-destructive mt-2 block'>
                  연결된 영상이 있어 삭제할 수 없습니다.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteCategory}
              disabled={
                deleteCategoryMutation.isPending || (selectedCategory?._count.videos ?? 0) > 0
              }
            >
              {deleteCategoryMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
