/**
 * 파일명: handlers.ts
 * 목적: MSW 핸들러 정의
 * 역할: API 요청을 가로채기 위한 MSW 핸들러 제공
 * 작성일: 2025-03-30
 * 수정일: 2025-04-08
 * 수정일: 2023-10-27 : 린터 오류 수정 (미사용 변수 제거)
 * 수정일: 2024-05-01 : 통합 테스트를 위한 추가 핸들러 구현
 * 수정일: 2025-04-21 : 카드 대량/일괄 처리 API 핸들러 추가
 */

import { http, HttpResponse } from 'msw';

/**
 * createMockSession: 모의 Supabase 세션 생성
 * @param options - 세션 생성 옵션
 * @returns 모의 세션 객체
 */
export function createMockSession(options: {
  success?: boolean;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  provider?: string;
  errorMessage?: string;
} = {}) {
  const {
    success = true,
    accessToken = 'mock_access_token',
    refreshToken = 'mock_refresh_token',
    userId = 'mock_user_id',
    provider = 'google',
    errorMessage = '인증 실패',
  } = options;

  if (success) {
    return {
      data: {
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            id: userId,
            app_metadata: { provider }
          }
        }
      },
      error: null
    };
  } else {
    return {
      data: { session: null },
      error: { message: errorMessage, status: 401 }
    };
  }
}

/**
 * 카드 데이터 타입
 */
export interface CardData {
  id: string;
  title: string;
  content: string;
  cardTags: Array<{ id: string; name: string; }>;
}

/**
 * 카드 데이터 생성 함수
 * @param id - 카드 ID
 * @returns 카드 데이터 객체
 */
export function createMockCard(id: string = 'test-card-123'): CardData {
  return {
    id,
    title: '테스트 카드',
    content: '테스트 내용',
    cardTags: []
  };
}

/**
 * 태그 데이터 생성 함수
 * @param id - 태그 ID
 * @param name - 태그 이름
 * @returns 태그 데이터 객체
 */
export function createMockTag(id: string = 'test-tag-123', name: string = '테스트 태그') {
  return {
    id,
    name
  };
}

// 모의 데이터
let mockCards = [
  createMockCard('card-1'),
  { ...createMockCard('card-2'), title: '중요 카드', cardTags: [{ id: 'tag-1', name: '중요' }] },
  { ...createMockCard('card-3'), title: '작업 카드', cardTags: [{ id: 'tag-2', name: '작업' }] }
];

const mockTags = [
  createMockTag('tag-1', '중요'),
  createMockTag('tag-2', '작업'),
  createMockTag('tag-3', '아이디어')
];

