/**
 * 파일명: src/app/api/users/[id]/route.ts
 * 목적: 특정 사용자 조회 API
 * 역할: ID로 사용자를 조회하는 API 엔드포인트
 * 작성일: ${new Date().toISOString().split('T')[0]}
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET: ID로 사용자 조회
 * @param request - 요청 객체
 * @param params - URL 파라미터 (userId)
 * @returns 사용자 정보 또는 오류
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('사용자 조회 API 오류:', error);
    return NextResponse.json(
      { error: '사용자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 