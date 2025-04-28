/**
 * 파일명: src/app/api/edges/route.ts
 * 목적: 엣지 데이터 관리를 위한 API 엔드포인트
 * 역할: 프로젝트 엣지 데이터의 조회/생성/수정/삭제 처리
 * 작성일: 2025-04-21
 * 수정일: 2025-04-21 : Prisma 클라이언트 접근 패턴 수정 (Edge → edge)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth-server';
import createLogger from '@/lib/logger';

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

// POST, DELETE 핸들러는 다음 Task에서 구현 