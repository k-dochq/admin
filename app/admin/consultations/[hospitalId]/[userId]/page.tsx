'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { AdminConsultationChat } from 'features/admin-consultation-chat';
import { LoadingSpinner } from '@/shared/ui';

export default function AdminConsultationChatPage() {
  const params = useParams();
  const hospitalId = params.hospitalId as string;
  const userId = params.userId as string;

  return (
    <div className='h-full min-w-0 overflow-hidden'>
      <Suspense fallback={<LoadingSpinner text='상담 채팅을 불러오는 중...' />}>
        <AdminConsultationChat hospitalId={hospitalId} userId={userId} />
      </Suspense>
    </div>
  );
}
