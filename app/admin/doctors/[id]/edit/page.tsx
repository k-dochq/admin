import { Suspense } from 'react';
import { DoctorForm } from 'features/doctor-edit';
import { LoadingSpinner } from '@/shared/ui';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorEditPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingSpinner text='의사 수정 페이지를 불러오는 중...' />}>
      <DoctorForm mode='edit' doctorId={id} />
    </Suspense>
  );
}
