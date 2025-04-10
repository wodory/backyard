/**
 * 파일명: src/app/api/users/route.ts
 * 목적: 사용자 생성 및 조회 API
 * 역할: 사용자 생성 및 목록 조회 API 엔드포인트
 * 작성일: ${new Date().toISOString().split('T')[0]}
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET: 사용자 목록 조회
 * @returns 사용자 목록
 */
export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '사용자 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST: 새 사용자 생성
 * @returns 생성된 사용자
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name } = body;
    
    // 필수 필드 검증
    if (!id || !email) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다. ID와 이메일은 필수입니다.' },
        { status: 400 }
      );
    }
    
    // 이미 존재하는 사용자인지 확인
    const existingUser = await prisma.user.findUnique({
      where: { 
        id 
      }
    });
    
    if (existingUser) {
      return NextResponse.json(existingUser);
    }
    
    // 새 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        id,
        email,
        name: name || email.split('@')[0]
      }
    });
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('사용자 생성 실패:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: '사용자 생성에 실패했습니다' },
      { status: 500 }
    );
  }
} 