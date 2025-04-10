/**
 * 파일명: src/app/api/projects/[projectId]/restore/route.ts
 * 목적: 프로젝트 복원 API 엔드포인트 구현
 * 역할: 삭제된 프로젝트 복원 기능 제공
 * 작성일: ${new Date().toISOString().split('T')[0]}
 * 수정일: ${new Date().toISOString().split('T')[0]} : projectId 필드 매핑 수정
 * 수정일: ${new Date().toISOString().split('T')[0]} : Prisma 타입 수정
 * 수정일: ${new Date().toISOString().split('T')[0]} : Prisma 클라이언트 singleton 패턴 적용
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Prisma Project 타입 정의
type PrismaProject = {
  id: string;
  name: string;
  ownerId: string;
  ownerNickname: string | null;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt: Date | null;
};

/**
 * POST: 삭제된 프로젝트 복원
 * @returns 복원된 프로젝트 정보
 */
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    
    if (!projectId) {
      return NextResponse.json(
        { error: '프로젝트 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 프로젝트 존재 여부 확인
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    }) as unknown as PrismaProject | null;
    
    if (!existingProject) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 프로젝트가 삭제된 상태인지 확인
    if (!existingProject.isDeleted) {
      return NextResponse.json(
        { error: '이미 활성 상태인 프로젝트입니다' },
        { status: 400 }
      );
    }
    
    // 프로젝트 복원 처리
    const dbRestoredProject = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date()
      }
    }) as unknown as PrismaProject;
    
    // Prisma 모델 -> 프론트엔드 타입으로 변환
    const restoredProject = {
      projectId: dbRestoredProject.id,
      name: dbRestoredProject.name,
      ownerId: dbRestoredProject.ownerId,
      ownerNickname: dbRestoredProject.ownerNickname,
      settings: dbRestoredProject.settings,
      createdAt: dbRestoredProject.createdAt.toISOString(),
      updatedAt: dbRestoredProject.updatedAt.toISOString(),
      isDeleted: dbRestoredProject.isDeleted,
      deletedAt: dbRestoredProject.deletedAt ? dbRestoredProject.deletedAt.toISOString() : undefined
    };
    
    return NextResponse.json(restoredProject);
  } catch (error) {
    console.error('프로젝트 복원 실패:', error);
    return NextResponse.json(
      { error: '프로젝트 복원에 실패했습니다' },
      { status: 500 }
    );
  }
} 