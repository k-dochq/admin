'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/shared/ui';
import { useMedicalSpecialties, type MedicalSpecialty } from '@/lib/queries/medical-specialties';
import { type DoctorFormErrors } from '../model/types';

interface DoctorMedicalSpecialtySectionProps {
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  errors?: DoctorFormErrors;
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

export function DoctorMedicalSpecialtySection({
  selectedIds = [],
  onChange,
  errors,
}: DoctorMedicalSpecialtySectionProps) {
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
          <CardTitle>시술부위</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text='시술부위를 불러오는 중...' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>시술부위</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-destructive text-sm'>
            시술부위를 불러오는 중 오류가 발생했습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  // 로딩이 완료되었지만 데이터가 없는 경우에만 "사용 가능한 시술부위가 없습니다" 표시
  if (!isLoading && (!medicalSpecialties || medicalSpecialties.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>시술부위</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground text-sm'>사용 가능한 시술부위가 없습니다.</div>
        </CardContent>
      </Card>
    );
  }

  // 활성화된 시술부위만 필터링하고 order 순으로 정렬
  const activeSpecialties = (medicalSpecialties || [])
    .filter((specialty) => specialty.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>시술부위</CardTitle>
        <p className='text-muted-foreground text-sm'>의사가 전문으로 하는 시술부위를 선택하세요.</p>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {activeSpecialties.map((specialty) => {
            const isChecked = selectedIds.includes(specialty.id);
            const displayName = getDisplayName(specialty);

            return (
              <div key={specialty.id} className='flex items-center space-x-2'>
                <Checkbox
                  id={`doctor-specialty-${specialty.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleSpecialtyToggle(specialty.id, checked === true)
                  }
                />
                <Label
                  htmlFor={`doctor-specialty-${specialty.id}`}
                  className='cursor-pointer text-sm font-normal'
                >
                  {displayName}
                </Label>
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
              선택된 시술부위: {selectedIds.length}개
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
