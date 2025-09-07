'use client';

import { createSupabaseClient } from 'shared/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function useLogout() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('로그아웃 실패:', error);
        throw new Error(`로그아웃 실패: ${error.message}`);
      }

      // 로그아웃 성공 시 로그인 페이지로 리다이렉트
      router.push('/auth/login');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 에러가 발생해도 로그인 페이지로 리다이렉트
      router.push('/auth/login');
    }
  };

  return {
    logout,
  };
}
