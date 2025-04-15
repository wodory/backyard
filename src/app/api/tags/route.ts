/**
 * 파일명: src/app/api/tags/route.ts
 * 목적: 태그 관련 API 엔드포인트 제공
 * 역할: 태그 목록 조회, 태그 사용 횟수 집계, 태그 생성 등 기능 제공
 * 작성일: 2025-03-05
 * 수정일: 2025-03-27
 */

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

/**
 * GET: 태그 목록을 반환하는 API
 * @param request - 요청 객체
 * @returns 태그 목록 및 사용 횟수
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeCount = searchParams.get('includeCount') === 'true';
    const searchQuery = searchParams.get('q') || '';
    
    if (includeCount) {
      // 사용 횟수와 함께 태그 목록 반환
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            contains: searchQuery,
          },
        },
        include: {
          _count: {
            select: { cardTags: true },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
      
      // 응답 형식 변환
      const formattedTags = tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        count: tag._count.cardTags,
        createdAt: tag.createdAt,
      }));
      
      return NextResponse.json(formattedTags);
    } else {
      // 기본 태그 목록만 반환
      const tags = await prisma.tag.findMany({
        where: searchQuery ? {
          name: {
            contains: searchQuery,
          },
        } : undefined,
        orderBy: {
          name: 'asc',
        },
      });
      
      return NextResponse.json(tags);
    }
  } catch (error) {
    console.error('태그 조회 오류:', error);
    return NextResponse.json(
      { error: '태그 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST: 새 태그를 생성하는 API
 * @param request - 요청 객체
 * @returns 생성된 태그 정보
 */
export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: '유효한 태그 이름이 필요합니다' },
        { status: 400 }
      );
    }
    
    // 이미 존재하는 태그인지 확인
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: name.trim(),
      },
    });
    
    if (existingTag) {
      return NextResponse.json(
        { error: '이미 존재하는 태그입니다', tag: existingTag },
        { status: 409 }
      );
    }
    
    // 새 태그 생성
    const newTag = await prisma.tag.create({
      data: {
        name: name.trim(),
      },
    });
    
    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('태그 생성 오류:', error);
    return NextResponse.json(
      { error: '태그 생성에 실패했습니다' },
      { status: 500 }
    );
  }
} 