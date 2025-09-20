'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Users,
  Building2,
  UserCheck,
  MessageSquare,
  Stethoscope,
  Star,
} from 'lucide-react';
import { useLogout } from 'features/auth/model/useLogout';

interface NavigationItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: '대시보드',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    title: '사용자관리',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: '병원관리',
    href: '/admin/hospitals',
    icon: Building2,
  },
  {
    title: '의사관리',
    href: '/admin/doctors',
    icon: UserCheck,
  },
  {
    title: '시술관리',
    href: '/admin/procedures',
    icon: Stethoscope,
  },
  {
    title: '리뷰관리',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    title: '상담관리',
    href: '/admin/consultations',
    icon: MessageSquare,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useLogout();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleLogout = async () => {
    await logout();
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    );
  };

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.href && pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => isItemActive(child));
    }
    return false;
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.title);
    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-gray-50 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            <div className='flex items-center space-x-3'>
              <item.icon className={cn('h-4 w-4', isActive ? 'text-gray-900' : 'text-gray-400')} />
              <span>{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className='h-4 w-4 text-gray-400' />
            ) : (
              <ChevronRight className='h-4 w-4 text-gray-400' />
            )}
          </button>
        ) : (
          <Link
            href={item.href || '#'}
            className={cn(
              'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-gray-50 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            <item.icon
              className={cn('h-4 w-4', pathname === item.href ? 'text-gray-900' : 'text-gray-400')}
            />
            <span>{item.title}</span>
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className='mt-1 ml-6 space-y-1'>
            {item.children?.map((child) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='hidden w-64 bg-white lg:block'>
      <div className='flex h-full flex-col'>
        {/* 로고 영역 */}
        <div className='flex items-center px-6 py-6'>
          <div className='flex items-center space-x-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900'>
              <span className='text-sm font-bold text-white'>K</span>
            </div>
            <span className='text-xl font-semibold text-gray-900'>K-DOC 어드민</span>
          </div>
        </div>
        <Separator />
        {/* 네비게이션 메뉴 */}
        <nav className='flex-1 px-3 py-6'>
          <div className='space-y-1'>
            {navigationItems.map((item) => renderNavigationItem(item))}
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
                  ? 'bg-gray-50 text-gray-900'
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

            <button
              onClick={handleLogout}
              className='flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900'
            >
              <LogOut className='h-4 w-4 text-gray-400' />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
