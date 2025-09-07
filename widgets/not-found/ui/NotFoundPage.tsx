'use client';

import React from 'react';
import Link from 'next/link';

export function NotFoundPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <h1 className='mb-4 text-6xl font-bold text-gray-900'>404</h1>
        <p className='mb-8 text-xl text-gray-600'>페이지를 찾을 수 없습니다</p>
        <Link
          href='/admin/dashboard'
          className='inline-block rounded-lg bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800'
        >
          대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
