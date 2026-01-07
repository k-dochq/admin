'use client';

import { useParams } from 'next/navigation';
import { AdminConsultationChat } from 'features/admin-consultation-chat';

export default function AdminConsultationChatPage() {
  const params = useParams();
  const hospitalId = params.hospitalId as string;
  const userId = params.userId as string;

  return (
    <div className='h-full min-w-0 overflow-hidden'>
      <AdminConsultationChat hospitalId={hospitalId} userId={userId} />
    </div>
  );
}
