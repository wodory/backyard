/**
 * 파일명: src/app/api/projects/[projectId]/route.ts
 * 목적: 단일 프로젝트 API 엔드포인트 구현
 * 역할: 프로젝트 조회, 수정, 삭제 기능 제공
 * 작성일: ${new Date().toISOString().split('T')[0]}
 * 수정일: ${new Date().toISOString().split('T')[0]} : projectId 필드 매핑 수정
 * 수정일: ${new Date().toISOString().split('T')[0]} : Prisma 타입 수정
 * 수정일: ${new Date().toISOString().split('T')[0]} : Prisma 클라이언트 singleton 패턴 적용
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UpdateProjectInput } from '@/types/project';

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
 * GET: 프로젝트 상세 조회
 * @returns 프로젝트 정보
 */
export async function GET(
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
    
    // 프로젝트 조회
    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    }) as unknown as PrismaProject | null;
    
    if (!project) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 타입 변환: Prisma 모델 -> 프론트엔드 타입
    const apiResponse = {
      projectId: project.id,
      name: project.name,
      ownerId: project.ownerId,
      ownerNickname: project.ownerNickname,
      settings: project.settings,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      isDeleted: project.isDeleted,
      deletedAt: project.deletedAt ? project.deletedAt.toISOString() : undefined
    };
    
    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('프로젝트 조회 실패:', error);
    return NextResponse.json(
      { error: '프로젝트 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT: 프로젝트 정보 수정
 * @returns 수정된 프로젝트 정보
 */
export async function PUT(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const body = await request.json() as UpdateProjectInput;
    
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
    
    // 프로젝트 업데이트
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        ownerNickname: body.ownerNickname !== undefined ? body.ownerNickname : undefined,
        settings: body.settings !== undefined ? body.settings : undefined,
        isDeleted: body.isDeleted !== undefined ? body.isDeleted : undefined,
        deletedAt: body.deletedAt !== undefined ? new Date(body.deletedAt) : undefined,
        updatedAt: new Date()
      }
    }) as unknown as PrismaProject;
    
    // 타입 변환: Prisma 모델 -> 프론트엔드 타입
    const apiResponse = {
      projectId: updatedProject.id,
      name: updatedProject.name,
      ownerId: updatedProject.ownerId,
      ownerNickname: updatedProject.ownerNickname,
      settings: updatedProject.settings,
      createdAt: updatedProject.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString(),
      isDeleted: updatedProject.isDeleted,
      deletedAt: updatedProject.deletedAt ? updatedProject.deletedAt.toISOString() : undefined
    };
    
    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('프로젝트 수정 실패:', error);
    return NextResponse.json(
      { error: '프로젝트 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 프로젝트 삭제 (소프트 삭제)
 * @returns 204 No Content
 */
export async function DELETE(
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
    
    // 소프트 삭제 (휴지통 기능)
    await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('프로젝트 삭제 실패:', error);
    return NextResponse.json(
      { error: '프로젝트 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
} 