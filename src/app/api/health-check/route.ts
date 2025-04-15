/**
 * 파일명: src/app/api/health-check/route.ts
 * 목적: 데이터베이스 연결 상태를 확인하는 헬스 체크 API
 * 역할: 애플리케이션의 서버와 데이터베이스 연결 상태를 모니터링
 * 작성일: 2023-10-27
 * 수정일: 2024-05-17 : 사용하지 않는 request 매개변수 제거
 * 수정일: 2024-05-17 : 사용하지 않는 NextRequest 가져오기 제거
 */
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

/**
 * DB 연결 상태를 확인하는 헬스 체크 API
 * HEAD 또는 GET 요청 모두 사용 가능
 */
export async function HEAD() {
  try {
    // Prisma로 간단한 쿼리 실행하여 DB 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    
    // 응답 본문 없이 200 OK만 반환
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('DB 연결 실패:', error);
    return new NextResponse(null, { status: 503 }); // Service Unavailable
  }
}

export async function GET() {
  try {
    // Prisma로 간단한 쿼리 실행하여 DB 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ status: 'ok', message: 'Database connection successful' });
  } catch (error) {
    console.error('DB 연결 실패:', error);
    
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed' },
      { status: 503 } // Service Unavailable
    );
  }
} 