import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const activities = [
  {
    user: {
      name: '김철수',
      email: 'kim@example.com',
      avatar: '/avatars/01.png',
      initials: 'KC',
    },
    action: '새 문서를 생성했습니다',
    time: '2분 전',
    type: 'create',
  },
  {
    user: {
      name: '이영희',
      email: 'lee@example.com',
      avatar: '/avatars/02.png',
      initials: 'LY',
    },
    action: '프로젝트를 업데이트했습니다',
    time: '1시간 전',
    type: 'update',
  },
  {
    user: {
      name: '박민수',
      email: 'park@example.com',
      avatar: '/avatars/03.png',
      initials: 'PM',
    },
    action: '댓글을 남겼습니다',
    time: '3시간 전',
    type: 'comment',
  },
  {
    user: {
      name: '정수진',
      email: 'jung@example.com',
      avatar: '/avatars/04.png',
      initials: 'JS',
    },
    action: '파일을 업로드했습니다',
    time: '5시간 전',
    type: 'upload',
  },
  {
    user: {
      name: '최동욱',
      email: 'choi@example.com',
      avatar: '/avatars/05.png',
      initials: 'CD',
    },
    action: '보고서를 완료했습니다',
    time: '1일 전',
    type: 'complete',
  },
];

const getActionBadge = (type: string) => {
  switch (type) {
    case 'create':
      return (
        <Badge variant='default' className='text-xs'>
          생성
        </Badge>
      );
    case 'update':
      return (
        <Badge variant='secondary' className='text-xs'>
          수정
        </Badge>
      );
    case 'comment':
      return (
        <Badge variant='outline' className='text-xs'>
          댓글
        </Badge>
      );
    case 'upload':
      return (
        <Badge variant='default' className='text-xs'>
          업로드
        </Badge>
      );
    case 'complete':
      return (
        <Badge variant='default' className='text-xs'>
          완료
        </Badge>
      );
    default:
      return null;
  }
};

export function RecentActivity() {
  return (
    <div className='space-y-8'>
      {activities.map((activity, index) => (
        <div key={index} className='flex items-center'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src={activity.user.avatar} alt='Avatar' />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className='ml-4 flex-1 space-y-1'>
            <div className='flex items-center justify-between'>
              <p className='text-sm leading-none font-medium'>{activity.user.name}</p>
              {getActionBadge(activity.type)}
            </div>
            <p className='text-muted-foreground text-sm'>{activity.action}</p>
            <p className='text-muted-foreground text-xs'>{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
