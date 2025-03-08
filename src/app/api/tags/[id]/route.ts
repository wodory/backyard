import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// 태그 수정 스키마
const updateTagSchema = z.object({
  name: z.string().min(1, '태그 이름은 필수입니다.'),
  color: z.string().optional(),
});

// 개별 태그 조회 API
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    // 태그 조회
    const tag = await prisma.tag.findUnique({
      where: { id }
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: '태그를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tag);
  } catch (error) {
    console.error('태그 조회 오류:', error);
    return NextResponse.json(
      { error: '태그를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 태그 수정 API
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const body = await request.json();
    
    // 데이터 유효성 검사
    const validation = updateTagSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    // 태그 존재 여부 확인
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });
    
    if (!existingTag) {
      return NextResponse.json(
        { error: '태그를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 같은 이름의 태그가 있는지 확인 (다른 ID)
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        name: validation.data.name,
        id: { not: id }
      }
    });
    
    if (duplicateTag) {
      return NextResponse.json(
        { error: '이미 같은 이름의 태그가 존재합니다.' },
        { status: 400 }
      );
    }
    
    // 태그 수정
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: validation.data
    });
    
    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('태그 수정 오류:', error);
    return NextResponse.json(
      { error: '태그를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 태그 삭제 API
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    // 태그 존재 여부 확인
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });
    
    if (!existingTag) {
      return NextResponse.json(
        { error: '태그를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 태그가 카드에서 사용 중인지 확인
    const cardTagsCount = await prisma.cardTag.count({
      where: { tagId: id }
    });
    
    // 태그 삭제
    await prisma.tag.delete({
      where: { id }
    });
    
    return NextResponse.json({
      message: '태그가 성공적으로 삭제되었습니다.',
      affectedCards: cardTagsCount
    });
  } catch (error) {
    console.error('태그 삭제 오류:', error);
    return NextResponse.json(
      { error: '태그를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 