'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, User } from 'lucide-react';
import { useLogout } from 'features/auth/model/useLogout';

export function Header() {
  const { logout } = useLogout();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  const getPageTitle = (pathname: string): string => {
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments.length === 0) return '대시보드';

    const lastSegment = pathSegments[pathSegments.length - 1];

    // 특정 경로에 대한 제목 매핑
    const titleMap: Record<string, string> = {
      dashboard: '대시보드',
      banner: '빅배너 전시',
      'closed-pick': '클로즈드 픽 상품 전시',
      essentials: '에센셜즈 전시',
      packages: '패키지 상품 관리',
      items: '아이템 상품 관리',
      hospitals: '병원 관리',
      others: '병원 외 등록',
      members: '회원 리스트',
      waiting: '웨이팅 리스트 관리',
      blacklist: '블랙리스트 관리',
      reservations: '예약 리스트',
      schedule: '일정 생성/수정 관리',
      inquiries: '문의 관리',
      credits: '적립금 관리',
      'invitation-codes': '초대코드 생성',
      list: '운영자 리스트',
      permissions: '접근권한 관리',
      categories: '카테고리 추가',
      'target-groups': '타겟 그룹 관리',
      settings: '설정',
      banners: '배너 관리',
      'live-reviews': '생생후기관리',
      add: '생생후기 추가',
      edit: '생생후기 수정',
    };

    return titleMap[lastSegment] || '관리자 페이지';
  };

  return (
    <header className='bg-white px-6 py-4'>
      <div className='flex items-center justify-between'>
        {/* 왼쪽: 페이지 제목 */}
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>{getPageTitle(pathname)}</h1>
        </div>

        {/* 오른쪽: 사용자 메뉴 */}
        <div className='flex items-center space-x-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-8 w-8 cursor-pointer rounded-full'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src='/avatars/01.png' alt='Avatar' />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm leading-none font-medium'>Admin</p>
                  <p className='text-muted-foreground text-xs leading-none'>admin@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='cursor-pointer'>
                <User className='mr-2 h-4 w-4' />
                <span>프로필</span>
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Settings className='mr-2 h-4 w-4' />
                <span>설정</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
                <LogOut className='mr-2 h-4 w-4' />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
