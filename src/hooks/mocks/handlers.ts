/**
 * 파일명: src/hooks/mocks/handlers.ts
 * 목적: MSW handler 정의
 * 역할: API 요청을 가로채기 위한 MSW handler 제공
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : 카드 업데이트 핸들러 추가
 * 수정일: 2025-04-21 : 디버깅용 로깅 추가 및 URL 형식 조정
 * 수정일: 2025-04-21 : 응답 상태 코드 수정 및 로깅 핸들러 추가
 */

import { http, HttpResponse } from 'msw';
import { Card, CreateCardInput, UpdateCardInput } from '../../types/card';

// 테스트용 모킹 카드 데이터
export const mockCards: Card[] = [{
  id: 'test-card-123',
  title: '테스트 카드',
  content: '테스트 내용',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user-1',
  cardTags: []
}];

// 테스트용 업데이트된 카드 데이터
export const mockUpdatedCard: Card = {
  id: 'test-card-123',
  title: '수정된 카드',
  content: '수정된 내용',
  createdAt: mockCards[0].createdAt,
  updatedAt: new Date().toISOString(),
  userId: 'user-1',
  cardTags: []
};

// API 요청 핸들러 정의
export const handlers = [
  // 카드 생성 API (POST /api/cards)
  http.post('/api/cards', async ({ request }) => {
    console.log('🔵 MSW가 POST /api/cards 요청을 가로챘습니다');
    try {
      // 요청 데이터 파싱
      const input = await request.json() as CreateCardInput | CreateCardInput[];
      const inputs = Array.isArray(input) ? input : [input];
      
      // 필수 필드 검증
      if (inputs.some(card => !card.title)) {
        return new HttpResponse(JSON.stringify({ error: '제목은 필수입니다' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // 새 카드 생성 (실제로는 고정된 mockCards 반환)
      return HttpResponse.json(mockCards, { status: 201 });
    } catch (error) {
      // 예외 처리
      return new HttpResponse(JSON.stringify({ error: '요청 처리 중 오류가 발생했습니다' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }),
  
  // 카드 업데이트 API (PATCH 요청 - 정확히 /api/cards/{id} 형식으로 처리)
  http.patch('/api/cards/:id', async ({ request, params }) => {
    console.log(`🔵 MSW가 PATCH /api/cards/${params.id} 요청을 가로챘습니다`, params);
    try {
      const { id } = params;
      
      // 요청 데이터 파싱
      const patchData = await request.json() as UpdateCardInput;
      console.log('🔵 PATCH 요청 데이터:', patchData);
      
      // 실제로는 params.id 값이 test-card-123인지 확인하지만, 
      // 더 유연하게 모든 ID를 허용하고 항상 응답을 반환
      const updatedCard = {
        ...mockUpdatedCard,
        id: id as string 
      };
      
      // 성공 응답 반환 - 명시적으로 200 OK 상태 코드 사용
      return HttpResponse.json(updatedCard, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('🔴 MSW PATCH 처리 중 오류:', error);
      // 예외 처리
      return new HttpResponse(JSON.stringify({ error: '요청 처리 중 오류가 발생했습니다' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }),
  
  // 서버 오류 시뮬레이션을 위한 특수 엔드포인트
  http.post('/api/cards/error', () => {
    return new HttpResponse(JSON.stringify({ error: '서버 오류' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
  
  // 로깅 API 요청 가로채기 (무시)
  http.post('/api/logs', () => {
    console.log('📝 로깅 요청 무시됨');
    return HttpResponse.json({ success: true }, { status: 200 });
  })
]; 