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
 * 수정일: 2025-05-02 : 디버그 로그 추가하여 요청 추적 용이하게 개선
 * 수정일: 2025-05-02 : 테스트용 POST 핸들러 추가 후 원래 기능으로 복원
 * 수정일: 2025-05-02 : 간단한 브라우저 테스트용 POST 핸들러로 교체
 * 수정일: 2025-04-21 : 테스트 핸들러에서 원래 엣지 생성 로직으로 복원 및 디버깅 로그 개선
 * 수정일: 2025-04-21 : source/target 필드와 sourceCardNodeId/targetCardNodeId 필드 간 매핑 로직 추가
 * 수정일: 2025-05-21 : 인증 디버깅을 위한 상세 로그 추가
 * 수정일: 2025-05-21 : 카드노드 미존재 시 상태 코드를 404에서 400으로 변경하고 에러 코드 명확화
 * 수정일: 2025-04-21 : source/target 조회 시 card 테이블 대신 cardNode 테이블 사용 및 검증 로직 개선
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth-server';
import createLogger from '@/lib/logger';
import { EdgeInput } from '@/types/edge';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers'; // 헤더 임포트 추가

const logger = createLogger('api:edges');

// 타입 정의 - Prisma 스키마 기반으로 필요한 타입 정의
interface CardWithProject {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  [key: string]: any; // 기타 필드
}

// 클라이언트 요청 형식 (source/target 필드 사용)
interface EdgeRequest {
  source?: string;
  target?: string;
  sourceCardNodeId?: string;
  targetCardNodeId?: string;
  projectId: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: Record<string, any>;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  logger.debug('GET 요청 수신', { url: request.url });
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

export async function POST(request: NextRequest) {
  console.log('--- [API /edges] POST 요청 수신 시작 ---');
  logger.debug('[/api/edges] POST 요청 수신됨');
  
  // 쿠키 헤더 확인
  try {
    const headerList = await headers();
    const cookieHeader = headerList.get('cookie');
    console.log('[API /edges] 수신된 Cookie 헤더 (앞 100자):', cookieHeader ? cookieHeader.substring(0, 100) + '...' : '없음');
  } catch (error) {
    console.error('[API /edges] 쿠키 헤더 가져오기 실패:', error);
  }
  
  // 인증 확인
  console.log('[API /edges] auth() 함수 호출하여 세션 확인 시작...');
  const session = await auth();
  console.log('[API /edges] auth() 함수 호출 완료. 세션:', session ? `사용자 ID: ${session.user.id}` : '세션 없음');
  
  if (!session?.user?.id) {
    console.error('[API /edges] 인증 실패! 유효한 세션 없음. 401 반환.');
    return NextResponse.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED', message: '인증이 필요합니다. 로그인 후 다시 시도해주세요.' },
      { status: 401 }
    );
  }
  
  const userId = session.user.id;
  console.log(`[API /edges] 인증 성공. 사용자 ID: ${userId}`);
  
  try {
    // 요청 본문 파싱
    const rawData = await request.json();
    console.log('[API /edges] 원본 요청 데이터:', JSON.stringify(rawData, null, 2));
    logger.debug('요청 본문 파싱 완료', { 
      isArray: Array.isArray(rawData),
      bodyLength: Array.isArray(rawData) ? rawData.length : 1,
      body: rawData
    });
    
    // source/target 필드를 sourceCardNodeId/targetCardNodeId로 매핑 (개선된 버전)
    const mapFieldNames = (data: EdgeRequest) => {
      const result: Record<string, any> = { ...data };
      
      // 원본 데이터 로깅
      console.log('[API /edges] 필드 매핑 전 데이터:', {
        source: data.source,
        target: data.target,
        sourceCardNodeId: result.sourceCardNodeId,
        targetCardNodeId: result.targetCardNodeId,
      });
      
      // source를 sourceCardNodeId로 매핑
      if (data.source !== undefined) {
        result.sourceCardNodeId = data.source;
        console.log(`[API /edges] source 필드(${data.source})를 sourceCardNodeId로 매핑함`);
      }
      
      // target을 targetCardNodeId로 매핑
      if (data.target !== undefined) {
        result.targetCardNodeId = data.target;
        console.log(`[API /edges] target 필드(${data.target})를 targetCardNodeId로 매핑함`);
      }
      
      // 매핑 결과 로깅
      console.log('[API /edges] 필드 매핑 후 데이터:', {
        source: data.source,
        target: data.target,
        sourceCardNodeId: result.sourceCardNodeId,
        targetCardNodeId: result.targetCardNodeId,
      });
      
      return result as EdgeInput;
    };
    
    // 단일 객체 또는 배열 처리
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];
    const edgesInput: EdgeInput[] = dataArray.map(mapFieldNames);
    
