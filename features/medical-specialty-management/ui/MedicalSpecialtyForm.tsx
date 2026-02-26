'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import {
  useMedicalSpecialty,
  useCreateMedicalSpecialty,
  useUpdateMedicalSpecialty,
} from '@/lib/queries/medical-specialties';
import { LanguageTabs, type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import type {
  CreateMedicalSpecialtyRequest,
  UpdateMedicalSpecialtyRequest,
} from '../api';
import { Prisma } from '@prisma/client';
import { ALL_LOCALES } from '@/shared/lib/types/locale';

const DEFAULT_LOCALES_RECORD = ALL_LOCALES.reduce<Record<string, string>>(
  (acc, loc) => {
    acc[loc] = '';
    return acc;
  },
  {},
);

interface MedicalSpecialtyFormProps {
  parentSpecialtyId?: string;
  specialtyId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MedicalSpecialtyForm({
  parentSpecialtyId,
  specialtyId,
  onSuccess,
  onCancel,
}: MedicalSpecialtyFormProps) {
  const [selectedLocale, setSelectedLocale] = useState<HospitalLocale>('ko_KR');
  const [formData, setFormData] = useState({
    name: { ...DEFAULT_LOCALES_RECORD },
    description: { ...DEFAULT_LOCALES_RECORD },
    order: '',
    isActive: true,
  });

  const { data: existingSpecialty, isLoading: isLoadingSpecialty } = useMedicalSpecialty(
    specialtyId || '',
  );
  const createMutation = useCreateMedicalSpecialty();
  const updateMutation = useUpdateMedicalSpecialty();

  useEffect(() => {
    if (existingSpecialty) {
      const nameObj = existingSpecialty.name as Prisma.JsonValue;
      const descObj = existingSpecialty.description as Prisma.JsonValue | null;

      const parseJson = (json: Prisma.JsonValue): Record<string, string> => {
        if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
          return json as Record<string, string>;
        }
        return {};
      };

      const nameParsed = parseJson(nameObj);
      const descParsed = descObj ? parseJson(descObj) : {};

      setFormData({
        name: { ...DEFAULT_LOCALES_RECORD, ...nameParsed },
        description: { ...DEFAULT_LOCALES_RECORD, ...descParsed },
        order: existingSpecialty.order?.toString() || '',
        isActive: existingSpecialty.isActive,
      });
    }
  }, [existingSpecialty]);

  const updateField = (field: 'name' | 'description', locale: HospitalLocale, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [locale]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameData = formData.name;
    const hasDesc = Object.values(formData.description).some((v) => v?.trim());
    const descData = hasDesc ? formData.description : undefined;

    try {
      if (specialtyId) {
        const requestData: UpdateMedicalSpecialtyRequest = {
          name: nameData,
          description: descData,
          order: formData.order ? parseInt(formData.order, 10) : undefined,
          isActive: formData.isActive,
        };
        await updateMutation.mutateAsync({ id: specialtyId, data: requestData });
      } else if (parentSpecialtyId) {
        const requestData: CreateMedicalSpecialtyRequest = {
          parentSpecialtyId,
          name: nameData,
          description: descData,
          order: formData.order ? parseInt(formData.order, 10) : undefined,
          isActive: formData.isActive,
        };
        await createMutation.mutateAsync(requestData);
      }
      onSuccess();
    } catch (error) {
      console.error('진료부위 저장 실패:', error);
    }
  };

  if (isLoadingSpecialty && specialtyId) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <LanguageTabs value={selectedLocale} onValueChange={setSelectedLocale} />

      <div className='space-y-4'>
        <div>
          <Label htmlFor='name'>진료부위 이름 *</Label>
          <Input
            id='name'
            value={formData.name[selectedLocale]}
            onChange={(e) => updateField('name', selectedLocale, e.target.value)}
            placeholder='진료부위 이름을 입력하세요'
            required
          />
        </div>

        <div>
          <Label htmlFor='description'>설명</Label>
          <Textarea
            id='description'
            value={formData.description[selectedLocale]}
            onChange={(e) => updateField('description', selectedLocale, e.target.value)}
            placeholder='설명을 입력하세요'
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor='order'>정렬 순서</Label>
          <Input
            id='order'
            type='number'
            value={formData.order}
            onChange={(e) => setFormData((prev) => ({ ...prev, order: e.target.value }))}
            placeholder='숫자가 작을수록 앞에 표시'
          />
        </div>

        <div className='flex items-center space-x-2'>
          <Switch
            id='isActive'
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor='isActive'>활성화</Label>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          취소
        </Button>
        <Button type='submit' disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) && (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          )}
          {specialtyId ? '수정' : '추가'}
        </Button>
      </div>
    </form>
  );
}
