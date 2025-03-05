/**
 * @vitest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from './route';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';

// 타입 정의
interface RequestOptions {
  method?: string;
  body?: string;
}

interface ResponseOptions {
  status?: number;
}

// NextResponse와 prisma 모킹
vi.mock('next/server', () => {
  const NextResponseMock = {
    json: vi.fn().mockImplementation((data: any, options?: ResponseOptions) => ({
      status: options?.status || 200,
      json: async () => data,
    }))
  };
  
  return {
    NextRequest: vi.fn().mockImplementation((url: string, options?: RequestOptions) => ({
      url,
      method: options?.method || 'GET',
      json: vi.fn().mockResolvedValue(options?.body ? JSON.parse(options.body) : {}),
      nextUrl: {
        searchParams: new URLSearchParams(url?.split('?')[1] || ''),
      },
    })),
    NextResponse: NextResponseMock
  };
});

// prisma 모킹 - 내부에서 모킹 함수 생성
vi.mock('@/lib/prisma', () => {
  const cardFindMany = vi.fn();
  const cardCreate = vi.fn();
  const cardFindUnique = vi.fn();
  const userFindUnique = vi.fn();
  const tagFindUnique = vi.fn();
  const tagCreate = vi.fn();
  const cardTagDeleteMany = vi.fn();
  const cardTagCreate = vi.fn();
  
  return {
    prisma: {
      card: {
        findMany: cardFindMany,
        create: cardCreate,
        findUnique: cardFindUnique,
      },
      user: {
        findUnique: userFindUnique,
      },
      cardTag: {
        deleteMany: cardTagDeleteMany,
        create: cardTagCreate,
      },
      tag: {
        findUnique: tagFindUnique,
        create: tagCreate,
      }
    }
  };
});

// zod 모킹
vi.mock('zod', async (importOriginal: () => Promise<any>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    z: {
      ...actual.z,
      object: () => ({
        safeParse: vi.fn().mockImplementation((data) => {
          // title이 없으면 유효성 검사 실패
          if (!data.title) {
            return {
              success: false,
              error: {
                format: () => ({ title: { _errors: ['제목은 필수입니다.'] } })
              }
            };
          }
          // userId가 유효하지 않으면 실패
          if (data.userId && typeof data.userId !== 'string') {
            return {
              success: false,
              error: {
                format: () => ({ userId: { _errors: ['유효한 사용자 ID가 필요합니다.'] } })
              }
            };
          }
          return {
            success: true,
            data
          };
        })
      }),
      string: () => ({
        min: () => ({
          optional: vi.fn(),
          uuid: vi.fn().mockReturnThis()
        }),
        optional: vi.fn(),
        uuid: vi.fn().mockReturnThis()
      }),
      array: () => ({
        optional: vi.fn()
      })
    }
  };
});

describe('Cards API', () => {
  // console.error 모킹
  const originalConsoleError = console.error;
  let prismaMock: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    console.error = vi.fn();
    
    // 모든 테스트에서 사용할 prisma mock 설정
    const importedModule = await import('@/lib/prisma');
    prismaMock = vi.mocked(importedModule).prisma;
  });
  
  // 테스트 후 원래 console.error 복원
  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('GET /api/cards', () => {
    it('모든 카드를 성공적으로 조회한다', async () => {
      // 모킹된 데이터
      const mockCards = [
        {
          id: '1',
          title: '테스트 카드 1',
          content: '테스트 내용 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1',
          user: { id: 'user1', name: '사용자 1' }
        },
        {
          id: '2',
          title: '테스트 카드 2',
          content: '테스트 내용 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user2',
          user: { id: 'user2', name: '사용자 2' }
        },
      ];

      // Prisma 응답 모킹
      prismaMock.card.findMany.mockResolvedValueOnce(mockCards);

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards');
      const response = await GET(request);
      
      // 검증
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockCards);
      expect(prismaMock.card.findMany).toHaveBeenCalled();
    });

    it('사용자 ID로 필터링된 카드를 조회한다', async () => {
      const userId = 'user1';
      const mockCards = [
        {
          id: '1',
          title: '테스트 카드 1',
          content: '테스트 내용 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: userId,
          user: { id: userId, name: '사용자 1' }
        }
      ];

      prismaMock.card.findMany.mockResolvedValueOnce(mockCards);

      const request = new NextRequest(`http://localhost:3000/api/cards?userId=${userId}`);
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockCards);
      expect(prismaMock.card.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          cardTags: {
            include: {
              tag: true
            }
          }
        }
      });
    });

    it('검색어로 카드를 필터링한다', async () => {
      const searchQuery = '테스트';
      const mockCards = [
        {
          id: '1',
          title: '테스트 카드 1',
          content: '테스트 내용 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1',
          user: { id: 'user1', name: '사용자 1' }
        }
      ];

      prismaMock.card.findMany.mockResolvedValueOnce(mockCards);

      const request = new NextRequest(`http://localhost:3000/api/cards?q=${searchQuery}`);
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockCards);
      expect(prismaMock.card.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { content: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          cardTags: {
            include: {
              tag: true
            }
          }
        }
      });
    });

    it('태그로 카드를 필터링한다', async () => {
      const tagName = '테스트태그';
      const mockCards = [
        {
          id: '1',
          title: '테스트 카드 1',
          content: '테스트 내용 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1',
          user: { id: 'user1', name: '사용자 1' },
          cardTags: [
            {
              id: 'cardtag-1',
              cardId: '1',
              tagId: 'tag-1',
              tag: {
                id: 'tag-1',
                name: tagName
              }
            }
          ]
        }
      ];

      prismaMock.card.findMany.mockResolvedValueOnce(mockCards);

      const request = new NextRequest(`http://localhost:3000/api/cards?tag=${tagName}`);
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockCards);
      expect(prismaMock.card.findMany).toHaveBeenCalledWith({
        where: {
          cardTags: {
            some: {
              tag: {
                name: tagName
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          cardTags: {
            include: {
              tag: true
            }
          }
        }
      });
    });

    it('에러 발생 시 500 응답을 반환한다', async () => {
      // 에러 모킹
      prismaMock.card.findMany.mockRejectedValueOnce(new Error('DB 에러'));

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards');
      const response = await GET(request);
      
      // 검증
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST /api/cards', () => {
    it('유효한 데이터로 카드를 성공적으로 생성한다', async () => {
      // 유효한 요청 데이터
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tags: ['테스트태그']
      };
      
      // 생성된 카드 데이터 모킹
      const createdCard = {
        id: 'new-card-id',
        title: requestData.title,
        content: requestData.content,
        userId: requestData.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 태그 포함된 카드 데이터 모킹
      const cardWithTags = {
        ...createdCard,
        cardTags: [
          {
            id: 'cardtag-1',
            cardId: 'new-card-id',
            tagId: 'tag-1',
            tag: {
              id: 'tag-1',
              name: '테스트태그'
            }
          }
        ]
      };
      
      // 사용자 존재함을 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '테스트 사용자'
      });
      
      // 카드 생성 모킹
      prismaMock.card.create.mockResolvedValueOnce(createdCard);
      
      // 태그 조회 모킹
      prismaMock.tag.findUnique.mockResolvedValueOnce({
        id: 'tag-1',
        name: '테스트태그'
      });
      
      // 카드와 태그 정보 조회 모킹
      prismaMock.card.findUnique.mockResolvedValueOnce(cardWithTags);
      
      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(cardWithTags);
      expect(prismaMock.card.create).toHaveBeenCalledWith({
        data: {
          title: requestData.title,
          content: requestData.content,
          userId: requestData.userId
        }
      });
    });

    it('태그가 없는 카드를 생성한다', async () => {
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const createdCard = {
        id: 'new-card-id',
        title: requestData.title,
        content: requestData.content,
        userId: requestData.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: requestData.userId,
        name: '테스트 사용자'
      });
      
      prismaMock.card.create.mockResolvedValueOnce(createdCard);
      prismaMock.card.findUnique.mockResolvedValueOnce(createdCard);
      
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(createdCard);
      
      // 태그 처리 함수가 호출되지 않았는지 확인
      expect(prismaMock.cardTag.deleteMany).not.toHaveBeenCalled();
      expect(prismaMock.tag.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.tag.create).not.toHaveBeenCalled();
      expect(prismaMock.cardTag.create).not.toHaveBeenCalled();
    });

    it('이미 존재하는 태그를 포함한 카드를 생성한다', async () => {
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tags: ['기존태그']
      };
      
      const createdCard = {
        id: 'new-card-id',
        title: requestData.title,
        content: requestData.content,
        userId: requestData.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const existingTag = {
        id: 'tag-1',
        name: '기존태그'
      };
      
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: requestData.userId,
        name: '테스트 사용자'
      });
      
      prismaMock.card.create.mockResolvedValueOnce(createdCard);
      prismaMock.tag.findUnique.mockResolvedValueOnce(existingTag);
      prismaMock.cardTag.create.mockResolvedValueOnce({
        id: 'cardtag-1',
        cardId: createdCard.id,
        tagId: existingTag.id
      });
      
      const cardWithTags = {
        ...createdCard,
        cardTags: [
          {
            id: 'cardtag-1',
            cardId: createdCard.id,
            tagId: existingTag.id,
            tag: existingTag
          }
        ]
      };
      
      prismaMock.card.findUnique.mockResolvedValueOnce(cardWithTags);
      
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(cardWithTags);
      
      // 태그 처리 함수가 올바르게 호출되었는지 확인
      expect(prismaMock.cardTag.deleteMany).toHaveBeenCalledWith({
        where: { cardId: createdCard.id }
      });
      expect(prismaMock.tag.findUnique).toHaveBeenCalledWith({
        where: { name: '기존태그' }
      });
      expect(prismaMock.tag.create).not.toHaveBeenCalled();
      expect(prismaMock.cardTag.create).toHaveBeenCalledWith({
        data: {
          cardId: createdCard.id,
          tagId: existingTag.id
        }
      });
    });

    it('유효하지 않은 데이터로 요청 시 400 응답을 반환한다', async () => {
      // 유효하지 않은 요청 데이터 (제목 누락)
      const requestData = {
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(prismaMock.card.create).not.toHaveBeenCalled();
    });
    
    it('존재하지 않는 사용자로 요청 시 404 응답을 반환한다', async () => {
      // 유효한 요청 데이터 (존재하지 않는 사용자 ID)
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: 'non-existent-user-id',
      };
      
      // 사용자가 존재하지 않음을 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      
      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('존재하지 않는 사용자입니다.');
      expect(prismaMock.card.create).not.toHaveBeenCalled();
    });
    
    it('카드 생성 중 DB 에러 발생 시 500 응답을 반환한다', async () => {
      // 유효한 요청 데이터
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      
      // 사용자 존재함을 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '테스트 사용자'
      });
      
      // 카드 생성 중 에러 발생 모킹
      prismaMock.card.create.mockRejectedValueOnce(new Error('DB 에러'));
      
      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('카드를 생성하는 중 오류가 발생했습니다.');
      expect(console.error).toHaveBeenCalled();
    });
    
    it('새로운 태그를 생성하여, 카드와 함께 저장한다', async () => {
      // 유효한 요청 데이터 (새로운 태그 포함)
      const requestData = {
        title: '새 카드 제목',
        content: '새 카드 내용',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tags: ['새로운태그']
      };
      
      // 생성된 카드 데이터 모킹
      const createdCard = {
        id: 'new-card-id',
        title: requestData.title,
        content: requestData.content,
        userId: requestData.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 사용자 존재함을 모킹
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: requestData.userId,
        name: '테스트 사용자'
      });
      
      // 카드 생성 모킹
      prismaMock.card.create.mockResolvedValueOnce(createdCard);
      
      // 태그가 존재하지 않음을 모킹
      prismaMock.tag.findUnique.mockResolvedValueOnce(null);
      
      // 새 태그 생성 모킹
      const newTag = {
        id: 'new-tag-id',
        name: '새로운태그'
      };
      prismaMock.tag.create.mockResolvedValueOnce(newTag);
      
      // 카드-태그 연결 모킹
      prismaMock.cardTag.create.mockResolvedValueOnce({
        id: 'cardtag-1',
        cardId: createdCard.id,
        tagId: newTag.id
      });
      
      // 태그 포함된 카드 데이터 모킹
      const cardWithTags = {
        ...createdCard,
        cardTags: [
          {
            id: 'cardtag-1',
            cardId: 'new-card-id',
            tagId: 'new-tag-id',
            tag: newTag
          }
        ]
      };
      
      // 카드 조회 모킹
      prismaMock.card.findUnique.mockResolvedValueOnce(cardWithTags);
      
      // API 호출
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      const response = await POST(request);
      
      // 검증
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(cardWithTags);
      
      // 태그 처리 함수가 올바르게 호출되었는지 확인
      expect(prismaMock.cardTag.deleteMany).toHaveBeenCalledWith({
        where: { cardId: createdCard.id }
      });
      
      // 태그 조회 확인
      expect(prismaMock.tag.findUnique).toHaveBeenCalledWith({
        where: { name: '새로운태그' }
      });
      
      // 새 태그 생성 확인
      expect(prismaMock.tag.create).toHaveBeenCalledWith({
        data: { name: '새로운태그' }
      });
      
      // 카드-태그 연결 확인
      expect(prismaMock.cardTag.create).toHaveBeenCalledWith({
        data: {
          cardId: createdCard.id,
          tagId: newTag.id
        }
      });
    });
  });
}); 