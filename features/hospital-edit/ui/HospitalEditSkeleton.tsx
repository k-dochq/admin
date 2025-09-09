'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function HospitalEditSkeleton() {
  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      {/* 헤더 스켈레톤 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Skeleton className='h-9 w-20' /> {/* 뒤로가기 버튼 */}
          <Skeleton className='h-8 w-40' /> {/* 제목 */}
        </div>
        <Skeleton className='h-10 w-20' /> {/* 저장 버튼 */}
      </div>

      {/* 기본 정보 카드 스켈레톤 */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-24' /> {/* 기본 정보 제목 */}
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 병원명 - 3개 컬럼 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className='mb-2 h-4 w-20' /> {/* 라벨 */}
                <Skeleton className='h-10 w-full' /> {/* 입력 필드 */}
              </div>
            ))}
          </div>

          {/* 주소 - 3개 컬럼 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className='mb-2 h-4 w-16' /> {/* 라벨 */}
                <Skeleton className='h-10 w-full' /> {/* 입력 필드 */}
              </div>
            ))}
          </div>

          {/* 연락처 정보 - 2개 컬럼 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <Skeleton className='mb-2 h-4 w-16' /> {/* 라벨 */}
                <Skeleton className='h-10 w-full' /> {/* 입력 필드 */}
              </div>
            ))}
          </div>

          {/* 지역 선택 */}
          <div>
            <Skeleton className='mb-2 h-4 w-12' /> {/* 라벨 */}
            <Skeleton className='h-10 w-full' /> {/* 셀렉트 필드 */}
          </div>
        </CardContent>
      </Card>

      {/* 상세 정보 카드 스켈레톤 */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-24' /> {/* 상세 정보 제목 */}
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 설명 - 3개 컬럼 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className='mb-2 h-4 w-24' /> {/* 라벨 */}
                <Skeleton className='h-20 w-full' /> {/* 텍스트에어리어 */}
              </div>
            ))}
          </div>

          {/* 운영시간 - 3개 컬럼 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className='mb-2 h-4 w-20' /> {/* 라벨 */}
                <Skeleton className='h-20 w-full' /> {/* 텍스트에어리어 */}
              </div>
            ))}
          </div>

          {/* 길찾기 - 3개 컬럼 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className='mb-2 h-4 w-28' /> {/* 라벨 */}
                <Skeleton className='h-20 w-full' /> {/* 텍스트에어리어 */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 기타 정보 카드 스켈레톤 */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-20' /> {/* 기타 정보 제목 */}
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 3개 컬럼 필드들 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className='mb-2 h-4 w-16' /> {/* 라벨 */}
                <Skeleton className='h-10 w-full' /> {/* 입력 필드 */}
              </div>
            ))}
          </div>

          {/* 할인율 */}
          <div>
            <Skeleton className='mb-2 h-4 w-20' /> {/* 라벨 */}
            <Skeleton className='h-10 w-full' /> {/* 입력 필드 */}
          </div>

          {/* 메모 */}
          <div>
            <Skeleton className='mb-2 h-4 w-12' /> {/* 라벨 */}
            <Skeleton className='h-20 w-full' /> {/* 텍스트에어리어 */}
          </div>

          {/* 승인 상태 */}
          <div>
            <Skeleton className='mb-2 h-4 w-20' /> {/* 라벨 */}
            <Skeleton className='h-10 w-full' /> {/* 셀렉트 */}
          </div>

          {/* 거부 사유 (조건부) */}
          <div>
            <Skeleton className='mb-2 h-4 w-20' /> {/* 라벨 */}
            <Skeleton className='h-20 w-full' /> {/* 텍스트에어리어 */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
