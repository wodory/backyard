/**
 * 파일명: route.ts
 * 목적: 로그인 상태 확인 API
 * 역할: 현재 로그인 상태와 사용자 정보 반환
 * 작성일: 2024-03-31
 */

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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