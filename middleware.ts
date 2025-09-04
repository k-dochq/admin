import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientForMiddleware } from './shared/lib/supabase/server-client';

/**
 * Next.js 미들웨어용 인증 가드 함수
 * 보호된 경로에 접근하는 사용자의 인증 상태를 확인하고
 * 인증되지 않은 사용자는 로그인 페이지로 리다이렉트합니다.
 */
async function authGuard(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createSupabaseServerClientForMiddleware(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 로그인 페이지가 아닌 경우 인증 확인
  if (!request.nextUrl.pathname.startsWith('/auth') && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export async function middleware(request: NextRequest) {
  return await authGuard(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 파일 확장자가 있는 모든 파일 (이미지, CSS, JS 등)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|robots.txt|sitemap.xml).*)',
  ],
};
