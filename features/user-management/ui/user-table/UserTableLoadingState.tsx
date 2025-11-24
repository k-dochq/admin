'use client';

export function UserTableLoadingState() {
  return (
    <div className='flex items-center justify-center py-12'>
      <div className='text-center'>
        <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
        <p className='mt-2 text-sm text-gray-600'>사용자 목록을 불러오는 중...</p>
      </div>
    </div>
  );
}
