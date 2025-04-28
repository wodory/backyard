/**
 * 파일명: src/app/api/edges/route.ts
 * 목적: 엣지 데이터 관리를 위한 API 엔드포인트
 * 역할: 프로젝트 엣지 데이터의 조회/생성/수정/삭제 처리
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : Prisma 클라이언트 접근 패턴 수정 (edge → Edge)
 * 수정일: 2025-04-21 : POST 및 DELETE 핸들러 구현
 * 수정일: 2025-04-21 : Prisma 클라이언트 접근 패턴 수정 (edges → edge)
 * 수정일: 2025-04-21 : Prisma 클라이언트 접근 패턴 수정 (edge → Edge)
 * 수정일: 2025-04-21 : Prisma 클라이언트 접근 패턴을 올바르게 수정 (대소문자 구분)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth-server';
import createLogger from '@/lib/logger';
import { EdgeInput } from '@/types/edge';

const logger = createLogger('api:edges');

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = request.nextUrl;
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  try {
    logger.debug(`Fetching edges for projectId: ${projectId}`);
    const edges = await prisma.edge.findMany({
      where: { 
        userId, 
        projectId 
      },
    });
    
    logger.debug(`Found ${edges.length} edges for projectId: ${projectId}`);
    return NextResponse.json(edges);
  } catch (error) {
    logger.error(`Error fetching edges for projectId ${projectId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch edges' }, { status: 500 });
  }
}

/**
 * POST 핸들러: 새 엣지 생성
 * - 단일 엣지 또는 여러 엣지(배열)를 동시에 생성 가능
 * - body: EdgeInput | EdgeInput[]
 */
export async function POST(request: NextRequest) {
  // 사용자 인증 확인
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // 요청 본문 파싱
    const body = await request.json();
    const isArray = Array.isArray(body);
    const edgeInputs: EdgeInput[] = isArray ? body : [body];

    // 입력값 기본 검증
    if (edgeInputs.length === 0) {
      return NextResponse.json({ error: 'No edge data provided' }, { status: 400 });
    }

    for (const input of edgeInputs) {
      if (!input.source || !input.target || !input.projectId) {
        return NextResponse.json({
          error: 'Missing required fields: source, target, and projectId are required',
        }, { status: 400 });
      }
    }

    // 여러 엣지 한번에 생성 (트랜잭션 사용)
    const createdEdges = await prisma.$transaction(
      edgeInputs.map(input => 
        prisma.edge.create({
          data: {
            ...input,
            userId, // 현재 인증된 사용자 ID 추가
          }
        })
      )
    );

    logger.debug(`Created ${createdEdges.length} new edges`);
    return NextResponse.json(createdEdges, { status: 201 });
  } catch (error) {
    logger.error('Error creating edges:', error);
    return NextResponse.json({ error: 'Failed to create edges' }, { status: 500 });
  }
}

/**
 * DELETE 핸들러: 엣지 삭제
 * - Query 파라미터로 단일 ID 또는 콤마로 구분된 여러 ID를 받아 삭제
 * - ?ids=id1,id2,id3
 */
export async function DELETE(request: NextRequest) {
  // 사용자 인증 확인
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { searchParams } = request.nextUrl;
    const idsParam = searchParams.get('ids');

    // IDs 파라미터 없으면 에러
    if (!idsParam) {
      return NextResponse.json({ error: 'ids parameter is required' }, { status: 400 });
    }

    // 콤마로 구분된 IDs 파싱
    const ids = idsParam.split(',').map(id => id.trim()).filter(id => id);
    
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No valid ids provided' }, { status: 400 });
    }

    // 해당 사용자의 엣지만 삭제 (보안)
    const result = await prisma.edge.deleteMany({
      where: {
        id: { in: ids },
        userId, // 현재 인증된 사용자의 엣지만 삭제
      },
    });

    logger.debug(`Deleted ${result.count} edges with ids: ${ids.join(', ')}`);
    
    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    logger.error('Error deleting edges:', error);
    return NextResponse.json({ error: 'Failed to delete edges' }, { status: 500 });
  }
} 