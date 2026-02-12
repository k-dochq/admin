import { Suspense } from 'react';
import { HospitalForm } from '@/features/hospital-edit';
import { LoadingSpinner } from '@/shared/ui';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HospitalEditPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingSpinner text='병원 수정 페이지를 불러오는 중...' />}>
      <HospitalForm mode='edit' hospitalId={id} />
    </Suspense>
  );
}
