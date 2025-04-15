/**
 * 파일명: src/app/api/users/first/route.ts
 * 목적: 첫 번째 사용자 정보를 반환하는 API
 * 역할: 시스템에 등록된 가장 오래된(첫 번째) 사용자 정보 제공
 * 작성일: 2024-05-28
 */

import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

/**
 * 첫 번째 사용자를 가져오는 API 엔드포인트
 */
export async function GET() {
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