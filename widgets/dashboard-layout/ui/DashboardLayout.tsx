'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from 'features/navigation/ui/Sidebar';
import { Header } from 'features/navigation/ui/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className='flex min-h-screen bg-gray-100'>
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className='flex flex-1 flex-col'>
        {/* 헤더 */}
        <Header />

        {/* 페이지 콘텐츠 */}
        <main className='flex-1 bg-gray-50 p-6'>{children}</main>
      </div>
    </div>
  );
}
