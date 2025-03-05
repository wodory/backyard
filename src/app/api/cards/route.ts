import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// 카드 생성 스키마
const createCardSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.'),
  content: z.string().optional(),
  userId: z.string().uuid('유효한 사용자 ID가 필요합니다.'),
  tags: z.array(z.string()).optional()
});

// 태그 처리 함수
async function processTagsForCard(cardId: string, tagNames: string[] = []) {
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
}

// 카드 생성 API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
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
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '존재하지 않는 사용자입니다.' },
        { status: 404 }
      );
    }
    
    // 카드 생성
    const card = await prisma.card.create({
      data: {
        title,
        content,
        userId
      }
    });
    
    // 태그 처리
    if (tags && tags.length > 0) {
      await processTagsForCard(card.id, tags);
    }
    
    // 생성된 카드와 태그 조회
    const cardWithTags = await prisma.card.findUnique({
      where: { id: card.id },
      include: {
        cardTags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    return NextResponse.json(cardWithTags, { status: 201 });
  } catch (error) {
    console.error('카드 생성 오류:', error);
    return NextResponse.json(
      { error: '카드를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 모든 카드 조회 API
export async function GET(request: Request) {
  try {
    // URL 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');
    
    // 검색 조건 구성
    let where: any = {};
    
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
    
    // 카드 조회
    const cards = await prisma.card.findMany({
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
    });
    
    return NextResponse.json(cards);
  } catch (error) {
    console.error('카드 조회 오류:', error);
    return NextResponse.json(
      { error: '카드를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 