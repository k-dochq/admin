'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  BarChart3,
  Users,
  Settings,
  FileText,
  Database,
  HelpCircle,
  Search,
} from 'lucide-react';

const navigationItems = [
  {
    title: '홈',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    title: '분석',
    href: '/admin/analytics',
    icon: BarChart3,
    badge: 'New',
  },
  {
    title: '사용자',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: '문서',
    href: '/admin/documents',
    icon: FileText,
  },
  {
    title: '데이터',
    href: '/admin/data',
    icon: Database,
  },
];

const bottomItems = [
  {
    title: '설정',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: '도움말',
    href: '/admin/help',
    icon: HelpCircle,
  },
  {
    title: '검색',
    href: '/admin/search',
    icon: Search,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className='hidden w-64 bg-white shadow-sm lg:block'>
      <div className='flex h-full flex-col'>
        {/* 로고 영역 */}
        <div className='flex items-center px-6 py-4'>
          <div className='flex items-center space-x-2'>
            <div className='bg-primary h-8 w-8 rounded'></div>
            <span className='text-xl font-bold'>Admin</span>
          </div>
        </div>

        <Separator />

        {/* 네비게이션 메뉴 */}
        <nav className='flex-1 space-y-1 px-3 py-4'>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <div className='flex items-center space-x-3'>
                  <item.icon className='h-4 w-4' />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge variant='secondary' className='ml-auto'>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* 하단 메뉴 */}
        <nav className='space-y-1 px-3 py-4'>
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <item.icon className='h-4 w-4' />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
