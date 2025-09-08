'use client';

import { Suspense } from 'react';
import { CreateInvitationCodeForm } from '@/components/invitation-codes/create-invitation-code-form';
// import { InvitationCodesList } from '@/components/invitation-codes/invitation-codes-list';
import { InvitationCodesListSkeleton } from '@/components/invitation-codes/invitation-codes-list-skeleton';

function InvitationCodesContent() {
  return (
    <div className='space-y-6'>
      {/* 초대코드 생성 폼 */}
      <CreateInvitationCodeForm />

      {/* 초대코드 목록 */}
      <Suspense fallback={<InvitationCodesListSkeleton />}>
        {/* <InvitationCodesList /> */}
        <InvitationCodesListSkeleton />
      </Suspense>
    </div>
  );
}
export default function InvitationCodesPage() {
  return <InvitationCodesContent />;
}
