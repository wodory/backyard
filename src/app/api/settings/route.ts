/**
 * 파일명: src/app/api/settings/route.ts
 * 목적: 사용자 설정 API 엔드포인트
 * 역할: 아이디어맵 설정 및 기타 사용자 설정 관리
 * 작성일: 2024-07-06
 * 수정일: 2025-04-21 : 스키마 필드명 변경 및 깊은 병합 적용
 * 수정일: 2025-04-21 : 오류 처리 로직 개선 및 표준화
 * 수정일: 2025-05-05 : Settings-User 관계 필드 설정 수정
 * 수정일: 2025-04-21 : DB 필드명과 API 응답 구조 불일치 수정 (settings → data)
 * @rule   three-layer-standard
 * @layer  API
 */

import { NextRequest, NextResponse } from 'next/server';
import merge from 'lodash.merge';
import { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import createLogger from '@/lib/logger';
import { getDefaultSettings } from '@/lib/settings-utils';

// 로거 생성
const logger = createLogger('SettingsAPI');

// Prisma 스키마와 실제 DB 필드명이 불일치한 상태이므로 타입 정의 추가
type SettingsData = {
  user_id: string;
  settings_data: any;
  created_at: Date;
  updated_at: Date;
};

/**
 * 오류 응답을 표준화된 형식으로 반환하는 함수
 * @param {number} code - HTTP 상태 코드
 * @param {string} type - 오류 유형
 * @param {string} message - 오류 메시지
 * @returns {NextResponse} 표준화된 오류 응답
 */
function createErrorResponse(code: number, type: string, message: string): NextResponse {
  return NextResponse.json({
    code,
    type,
    message
  }, { status: code });
}

/**
 * 설정 조회 API
 * @param {NextRequest} request - 요청 객체
 * @returns {NextResponse} 응답 객체
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    const userIdFromAuth = session?.user?.id;
    
    // 요청으로부터 userId 추출
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    // 필수 파라미터 확인
    if (!userId) {
      return createErrorResponse(400, 'MISSING_PARAMETER', '사용자 ID가 필요합니다');
    }
    
    // 인증 검증: 자신의 설정만 조회 가능
    if (userIdFromAuth && userId !== userIdFromAuth) {
      return createErrorResponse(403, 'FORBIDDEN', '권한이 없습니다');
    }
    
    logger.info(`설정 조회 요청 (userId: ${userId})`);
    
    // 설정 조회
    const userSettings = await prisma.settings.findUnique({
      where: { 
        userId: userId
      }
    });
    
    // 설정이 없는 경우 기본값 반환
    if (!userSettings) {
      logger.info(`사용자 설정이 없음, 기본값 반환 (userId: ${userId})`);
      
      // 기본 설정 생성 및 저장 (비동기로 처리)
      try {
        await prisma.settings.create({
          data: {
            data: getDefaultSettings() as any, // 필드명 'settings'에서 'data'로 변경
            user: { // user 관계 필드를 통해 연결 방식 지정
              connect: { // 기존 User에 연결
                id: userId
              }
            }
          }
        });
        logger.info(`기본 설정 생성 완료 (userId: ${userId})`);
      } catch (error) {
        // 상세 로깅을 통한 오류 기록
        logger.error('기본 설정 생성 실패', {
          userId,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          meta: (error as any)?.meta
        });
      }
      
      return NextResponse.json({
        settingsData: getDefaultSettings()
      });
    }
    
    // 올바른 필드명(data)에서 설정 데이터를 가져와 settingsData로 반환
    return NextResponse.json({
      settingsData: (userSettings as any).data
    });
  } catch (error) {
    // 상세 오류 로깅
    logger.error('설정 조회 오류', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      meta: (error as any)?.meta
    });

    // Prisma 오류 코드별 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 특정 Prisma 오류 코드에 따른 처리
      if (error.code === 'P2001') {
        return createErrorResponse(404, 'RESOURCE_NOT_FOUND', '요청한 리소스를 찾을 수 없습니다');
      }
      if (error.code === 'P2002') {
        return createErrorResponse(409, 'UNIQUE_CONSTRAINT', '중복된 항목이 존재합니다');
      }
    }
    
    // 기타 오류는 서버 내부 오류로 처리
    return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', '설정을 불러오는데 실패했습니다');
  }
}

/**
 * 설정 저장 API (전체 교체)
 * @param {NextRequest} request - 요청 객체
 * @returns {NextResponse} 응답 객체
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    const userIdFromAuth = session?.user?.id;
    
    // JSON 파싱
    let data;
    try {
      data = await request.json();
    } catch (error) {
      logger.error('JSON 파싱 오류', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return createErrorResponse(400, 'INVALID_JSON', 'JSON 형식이 올바르지 않습니다');
    }
    
    const { settingsData, userId } = data;
    
    // 필수 필드 확인
    if (!settingsData || !userId) {
      return createErrorResponse(400, 'MISSING_PARAMETER', '설정 데이터와 사용자 ID가 필요합니다');
    }
    
    // 인증 검증: 자신의 설정만 수정 가능
    if (userIdFromAuth && userId !== userIdFromAuth) {
      return createErrorResponse(403, 'FORBIDDEN', '권한이 없습니다');
    }
    
    logger.info(`설정 저장 요청 (userId: ${userId})`);
    
    // 기존 설정 확인
    const existingSettings = await prisma.settings.findUnique({
      where: { userId: userId }
    });
    
    if (existingSettings) {
      // 설정 업데이트
      await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          // 필드명 'settings'에서 'data'로 변경
          data: settingsData as any,
          updated_at: new Date()
        } as any
      });
      
      logger.info(`설정 업데이트 완료 (userId: ${userId})`);
    } else {
      // 새 설정 생성
      await prisma.settings.create({
        data: {
          data: settingsData as any, // 필드명 변경
          user: { // user 관계 필드를 통해 연결 방식 지정
            connect: { // 기존 User에 연결
              id: userId
            }
          }
        }
      });
      
      logger.info(`새 설정 생성 완료 (userId: ${userId})`);
    }
    
    return NextResponse.json({ 
      success: true,
      settingsData
    });
  } catch (error) {
    // 상세 오류 로깅
    logger.error('설정 저장 오류', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      meta: (error as any)?.meta
    });

    // Prisma 오류 코드별 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 고유 제약 조건 위반 (중복 항목)
      if (error.code === 'P2002') {
        return createErrorResponse(409, 'UNIQUE_CONSTRAINT', '중복된 항목이 존재합니다');
      }
      // 외래 키 제약 조건 위반
      if (error.code === 'P2003') {
        return createErrorResponse(400, 'FOREIGN_KEY_CONSTRAINT', '참조 무결성 제약 조건을 위반했습니다');
      }
      // 레코드를 찾을 수 없음
      if (error.code === 'P2025') {
        return createErrorResponse(404, 'RECORD_NOT_FOUND', '업데이트할 레코드를 찾을 수 없습니다');
      }
    }
    
    // 기타 오류는 서버 내부 오류로 처리
    return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', '설정을 저장하는데 실패했습니다');
  }
}

/**
 * 설정 부분 업데이트 API
 * @param {NextRequest} request - 요청 객체
 * @returns {NextResponse} 응답 객체
 */
export async function PATCH(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    const userIdFromAuth = session?.user?.id;
    
    // JSON 파싱
    let data;
    try {
      data = await request.json();
    } catch (error) {
      logger.error('JSON 파싱 오류', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return createErrorResponse(400, 'INVALID_JSON', 'JSON 형식이 올바르지 않습니다');
    }
    
    const { settings: partialSettings, userId } = data;
    
    // 필수 필드 확인
    if (!partialSettings || !userId) {
      return createErrorResponse(400, 'MISSING_PARAMETER', '업데이트할 설정 데이터와 사용자 ID가 필요합니다');
    }
    
    // 인증 검증: 자신의 설정만 수정 가능
    if (userIdFromAuth && userId !== userIdFromAuth) {
      return createErrorResponse(403, 'FORBIDDEN', '권한이 없습니다');
    }
    
    if (!session?.user) {
      return createErrorResponse(401, 'UNAUTHORIZED', '인증이 필요합니다');
    }
    
    logger.info(`설정 부분 업데이트 요청 (userId: ${userId})`);
    
    // 기존 설정 확인
    const existingSettings = await prisma.settings.findFirst({
      where: { userId: userId }
    });
    
    let updatedSettingsData;
    
    if (existingSettings) {
      // 기존 설정과 깊은 병합 (lodash.merge 사용)
      updatedSettingsData = merge({}, (existingSettings as any).data, partialSettings);
      
      // 설정 업데이트
      await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          data: updatedSettingsData as any,
          updated_at: new Date()
        } as any
      });
      
      logger.info(`설정 부분 업데이트 완료 (userId: ${userId})`);
    } else {
      // 기존 설정이 없으면 기본값과 병합하여 새 설정 생성
      updatedSettingsData = merge({}, getDefaultSettings(), partialSettings);
      
      // 새 설정 생성
      await prisma.settings.create({
        data: {
          data: updatedSettingsData as any, // 필드명 변경
          user: { // user 관계 필드를 통해 연결 방식 지정
            connect: { // 기존 User에 연결
              id: userId
            }
          }
        }
      });
      
      logger.info(`새 설정 생성 완료 (userId: ${userId})`);
    }
    
    return NextResponse.json({ 
      success: true, 
      settingsData: updatedSettingsData
    });
  } catch (error) {
    // 상세 오류 로깅
    logger.error('설정 부분 업데이트 오류', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      meta: (error as any)?.meta
    });

    // Prisma 오류 코드별 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 고유 제약 조건 위반 (중복 항목)
      if (error.code === 'P2002') {
        return createErrorResponse(409, 'UNIQUE_CONSTRAINT', '중복된 항목이 존재합니다');
      }
      // 외래 키 제약 조건 위반
      if (error.code === 'P2003') {
        return createErrorResponse(400, 'FOREIGN_KEY_CONSTRAINT', '참조 무결성 제약 조건을 위반했습니다');
      }
      // 레코드를 찾을 수 없음
      if (error.code === 'P2025') {
        return createErrorResponse(404, 'RECORD_NOT_FOUND', '업데이트할 레코드를 찾을 수 없습니다');
      }
    }
    
    // 기타 오류는 서버 내부 오류로 처리
    return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', '설정을 업데이트하는데 실패했습니다');
  }
} 