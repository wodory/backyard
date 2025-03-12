import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 보호된 경로 (로그인 필요)
const protectedRoutes = ['/board', '/cards', '/tags'];
// 인증된 사용자는 접근할 수 없는 경로
const authRoutes = ['/login', '/register'];
// 인증 검사를 건너뛸 경로
const bypassAuthRoutes = ['/login', '/register', '/auth/callback', '/api/auth'];

export async function middleware(request: NextRequest) {
  console.log('미들웨어 실행:', request.nextUrl.pathname);
  
  // 응답 객체 준비
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  // 쿠키 확인 디버깅
  const cookies = request.cookies;
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  
  console.log('인증 상태 확인:', {
    path: request.nextUrl.pathname,
    액세스토큰: accessToken ? '존재함' : '없음',
    리프레시토큰: refreshToken ? '존재함' : '없음',
    모든쿠키: Array.from(cookies.getAll()).map(c => c.name)
  });
  
  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('미들웨어: Supabase 환경 변수가 설정되지 않았습니다.');
    return response;
  }
  
  try {
    // OAuth 콜백 경로인 경우 우회
    if (request.nextUrl.pathname === '/auth/callback') {
      console.log('콜백 처리 감지 - 미들웨어 우회');
      return response;
    }
    
    // 루트 경로에서 code 파라미터가 있는 경우 (링크를 통한 접근)
    if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('code')) {
      const code = request.nextUrl.searchParams.get('code');
      const redirectUrl = new URL('/auth/callback', request.url);
      redirectUrl.searchParams.set('code', code!);
      
      console.log('루트 경로에서 인증 코드 감지, 리디렉션:', redirectUrl.toString());
      
      return NextResponse.redirect(redirectUrl);
    }
    
    // 인증 상태 확인
    const isLoggedIn = !!accessToken;
    console.log('경로 접근:', request.nextUrl.pathname, '인증 상태:', isLoggedIn ? '로그인됨' : '로그인안됨');
    
    // URL 객체 준비
    const url = request.nextUrl.clone();
    
    // 인증 우회 경로인 경우 인증 검사 건너뛰기
    if (bypassAuthRoutes.some(route => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route))) {
      console.log('인증 검사 건너뛰기:', request.nextUrl.pathname);
      return response;
    }
    
    // 로그인이 필요한 경로인지 확인
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
    );
    
    // 인증된 사용자는 접근할 수 없는 경로인지 확인
    const isAuthRoute = authRoutes.some(route => 
      request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
    );
    
    // 미인증 상태에서 보호된 경로 접근 시도
    if (isProtectedRoute && !isLoggedIn) {
      console.log('인증되지 않은 사용자가 보호된 경로에 접근 시도:', request.nextUrl.pathname, '-> 로그인 페이지로 리디렉션');
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // 인증 상태에서 로그인/회원가입 페이지 접근 시도
    if (isAuthRoute && isLoggedIn) {
      console.log('인증된 사용자가 인증 경로에 접근 시도:', request.nextUrl.pathname, '-> 보드 페이지로 리디렉션');
      url.pathname = '/board';
      return NextResponse.redirect(url);
    }
    
    // 그 외 경로는 그대로 진행
    return response;
  } catch (error) {
    console.error('미들웨어 처리 중 오류:', error);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 