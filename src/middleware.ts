import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 보호된 경로 (로그인 필요)
const protectedRoutes = ['/board', '/cards', '/tags'];
// 인증된 사용자는 접근할 수 없는 경로
const authRoutes = ['/login', '/register'];
// 인증 검사를 건너뛸 경로
const bypassAuthRoutes = ['/auth/callback', '/api'];

export async function middleware(request: NextRequest) {
  console.log('미들웨어 실행:', request.nextUrl.pathname);
  
  // 쿠키 확인 디버깅
  const cookies = request.cookies;
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  
  console.log('쿠키 확인 - 액세스 토큰:', accessToken ? '존재함' : '없음');
  console.log('쿠키 확인 - 리프레시 토큰:', refreshToken ? '존재함' : '없음');
  console.log('모든 쿠키:', Array.from(cookies.getAll()).map(c => c.name));
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('미들웨어: Supabase 환경 변수가 설정되지 않았습니다.');
    
    // 환경 변수가 없는 경우, 기본 요청 계속 진행 (차단하지 않음)
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            const cookie = request.cookies.get(name);
            console.log('쿠키 가져오기:', name, cookie ? '존재' : '없음', cookie?.value ? `(값 길이: ${cookie.value.length})` : '');
            return cookie?.value;
          },
          set(name: string, value: string, options: any) {
            // Next.js 15에서는 서버 액션이나 라우트 핸들러에서만 쿠키를 수정할 수 있지만,
            // 미들웨어에서는 응답 객체를 통해 쿠키를 설정할 수 있습니다.
            console.log('쿠키 설정:', name, `(값 길이: ${value.length})`);
            response.cookies.set({
              name,
              value,
              ...options,
              // 프로덕션, 개발 환경 모두 일관된 설정 사용
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: false, // 클라이언트에서 접근 가능하도록
              // 도메인 속성 제거 - 쿠키는 기본적으로 현재 도메인에만 설정됨
            });
          },
          remove(name: string, options: any) {
            console.log('쿠키 삭제:', name);
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              // 프로덕션, 개발 환경 모두 일관된 설정 사용
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: false, // 클라이언트에서 접근 가능하도록
              // 도메인 속성 제거 - 쿠키는 기본적으로 현재 도메인에만 설정됨
            });
          },
        },
      }
    );

    // 콜백 URL로 리디렉션 중인 경우 처리 우회
    const { pathname, search } = request.nextUrl;
    if (pathname === '/auth/callback' && search) {
      console.log('콜백 처리 감지 - 미들웨어 우회');
      return response;
    }

    // 요청 URL 가져오기
    const url = request.nextUrl.clone();
    
    // 인증 우회 경로인 경우 인증 검사 건너뛰기
    if (bypassAuthRoutes.some(route => pathname === route || pathname.startsWith(route))) {
      console.log('인증 검사 건너뛰기:', pathname);
      return response;
    }
    
    // 직접 토큰 확인 (쿠키 기반)
    let isLoggedIn = false;
    
    // 1. 쿠키 토큰 기반 확인
    if (accessToken) {
      isLoggedIn = true;
      console.log('액세스 토큰 쿠키 확인 성공');
    } 
    // 2. Supabase 세션 기반 확인 (백업 방법)
    else {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('세션 획득 오류:', sessionError.message);
        }
        
        isLoggedIn = !!session;
        console.log('세션 확인:', isLoggedIn ? '로그인됨' : '로그인안됨');
        
        if (session) {
          console.log('세션 정보 - 사용자 ID:', session.user?.id);
          console.log('세션 정보 - 만료 시간:', new Date(session.expires_at! * 1000).toISOString());
          
          // 쿠키가 없지만 세션이 있는 경우, 쿠키 복구
          if (!accessToken) {
            response.cookies.set({
              name: 'sb-access-token',
              value: session.access_token,
              maxAge: 60 * 60 * 24 * 7, // 7일
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: false,
            });
            
            if (session.refresh_token) {
              response.cookies.set({
                name: 'sb-refresh-token',
                value: session.refresh_token,
                maxAge: 60 * 60 * 24 * 30, // 30일
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                httpOnly: false,
              });
            }
            
            console.log('세션 토큰을 쿠키에 복구함');
          }
        }
      } catch (sessionError) {
        console.error('세션 확인 중 오류:', sessionError);
      }
    }
    
    console.log('경로 접근:', pathname, '인증 상태:', isLoggedIn ? '로그인됨' : '로그인안됨');
    
    // 로그인이 필요한 경로인지 확인
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    // 인증된 사용자는 접근할 수 없는 경로인지 확인
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