/**
 * 파일명: route.test.ts
 * 목적: OAuth 콜백 핸들러 테스트
 * 역할: 인증 코드 처리와 리다이렉션 로직 검증
 * 작성일: 2025-03-27
 * 수정일: 2025-03-30
 * 수정일: 2025-04-21 : 리팩토링된 OAuth 콜백 핸들러에 맞게 테스트 업데이트
 */

import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { GET } from './route';

// Supabase 클라이언트 모킹
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

describe('OAuth Callback Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공적으로 인증 코드를 교환하고 홈으로 리다이렉트', async () => {
    // 모의 Supabase 클라이언트 설정
    const mockExchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    (createClient as any).mockResolvedValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession
      }
    });

    // 테스트 요청 생성
    const testUrl = 'http://localhost:3000/auth/callback?code=valid_code';
    const request = new NextRequest(new URL(testUrl));

    // 핸들러 실행
    const response = await GET(request);

    // 검증
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid_code');
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('인증 코드가 없을 경우 에러 페이지로 리다이렉트', async () => {
    // 테스트 요청 생성 (코드 없음)
    const testUrl = 'http://localhost:3000/auth/callback';
    const request = new NextRequest(new URL(testUrl));

    // 핸들러 실행
    const response = await GET(request);

    // 검증
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/error');
  });
}); 