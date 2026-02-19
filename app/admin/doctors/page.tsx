'use client';

import { Suspense } from 'react';
import { DoctorManagement } from 'features/doctor-management';
import { LoadingSpinner } from '@/shared/ui';

export default function DoctorsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text='의사 목록을 불러오는 중...' />}>
      <DoctorManagement />
    </Suspense>
  );
}
