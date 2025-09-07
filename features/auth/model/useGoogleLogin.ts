'use client';

import { createSupabaseClient } from 'shared/lib/supabase/client';

export function useGoogleLogin() {
  const supabase = createSupabaseClient();
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(`Google 로그인 실패: ${error.message}`);
    }
  };

  return {
    signInWithGoogle,
  };
}
