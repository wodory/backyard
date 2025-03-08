import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 보호된 경로 (로그인 필요)
const protectedRoutes = ['/board', '/cards', '/tags'];
// 인증된 사용자는 접근할 수 없는 경로
const authRoutes = ['/login', '/register'];
// 인증 검사를 건너뛸 경로
const bypassAuthRoutes = ['/auth/callback', '/api'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Next.js 15에서는 서버 액션이나 라우트 핸들러에서만 쿠키를 수정할 수 있지만,
          // 미들웨어에서는 응답 객체를 통해 쿠키를 설정할 수 있습니다.
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  // auth 관련 데이터 갱신 (필요한 경우)
  await supabase.auth.getSession();

  // 요청 URL 가져오기
  const url = request.nextUrl.clone();
  const { pathname } = url;
  
  // 인증 우회 경로인 경우 인증 검사 건너뛰기
  if (bypassAuthRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    console.log('인증 검사 건너뛰기:', pathname);
    return response;
  }
  
  try {
    // 토큰 확인
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;
    const isLoggedIn = !!accessToken;
    
    console.log('경로 접근:', pathname, '인증 상태:', isLoggedIn ? '로그인됨' : '로그인안됨');
    
    // 로그인이 필요한 경로인지 확인
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    // 인증된 사용자가 접근할 수 없는 경로인지 확인
    const isAuthRoute = authRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    // 미인증 상태에서 보호된 경로 접근 시도
    if (isProtectedRoute && !isLoggedIn) {
      console.log('인증되지 않은 사용자가 보호된 경로에 접근 시도:', pathname);
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // 인증 상태에서 로그인/회원가입 페이지 접근 시도
    if (isAuthRoute && isLoggedIn) {
      console.log('인증된 사용자가 인증 경로에 접근 시도:', pathname);
      url.pathname = '/board';
      return NextResponse.redirect(url);
    }
    
    return response;
  } catch (error) {
    console.error('미들웨어 처리 중 오류:', error);
    return response;
  }
}

// 미들웨어가 적용될 경로를 지정합니다.
export const config = {
  matcher: [
    // 인증이 필요한 경로는 여기에 추가
    /*
      '/protected',
      '/dashboard/:path*',
    */
    // 모든 경로에 미들웨어 적용 (필요에 따라 조정)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 