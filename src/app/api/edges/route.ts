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
 * 수정일: 2025-05-02 : 엣지 생성 에러 처리 세분화 및 구체적인 에러 응답 추가
 * 수정일: 2025-05-02 : Prisma 클라이언트 모델 이름을 스키마에 맞게 수정
 * 수정일: 2025-05-02 : 타입 단언을 사용하여 Prisma 클라이언트 타입 오류 해결
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth-server';
import createLogger from '@/lib/logger';
import { EdgeInput } from '@/types/edge';
import { Prisma } from '@prisma/client';

const logger = createLogger('api:edges');

// 타입 정의 - Prisma 스키마 기반으로 필요한 타입 정의
interface CardWithProject {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  [key: string]: any; // 기타 필드
}

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
    // @ts-ignore - Prisma 클라이언트 타입 문제 해결
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
    logger.warn('엣지 생성 시도 중 인증 실패');
    return NextResponse.json({ 
      error: 'Unauthorized', 
      code: 'AUTH_REQUIRED',
      message: '인증이 필요합니다. 로그인 후 다시 시도해주세요.' 
    }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // 요청 본문 파싱
    const body = await request.json();
    const isArray = Array.isArray(body);
    const edgeInputs: EdgeInput[] = isArray ? body : [body];

    // 입력값 기본 검증
    if (edgeInputs.length === 0) {
      logger.warn('빈 엣지 데이터로 생성 시도');
      return NextResponse.json({ 
        error: 'Bad Request', 
        code: 'EMPTY_INPUT',
        message: '엣지 데이터가 제공되지 않았습니다.' 
      }, { status: 400 });
    }

    // 각 필드 검증 및 구체적인 에러 메시지
    const missingFields: { index: number; fields: string[] }[] = [];
    
    edgeInputs.forEach((input, index) => {
      const missing: string[] = [];
      if (!input.source) missing.push('source');
      if (!input.target) missing.push('target');
      if (!input.projectId) missing.push('projectId');
      
      if (missing.length > 0) {
        missingFields.push({ index, fields: missing });
      }
    });

    if (missingFields.length > 0) {
      logger.warn('필수 필드가 누락된 엣지 생성 시도', { missingFields });
      return NextResponse.json({
        error: 'Bad Request',
        code: 'MISSING_REQUIRED_FIELDS',
        message: '필수 필드가 누락되었습니다.',
        details: missingFields
      }, { status: 400 });
    }

    // 프로젝트 존재 여부 확인
    for (const input of edgeInputs) {
      // @ts-ignore - Prisma 클라이언트 타입 문제 해결
      const project = await prisma.project.findUnique({
        where: { id: input.projectId }
      });
      
      if (!project) {
        logger.warn(`존재하지 않는 프로젝트로 엣지 생성 시도: ${input.projectId}`);
        return NextResponse.json({
          error: 'Bad Request',
          code: 'PROJECT_NOT_FOUND',
          message: '지정된 프로젝트가 존재하지 않습니다.',
          projectId: input.projectId
        }, { status: 404 });
      }
      
      // 프로젝트 멤버십 확인 (사용자가 해당 프로젝트에 속해 있는지)
      // @ts-ignore - Prisma 클라이언트 타입 문제 해결
      const membership = await prisma.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId
        }
      });
      
      if (!membership) {
        logger.warn(`사용자(${userId})가 접근 권한이 없는 프로젝트(${input.projectId})에 엣지 생성 시도`);
        return NextResponse.json({
          error: 'Forbidden',
          code: 'PROJECT_ACCESS_DENIED',
          message: '해당 프로젝트에 대한 접근 권한이 없습니다.',
          projectId: input.projectId
        }, { status: 403 });
      }
    }

    // 카드 존재 여부 확인
    for (const input of edgeInputs) {
      // source 카드 확인
      // @ts-ignore - Prisma 클라이언트 타입 문제 해결
      const sourceCard = await prisma.card.findUnique({
        where: { id: input.source }
      }) as CardWithProject | null;
      
      if (!sourceCard) {
        logger.warn(`존재하지 않는 source 카드로 엣지 생성 시도: ${input.source}`);
        return NextResponse.json({
          error: 'Bad Request',
          code: 'SOURCE_CARD_NOT_FOUND',
          message: '출발점 카드가 존재하지 않습니다.',
          source: input.source
        }, { status: 404 });
      }
      
      // 카드가 프로젝트에 속해 있는지 확인
      if (sourceCard.projectId !== input.projectId) {
        logger.warn(`다른 프로젝트의 카드로 엣지 생성 시도: source=${input.source}, projectId=${input.projectId}`);
        return NextResponse.json({
          error: 'Bad Request',
          code: 'SOURCE_CARD_PROJECT_MISMATCH',
          message: '출발점 카드가 해당 프로젝트에 속하지 않습니다.',
          source: input.source,
          projectId: input.projectId
        }, { status: 400 });
      }
      
      // target 카드 확인
      // @ts-ignore - Prisma 클라이언트 타입 문제 해결
      const targetCard = await prisma.card.findUnique({
        where: { id: input.target }
      }) as CardWithProject | null;
      
      if (!targetCard) {
        logger.warn(`존재하지 않는 target 카드로 엣지 생성 시도: ${input.target}`);
        return NextResponse.json({
          error: 'Bad Request',
          code: 'TARGET_CARD_NOT_FOUND',
          message: '도착점 카드가 존재하지 않습니다.',
          target: input.target
        }, { status: 404 });
      }
      
      // 카드가 프로젝트에 속해 있는지 확인
      if (targetCard.projectId !== input.projectId) {
        logger.warn(`다른 프로젝트의 카드로 엣지 생성 시도: target=${input.target}, projectId=${input.projectId}`);
        return NextResponse.json({
          error: 'Bad Request',
          code: 'TARGET_CARD_PROJECT_MISMATCH',
          message: '도착점 카드가 해당 프로젝트에 속하지 않습니다.',
          target: input.target,
          projectId: input.projectId
        }, { status: 400 });
      }
      
      // 중복 엣지 확인
      // @ts-ignore - Prisma 클라이언트 타입 문제 해결
      const existingEdge = await prisma.edge.findFirst({
        where: {
          projectId: input.projectId,
          source: input.source,
          target: input.target
        }
      });
      
      if (existingEdge) {
        logger.warn('중복 엣지 생성 시도', { 
          projectId: input.projectId, 
          source: input.source, 
          target: input.target 
        });
        return NextResponse.json({
          error: 'Conflict',
          code: 'EDGE_ALREADY_EXISTS',
          message: '동일한 연결이 이미 존재합니다.',
          existingEdge: {
            id: existingEdge.id,
            source: existingEdge.source,
            target: existingEdge.target,
            projectId: existingEdge.projectId
          }
        }, { status: 409 });
      }
    }

    try {
      // 여러 엣지 한번에 생성 (트랜잭션 사용)
      const createdEdges = await prisma.$transaction(
        edgeInputs.map(input => 
          // @ts-ignore - Prisma 클라이언트 타입 문제 해결
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
    } catch (dbError: any) {
      // Prisma 데이터베이스 오류 세분화
      if (dbError.code === 'P2002') {
        // 고유 제약 조건 위반 (unique constraint)
        logger.warn('고유 제약 조건 위반으로 엣지 생성 실패', { error: dbError });
        return NextResponse.json({
          error: 'Conflict',
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: '동일한 연결이 이미 존재합니다.',
          details: {
            target: dbError.meta?.target || '알 수 없음'
          }
        }, { status: 409 });
      } else if (dbError.code === 'P2003') {
        // 외래 키 제약 조건 위반 (foreign key constraint)
        logger.warn('외래 키 제약 조건 위반으로 엣지 생성 실패', { error: dbError });
        return NextResponse.json({
          error: 'Bad Request',
          code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
          message: '참조하는 카드 또는 프로젝트가 존재하지 않습니다.',
          details: {
            field: dbError.meta?.field_name || '알 수 없음'
          }
        }, { status: 400 });
      } else if (dbError.code === 'P2025') {
        // 레코드를 찾을 수 없음
        logger.warn('필요한 레코드를 찾을 수 없어 엣지 생성 실패', { error: dbError });
        return NextResponse.json({
          error: 'Not Found',
          code: 'RECORD_NOT_FOUND',
          message: '참조하는 데이터를 찾을 수 없습니다.',
          details: dbError.meta
        }, { status: 404 });
      }
      
      // 기타 Prisma 오류
      logger.error('Prisma 오류로 엣지 생성 실패', { error: dbError });
      return NextResponse.json({
        error: 'Database Error',
        code: 'DATABASE_ERROR',
        message: '데이터베이스 작업 중 오류가 발생했습니다.',
        details: {
          code: dbError.code,
          name: dbError.name,
          message: dbError.message
        }
      }, { status: 500 });
    }
  } catch (error: any) {
    // JSON 파싱 오류
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      logger.warn('JSON 파싱 오류로 엣지 생성 실패', { error });
      return NextResponse.json({
        error: 'Bad Request',
        code: 'INVALID_JSON',
        message: '유효하지 않은 JSON 형식입니다.',
        details: error.message
      }, { status: 400 });
    }
    
    // API 요청 본문 파싱 오류
    if (error.name === 'TypeError' && error.message.includes('body')) {
      logger.warn('API 요청 본문 파싱 오류로 엣지 생성 실패', { error });
      return NextResponse.json({
        error: 'Bad Request', 
        code: 'BODY_PARSING_ERROR',
        message: 'API 요청 본문을 파싱할 수 없습니다.',
        details: error.message
      }, { status: 400 });
    }
    
    // 기타 모든 예상치 못한 오류
    logger.error('예상치 못한 오류로 엣지 생성 실패', { 
      error: error.message,
      stack: error.stack,
      name: error.name 
    });
    return NextResponse.json({
      error: 'Internal Server Error',
      code: 'UNKNOWN_ERROR',
      message: '서버 내부 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name
      } : undefined
    }, { status: 500 });
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