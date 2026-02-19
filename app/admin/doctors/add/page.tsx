'use client';

import { Suspense } from 'react';
import { DoctorForm } from 'features/doctor-edit';
import { LoadingSpinner } from '@/shared/ui';

export default function DoctorAddPage() {
  return (
    <Suspense fallback={<LoadingSpinner text='의사 추가 페이지를 불러오는 중...' />}>
      <DoctorForm mode='add' />
    </Suspense>
  );
}
