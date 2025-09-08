'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';

export default function InvitationCodesPage() {
  return (
    <div className='space-y-6'>
      {/* 페이지 헤더 */}
      <div className='flex items-center space-x-3'>
        <Gift className='h-8 w-8 text-gray-900' />
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>초대코드 생성</h1>
          <p className='text-gray-600'>멤버십 가입을 위한 초대코드를 생성하고 관리합니다.</p>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <Card>
        <CardHeader>
          <CardTitle>초대코드 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex h-64 items-center justify-center text-gray-500'>
            <div className='text-center'>
              <Gift className='mx-auto mb-4 h-16 w-16 text-gray-300' />
              <p className='text-lg font-medium'>초대코드 생성 기능이 곧 추가됩니다</p>
              <p className='text-sm'>
                VIP 인비테이션 코드와 멤버십 비용 지불 레퍼런스 코드를 생성할 수 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
