import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * 첫 번째 사용자를 가져오는 API 엔드포인트
 */
export async function GET(request: NextRequest) {
  try {
    // 첫 번째 사용자를 가져옴 (가장 먼저 생성된 사용자)
    const firstUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    if (!firstUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(firstUser);
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    
    return NextResponse.json(
      { error: '사용자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 