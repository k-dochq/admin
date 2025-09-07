import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from 'shared/lib/supabase/server-client';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  // 세션이 있으면 dashboard로 리다이렉트
  if (session) {
    redirect('/admin/dashboard');
  }

  // 세션이 없으면 로그인 페이지로 리다이렉트
  redirect('/auth/login');
}
