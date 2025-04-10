/**
 * 파일명: actions.ts
 * 목적: 로그인 및 회원가입 서버 액션 제공
 * 역할: 사용자 인증 처리
 * 작성일: 2025-03-27
 */

'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('로그인 오류:', error)
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('회원가입 오류:', error)
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // 회원가입 성공 메시지로 리다이렉션
  return redirect('/login?message=확인 이메일을 발송했습니다. 이메일을 확인해주세요.')
}

export async function signInWithGoogle() {
  // Supabase 클라이언트 생성
  const supabase = await createClient()
  
  // 현재 앱 도메인 (기본값 localhost:3000)
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // 콜백 URL 설정
  const redirectUrl = `${origin}/auth/callback`
  
  // Google OAuth 로그인 프로세스 시작
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    // 오류 발생 시 로그인 페이지로 리다이렉트
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // 구글 OAuth URL로 리다이렉션
  if (data?.url) {
    return redirect(data.url)
  }
  
  // URL이 없는 경우 홈으로 리다이렉션
  return redirect('/')
} 