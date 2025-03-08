import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 보호된 경로 (로그인 필요)
const protectedRoutes = ['/board', '/cards', '/tags'];
// 인증된 사용자는 접근할 수 없는 경로
const authRoutes = ['/login', '/register'];
// 인증 검사를 건너뛸 경로
const bypassAuthRoutes = ['/auth/callback', '/api'];

export async function middleware(req: NextRequest) {
  // 요청 URL 가져오기
  const url = req.nextUrl.clone();
  const { pathname } = url;
  
  // 인증 우회 경로인 경우 인증 검사 건너뛰기
  if (bypassAuthRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    console.log('인증 검사 건너뛰기:', pathname);
    return NextResponse.next();
  }
  
  // 응답 생성
  const res = NextResponse.next();
  
  try {
    // 토큰 확인
    const accessToken = req.cookies.get('sb-access-token')?.value;
    const refreshToken = req.cookies.get('sb-refresh-token')?.value;
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
    
    return res;
  } catch (error) {
    console.error('미들웨어 처리 중 오류:', error);
    return res;
  }
}

// 미들웨어 적용 경로 지정
export const config = {
  matcher: [
    /*
     * 미들웨어 동작을 제외할 경로:
     * - 정적 파일 (images, favicon 등)
     * - 서비스 워커
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 