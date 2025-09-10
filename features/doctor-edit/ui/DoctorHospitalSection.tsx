'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHospitals } from '@/lib/queries/hospitals';
import { type DoctorFormErrors } from '../model/types';
import { parseJsonValueToString } from '@/features/doctor-management/api/entities/types';

interface DoctorHospitalSectionProps {
  hospitalId: string;
  errors: DoctorFormErrors;
  onUpdateHospitalId: (hospitalId: string) => void;
}

export function DoctorHospitalSection({
  hospitalId,
  errors,
  onUpdateHospitalId,
}: DoctorHospitalSectionProps) {
  const { data: hospitalsData, isLoading } = useHospitals({
    page: 1,
    limit: 100, // 모든 병원을 가져오기 위해 큰 수로 설정
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>병원 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <Label htmlFor='hospital'>소속 병원 *</Label>
          <Select value={hospitalId} onValueChange={onUpdateHospitalId} disabled={isLoading}>
            <SelectTrigger className={errors.hospitalId ? 'border-destructive' : ''}>
              <SelectValue
                placeholder={isLoading ? '병원 목록을 불러오는 중...' : '병원을 선택하세요'}
              />
            </SelectTrigger>
            <SelectContent>
              {hospitalsData?.hospitals.map((hospital) => (
                <SelectItem key={hospital.id} value={hospital.id}>
                  {parseJsonValueToString(hospital.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.hospitalId && <p className='text-destructive text-sm'>{errors.hospitalId}</p>}

          {!isLoading && hospitalsData?.hospitals.length === 0 && (
            <p className='text-muted-foreground text-sm'>등록된 병원이 없습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
