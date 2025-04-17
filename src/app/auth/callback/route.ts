/**
 * 파일명: src/app/auth/callback/route.ts
 * 목적: OAuth 콜백 처리
 * 역할: OAuth 인증 완료 후 사용자를 적절한 페이지로 리다이렉트
 * 작성일: 2025-03-27
 * 수정일: 2025-04-05 : 로그 메시지 강화 및 추가
 */

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // 핸들러 시작 로그 추가
    console.log('[AuthCallback] Route handler started.');
    
    // 요청 URL 로깅
    console.log('[AuthCallback] Received request URL:', request.url);
    
    // URL에서 인증 코드 추출
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    // 인증 코드 추출 로그 강화
    if (code) {
      console.log('[AuthCallback] Authorization code found:', code.substring(0, 10) + '...'); // 코드 일부만 로깅
    } else {
      console.error('[AuthCallback] Authorization code NOT found in URL.'); // 에러 로그로 변경
      return NextResponse.redirect(new URL('/login?error=인증 코드를 찾을 수 없습니다', request.url))
    }
    
    // 리다이렉트 대상 경로 (기본값: 홈)
    const next = '/'
    
    // 서버 클라이언트 생성
    const supabase = await createClient()
    
    // 세션 교환 시도 로그
    console.log('[AuthCallback] Attempting to exchange code for session with code:', code.substring(0, 10) + '...');
    
    // PKCE 인증 흐름 완료 (코드 → 토큰 교환)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    // 세션 교환 결과 로그 강화
    if (error) {
      console.error('[AuthCallback] Code exchange failed. Error:', error); // 에러 객체 전체 로깅
      // 리디렉션 URL 생성 전 로그 추가
      const errorRedirectUrl = new URL(`/login?error=코드 교환 실패&error_description=${encodeURIComponent(error.message)}`, request.url);
      console.log('[AuthCallback] Redirecting to (error):', errorRedirectUrl.toString());
      return NextResponse.redirect(errorRedirectUrl);
    } else {
      console.log('[AuthCallback] Code exchange successful.'); // 성공 로그 추가
    }
    
    // 성공 리디렉션 로그
    const successRedirectUrl = new URL(next, request.url);
    console.log('[AuthCallback] Redirecting to (success):', successRedirectUrl.toString());
    return NextResponse.redirect(successRedirectUrl);
  } catch (error: unknown) {
    // 전체 예외 처리 로그 강화
    console.error('[AuthCallback] Unhandled exception during callback processing:', error); // 에러 객체 로깅
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류 발생';
    const exceptionRedirectUrl = new URL(`/login?error=콜백 처리 중 예외 발생&error_description=${encodeURIComponent(errorMessage)}`, request.url);
    console.log('[AuthCallback] Redirecting to (exception):', exceptionRedirectUrl.toString());
    return NextResponse.redirect(exceptionRedirectUrl);
  }
} 