    console.log('[API /edges] 매핑된 엣지 입력 데이터:', JSON.stringify(edgesInput, null, 2));
    
    // 필수 필드 검증 - sourceCardNodeId, targetCardNodeId, projectId가 반드시 존재해야 함
    for (const edge of edgesInput) {
      if (!edge.sourceCardNodeId || !edge.targetCardNodeId || !edge.projectId) {
        const missingFields = {
          sourceCardNodeId: !edge.sourceCardNodeId,
          targetCardNodeId: !edge.targetCardNodeId,
          projectId: !edge.projectId
        };
        logger.warn('필수 필드 누락:', missingFields);
        console.error('[API /edges] 필수 필드 누락! 400 반환.', missingFields);
        return NextResponse.json({ 
          error: 'Required fields missing',
          details: missingFields
        }, { status: 400 });
      }
    }
    
    // 요청 데이터 파싱 후 사용할 변수들 로깅
    const edgeInput = edgesInput[0]; // 첫 번째 엣지 사용 (배열로 요청이 들어올 수 있음)
    const sourceCardNodeId = edgeInput.sourceCardNodeId;
    const targetCardNodeId = edgeInput.targetCardNodeId;
    const projectId = edgeInput.projectId;
    const currentUserId = userId;
    
    console.log('[API /edges] 수신된 엣지 생성 데이터:', { 
      sourceCardNodeId, 
      targetCardNodeId, 
      projectId, 
      currentUserId,
      sourceHandle: edgeInput.sourceHandle,
      targetHandle: edgeInput.targetHandle,
      type: edgeInput.type
    });
    
