/**
 * 파일명: src/services/cardService.test.ts
 * 목적: 카드 API 서비스 모듈 테스트
 * 역할: 카드 서비스 함수의 API 호출 및 오류 처리를 검증
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : 두 개의 테스트 파일을 병합하여 MSW 기반 테스트로 통합
 * 수정일: 2025-04-21 : 단건/소배치/대량 API 호출 구조에 맞게 테스트 케이스 업데이트
 */

import { beforeAll, afterAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse, type DefaultBodyType } from 'msw';
import { setupServer } from 'msw/node';
import { 
  fetchCards, 
  fetchCardById, 
  createCardsAPI, 
  createCardsBulkAPI, 
  updateCardAPI, 
  updateCardsBulkAPI, 
  deleteCardAPI, 
  deleteCardsAPI,
  deleteCardsBulkAPI
} from './cardService';
import { Card, CreateCardInput as CardInput, UpdateCardInput as CardPatch } from '@/types/card';

// 테스트 데이터
const mockTags = [
  { id: 'tag1', name: '개발' },
  { id: 'tag2', name: '일상' }
];

const mockUser = {
  id: 'user1',
  name: '사용자1'
};

const mockCards: Card[] = [
  {
    id: 'card1',
    title: '테스트 카드 1',
    content: '테스트 내용 1',
    createdAt: '2025-04-21T10:00:00Z',
    updatedAt: '2025-04-21T10:00:00Z',
    userId: 'user1',
    user: mockUser,
    cardTags: [{ tag: mockTags[0] }]
  },
  {
    id: 'card2',
    title: '테스트 카드 2',
    content: '테스트 내용 2',
    createdAt: '2025-04-21T11:00:00Z',
    updatedAt: '2025-04-21T11:00:00Z',
    userId: 'user1',
    user: mockUser,
    cardTags: [{ tag: mockTags[1] }]
  }
];

