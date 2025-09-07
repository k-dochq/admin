'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Settings, LogOut, User } from 'lucide-react';

export function Header() {
  return (
    <header className='border-b bg-white px-6 py-3'>
      <div className='flex items-center justify-between'>
        {/* 왼쪽: 페이지 제목 및 브레드크럼 */}
        <div className='flex items-center space-x-4'>
          <h1 className='text-2xl font-semibold text-gray-900'>Dashboard</h1>
          <Badge variant='outline'>Live</Badge>
        </div>

        {/* 오른쪽: 액션 버튼들 */}
        <div className='flex items-center space-x-4'>
          {/* 검색 버튼 */}
          <Button variant='ghost' size='sm'>
            <Search className='h-4 w-4' />
          </Button>

          {/* 알림 버튼 */}
          <Button variant='ghost' size='sm' className='relative'>
            <Bell className='h-4 w-4' />
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs'
            >
              3
            </Badge>
          </Button>

          {/* 사용자 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
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
              <DropdownMenuItem>
                <User className='mr-2 h-4 w-4' />
                <span>프로필</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className='mr-2 h-4 w-4' />
                <span>설정</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
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
