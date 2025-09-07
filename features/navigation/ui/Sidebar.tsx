'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Home, Users, Settings, FileText, BarChart3, Database, LogOut } from 'lucide-react';

const navigationItems = [
  {
    title: '대시보드',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    title: '사용자 관리',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: '문서 관리',
    href: '/admin/documents',
    icon: FileText,
  },
  {
    title: '분석',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: '데이터베이스',
    href: '/admin/database',
    icon: Database,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className='hidden w-64 border-r bg-white lg:block'>
      <div className='flex h-full flex-col'>
        {/* 로고 영역 */}
        <div className='flex items-center px-6 py-6'>
          <div className='flex items-center space-x-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900'>
              <span className='text-sm font-bold text-white'>A</span>
            </div>
            <span className='text-xl font-semibold text-gray-900'>Admin</span>
          </div>
        </div>

        <Separator />

        {/* 네비게이션 메뉴 */}
        <nav className='flex-1 px-3 py-6'>
          <div className='space-y-1'>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-r-2 border-gray-900 bg-gray-50 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <item.icon
                    className={cn('h-4 w-4', isActive ? 'text-gray-900' : 'text-gray-400')}
                  />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <Separator />

        {/* 하단 메뉴 */}
        <div className='p-3'>
          <div className='space-y-1'>
            <Link
              href='/admin/settings'
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === '/admin/settings'
                  ? 'border-r-2 border-gray-900 bg-gray-50 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Settings
                className={cn(
                  'h-4 w-4',
                  pathname === '/admin/settings' ? 'text-gray-900' : 'text-gray-400',
                )}
              />
              <span>설정</span>
            </Link>

            <button className='flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900'>
              <LogOut className='h-4 w-4 text-gray-400' />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
