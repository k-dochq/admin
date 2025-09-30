'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { ConsultationManagement } from 'features/consultation-management';

export default function ConsultationsPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2'>
        <MessageSquare className='h-6 w-6' />
        <h1 className='text-2xl font-bold'>상담 관리</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상담 채팅방 목록</CardTitle>
        </CardHeader>
        <CardContent className='relative'>
          <ConsultationManagement />
        </CardContent>
      </Card>
    </div>
  );
}
