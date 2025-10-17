'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { NoticeManagement } from 'features/notice-management';

export default function NoticesPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2'>
        <Megaphone className='h-6 w-6' />
        <h1 className='text-2xl font-bold'>공지사항</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>공지사항 관리</CardTitle>
        </CardHeader>
        <CardContent className='relative'>
          <NoticeManagement />
        </CardContent>
      </Card>
    </div>
  );
}
