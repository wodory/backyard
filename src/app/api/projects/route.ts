/**
 * 파일명: src/app/api/projects/route.ts
 * 목적: 프로젝트 API 엔드포인트
 * 역할: 프로젝트 목록 조회 기능 제공
 * 작성일: 2025-04-21
 */

import { NextRequest, NextResponse } from 'next/server';

// 가상의 기본 프로젝트 데이터
// TODO : 반드시 리펙토링을 통해 실제 프로젝트 ID로 변경해야 함. 
const DEFAULT_PROJECT = {
  id: '5ad74831-d031-4e35-aad8-08054937269e',
  name: '기본 프로젝트',
  ownerId: '47050492-4cde-4a79-a55b-44a8da1a4fc8', // 기본 사용자 ID와 동일하게 설정
  settings: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 프로젝트 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    // 실제 DB 연동 전까지는 가상의 프로젝트 데이터 반환
    const projects = [DEFAULT_PROJECT];
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('프로젝트 조회 오류:', error);
    return NextResponse.json(
      { error: '프로젝트 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 단일 프로젝트 조회 API (id 파라미터 사용)
export async function HEAD(request: NextRequest) {
  try {
    // 요청 URL에서 프로젝트 ID 파라미터 추출
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    
    // ID가 제공되지 않은 경우
    if (!id) {
      return NextResponse.json(
        { error: '프로젝트 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 현재는 기본 프로젝트만 확인
    if (id === DEFAULT_PROJECT.id) {
      return new NextResponse(null, { status: 200 });
    }
    
    // 프로젝트를 찾지 못한 경우
    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error('프로젝트 확인 오류:', error);
    return new NextResponse(null, { status: 500 });
  }
} 