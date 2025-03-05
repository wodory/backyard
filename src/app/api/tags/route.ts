import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 태그 스키마 정의
const tagSchema = z.object({
  name: z.string().min(1, '태그 이름은 필수입니다.').max(50, '태그 이름은 50자 이하여야 합니다.')
});

// 태그 목록 조회
export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: '태그 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 태그 생성
export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 추출
    let body;
    try {
      body = await request.json();
    } catch (error) {
      // request.json()이 실패하면 request.text()를 사용
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        // JSON 파싱에 실패하면 빈 객체 반환
        return NextResponse.json(
          { error: '잘못된 JSON 형식입니다.' },
          { status: 400 }
        );
      }
    }
    
    // 태그 데이터 유효성 검사
    const validationResult = tagSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // 태그 중복 확인
    const existingTag = await prisma.tag.findUnique({
      where: { name: validationResult.data.name }
    });
    
    if (existingTag) {
      return NextResponse.json(
        { error: '이미 존재하는 태그입니다.' },
        { status: 400 }
      );
    }
    
    // 태그 생성
    const tag = await prisma.tag.create({
      data: {
        name: validationResult.data.name
      }
    });
    
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: '태그 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 