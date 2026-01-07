'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare } from 'lucide-react';
import { ConsultationManagement } from 'features/consultation-management';

export default function ConsultationsPage() {
  const [excludeTestAccounts, setExcludeTestAccounts] = useState(true);

  return (
    <div className='min-w-0 space-y-4 sm:space-y-6'>
      <div className='flex items-center gap-2'>
        <MessageSquare className='h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6' />
        <h1 className='min-w-0 truncate text-xl font-bold sm:text-2xl'>상담 관리</h1>
      </div>

      <Card className='overflow-hidden'>
        <CardHeader className='px-4 py-3 sm:px-6 sm:py-4'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base sm:text-lg'>상담 채팅방 목록</CardTitle>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='exclude-test-accounts'
                checked={excludeTestAccounts}
                onCheckedChange={(checked) => setExcludeTestAccounts(checked === true)}
              />
              <label
                htmlFor='exclude-test-accounts'
                className='cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                테스트 계정 제외
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className='relative min-w-0 overflow-hidden px-4 py-3 sm:px-6 sm:py-4'>
          <ConsultationManagement excludeTestAccounts={excludeTestAccounts} />
        </CardContent>
      </Card>
    </div>
  );
}
