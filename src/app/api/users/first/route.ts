/**
 * 파일명: src/app/api/users/first/route.ts
 * 목적: 첫 번째 사용자를 가져오는 API 엔드포인트
 * 역할: 데이터베이스의 첫 번째 사용자 정보 제공
 * 작성일: ${new Date().toISOString().split('T')[0]}
 * 수정일: ${new Date().toISOString().split('T')[0]} : 오류 처리 개선
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET: 첫 번째 사용자 정보 조회
 * @returns 첫 번째 사용자 정보 또는 오류
 */
export async function GET() {
  try {
    console.log('첫 번째 사용자 조회 API 호출됨');
    
    // 첫 번째 사용자를 가져옴 (가장 먼저 생성된 사용자)
    const firstUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log('첫 번째 사용자 조회 결과:', firstUser ? '사용자 있음' : '사용자 없음');
    
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