// MSW 서버 설정
const handlers = [
  // GET /api/cards
  http.get('/api/cards', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const tag = url.searchParams.get('tag');
    const userId = url.searchParams.get('userId');
    
    let filteredCards = [...mockCards];
    
    if (q) {
      filteredCards = filteredCards.filter(card => 
        card.title.includes(q) || (card.content && card.content.includes(q))
      );
    }
    
    if (tag) {
      filteredCards = filteredCards.filter(card => 
        card.cardTags?.some(ct => ct.tag.name === tag)
      );
    }
    
    if (userId) {
      filteredCards = filteredCards.filter(card => card.userId === userId);
    }
    
    return HttpResponse.json(filteredCards, { status: 200 });
  }),
  
  // GET /api/cards/:id
  http.get('/api/cards/:id', ({ params }) => {
    const id = params.id as string;
    const card = mockCards.find(c => c.id === id);
    
    if (card) {
      return HttpResponse.json(card, { status: 200 });
    }
    
    return new HttpResponse(JSON.stringify({ error: '카드를 찾을 수 없습니다.' }), { 
      status: 404, 
      statusText: 'Not Found',
      headers: { 'Content-Type': 'application/json' }
    });
  }),
  
  // POST /api/cards - 단건 또는 소배치
  http.post('/api/cards', async ({ request }) => {
    const body = await request.json();
    const inputs = Array.isArray(body) ? body : [body];
    
    if (inputs.some(input => !input.title)) {
      return new HttpResponse(JSON.stringify({ error: '제목은 필수입니다.' }), { 
        status: 400, 
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const newCards = inputs.map((input, index) => ({
      id: `new-card-${index + 1}`,
      title: input.title,
      content: input.content || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: input.userId,
      user: mockUser,
      cardTags: input.tags ? input.tags.map((tag: string) => ({ tag: { id: tag, name: tag } })) : []
    }));
    
    return HttpResponse.json(newCards, { status: 201 });
  }),
  
  // POST /api/cards/bulk - 대량 비동기 생성
  http.post('/api/cards/bulk', async () => {
    const token = 'bulk-create-token-12345';
    const headers = new Headers({
      'Location': `/api/bulk-status/${token}`
    });
    
    return HttpResponse.json({}, { status: 202, headers });
  }),
  
  // PATCH /api/cards/:id - 단건 부분 수정
  http.patch('/api/cards/:id', async ({ request, params }) => {
    const id = params.id as string;
    const body = await request.json() as CardPatch;
    const cardIndex = mockCards.findIndex(c => c.id === id);
    
    if (cardIndex === -1) {
      return new HttpResponse(JSON.stringify({ error: '카드를 찾을 수 없습니다.' }), { 
        status: 404, 
        statusText: 'Not Found',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const updatedCard: Card = {
      ...mockCards[cardIndex],
      ...(body as Partial<Card>),
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(updatedCard, { status: 200 });
  }),
  
  // PATCH /api/cards/bulk - 대량 비동기 부분 수정
  http.patch('/api/cards/bulk', async () => {
    const token = 'bulk-update-token-12345';
    const headers = new Headers({
      'Location': `/api/bulk-status/${token}`
    });
    
    return HttpResponse.json({}, { status: 202, headers });
  }),
  
  // DELETE /api/cards/:id - 단건 삭제
  http.delete('/api/cards/:id', ({ params }) => {
    const id = params.id as string;
    const cardIndex = mockCards.findIndex(c => c.id === id);
    
    if (cardIndex === -1) {
      return new HttpResponse(JSON.stringify({ error: '카드를 찾을 수 없습니다.' }), { 
        status: 404, 
        statusText: 'Not Found',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return HttpResponse.json({ message: '카드가 성공적으로 삭제되었습니다.' }, { status: 200 });
  }),
  
  // DELETE /api/cards?ids=id1,id2 - 다건 동기 삭제
  http.delete('/api/cards', ({ request }) => {
    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids');
    
    if (!idsParam) {
      return new HttpResponse(JSON.stringify({ error: '삭제할 카드 ID가 제공되지 않았습니다.' }), { 
        status: 400, 
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const ids = idsParam.split(',');
    
    if (ids.length > 100) {
      return new HttpResponse(JSON.stringify({ error: '동시에 100개 이상의 카드를 삭제할 수 없습니다.' }), { 
        status: 400, 
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return HttpResponse.json({ message: `${ids.length}개의 카드가 성공적으로 삭제되었습니다.` }, { status: 200 });
  }),
  
  // POST /api/cards/bulk-delete - 대량 비동기 삭제
  http.post('/api/cards/bulk-delete', async () => {
    const token = 'bulk-delete-token-12345';
    const headers = new Headers({
      'Location': `/api/bulk-status/${token}`
    });
    
    return HttpResponse.json({}, { status: 202, headers });
  })
];

const server = setupServer(...handlers);

// 테스트 전후 설정
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('cardService', () => {
  describe('fetchCards', () => {
    it('모든 카드를 가져올 수 있어야 한다', async () => {
      const cards = await fetchCards();
      expect(cards).toHaveLength(mockCards.length);
      expect(cards[0].id).toBe('card1');
      expect(cards[1].id).toBe('card2');
    });
    
    it('검색어로 필터링된 카드를 가져올 수 있어야 한다', async () => {
      server.use(
        http.get('/api/cards', ({ request }) => {
          const url = new URL(request.url);
          const q = url.searchParams.get('q');
          
          if (q === '카드 2') {
            return HttpResponse.json([mockCards[1]], { status: 200 });
          }
          
          return HttpResponse.json(mockCards, { status: 200 });
        })
      );
      
      const cards = await fetchCards({ q: '카드 2' });
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('card2');
    });
    
    it('태그로 필터링된 카드를 가져올 수 있어야 한다', async () => {
      server.use(
        http.get('/api/cards', ({ request }) => {
          const url = new URL(request.url);
          const tag = url.searchParams.get('tag');
          
          if (tag === '개발') {
            return HttpResponse.json([mockCards[0]], { status: 200 });
          }
          
          return HttpResponse.json(mockCards, { status: 200 });
        })
      );
      
      const cards = await fetchCards({ tag: '개발' });
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('card1');
    });
    
    it('오류 발생 시 적절하게 처리해야 한다', async () => {
      server.use(
        http.get('/api/cards', () => {
          return new HttpResponse(JSON.stringify({ error: '서버 오류' }), { 
            status: 500, 
            statusText: 'Internal Server Error',
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
      
      await expect(fetchCards()).rejects.toThrow();
    });
  });
  
  describe('fetchCardById', () => {
    it('특정 ID의 카드를 가져올 수 있어야 한다', async () => {
      const card = await fetchCardById('card1');
      expect(card.id).toBe('card1');
      expect(card.title).toBe('테스트 카드 1');
    });
    
    it('존재하지 않는 카드 ID에 대해 오류를 반환해야 한다', async () => {
      await expect(fetchCardById('nonexistent')).rejects.toThrow();
    });
  });
  
  describe('createCardsAPI', () => {
    it('단일 카드를 생성할 수 있어야 한다', async () => {
      const newCardData: CardInput = {
        title: '새 카드',
        content: '새 카드 내용',
        userId: 'user1',
        tags: ['개발']
      };
      
      const newCards = await createCardsAPI(newCardData);
      expect(newCards).toHaveLength(1);
      expect(newCards[0].title).toBe('새 카드');
      expect(newCards[0].content).toBe('새 카드 내용');
    });
    
    it('여러 카드를 배열로 생성할 수 있어야 한다', async () => {
      const newCardsData: CardInput[] = [
        {
          title: '새 카드 1',
          content: '새 카드 내용 1',
          userId: 'user1'
        },
        {
          title: '새 카드 2',
          content: '새 카드 내용 2',
          userId: 'user1'
        }
      ];
      
      const newCards = await createCardsAPI(newCardsData);
      expect(newCards).toHaveLength(2);
      expect(newCards[0].title).toBe('새 카드 1');
      expect(newCards[1].title).toBe('새 카드 2');
    });
    
    it('필수 필드가 누락된 경우 오류를 반환해야 한다', async () => {
      const invalidCardData = {
        content: '제목 없는 카드',
        userId: 'user1'
      } as unknown as CardInput;
      
      await expect(createCardsAPI(invalidCardData)).rejects.toThrow();
    });
  });
  
  describe('createCardsBulkAPI', () => {
    it('대량 카드 생성 요청을 보내고 토큰을 받아야 한다', async () => {
      const bulkCardsData: CardInput[] = Array(51).fill(null).map((_, i) => ({
        title: `대량 카드 ${i + 1}`,
        content: `대량 카드 내용 ${i + 1}`,
        userId: 'user1'
      }));
      
      const result = await createCardsBulkAPI(bulkCardsData);
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('bulk-create-token-12345');
    });
    
    it('서버 오류 시 적절하게 처리해야 한다', async () => {
      server.use(
        http.post('/api/cards/bulk', () => {
          return new HttpResponse(JSON.stringify({ error: '서버 오류' }), { 
            status: 500, 
            statusText: 'Internal Server Error',
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
      
      await expect(createCardsBulkAPI([{ title: '테스트', userId: 'user1' }])).rejects.toThrow();
    });
    
    it('Location 헤더가 없는 경우 오류를 발생시켜야 한다', async () => {
      server.use(
        http.post('/api/cards/bulk', () => {
          return new HttpResponse(null, { status: 202 }); // Location 헤더 없음
        })
      );
      
      await expect(createCardsBulkAPI([{ title: '테스트', userId: 'user1' }])).rejects.toThrow('Location 헤더');
    });
  });
  
  describe('updateCardAPI', () => {
    it('카드를 부분 업데이트할 수 있어야 한다', async () => {
      const updateData: CardPatch = {
        title: '업데이트된 제목',
        content: '업데이트된 내용'
      };
      
      const updatedCard = await updateCardAPI('card1', updateData);
      expect(updatedCard.title).toBe('업데이트된 제목');
      expect(updatedCard.content).toBe('업데이트된 내용');
    });
    
    it('존재하지 않는 카드 ID에 대해 오류를 반환해야 한다', async () => {
      await expect(updateCardAPI('nonexistent', { title: '테스트' })).rejects.toThrow();
    });
  });
  
  describe('updateCardsBulkAPI', () => {
    it('대량 카드 업데이트 요청을 보내고 토큰을 받아야 한다', async () => {
      const patches = [
        { id: 'card1', patch: { title: '업데이트 1' } },
        { id: 'card2', patch: { content: '업데이트 내용 2' } }
      ];
      
      const result = await updateCardsBulkAPI(patches);
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('bulk-update-token-12345');
    });
    
    it('서버 오류 시 적절하게 처리해야 한다', async () => {
      server.use(
        http.patch('/api/cards/bulk', () => {
          return new HttpResponse(JSON.stringify({ error: '서버 오류' }), { 
            status: 500, 
            statusText: 'Internal Server Error',
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
      
      await expect(updateCardsBulkAPI([{ id: 'card1', patch: { title: '테스트' } }])).rejects.toThrow();
    });
  });
  
  describe('deleteCardAPI', () => {
    it('카드를 삭제할 수 있어야 한다', async () => {
      await expect(deleteCardAPI('card1')).resolves.not.toThrow();
    });
    
    it('존재하지 않는 카드 ID에 대해 오류를 반환해야 한다', async () => {
      await expect(deleteCardAPI('nonexistent')).rejects.toThrow();
    });
  });
  
  describe('deleteCardsAPI', () => {
    it('여러 카드를 삭제할 수 있어야 한다', async () => {
      await expect(deleteCardsAPI(['card1', 'card2'])).resolves.not.toThrow();
    });
    
    it('카드 ID가 제공되지 않은 경우 오류를 반환해야 한다', async () => {
      server.use(
        http.delete('/api/cards', () => {
          return new HttpResponse(JSON.stringify({ error: '삭제할 카드 ID가 제공되지 않았습니다.' }), { 
            status: 400, 
            statusText: 'Bad Request',
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
      
      await expect(deleteCardsAPI([])).rejects.toThrow();
    });
    
    it('100개 초과 카드 삭제 시도 시 오류를 반환해야 한다', async () => {
      server.use(
        http.delete('/api/cards', () => {
          return new HttpResponse(JSON.stringify({ error: '동시에 100개 이상의 카드를 삭제할 수 없습니다.' }), { 
            status: 400, 
            statusText: 'Bad Request',
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
      
      const manyIds = Array(101).fill(null).map((_, i) => `card${i}`);
      await expect(deleteCardsAPI(manyIds)).rejects.toThrow();
    });
  });
  
  describe('deleteCardsBulkAPI', () => {
    it('대량 카드 삭제 요청을 보내고 토큰을 받아야 한다', async () => {
      const ids = Array(200).fill(null).map((_, i) => `card${i}`);
      
      const result = await deleteCardsBulkAPI(ids);
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('bulk-delete-token-12345');
    });
    
    it('서버 오류 시 적절하게 처리해야 한다', async () => {
      server.use(
        http.post('/api/cards/bulk-delete', () => {
          return new HttpResponse(JSON.stringify({ error: '서버 오류' }), { 
            status: 500, 
            statusText: 'Internal Server Error',
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
      
      await expect(deleteCardsBulkAPI(['card1'])).rejects.toThrow();
    });
  });
}); 