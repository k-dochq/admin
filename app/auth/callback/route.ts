import {
  createSupabaseServerClient,
  createSupabaseServerClientForMiddleware,
} from 'shared/lib/supabase/server-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 성공적으로 로그인된 경우 루트로 리다이렉트
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // 에러가 있거나 코드가 없는 경우 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/login`);
}
