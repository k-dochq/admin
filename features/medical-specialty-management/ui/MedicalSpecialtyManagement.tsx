'use client';

import { useState } from 'react';
import { Prisma } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { LoadingSpinner } from '@/shared/ui';
import { useMedicalSpecialties } from '@/lib/queries/medical-specialties';
import { useDeleteMedicalSpecialty } from '@/lib/mutations/medical-specialty-delete';
import type { MedicalSpecialty } from '@/lib/queries/medical-specialties';
import { MedicalSpecialtyTree } from './MedicalSpecialtyTree';
import { MedicalSpecialtyForm } from './MedicalSpecialtyForm';

function getLocalizedText(jsonText: Prisma.JsonValue | null | undefined): string {
  if (!jsonText) return '';
  if (typeof jsonText === 'string') return jsonText;
  if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
    const obj = jsonText as Record<string, unknown>;
    return (
      (obj.ko_KR as string) || (obj.en_US as string) || (obj.th_TH as string) || ''
    );
  }
  return '';
}

export function MedicalSpecialtyManagement() {
  const [isActive, setIsActive] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedicalSpecialty | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: specialtiesData,
    isLoading,
    refetch,
  } = useMedicalSpecialties(isActive === 'all' ? undefined : isActive === 'true');

  const deleteMutation = useDeleteMedicalSpecialty();

  const handleAddSubCategory = (parentId: string) => {
    setAddParentId(parentId);
    setAddDialogOpen(true);
  };

  const handleEdit = (specialty: MedicalSpecialty) => {
    setSelectedSpecialty(specialty);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (specialty: MedicalSpecialty) => {
    setSelectedSpecialty(specialty);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSpecialty) return;
    try {
      await deleteMutation.mutateAsync(selectedSpecialty.id);
      setDeleteDialogOpen(false);
      setSelectedSpecialty(null);
    } catch (error) {
      console.error('진료부위 삭제 실패:', error);
    }
  };

  const handleFormSuccess = () => {
    setAddDialogOpen(false);
    setAddParentId(null);
    setEditDialogOpen(false);
    setSelectedSpecialty(null);
    refetch();
  };

  const specialties = specialtiesData || [];
  const parentSpecialties = specialties
    .filter((s) => !s.parentSpecialtyId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const childrenByParentId = specialties
    .filter((s) => s.parentSpecialtyId)
    .reduce<Record<string, MedicalSpecialty[]>>((acc, s) => {
      const parentId = s.parentSpecialtyId!;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(s);
      return acc;
    }, {});
  for (const parentId of Object.keys(childrenByParentId)) {
    childrenByParentId[parentId].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>진료부위 관리</h1>

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
                className='rounded-md border border-input px-3 py-1.5 text-sm'
              >
                <option value='all'>전체</option>
                <option value='true'>활성화</option>
                <option value='false'>비활성화</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>진료부위 목록</CardTitle>
          <p className='text-muted-foreground text-sm'>
            상위 카테고리는 조회만 가능하며, 하위 카테고리는 추가·수정·삭제할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner text='진료부위를 불러오는 중...' />
          ) : parentSpecialties.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>
              진료부위가 없습니다.
            </div>
          ) : (
            <MedicalSpecialtyTree
              parentSpecialties={parentSpecialties}
              childrenByParentId={childrenByParentId}
              onAddSubCategory={handleAddSubCategory}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              isDeletePending={deleteMutation.isPending}
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setAddParentId(null);
        }}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>하위 진료부위 추가</DialogTitle>
            <DialogDescription>
              선택한 상위 카테고리 아래에 하위 진료부위를 추가합니다.
            </DialogDescription>
          </DialogHeader>
          {addParentId && (
            <MedicalSpecialtyForm
              parentSpecialtyId={addParentId}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setAddDialogOpen(false);
                setAddParentId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>하위 진료부위 수정</DialogTitle>
            <DialogDescription>하위 진료부위 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          {selectedSpecialty && (
            <MedicalSpecialtyForm
              specialtyId={selectedSpecialty.id}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedSpecialty(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>하위 진료부위 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 &quot;{selectedSpecialty && getLocalizedText(selectedSpecialty.name)}
              &quot;를 삭제하시겠습니까? 연결된 병원/의사가 있으면 비활성화 처리됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
