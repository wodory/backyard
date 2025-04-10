/**
 * 파일명: src/app/api/projects/route.ts
 * 목적: 프로젝트 API 엔드포인트 구현
 * 역할: 프로젝트 목록 조회 및 생성 기능 제공
 * 작성일: ${new Date().toISOString().split('T')[0]}
 * 수정일: ${new Date().toISOString().split('T')[0]} : projectId 필드 매핑 수정
 * 수정일: ${new Date().toISOString().split('T')[0]} : Prisma 타입 수정
 * 수정일: ${new Date().toISOString().split('T')[0]} : Prisma 클라이언트 singleton 패턴 적용
 * 수정일: ${new Date().toISOString().split('T')[0]} : 오류 로깅 개선 및 외래 키 오류 처리 추가
 * 수정일: ${new Date().toISOString().split('T')[0]} : Prisma 모델명 오류 수정
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Project, CreateProjectInput } from '@/types/project';

/**
 * GET: 프로젝트 목록 조회
 * @returns 프로젝트 목록
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    
    // 삭제된 프로젝트 포함 여부에 따라 쿼리 조건 변경
    const whereCondition = includeDeleted 
      ? {} 
      : { isDeleted: false };
    
    // 타입 명시로 타입 에러 방지
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
    
    // prisma.project -> prisma.Project로 수정 (대문자로 시작하는 모델명)
    const dbProjects = await prisma.Project.findMany({
      where: whereCondition,
      orderBy: {
        updatedAt: 'desc'
      }
    }) as unknown as PrismaProject[];
    
    // Prisma 모델 -> 프론트엔드 타입으로 변환
    const projects = dbProjects.map(project => ({
      projectId: project.id,
      name: project.name,
      ownerId: project.ownerId,
      ownerNickname: project.ownerNickname,
      settings: project.settings,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      isDeleted: project.isDeleted,
      deletedAt: project.deletedAt ? project.deletedAt.toISOString() : undefined
    }));
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '프로젝트 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST: 새 프로젝트 생성
 * @returns 생성된 프로젝트
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateProjectInput;
    
    // 필수 필드 검증
    if (!body.name || !body.ownerId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다. 이름과 소유자 ID는 필수입니다.' },
        { status: 400 }
      );
    }
    
    // 소유자 ID가 실제로 존재하는지 확인
    try {
      const owner = await prisma.User.findUnique({
        where: { id: body.ownerId },
        select: { id: true }
      });
      
      if (!owner) {
        console.error(`프로젝트 생성 실패: 소유자 ID ${body.ownerId}가 존재하지 않습니다`);
        return NextResponse.json(
          { error: '지정된 소유자가 존재하지 않습니다.' },
          { status: 404 }
        );
      }
    } catch (userError) {
      console.error('소유자 확인 중 오류:', userError);
    }
    
    // 타입 명시로 타입 에러 방지
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
    
    console.log('프로젝트 생성 시도:', {
      name: body.name,
      ownerId: body.ownerId,
      ownerNickname: body.ownerNickname
    });
    
    // prisma.project -> prisma.Project로 수정 (대문자로 시작하는 모델명)
    const dbProject = await prisma.Project.create({
      data: {
        name: body.name,
        ownerId: body.ownerId,
        ownerNickname: body.ownerNickname || undefined,
        settings: body.settings || {},
        isDeleted: false
      }
    }) as unknown as PrismaProject;
    
    console.log('프로젝트 생성 성공:', {
      id: dbProject.id,
      name: dbProject.name,
      ownerId: dbProject.ownerId
    });
    
    // Prisma 모델 -> 프론트엔드 타입으로 변환
    const newProject = {
      projectId: dbProject.id,
      name: dbProject.name,
      ownerId: dbProject.ownerId,
      ownerNickname: dbProject.ownerNickname,
      settings: dbProject.settings,
      createdAt: dbProject.createdAt.toISOString(),
      updatedAt: dbProject.updatedAt.toISOString(),
      isDeleted: dbProject.isDeleted,
      deletedAt: dbProject.deletedAt ? dbProject.deletedAt.toISOString() : undefined
    };
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('프로젝트 생성 실패:', error);
    
    // Prisma 에러 타입 체크 및 상세 오류 반환
    const prismaError = error as any;
    if (prismaError.code === 'P2003') {
      console.error('외래 키 제약 조건 위반:', prismaError.meta);
      return NextResponse.json(
        { error: '해당 소유자가 존재하지 않습니다. 사용자 정보를 먼저 등록해주세요.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '프로젝트 생성에 실패했습니다' },
      { status: 500 }
    );
  }
} 