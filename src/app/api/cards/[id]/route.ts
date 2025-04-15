/**
 * 파일명: src/app/api/cards/[id]/route.ts
 * 목적: 개별 카드 API 엔드포인트
 * 역할: 카드 조회, 수정, 삭제 기능 제공
 * 작성일: 2024-05-21
 * 수정일: 2024-05-22 : import 순서 수정
 * 수정일: 2024-05-22 : import 순서 재수정
 * 수정일: 2024-05-23 : import 그룹 빈 줄 수정
 * 수정일: 2024-05-23 : import 그룹 사이 빈 줄 추가
 * 수정일: 2024-05-23 : 전체 import 구조 재작성
 */

import { NextRequest, NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

import prisma from '@/lib/prisma';

// 카드 수정 스키마
const updateCardSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').optional(),
  content: z.string().optional(),
  userId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// 개별 카드 조회 API
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    console.log(`카드 상세 조회 요청: ID=${id}`);
    
    // 카드 조회 (태그 정보 포함)
    const card = await prisma.card.findUnique({
      where: { id },
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
    
    if (!card) {
      console.log(`카드 찾을 수 없음: ID=${id}`);
      return NextResponse.json(
        { error: '카드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    console.log(`카드 조회 성공: ID=${id}`);
    return NextResponse.json(card);
  } catch (error) {
    console.error(`카드 조회 오류 (ID=${context.params.id}):`, error);
    return NextResponse.json(
      { error: '카드를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 카드 수정 API
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const body = await request.json();
    
    // 데이터 유효성 검사
    const validation = updateCardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    // 카드 존재 여부 확인
    const existingCard = await prisma.card.findUnique({
      where: { id },
      include: {
        cardTags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    if (!existingCard) {
      return NextResponse.json(
        { error: '카드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 데이터 준비
    const { tags, ...cardData } = validation.data;
    
    // 트랜잭션으로 카드 및 태그 업데이트
    const updatedCard = await prisma.$transaction(async (tx) => {
      const client = tx as PrismaClient;
      
      // 1. 기본 카드 정보 업데이트
      const updated = await client.card.update({
        where: { id },
        data: cardData,
        include: {
          cardTags: {
            include: {
              tag: true
            }
          }
        }
      });
      
      // 2. 태그 처리
      if (tags) {
        // 2.1. 기존 카드-태그 연결 모두 삭제
        await client.cardTag.deleteMany({
          where: { cardId: id }
        });
        
        // 2.2. 새 태그 처리
        for (const tagName of tags) {
          // 태그가 있는지 확인하고 없으면 생성
          let tag = await client.tag.findUnique({
            where: { name: tagName }
          });
          
          if (!tag) {
            tag = await client.tag.create({
              data: { name: tagName }
            });
          }
          
          // 카드와 태그 연결
          await client.cardTag.create({
            data: {
              cardId: id,
              tagId: tag.id
            }
          });
        }
        
        // 2.3. 업데이트된 카드 정보 다시 조회
        return await client.card.findUnique({
          where: { id },
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
      }
      
      return updated;
    });
    
    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('카드 수정 오류:', error);
    return NextResponse.json(
      { error: '카드를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 카드 삭제 API
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    // 카드 존재 여부 확인
    const existingCard = await prisma.card.findUnique({
      where: { id }
    });
    
    if (!existingCard) {
      return NextResponse.json(
        { error: '카드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 카드 삭제
    await prisma.card.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: '카드가 성공적으로 삭제되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('카드 삭제 오류:', error);
    return NextResponse.json(
      { error: '카드를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 