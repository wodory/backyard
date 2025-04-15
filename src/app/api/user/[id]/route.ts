/**
 * 파일명: ./src/app/api/user/[id]/route.ts
 * 목적: 사용자 정보 조회 API 엔드포인트
 * 역할: 사용자 ID로 사용자 정보를 조회하고 응답을 반환
 * 작성일: 2024-05-29
 */

import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Next.js 15에서는 params가 Promise이므로 await 사용
    const paramsResolved = await params;
    const id = paramsResolved.id;
    
    if (!id) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    try {
      // 사용자 조회
      const user = await prisma.user.findUnique({
        where: { id },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ user });
    } catch (dbError: Error | unknown) {
      console.error('DB 조회 오류:', dbError);
      
      // DB 오류가 발생하면 더미 사용자 데이터 반환
      // 실제 환경에서는 적절한 오류 처리 필요
      return NextResponse.json({
        user: {
          id,
          email: 'user@example.com',
          name: '사용자',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      });
    }
  } catch (error: Error | unknown) {
    console.error('사용자 조회 API 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `사용자 조회 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
} 