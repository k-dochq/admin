'use client';

import { Suspense } from 'react';
import { HospitalManagement } from 'features/hospital-management';
import { LoadingSpinner } from '@/shared/ui';

export default function HospitalsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text='병원 목록을 불러오는 중...' />}>
      <HospitalManagement />
    </Suspense>
  );
}