    // 프로젝트 유효성 검증
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true }
    });
    
    if (!project) {
      logger.warn('존재하지 않는 프로젝트로 엣지 생성 시도:', { projectId });
      console.error(`[API /edges] 존재하지 않는 프로젝트 ID! ${projectId}. 400 반환.`);
      return NextResponse.json({ 
        error: 'Bad Request', 
        code: 'PROJECT_NOT_FOUND',
        message: '프로젝트가 존재하지 않습니다.'
      }, { status: 400 });
    }
    
    // 사용자 권한 검증
    const membership = await prisma.projectMember.findUnique({
      where: { 
        projectId_userId: { 
          projectId, 
          userId 
        } 
      }
    });
    
    if (!membership) {
      logger.warn('권한 없는 프로젝트에 엣지 생성 시도:', { projectId, userId });
      console.error(`[API /edges] 해당 프로젝트에 권한 없음! 프로젝트 ID: ${projectId}. 403 반환.`);
      return NextResponse.json({ 
        error: 'Forbidden',
        message: '해당 프로젝트에 접근 권한이 없습니다.'
      }, { status: 403 });
    }
    
    // 소스 카드 존재 여부 확인 (cardNode 테이블 사용으로 수정)
    console.log(`[API /edges] Source CardNode 조회 시작 - 조건: { id: '${sourceCardNodeId}' }`); // 로그 업데이트
    const sourceNode = await prisma.cardNode.findUnique({ // card -> cardNode
      where: { id: sourceCardNodeId },
      include: { card: { select: { projectId: true } } } // card 포함 및 projectId 선택
    });
    console.log(`[API /edges] Source CardNode 조회 결과:`, sourceNode ? `{ id: ${sourceNode.id}, cardProjectId: ${sourceNode.card?.projectId} }` : 'null'); // 로그 업데이트
    
    if (!sourceNode || sourceNode.card?.projectId !== projectId) { // sourceNode 확인 및 projectId 비교 추가
       console.log(`[API /edges] Source CardNode를 찾을 수 없거나 프로젝트 불일치! ID=${sourceCardNodeId}, 요청 projectId=${projectId}, 실제 projectId=${sourceNode?.card?.projectId}`); // 로그 업데이트
       logger.warn('존재하지 않는 source CardNode 또는 프로젝트 불일치로 엣지 생성 시도:', { source: sourceCardNodeId, projectId }); // 로그 업데이트
       return NextResponse.json(
        { error: 'Bad Request', code: 'SOURCE_CARDNODE_NOT_FOUND', message: '출발점 노드를 찾을 수 없거나 프로젝트가 일치하지 않습니다.', source: sourceCardNodeId }, // 메시지 업데이트
        { status: 400 }
      );
    }
    
    // 타겟 카드 존재 여부 확인 (cardNode 테이블 사용으로 수정)
    console.log(`[API /edges] Target CardNode 조회 시작 - 조건: { id: '${targetCardNodeId}' }`); // 로그 추가
    const targetNode = await prisma.cardNode.findUnique({ // card -> cardNode
      where: { id: targetCardNodeId },
      include: { card: { select: { projectId: true } } } // card 포함 및 projectId 선택
    });
    console.log(`[API /edges] Target CardNode 조회 결과:`, targetNode ? `{ id: ${targetNode.id}, cardProjectId: ${targetNode.card?.projectId} }` : 'null'); // 로그 추가
    
    if (!targetNode || targetNode.card?.projectId !== projectId) { // targetNode 확인 및 projectId 비교 추가
      console.log(`[API /edges] Target CardNode를 찾을 수 없거나 프로젝트 불일치! ID=${targetCardNodeId}, 요청 projectId=${projectId}, 실제 projectId=${targetNode?.card?.projectId}`); // 로그 업데이트
      logger.warn('존재하지 않는 target CardNode 또는 프로젝트 불일치로 엣지 생성 시도:', { target: targetCardNodeId, projectId }); // 로그 업데이트
      return NextResponse.json(
        { error: 'Bad Request', code: 'TARGET_CARDNODE_NOT_FOUND', message: '도착점 노드를 찾을 수 없거나 프로젝트가 일치하지 않습니다.', target: targetCardNodeId }, // 메시지 업데이트
        { status: 400 }
      );
    }
    
    // 프로젝트 ID 일치 확인 - 이제 이 검증은 위에서 수행하므로 불필요함
    // if (sourceNode.card?.projectId !== projectId || targetNode.card?.projectId !== projectId) {
    //   logger.warn('프로젝트 ID 불일치:', { 
    //     edgeProjectId: projectId,
    //     sourceCardProjectId: sourceNode.card?.projectId,
    //     targetCardProjectId: targetNode.card?.projectId
    //   });
    //   return NextResponse.json({ 
    //     error: 'Bad Request',
    //     code: 'PROJECT_ID_MISMATCH',
    //     message: '카드와 엣지의 프로젝트가 일치하지 않습니다.'
    //   }, { status: 400 });
    // }
    
    // 엣지 배열 준비
    const edgesToCreate = edgesInput.map(edge => ({
      sourceCardNodeId: edge.sourceCardNodeId,
      targetCardNodeId: edge.targetCardNodeId,
      projectId: edge.projectId,
      userId,              // 현재 인증된 사용자 ID 추가
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      animated: edge.animated,
      style: edge.style || Prisma.JsonNull,  // Prisma.JsonNull 사용
      data: edge.data || Prisma.JsonNull     // Prisma.JsonNull 사용
    }));
    
    console.log('[API /edges] 생성할 엣지 데이터:', JSON.stringify(edgesToCreate, null, 2));
    logger.debug('엣지 생성 시작:', { count: edgesToCreate.length });
    
    // 트랜잭션으로 모든 엣지 생성
    const createdEdges = await prisma.$transaction(
      edgesToCreate.map(edge => 
        // @ts-ignore - Prisma 클라이언트 타입 문제 해결
        prisma.edge.create({ data: edge })
      )
    );
    
    console.log('[API /edges] 생성된 엣지:', JSON.stringify(createdEdges, null, 2));
    logger.debug('엣지 생성 완료:', { count: createdEdges.length });
    
    // 단일 객체 또는 배열 반환 (요청 형식에 맞춤)
    return Array.isArray(rawData)
      ? NextResponse.json(createdEdges)
      : NextResponse.json(createdEdges[0]);
  } catch (error) {
    // 오류 유형에 따른 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma 에러 처리
      if (error.code === 'P2002') {
        logger.error('중복 엣지 생성 시도:', error);
        return NextResponse.json({ 
          error: 'Bad Request',
          code: 'DUPLICATE_EDGE',
          message: '이미 동일한 엣지가 존재합니다.'
        }, { status: 409 });
      } else if (error.code === 'P2003') {
        logger.error('외래 키 제약 위반:', error);
        return NextResponse.json({ 
          error: 'Bad Request',
          code: 'FOREIGN_KEY_CONSTRAINT',
          message: '참조된 카드가 존재하지 않습니다.'
        }, { status: 400 });
      }
    }
    
    // 그 외 모든 오류
    logger.error('엣지 생성 중 오류 발생:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
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