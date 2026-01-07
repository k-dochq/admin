'use client';

import React, { ReactNode, useState } from 'react';
import { Sidebar } from 'features/navigation/ui/Sidebar';
import { Header } from 'features/navigation/ui/Header';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-gray-100'>
      {/* 데스크톱 사이드바 */}
      <Sidebar />

      {/* 모바일 메뉴 Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side='left' className='w-64 p-0 sm:w-80 [&>button]:hidden'>
          <SheetHeader className='sr-only'>
            <SheetTitle>메뉴</SheetTitle>
          </SheetHeader>
          <div className='h-full overflow-y-auto'>
            <Sidebar variant='mobile' onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* 메인 콘텐츠 영역 */}
      <div className='flex flex-1 flex-col'>
        {/* 헤더 */}
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* 페이지 콘텐츠 */}
        <main className='flex-1 bg-gray-50 p-4 sm:p-6'>{children}</main>
      </div>
    </div>
  );
}
