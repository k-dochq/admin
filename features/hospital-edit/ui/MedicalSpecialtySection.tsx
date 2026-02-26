'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/shared/ui';
import { useMedicalSpecialties, type MedicalSpecialty } from '@/lib/queries/medical-specialties';
import { type FormErrors } from '../api/entities/types';

interface MedicalSpecialtySectionProps {
  selectedIds: string[] | undefined;
  onChange: (selectedIds: string[]) => void;
  errors?: FormErrors;
}

function getDisplayName(specialty: MedicalSpecialty): string {
  // 한국어 우선, 없으면 영어, 없으면 태국어, 모두 없으면 specialtyType
  return (
    specialty.name.ko_KR ||
    specialty.name.en_US ||
    specialty.name.th_TH ||
    specialty.specialtyType ||
    'Unknown'
  );
}

export function MedicalSpecialtySection({
  selectedIds = [],
  onChange,
  errors,
}: MedicalSpecialtySectionProps) {
  const { data: medicalSpecialties, isLoading, error } = useMedicalSpecialties();

  const handleSpecialtyToggle = (specialtyId: string, checked: boolean) => {
    const currentIds = selectedIds || [];

    if (checked) {
      // 추가
      if (!currentIds.includes(specialtyId)) {
        onChange([...currentIds, specialtyId]);
      }
    } else {
      // 제거
      onChange(currentIds.filter((id) => id !== specialtyId));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>진료부위</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text='진료부위를 불러오는 중...' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>진료부위</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-destructive text-sm'>
            진료부위를 불러오는 중 오류가 발생했습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  // 로딩이 완료되었지만 데이터가 없는 경우에만 "사용 가능한 진료부위가 없습니다" 표시
  if (!isLoading && (!medicalSpecialties || medicalSpecialties.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>진료부위</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground text-sm'>사용 가능한 진료부위가 없습니다.</div>
        </CardContent>
      </Card>
    );
  }

  // 활성화된 진료부위만 필터링
  const activeSpecialties = (medicalSpecialties || []).filter((specialty) => specialty.isActive);

  // 상위 카테고리(parentSpecialtyId === null)와 하위 카테고리 분리
  const parentSpecialties = activeSpecialties
    .filter((s) => !s.parentSpecialtyId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const childrenByParentId = activeSpecialties
    .filter((s) => s.parentSpecialtyId)
    .reduce<Record<string, MedicalSpecialty[]>>((acc, s) => {
      const parentId = s.parentSpecialtyId!;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(s);
      return acc;
    }, {});

  // 하위 카테고리 내 order 정렬
  for (const parentId of Object.keys(childrenByParentId)) {
    childrenByParentId[parentId].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const renderSpecialtyRow = (specialty: MedicalSpecialty, isSubCategory: boolean) => {
    const isChecked = selectedIds.includes(specialty.id);
    const displayName = getDisplayName(specialty);

    return (
      <div
        key={specialty.id}
        className={`flex items-center space-x-2 ${isSubCategory ? 'pl-6' : ''}`}
      >
        <Checkbox
          id={`specialty-${specialty.id}`}
          checked={isChecked}
          onCheckedChange={(checked) =>
            handleSpecialtyToggle(specialty.id, checked === true)
          }
        />
        <Label
          htmlFor={`specialty-${specialty.id}`}
          className={`cursor-pointer text-sm ${isSubCategory ? 'font-normal text-muted-foreground' : 'font-medium'}`}
        >
          {displayName}
        </Label>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>진료부위</CardTitle>
        <p className='text-muted-foreground text-sm'>병원에서 제공하는 진료부위를 선택하세요.</p>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
          {parentSpecialties.map((parent) => {
            const children = childrenByParentId[parent.id] ?? [];

            return (
              <div key={parent.id} className='space-y-1'>
                {renderSpecialtyRow(parent, false)}
                {children.map((child) => renderSpecialtyRow(child, true))}
              </div>
            );
          })}
        </div>

        {errors?.medicalSpecialtyIds && (
          <div className='text-destructive mt-2 text-sm'>{errors.medicalSpecialtyIds}</div>
        )}

        {selectedIds.length > 0 && (
          <div className='mt-4 border-t pt-4'>
            <div className='text-muted-foreground text-sm'>
              선택된 진료부위: {selectedIds.length}개
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
