import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Prisma } from '@prisma/client';
import { sortHospitalsByName } from 'shared/lib';
import type { LiveReviewFormErrors } from '../model/useLiveReviewForm';

interface MedicalSpecialty {
  id: string;
  name: Prisma.JsonValue;
}

interface Hospital {
  id: string;
  name: Prisma.JsonValue;
}

interface BasicInfoSectionProps {
  medicalSpecialtyId: string;
  hospitalId: string;
  detailLink: string;
  order: number | null;
  isActive: boolean;
  medicalSpecialties: MedicalSpecialty[];
  hospitals: Hospital[];
  errors: LiveReviewFormErrors;
  onUpdateMedicalSpecialtyId: (value: string) => void;
  onUpdateHospitalId: (value: string) => void;
  onUpdateDetailLink: (value: string) => void;
  onUpdateOrder: (value: number | null) => void;
  onUpdateIsActive: (value: boolean) => void;
}

// 다국어 텍스트 추출
const getLocalizedText = (jsonText: Prisma.JsonValue, locale: string): string => {
  if (!jsonText) return '';
  if (typeof jsonText === 'string') return jsonText;
  if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
    const textObj = jsonText as Record<string, unknown>;
    return (textObj[locale] as string) || '';
  }
  return '';
};

export function BasicInfoSection({
  medicalSpecialtyId,
  hospitalId,
  detailLink,
  order,
  isActive,
  medicalSpecialties,
  hospitals,
  errors,
  onUpdateMedicalSpecialtyId,
  onUpdateHospitalId,
  onUpdateDetailLink,
  onUpdateOrder,
  onUpdateIsActive,
}: BasicInfoSectionProps) {
  // 병원 목록을 가나다순으로 정렬
  const sortedHospitals = useMemo(() => {
    return sortHospitalsByName(hospitals);
  }, [hospitals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <div>
            <Label htmlFor='hospitalId'>병원 *</Label>
            <Select value={hospitalId} onValueChange={onUpdateHospitalId}>
              <SelectTrigger>
                <SelectValue placeholder='병원 선택' />
              </SelectTrigger>
              <SelectContent>
                {sortedHospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {getLocalizedText(hospital.name, 'ko_KR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.hospitalId && (
              <p className='text-destructive mt-1 text-sm'>{errors.hospitalId}</p>
            )}
          </div>

          <div>
            <Label htmlFor='medicalSpecialtyId'>시술부위 *</Label>
            <Select value={medicalSpecialtyId} onValueChange={onUpdateMedicalSpecialtyId}>
              <SelectTrigger>
                <SelectValue placeholder='시술부위 선택' />
              </SelectTrigger>
              <SelectContent>
                {medicalSpecialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {getLocalizedText(specialty.name, 'ko_KR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.medicalSpecialtyId && (
              <p className='text-destructive mt-1 text-sm'>{errors.medicalSpecialtyId}</p>
            )}
          </div>

          <div>
            <Label htmlFor='detailLink'>상세 링크</Label>
            <Input
              id='detailLink'
              value={detailLink}
              onChange={(e) => onUpdateDetailLink(e.target.value)}
              placeholder='https://...'
            />
            {errors.detailLink && (
              <p className='text-destructive mt-1 text-sm'>{errors.detailLink}</p>
            )}
          </div>

          <div>
            <Label htmlFor='order'>정렬 순서</Label>
            <Input
              id='order'
              type='number'
              value={order ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                onUpdateOrder(value === '' ? null : parseInt(value, 10));
              }}
              placeholder='숫자가 작을수록 앞에 표시'
            />
            {errors.order && <p className='text-destructive mt-1 text-sm'>{errors.order}</p>}
          </div>

          <div className='flex items-center space-x-2'>
            <Switch id='isActive' checked={isActive} onCheckedChange={onUpdateIsActive} />
            <Label htmlFor='isActive'>활성화</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