// Supabase 인증 API 엔드포인트 핸들러
export const handlers = [
  // Supabase 세션 교환 API 모킹
  http.post('*/auth/v1/token*', async ({ request }) => {
    // URL 파라미터를 사용하여 성공 또는 실패 시나리오 결정
    const url = new URL(request.url);
    const mockFail = url.searchParams.get('mock_fail') === 'true';
    const mockTimeout = url.searchParams.get('mock_timeout') === 'true';

    // 타임아웃 시뮬레이션
    if (mockTimeout) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    // 요청 데이터 파싱
    const formData = await request.formData();
    const grantType = formData.get('grant_type');
    const code = formData.get('code');
    const codeVerifier = formData.get('code_verifier');

    // 요청 유효성 검증
    if (!grantType || !code) {
      return HttpResponse.json({
        error: 'invalid_request',
        error_description: '필수 파라미터가 누락되었습니다'
      }, { status: 400 });
    }

    // 코드 검증기 유효성 검증
    if (grantType === 'authorization_code' && !codeVerifier) {
      return HttpResponse.json({
        error: 'invalid_request',
        error_description: 'code_verifier가 필요합니다'
      }, { status: 400 });
    }

    // 실패 시나리오
    if (mockFail) {
      return HttpResponse.json({
        error: 'invalid_grant',
        error_description: '인증 코드가 유효하지 않습니다'
      }, { status: 400 });
    }

    // 성공 시나리오
    return HttpResponse.json({
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 'mock_user_id',
        app_metadata: { provider: 'google' },
        aud: 'authenticated',
        email: 'test@example.com'
      }
    });
  }),

  // Supabase 사용자 정보 API 모킹
  http.get('*/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'mock_user_id',
      app_metadata: { provider: 'google' },
      user_metadata: { name: 'Test User' },
      aud: 'authenticated',
      email: 'test@example.com'
    });
  }),

  // 카드 목록 조회 - 필터링 지원
  http.get('/api/cards', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const tag = url.searchParams.get('tag');
    
    let filteredCards = [...mockCards];
    
    // 검색어 필터링
    if (q) {
      filteredCards = filteredCards.filter(card => 
        card.title.toLowerCase().includes(q.toLowerCase()) || 
        card.content.toLowerCase().includes(q.toLowerCase())
      );
    }
    
    // 태그 필터링
    if (tag) {
      filteredCards = filteredCards.filter(card => 
        card.cardTags.some(t => t.name.toLowerCase() === tag.toLowerCase())
      );
    }
    
    return HttpResponse.json(filteredCards);
  }),

  // 카드 조회 API - 성공 케이스
  http.get('/api/cards/:id', ({ params }) => {
    const { id } = params;
    
    // 특정 ID로 에러 케이스 테스트 가능
    if (id === 'not-found') {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Not Found'
      });
    }
    
    if (id === 'server-error') {
      return new HttpResponse(null, {
        status: 500,
        statusText: 'Internal Server Error'
      });
    }

    const card = mockCards.find(c => c.id === id);
    
    if (!card) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Not Found'
      });
    }

    // 성공 응답
    return HttpResponse.json(card);
  }),

  // 카드 생성 API - 단건 또는 소배치(≤50)
  http.post('/api/cards', async ({ request }) => {
    try {
      const data = await request.json();
      const inputs = Array.isArray(data) ? data : [data];
      
      // 필수 필드 검증
      if (inputs.some(input => !input.title)) {
        return new HttpResponse(JSON.stringify({ error: '제목은 필수입니다' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // 소배치 크기 제한 검증
      if (inputs.length > 50) {
        return new HttpResponse(JSON.stringify({ error: '최대 50개까지만 한 번에 생성할 수 있습니다' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // 새 카드 생성
      const newCards = inputs.map((input, index) => ({
        id: `gen-card-${Date.now()}-${index}`,
        title: input.title,
        content: input.content || '',
        cardTags: input.tags ? input.tags.map((tag: string) => ({ id: tag, name: tag })) : []
      }));
      
      // mockCards 배열에 추가 (실제 환경에서는 DB에 저장)
      mockCards = [...mockCards, ...newCards];
      
      return HttpResponse.json(newCards, { status: 201 });
    } catch (error) {
      return new HttpResponse(JSON.stringify({ error: '요청 처리 중 오류가 발생했습니다' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }),
  
  // 카드 대량 생성 API - 비동기(>50)
  http.post('/api/cards/bulk', async ({ request }) => {
    try {
      const data = await request.json();
      const inputs = Array.isArray(data) ? data : [data];
      
      // 필수 필드 검증
      if (inputs.some(input => !input.title)) {
        return new HttpResponse(JSON.stringify({ error: '모든 카드에 제목이 필요합니다' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // 비동기 작업 토큰 생성
      const token = `bulk-create-${Date.now()}`;
      
      // 202 Accepted 응답 + Location 헤더
      return new HttpResponse(null, {
        status: 202,
        headers: {
          'Location': `/api/bulk-status/${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      return new HttpResponse(JSON.stringify({ error: '요청 처리 중 오류가 발생했습니다' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }),

  // 카드 수정 API - 단건
  http.patch('/api/cards/:id', async ({ params, request }) => {
    const { id } = params;
    
    try {
      const patchData = await request.json();
      
      // 존재하는 카드 찾기
      const cardIndex = mockCards.findIndex(card => card.id === id);
      if (cardIndex === -1) {
        return new HttpResponse(JSON.stringify({ error: '카드를 찾을 수 없습니다' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // 카드 업데이트
      const updatedCard = {
        ...mockCards[cardIndex],
        ...(patchData as Record<string, unknown>),
      };
      
      // 업데이트된 카드 저장
      mockCards[cardIndex] = updatedCard;
      
      return HttpResponse.json(updatedCard);
    } catch (error) {
      return new HttpResponse(JSON.stringify({ error: '요청 처리 중 오류가 발생했습니다' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }),
  
  // 카드 대량 수정 API - 비동기
  http.patch('/api/cards/bulk', async () => {
    // 비동기 작업 토큰 생성
    const token = `bulk-update-${Date.now()}`;
    
    // 202 Accepted 응답 + Location 헤더
    return new HttpResponse(null, {
      status: 202,
      headers: {
        'Location': `/api/bulk-status/${token}`,
        'Content-Type': 'application/json',
      },
    });
  }),

  // 카드 수정 API
  http.put('/api/cards/:id', async ({ params, request }) => {
    const { id } = params;
    
    try {
      const requestData = await request.json() as Partial<CardData>;

      // 유효성 검사 실패 케이스
      if (!requestData || !requestData.title || !requestData.content) {
        return new HttpResponse(JSON.stringify({ error: '필수 필드가 누락되었습니다' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      // 카드 찾기 및 업데이트
      const index = mockCards.findIndex(c => c.id === id);
      if (index === -1) {
        return new HttpResponse(JSON.stringify({ error: '카드를 찾을 수 없습니다' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      mockCards[index] = { ...mockCards[index], ...requestData };

      // 성공 응답
      return HttpResponse.json(mockCards[index]);
    } catch {
      return new HttpResponse(JSON.stringify({ error: '잘못된 요청 형식입니다' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }),

  // 카드 삭제 API - 단건
  http.delete('/api/cards/:id', ({ params }) => {
    const { id } = params;
    
    // 존재하는 카드 찾기
    const cardIndex = mockCards.findIndex(card => card.id === id);
    if (cardIndex === -1) {
      return new HttpResponse(JSON.stringify({ error: '카드를 찾을 수 없습니다' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // 카드 삭제
    mockCards = mockCards.filter(card => card.id !== id);
    
    return HttpResponse.json({ message: '카드가 성공적으로 삭제되었습니다' });
  }),
  
  // 카드 다건 삭제 API - 동기(≤100)
  http.delete('/api/cards', ({ request }) => {
    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids');
    
    if (!idsParam) {
      return new HttpResponse(JSON.stringify({ error: '삭제할 카드 ID가 제공되지 않았습니다' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const ids = idsParam.split(',');
    
    if (ids.length > 100) {
      return new HttpResponse(JSON.stringify({ error: '동시에 100개 이상의 카드를 삭제할 수 없습니다' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // 카드 삭제
    const initialCount = mockCards.length;
    mockCards = mockCards.filter(card => !ids.includes(card.id));
    const deletedCount = initialCount - mockCards.length;
    
    return HttpResponse.json({ message: `${deletedCount}개의 카드가 성공적으로 삭제되었습니다` });
  }),
  
  // 카드 대량 삭제 API - 비동기(>100)
  http.post('/api/cards/bulk-delete', async () => {
    // 비동기 작업 토큰 생성
    const token = `bulk-delete-${Date.now()}`;
    
    // 202 Accepted 응답 + Location 헤더
    return new HttpResponse(null, {
      status: 202,
      headers: {
        'Location': `/api/bulk-status/${token}`,
        'Content-Type': 'application/json',
      },
    });
  }),

  // 태그 목록 조회 API
  http.get('/api/tags', () => {
    return HttpResponse.json(mockTags);
  }),
  
  // 태그 생성 API
  http.post('/api/tags', async ({ request }) => {
    try {
      const data = await request.json() as { name: string };
      if (!data.name) {
        return HttpResponse.json({ error: '태그 이름은 필수입니다.' }, { status: 400 });
      }
      
      // 중복 체크
      if (mockTags.some(t => t.name.toLowerCase() === data.name.toLowerCase())) {
        return HttpResponse.json({ error: '이미 존재하는 태그입니다.' }, { status: 400 });
      }
      
      const newTag = {
        id: `tag-${Date.now()}`,
        name: data.name
      };
      
      // 모의 데이터에 추가
      mockTags.push(newTag);
      
      return HttpResponse.json(newTag, { status: 201 });
    } catch {
      return HttpResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }
  }),
  
  // 태그 삭제 API
  http.delete('/api/tags/:id', ({ params }) => {
    const { id } = params;
    
    const index = mockTags.findIndex(t => t.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // 모의 데이터에서 제거
    mockTags.splice(index, 1);
    
    // 관련 카드에서도 태그 제거
    mockCards = mockCards.map(card => ({
      ...card,
      cardTags: card.cardTags.filter(t => t.id !== id)
    }));
    
    return new HttpResponse(null, { status: 200 });
  })
]; 