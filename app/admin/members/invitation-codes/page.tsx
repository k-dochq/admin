'use client';

import { Suspense } from 'react';
import { CreateInvitationCodeForm } from '@/components/invitation-codes/create-invitation-code-form';
import { InvitationCodesList } from '@/components/invitation-codes/invitation-codes-list';
import { LoadingSpinner } from '@/shared/ui';

function InvitationCodesContent() {
  return (
    <div className='space-y-6'>
      {/* 초대코드 생성 폼 */}
      <CreateInvitationCodeForm />

      {/* 초대코드 목록 */}
      <Suspense fallback={<LoadingSpinner text='초대코드 목록을 불러오는 중...' />}>
        <InvitationCodesList />
      </Suspense>
    </div>
  );
}
export default function InvitationCodesPage() {
  return <InvitationCodesContent />;
}
