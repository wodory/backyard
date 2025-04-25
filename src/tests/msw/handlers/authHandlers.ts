/**
 * 파일명: src/tests/msw/handlers/authHandlers.ts
 * 목적: Supabase 인증 관련 API 요청을 모킹하기 위한 MSW 핸들러
 * 역할: 테스트 환경에서 Supabase 인증 요청을 가로채고 모의 응답 제공
 * 작성일: 2024-05-25
 * @rule   three-layer-Standard
 * @layer  service
 * @tag    @service-msw auth
 */

import { http, HttpResponse, delay } from 'msw';
import { User } from '@supabase/supabase-js';

// 모의 사용자 데이터
const mockUser: User = {
  id: 'test-user-id',
  app_metadata: {},
  user_metadata: {
    name: '테스트 사용자'
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'test@example.com',
  phone: '',
  role: '',
  updated_at: new Date().toISOString()
};

// 모의 세션 토큰
const mockAccessToken = 'test-access-token';
const mockRefreshToken = 'test-refresh-token';

export const authHandlers = [
  // 로그인 요청 처리
  http.post(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token`, async () => {
    await delay(100);
    return HttpResponse.json({
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken,
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser
    });
  }),

  // 세션 조회 요청 처리
  http.get(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, async ({ request }) => {
    await delay(100);
    // 인증 헤더가 있는 경우 사용자 정보 반환
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.includes(mockAccessToken)) {
      return HttpResponse.json(mockUser);
    }
    
    // 인증 실패
    return new HttpResponse(
      JSON.stringify({
        error: 'Unauthorized',
        message: '유효하지 않은 인증 토큰'
      }),
      { status: 401 }
    );
  }),

  // 로그아웃 요청 처리
  http.post(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/logout`, async () => {
    await delay(100);
    return HttpResponse.json({ message: '로그아웃 성공' });
  }),

  // 세션 갱신 요청 처리
  http.post(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, async () => {
    await delay(100);
    return HttpResponse.json({
      access_token: `${mockAccessToken}-refreshed`,
      refresh_token: `${mockRefreshToken}-refreshed`,
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser
    });
  })
]; 