'use client';

import { Suspense } from 'react';
import { HospitalForm } from 'features/hospital-edit';
import { LoadingSpinner } from '@/shared/ui';

export default function HospitalAddPage() {
  return (
    <Suspense fallback={<LoadingSpinner text='병원 추가 페이지를 불러오는 중...' />}>
      <HospitalForm mode='add' />
    </Suspense>
  );
}
