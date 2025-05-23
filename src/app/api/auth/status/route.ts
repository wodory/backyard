/**
 * 파일명: route.ts
 * 목적: 로그인 상태 확인 API
 * 역할: 현재 로그인 상태와 사용자 정보 반환
 * 작성일: 2025-03-27
 * 수정일: 2024-05-21 : import 순서 수정
 * 수정일: 2024-05-22 : import 순서 오류 수정
 */

import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      return NextResponse.json({ 
        loggedIn: false, 
        error: error.message 
      })
    }
    
    return NextResponse.json({ 
      loggedIn: !!data?.user,
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        provider: data.user.app_metadata?.provider || 'unknown'
      } : null
    })
  } catch (error) {
    console.error('인증 상태 확인 중 오류:', error)
    return NextResponse.json({ 
      loggedIn: false, 
      error: '인증 상태 확인 중 오류가 발생했습니다' 
    }, { status: 500 })
  }
} 