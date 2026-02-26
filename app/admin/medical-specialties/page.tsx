'use client';

import { Suspense } from 'react';
import { MedicalSpecialtyManagement } from '@/features/medical-specialty-management';
import { LoadingSpinner } from '@/shared/ui';

export default function MedicalSpecialtiesPage() {
  return (
    <Suspense fallback={<LoadingSpinner text='진료부위 목록을 불러오는 중...' />}>
      <MedicalSpecialtyManagement />
    </Suspense>
  );
}
