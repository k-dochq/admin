'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface UseAdminListUrlOptions {
  /** true면 value가 'all'일 때 해당 키를 URL에서 제거 (필터 기본값) */
  treatAllAsEmpty?: boolean;
}

/**
 * Admin 목록 페이지에서 URL 쿼리 파라미터와 동기화하는 공통 훅.
 * - page=1 은 URL에서 제거 (깔끔한 URL)
 * - treatAllAsEmpty 시 value 'all' 도 제거
 */
export function useAdminListUrl(
  basePath: string,
  options: UseAdminListUrlOptions = {},
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { treatAllAsEmpty = false } = options;

  const updateURL = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        const shouldOmit =
          value == null ||
          value === '' ||
          (key === 'page' && value === '1') ||
          (treatAllAsEmpty && value === 'all');
        if (shouldOmit) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const query = params.toString();
      const path = `/admin/${basePath}`;
      router.replace(query ? `${path}?${query}` : path);
    },
    [searchParams, router, basePath, treatAllAsEmpty],
  );

  const returnToListPath = searchParams.toString()
    ? `/admin/${basePath}?${searchParams.toString()}`
    : `/admin/${basePath}`;

  const resetUrl = useCallback(() => {
    router.replace(`/admin/${basePath}`);
  }, [router, basePath]);

  return { updateURL, returnToListPath, resetUrl, searchParams };
}
