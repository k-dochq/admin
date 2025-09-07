'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

export function NotFoundPage() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <div className='space-y-6 text-center'>
            {/* 404 애니메이션 영역 */}
            <div className='space-y-4'>
              <div className='mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100'>
                <span className='text-4xl font-bold text-blue-600'>404</span>
              </div>
              <div className='space-y-2'>
                <h1 className='text-2xl font-bold text-gray-900'>페이지를 찾을 수 없습니다</h1>
                <p className='text-gray-600'>
                  요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                </p>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className='space-y-3'>
              <Link href='/admin/dashboard' className='block w-full'>
                <div className='flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700'>
                  <Home className='mr-2 h-4 w-4' />
                  대시보드로 돌아가기
                </div>
              </Link>

              <div className='grid grid-cols-2 gap-3'>
                <button
                  onClick={handleGoBack}
                  className='flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
                >
                  <ArrowLeft className='mr-2 h-3 w-3' />
                  뒤로 가기
                </button>
                <Link href='/admin/search'>
                  <div className='flex w-full items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'>
                    <Search className='mr-2 h-3 w-3' />
                    검색
                  </div>
                </Link>
              </div>
            </div>

            {/* 추가 도움말 */}
            <div className='border-t pt-4'>
              <div className='flex items-center justify-center space-x-2 text-sm text-gray-500'>
                <HelpCircle className='h-4 w-4' />
                <span>문제가 지속되면 관리자에게 문의하세요</span>
              </div>
            </div>

            {/* 인기 페이지 링크 */}
            <div className='space-y-2 pt-4'>
              <p className='text-sm font-medium text-gray-700'>인기 페이지:</p>
              <div className='flex flex-wrap justify-center gap-2'>
                <Link href='/admin/dashboard'>
                  <span className='rounded-md px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900'>
                    대시보드
                  </span>
                </Link>
                <Link href='/admin/users'>
                  <span className='rounded-md px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900'>
                    사용자 관리
                  </span>
                </Link>
                <Link href='/admin/settings'>
                  <span className='rounded-md px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900'>
                    설정
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
