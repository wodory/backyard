import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 태그 삭제 API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 태그 존재 여부 확인
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cardTags: true }
        }
      }
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: '존재하지 않는 태그입니다.' },
        { status: 404 }
      );
    }
    
    // 태그가 연결된 카드-태그 관계 삭제
    await prisma.cardTag.deleteMany({
      where: { tagId: id }
    });
    
    // 태그 삭제
    await prisma.tag.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: '태그가 성공적으로 삭제되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('태그 삭제 오류:', error);
    return NextResponse.json(
      { error: '태그를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 