import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// 카드 수정 스키마
const updateCardSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').optional(),
  content: z.string().optional(),
});

// 개별 카드 조회 API
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // 카드 조회
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!card) {
      return NextResponse.json(
        { error: '카드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(card);
  } catch (error) {
    console.error('카드 조회 오류:', error);
    return NextResponse.json(
      { error: '카드를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 카드 수정 API
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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
      where: { id }
    });
    
    if (!existingCard) {
      return NextResponse.json(
        { error: '카드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 카드 수정
    const updatedCard = await prisma.card.update({
      where: { id },
      data: validation.data
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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