/**
 * 파일명: src/app/api/db-init/route.ts
 * 목적: 데이터베이스 초기화를 위한 API 엔드포인트 제공
 * 역할: 개발 환경에서 데이터베이스를 초기화하는 API를 처리
 * 작성일: 2023-11-01
 * 수정일: 2024-05-31 : 사용하지 않는 request 매개변수 제거
 * 수정일: 2024-06-26 : 사용하지 않는 NextRequest import 제거
 */
import { NextResponse } from 'next/server';

import { initDatabase } from '@/lib/db-init';

/**
 * DB 초기화 API 엔드포인트
 * 개발 환경에서만 사용 가능
 */
export async function GET() {
  // 개발 환경인지 확인
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: '이 API는 개발 환경에서만 사용 가능합니다.' },
      { status: 403 }
    );
  }

  try {
    await initDatabase();
    
    return NextResponse.json(
      { success: true, message: '데이터베이스 초기화가 완료되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DB 초기화 API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: '데이터베이스 초기화 중 오류가 발생했습니다.', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 