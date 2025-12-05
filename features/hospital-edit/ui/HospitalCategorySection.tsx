'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/shared/ui';
import { useHospitalCategories } from '@/lib/queries/hospital-categories';
import { type FormErrors } from '../api/entities/types';
import { parseJsonValueToString } from '../api/entities/types';
import type { HospitalCategory } from '@/features/hospital-category-management/api';
import { Prisma } from '@prisma/client';

interface HospitalCategorySectionProps {
  selectedIds: string[] | undefined;
  onChange: (selectedIds: string[]) => void;
  errors?: FormErrors;
}

function getDisplayName(category: HospitalCategory): string {
  return parseJsonValueToString(category.name as Prisma.JsonValue);
}

export function HospitalCategorySection({
  selectedIds = [],
  onChange,
  errors,
}: HospitalCategorySectionProps) {
  const { data: categories, isLoading, error } = useHospitalCategories(true); // 활성 카테고리만

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const currentIds = selectedIds || [];

    if (checked) {
      // 추가
      if (!currentIds.includes(categoryId)) {
        onChange([...currentIds, categoryId]);
      }
    } else {
      // 제거
      onChange(currentIds.filter((id) => id !== categoryId));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>병원 카테고리</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text='병원 카테고리를 불러오는 중...' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>병원 카테고리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-destructive text-sm'>
            병원 카테고리를 불러오는 중 오류가 발생했습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && (!categories || categories.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>병원 카테고리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground text-sm'>사용 가능한 병원 카테고리가 없습니다.</div>
        </CardContent>
      </Card>
    );
  }

  // 활성화된 카테고리만 필터링하고 order 순으로 정렬
  const activeCategories = (categories || [])
    .filter((category) => category.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>병원 카테고리</CardTitle>
        <p className='text-muted-foreground text-sm'>병원에 연결할 카테고리를 선택하세요.</p>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {activeCategories.map((category) => {
            const isChecked = selectedIds.includes(category.id);
            const displayName = getDisplayName(category);

            return (
              <div key={category.id} className='flex items-center space-x-2'>
                <Checkbox
                  id={`category-${category.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCategoryToggle(category.id, checked === true)}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className='cursor-pointer text-sm font-normal'
                >
                  {displayName}
                </Label>
              </div>
            );
          })}
        </div>

        {errors?.hospitalCategoryIds && (
          <div className='text-destructive mt-2 text-sm'>{errors.hospitalCategoryIds}</div>
        )}

        {selectedIds.length > 0 && (
          <div className='mt-4 border-t pt-4'>
            <div className='text-muted-foreground text-sm'>
              선택된 카테고리: {selectedIds.length}개
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
