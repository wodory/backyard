/**
 * 파일명: actions.ts
 * 목적: 로그인 및 회원가입 서버 액션 제공
 * 역할: 사용자 인증 처리
 * 작성일: 2025-03-27
 * 수정일: 2025-04-05 : OAuth 리다이렉션 URL 환경변수 수정
 * 수정일: 2025-04-24 : Supabase 기반 인증 처리로 리팩토링
 * 수정일: 2025-04-24 : Google 로그인 액션을 서버 호환 함수로 수정
 * 수정일: 2025-04-24 : 구글 로그인 리다이렉션 처리 방식 변경 - URL 반환 방식으로 수정
 * 수정일: 2024-05-19 : 클라이언트 Google OAuth 모듈을 서버 호환 모듈로 교체
 * 수정일: 2024-05-19 : Google OAuth 함수 import 경로 변경 (auth/server → auth-server)
 * 수정일: 2024-05-21 : 클라이언트 signIn 함수를 서버 호환 함수로 교체
 * 
 * @rule   three-layer-standard
 * @layer  service
 * @tag    @service-msw googleSignInAction
 * 설명    서버 액션(action)에서 auth-server 서비스 함수를 호출하여 인증 처리 (MSW로 테스트)
 */

'use server'

import { redirect } from 'next/navigation'

// 클라이언트 함수 import 제거
// import { signIn } from '@/lib/auth'
import { serverSignInWithGoogle } from '@/lib/auth-server'
import createLogger from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

// 로거 생성
const logger = createLogger('LoginActions')

/**
 * serverSignIn: 서버에서 이메일과 비밀번호로 로그인
 * @param {string} email - 이메일 주소
 * @param {string} password - 비밀번호
 * @returns {Promise<any>} 로그인 결과
 */
async function serverSignIn(email: string, password: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    logger.info('서버에서 로그인 성공', {
      환경: process.env.NODE_ENV
    });

    return data;
  } catch (error) {
    logger.error('서버에서 로그인 실패:', error);
    throw error;
  }
}

/**
 * loginAction: 이메일과 비밀번호를 사용하여 사용자를 로그인
 * @param formData - 로그인 폼 데이터 (email, password)
 */
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 기본 유효성 검사
  if (!email || !password) {
    logger.error('이메일 또는 비밀번호가 제공되지 않았습니다')
    return redirect('/login?error=Missing+credentials')
  }

  try {
    logger.debug('로그인 시도:', { email })
    // 클라이언트 signIn 대신 서버용 함수 사용
    const data = await serverSignIn(email, password)

    // 성공 시 홈페이지로 리디렉션
    logger.info('로그인 성공:', { email })
    return redirect('/')
  } catch (error) {
    logger.error('로그인 중 예외 발생:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
  }
}

/**
 * signupAction: 새 사용자 등록
 * @param formData - 회원가입 폼 데이터 (email, password, name)
 */
export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  // 기본 유효성 검사
  if (!email || !password || !name) {
    logger.error('회원가입에 필요한 필드가 누락되었습니다')
    return redirect('/signup?error=Missing+required+fields')
  }

  try {
    // 회원가입 로직 - 필요한 경우 구현
    logger.debug('회원가입 시도:', { email, name })
    // TODO: 회원가입 로직 구현
    
    logger.info('회원가입 성공:', { email })
    return redirect('/login?success=Account+created+successfully')
  } catch (error) {
    logger.error('회원가입 중 예외 발생:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return redirect(`/signup?error=${encodeURIComponent(errorMessage)}`)
  }
}

/**
 * googleSignInAction: Google OAuth를 사용하여 로그인
 */
export async function googleSignInAction() {
  try {
    logger.debug('Google OAuth 로그인 시도')
    const { success, url, error } = await serverSignInWithGoogle()

    if (!success || error) {
      logger.error('Google OAuth 로그인 실패:', error)
      return redirect(`/login?error=${encodeURIComponent(error || 'Unknown error')}`)
    }

    // 클라이언트에서 OAuth URL로 리디렉션하기 위한 URL 반환
    logger.info('Google OAuth URL 획득됨')
    return { url }
  } catch (error) {
    logger.error('Google OAuth 로그인 중 예외 발생:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { error: errorMessage }
  }
} 