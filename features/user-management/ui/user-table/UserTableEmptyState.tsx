'use client';

export function UserTableEmptyState() {
  return (
    <div className='py-12 text-center'>
      <div className='mb-2 text-lg text-gray-500'>사용자가 없습니다</div>
      <p className='text-sm text-gray-400'>검색 조건을 변경해보세요.</p>
    </div>
  );
}
