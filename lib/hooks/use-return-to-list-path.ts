'use client';

import { useSearchParams } from 'next/navigation';

/** returnTo 쿼리가 /admin/ 으로 시작할 때만 사용 (보안). 그 외에는 fallbackPath 사용 */
export function useReturnToListPath(fallbackPath: string): string {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  return returnTo && returnTo.startsWith('/admin/') ? returnTo : fallbackPath;
}
