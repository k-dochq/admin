'use client';

import React from 'react';
import {
  Plus,
  Users,
  FileText,
  Settings,
  Download,
  Upload,
  BarChart3,
  Database,
} from 'lucide-react';

const quickActions = [
  {
    title: '새 사용자',
    description: '새로운 사용자를 추가합니다',
    icon: Users,
    action: () => console.log('새 사용자 추가'),
  },
  {
    title: '문서 작성',
    description: '새 문서를 작성합니다',
    icon: FileText,
    action: () => console.log('문서 작성'),
  },
  {
    title: '데이터 내보내기',
    description: '데이터를 내보냅니다',
    icon: Download,
    action: () => console.log('데이터 내보내기'),
  },
  {
    title: '파일 업로드',
    description: '파일을 업로드합니다',
    icon: Upload,
    action: () => console.log('파일 업로드'),
  },
  {
    title: '보고서 생성',
    description: '새 보고서를 생성합니다',
    icon: BarChart3,
    action: () => console.log('보고서 생성'),
  },
  {
    title: '데이터베이스',
    description: '데이터베이스를 관리합니다',
    icon: Database,
    action: () => console.log('데이터베이스 관리'),
  },
  {
    title: '시스템 설정',
    description: '시스템을 설정합니다',
    icon: Settings,
    action: () => console.log('시스템 설정'),
  },
  {
    title: '새 프로젝트',
    description: '새 프로젝트를 시작합니다',
    icon: Plus,
    action: () => console.log('새 프로젝트'),
  },
];

export function QuickActions() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {quickActions.map((action, index) => (
        <div
          key={index}
          className='group relative cursor-pointer overflow-hidden rounded-lg border p-4 transition-colors hover:bg-gray-50'
          onClick={action.action}
        >
          <div className='flex items-start space-x-3'>
            <div className='rounded-lg bg-blue-100 p-2 transition-colors group-hover:bg-blue-200'>
              <action.icon className='h-4 w-4 text-blue-600' />
            </div>
            <div className='flex-1 space-y-1'>
              <h3 className='text-sm font-medium'>{action.title}</h3>
              <p className='line-clamp-2 text-xs text-gray-500'>{action.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
