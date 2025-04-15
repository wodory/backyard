/**
 * 파일명: src/app/api/cards/route.ts
 * 목적: 카드 API 엔드포인트
 * 역할: 카드 생성 및 조회 기능 제공
 * 작성일: 2024-05-22
 */

import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import prisma from '@/lib/prisma';

// 카드 생성 스키마
const createCardSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.'),
  content: z.string().optional(),
  userId: z.string().uuid('유효한 사용자 ID가 필요합니다.'),
  tags: z.array(z.string()).optional()
});

// 태그 처리 함수
async function processTagsForCard(cardId: string, tagNames: string[] = []) {
  try {
    // 중복 태그 제거 및 공백 제거
    const uniqueTags = [...new Set(tagNames.map(tag => tag.trim()))].filter(tag => tag.length > 0);
    
    // 카드와 연결된 기존 태그 삭제
    await prisma.cardTag.deleteMany({
      where: { cardId }
    });
    
    // 각 태그에 대해 처리
    for (const tagName of uniqueTags) {
      // 태그가 존재하는지 확인하고, 없으면 생성
      let tag = await prisma.tag.findUnique({
        where: { name: tagName }
      });
      
      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName }
        });
      }
      
      // 카드와 태그 연결
      await prisma.cardTag.create({
        data: {
          cardId,
          tagId: tag.id
        }
      });
    }
  } catch (error) {
    console.error('태그 처리 중 오류:', error);
    // 태그 처리 실패해도 흐름 계속 (태그는 필수가 아님)
  }
}

// 데이터베이스 연결 안전하게 수행하는 래퍼 함수
async function safeDbOperation<T>(operation: () => Promise<T>, errorMessage: string): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await operation();
    return { data: result, error: null };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return { data: null, error: errorMessage };
  }
}

// 카드 생성 API
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱 안전하게 처리
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('요청 본문 파싱 오류:', jsonError);
      return NextResponse.json(
        { error: '유효하지 않은 요청 형식입니다.' },
        { status: 400 }
      );
    }
    
    // 데이터 유효성 검사
    const validation = createCardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { title, content, userId, tags } = validation.data;
    
    // 사용자 존재 여부 확인
    const userResult = await safeDbOperation(
      () => prisma.user.findUnique({
        where: { id: userId }
      }),
      '사용자 정보를 확인하는 중 오류가 발생했습니다.'
    );
    
    if (userResult.error) {
      return NextResponse.json(
        { error: userResult.error },
        { status: 500 }
      );
    }
    
    if (!userResult.data) {
      return NextResponse.json(
        { error: '존재하지 않는 사용자입니다.' },
        { status: 404 }
      );
    }
    
    // 카드 생성
    const cardResult = await safeDbOperation(
      () => prisma.card.create({
        data: {
          title,
          content,
          userId
        }
      }),
      '카드를 생성하는 중 오류가 발생했습니다.'
    );
    
    if (cardResult.error || !cardResult.data) {
      return NextResponse.json(
        { error: cardResult.error || '카드 생성에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    // 태그 처리
    if (tags && tags.length > 0) {
      await processTagsForCard(cardResult.data.id, tags);
    }
    
    // 생성된 카드와 태그 조회
    const cardWithTagsResult = await safeDbOperation(
      () => prisma.card.findUnique({
        where: { id: cardResult.data!.id },
        include: {
          cardTags: {
            include: {
              tag: true
            }
          }
        }
      }),
      '카드 정보를 조회하는 중 오류가 발생했습니다.'
    );
    
    if (cardWithTagsResult.error) {
      // 태그 정보 조회 실패해도 기본 카드 정보는 반환
      return NextResponse.json(cardResult.data, { status: 201 });
    }
    
    return NextResponse.json(cardWithTagsResult.data, { status: 201 });
  } catch (error) {
    console.error('카드 생성 오류:', error);
    return NextResponse.json(
      { error: '카드를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 모든 카드 조회 API
export async function GET(request: NextRequest) {
  try {
    // 환경 정보 로깅
    console.log('API 호출 환경:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 10) + '...' // 보안을 위해 URL 전체를 로깅하지 않음
    });
    
    // Prisma 클라이언트가 초기화되었는지 확인
    if (!prisma) {
      console.error('Prisma 클라이언트가 초기화되지 않았습니다.');
      return NextResponse.json(
        { error: '데이터베이스 연결을 초기화하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // Prisma 클라이언트 상태 확인
    try {
      // 빠른 데이터베이스 연결 테스트
      await prisma.$queryRaw`SELECT 1`;
      console.log('데이터베이스 연결 테스트 성공');
    } catch (dbError) {
      console.error('데이터베이스 연결 테스트 실패:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 연결 실패. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }
    
    // URL 쿼리 파라미터 파싱
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');
    const q = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';
    
    console.log('카드 조회 요청 - 파라미터:', { userId, q, tag });
    
    // 검색 조건 구성
    const where: Record<string, unknown> = {};
    
    // 사용자 ID 필터
    if (userId) {
      where.userId = userId;
    }
    
    // 제목/내용 검색
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    // 태그 검색
    if (tag) {
      where.cardTags = {
        some: {
          tag: {
            name: tag
          }
        }
      };
    }
    
    console.log('카드 조회 쿼리 조건:', JSON.stringify(where));
    
    // 안전한 데이터베이스 조회
    const cardsResult = await safeDbOperation(
      () => prisma.card.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
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
      }),
      '카드를 조회하는 중 오류가 발생했습니다.'
    );
    
    if (cardsResult.error) {
      return NextResponse.json(
        { error: cardsResult.error },
        { status: 500 }
      );
    }
    
    // 결과가 null이 아닌지 확인
    const cards = cardsResult.data || [];
    console.log(`카드 조회 결과: ${cards.length}개 카드 찾음`);
    
    return NextResponse.json(cards);
  } catch (error) {
    console.error('카드 조회 API 오류:', error);
    return NextResponse.json(
      { error: '카드 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 