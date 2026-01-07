'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { ConsultationManagement } from 'features/consultation-management';

export default function ConsultationsPage() {
  return (
    <div className='min-w-0 space-y-4 sm:space-y-6'>
      <div className='flex items-center gap-2'>
        <MessageSquare className='h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6' />
        <h1 className='min-w-0 truncate text-xl font-bold sm:text-2xl'>상담 관리</h1>
      </div>

      <Card className='overflow-hidden'>
        <CardHeader className='px-4 py-3 sm:px-6 sm:py-4'>
          <CardTitle className='text-base sm:text-lg'>상담 채팅방 목록</CardTitle>
        </CardHeader>
        <CardContent className='relative min-w-0 overflow-hidden px-4 py-3 sm:px-6 sm:py-4'>
          <ConsultationManagement />
        </CardContent>
      </Card>
    </div>
  );
}
