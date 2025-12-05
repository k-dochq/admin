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
import { Trash2, Edit, Plus } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useHospitalCategories } from '@/lib/queries/hospital-categories';
import { useDeleteHospitalCategory } from '@/lib/mutations/hospital-category-delete';
import { HospitalCategoryForm } from './HospitalCategoryForm';
import type { HospitalCategory } from '../api';

export function HospitalCategoryManagement() {
  const [isActive, setIsActive] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<HospitalCategory | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: categoriesData,
    isLoading,
    refetch,
  } = useHospitalCategories(isActive === 'all' ? undefined : isActive === 'true');

  const deleteCategoryMutation = useDeleteHospitalCategory();

  // 다국어 텍스트 추출
  const getLocalizedText = (jsonText: Prisma.JsonValue | null | undefined): string => {
    if (!jsonText) return '';
    if (typeof jsonText === 'string') return jsonText;
    if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
      const textObj = jsonText as Record<string, unknown>;
      return (
        (textObj.ko_KR as string) || (textObj.en_US as string) || (textObj.th_TH as string) || ''
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

  const handleFormSuccess = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedCategory(null);
    refetch();
  };

  const categories = categoriesData || [];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>병원 카테고리 관리</h1>
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
            <LoadingSpinner text='카테고리를 불러오는 중...' />
          ) : categories.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>카테고리가 없습니다.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>정렬 순서</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>연결된 병원 수</TableHead>
                  <TableHead className='text-right'>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className='font-medium'>{getLocalizedText(category.name)}</TableCell>
                    <TableCell>{getLocalizedText(category.description)}</TableCell>
                    <TableCell>{category.order ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell>{category._count?.hospitals || 0}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
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
                          disabled={deleteCategoryMutation.isPending}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 추가 다이얼로그 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>카테고리 추가</DialogTitle>
            <DialogDescription>새로운 병원 카테고리를 추가합니다.</DialogDescription>
          </DialogHeader>
          <HospitalCategoryForm
            onSuccess={handleFormSuccess}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>카테고리 수정</DialogTitle>
            <DialogDescription>병원 카테고리 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <HospitalCategoryForm
              categoryId={selectedCategory.id}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedCategory(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 카테고리 &quot;{selectedCategory && getLocalizedText(selectedCategory.name)}
              &quot;를 삭제하시겠습니까?
              {selectedCategory &&
                selectedCategory._count &&
                selectedCategory._count.hospitals > 0 && (
                  <span className='text-destructive mt-2 block'>
                    연결된 병원이 {selectedCategory._count.hospitals}개 있어 비활성화 처리됩니다.
                  </span>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
