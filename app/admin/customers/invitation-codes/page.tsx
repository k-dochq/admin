'use client';

import { Suspense } from 'react';
import { CreateInvitationCodeForm } from '@/components/invitation-codes/create-invitation-code-form';
import { InvitationCodesList } from '@/components/invitation-codes/invitation-codes-list';

function InvitationCodesContent() {
  return (
    <div className='space-y-6'>
      {/* 초대코드 생성 폼 */}
      <CreateInvitationCodeForm />

      {/* 초대코드 목록 */}
      <Suspense
        fallback={
          <div className='flex items-center justify-center py-8'>
            <div className='text-gray-500'>초대코드 목록을 불러오는 중...</div>
          </div>
        }
      >
        <InvitationCodesList />
      </Suspense>
    </div>
  );
}
export default function InvitationCodesPage() {
  return <InvitationCodesContent />;
}
