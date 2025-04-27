/**
 * 파일명: src/app/api/auth/user-sync/route.ts
 * 목적: Supabase 사용자 데이터 동기화 웹훅 처리
 * 역할: auth.users와 public.users 테이블 간 데이터 동기화 및 기본 설정 생성
 * 작성일: 2025-05-29
 */

import { NextRequest, NextResponse } from 'next/server';

import { DEFAULT_SETTINGS } from '@/lib/ideamap-utils';
import prisma from '@/lib/prisma';
import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('UserSyncWebhook');

// 웹훅 시크릿 (환경 변수에서 가져옴)
const webhookSecret = process.env.WEBHOOK_SECRET;

/**
 * 웹훅 요청 검증 함수
 * @param request - NextRequest 객체
 * @returns 검증 결과 (성공/실패)
 */
async function verifyWebhookRequest(request: NextRequest): Promise<boolean> {
  try {
    // 실제 프로덕션 환경에서는 시크릿 검증 로직 구현
    // 예: 헤더에서 시크릿 토큰 확인
    // const authHeader = request.headers.get('x-webhook-secret');
    // if (authHeader !== webhookSecret) return false;
    
    // 개발 환경에서는 검증 생략 (실제 배포 시 제거 필요)
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // TODO: 실제 환경에서 사용할 시크릿 검증 로직 추가

    return true;
  } catch (error) {
    logger.error('웹훅 요청 검증 실패:', error);
    return false;
  }
}

/**
 * 사용자 데이터 처리 함수 - INSERT 작업
 * @param userData - 웹훅으로 전달된 사용자 데이터
 */
async function handleUserInsert(userData: any) {
  try {
    // 이미 사용자가 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id }
    });

    if (existingUser) {
      logger.info(`사용자 이미 존재: ${userData.id}`);
      return;
    }

    // 새 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.raw_user_meta_data?.name || userData.email.split('@')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    logger.info(`새 사용자 생성 완료: ${newUser.id}`);

    // 기본 설정 생성
    await prisma.$queryRaw`
      INSERT INTO public.settings (id, user_id, settings, created_at, updated_at)
      VALUES (gen_random_uuid(), ${newUser.id}::uuid, ${JSON.stringify(DEFAULT_SETTINGS)}::jsonb, NOW(), NOW())
    `;

    logger.info(`기본 설정 생성 완료: ${newUser.id}`);
  } catch (error) {
    logger.error('사용자 INSERT 처리 중 오류:', error);
    throw error;
  }
}

/**
 * 사용자 데이터 처리 함수 - UPDATE 작업
 * @param userData - 웹훅으로 전달된 사용자 데이터
 */
async function handleUserUpdate(userData: any) {
  try {
    // 사용자가 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id }
    });

    if (!existingUser) {
      logger.warn(`업데이트할 사용자 없음: ${userData.id}, INSERT로 처리`);
      return await handleUserInsert(userData);
    }

    // 사용자 정보 업데이트
    await prisma.user.update({
      where: { id: userData.id },
      data: {
        email: userData.email,
        name: userData.raw_user_meta_data?.name || existingUser.name,
        updatedAt: new Date()
      }
    });

    logger.info(`사용자 업데이트 완료: ${userData.id}`);
  } catch (error) {
    logger.error('사용자 UPDATE 처리 중 오류:', error);
    throw error;
  }
}

/**
 * 사용자 데이터 처리 함수 - DELETE 작업
 * @param userData - 웹훅으로 전달된 사용자 데이터
 */
async function handleUserDelete(userData: any) {
  try {
    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id }
    });

    if (!existingUser) {
      logger.warn(`삭제할 사용자 없음: ${userData.id}`);
      return;
    }

    // 사용자 관련 데이터 삭제 (설정, 카드 등)
    // 참고: Prisma 스키마에 onDelete: Cascade가 설정되어 있으면 자동 삭제됨

    // 사용자 삭제
    await prisma.user.delete({
      where: { id: userData.id }
    });

    logger.info(`사용자 삭제 완료: ${userData.id}`);
  } catch (error) {
    logger.error('사용자 DELETE 처리 중 오류:', error);
    throw error;
  }
}

/**
 * Webhook 핸들러 - HTTP POST 요청 처리
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 검증
    const isValid = await verifyWebhookRequest(request);
    if (!isValid) {
      logger.warn('유효하지 않은 웹훅 요청');
      return NextResponse.json(
        { error: '유효하지 않은 웹훅 요청' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const payload = await request.json();
    logger.debug('웹훅 페이로드 수신:', payload);

    // 이벤트 타입에 따라 처리
    const { type, record } = payload;

    if (!type || !record) {
      logger.warn('유효하지 않은 웹훅 데이터:', { type, hasRecord: !!record });
      return NextResponse.json(
        { error: '유효하지 않은 웹훅 데이터' },
        { status: 400 }
      );
    }

    // 이벤트 타입에 따른 처리
    switch (type) {
      case 'INSERT':
        await handleUserInsert(record);
        break;
      case 'UPDATE':
        await handleUserUpdate(record);
        break;
      case 'DELETE':
        await handleUserDelete(record);
        break;
      default:
        logger.warn(`지원하지 않는 이벤트 타입: ${type}`);
        return NextResponse.json(
          { error: `지원하지 않는 이벤트 타입: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('웹훅 처리 중 오류:', error);
    
    // 오류 상세 정보 로깅
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    };
    
    logger.error('오류 상세 정보:', errorDetails);
    
    return NextResponse.json(
      { 
        error: '웹훅 처리 중 오류 발생',
        details: errorDetails.message
      }, 
      { status: 500 }
    );
  }
}

/**
 * 상태 확인용 GET 엔드포인트
 */
export function GET() {
  return NextResponse.json({ status: 'UserSync webhook endpoint is active' });
} 