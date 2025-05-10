/**
 * 파일명: src/app/api/settings/route.ts
 * 목적: 사용자 설정 API 엔드포인트
 * 역할: 아이디어맵 설정 및 기타 사용자 설정 관리
 * 작성일: 2024-07-06
 * 수정일: 2025-04-21 : 스키마 필드명 변경 및 깊은 병합 적용
 * 수정일: 2025-04-21 : 오류 처리 로직 개선 및 표준화
 * 수정일: 2025-05-05 : Settings-User 관계 필드 설정 수정
 * 수정일: 2025-04-21 : DB 필드명과 API 응답 구조 불일치 수정 (settings → data)
 * 수정일: 2025-05-21 : Zod 스키마 기반의 Partial<SchemaFullSettings> 구조 지원
 * @rule   three-layer-standard
 * @layer  API
 */

import { NextRequest, NextResponse } from 'next/server';
import merge from 'lodash.merge';
import { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import createLogger from '@/lib/logger';
import { getDefaultSettings, validateSettings } from '@/lib/settings-utils';
import { FullSettings as SchemaFullSettings } from '@/lib/schema/settings-schema';

// 로거 생성
const logger = createLogger('SettingsAPI');

// Prisma 스키마와 실제 DB 필드명이 불일치한 상태이므로 타입 정의 추가
type SettingsData = {
  user_id: string;
  settings_data: any;
  created_at: Date;
  updated_at: Date;
};

// 설정 부분 업데이트 API에서 사용되는 타입
type SettingsPartialUpdateBody = {
  userId: string;
  [key: string]: any; // SchemaFullSettings의 부분 업데이트 필드들
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
    
    // 사용자 설정 초기화 로직 개선: 설정이 없거나 비어있는 경우
    if (!userSettings || !userSettings.data || Object.keys(userSettings.data as any).length === 0) {
      logger.info(`사용자 ID [${userId}]에 대한 설정 없음 또는 비어있음. 기본값 생성 및 저장.`);
      
      // Zod 스키마 기반 완전한 기본 설정 생성
      const defaultFullSettings = getDefaultSettings('full');
      
      // upsert를 통해 레코드 생성 또는 업데이트
      try {
        const updatedRecord = await prisma.settings.upsert({
          where: { userId: userId },
          create: {
            data: defaultFullSettings as any, // Prisma JSON 타입 호환성
            user: {
              connect: { id: userId }
            }
          },
          update: {
            data: defaultFullSettings as any, // Prisma JSON 타입 호환성
            updatedAt: new Date()
          }
        });
        
        logger.info(`[API /settings GET] 사용자 ID [${userId}]에 대한 기본 설정 생성 및 저장 완료.`);
        
        // 새로 생성된 설정 반환
        return NextResponse.json({
          settingsData: (updatedRecord as any).data
        });
      } catch (error) {
        // 설정 생성 실패 시 로깅 후 기본값만 반환
        logger.error('기본 설정 저장 실패', {
          userId,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          meta: (error as any)?.meta
        });
        
        // DB 저장에 실패해도 기본값 반환
        return NextResponse.json({
          settingsData: defaultFullSettings
        });
      }
    }
    
    logger.info(`사용자 ID [${userId}]에 대한 설정 로드 성공.`);
    
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
          updatedAt: new Date()
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
    let body: SettingsPartialUpdateBody;
    try {
      body = await request.json();
    } catch (error) {
      logger.error('JSON 파싱 오류', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return createErrorResponse(400, 'INVALID_JSON', 'JSON 형식이 올바르지 않습니다');
    }
    
    const { userId, ...partialUpdate } = body;
    
    // 필수 필드 확인
    if (!userId) {
      return createErrorResponse(400, 'MISSING_PARAMETER', '사용자 ID가 필요합니다');
    }
    
    if (!partialUpdate || typeof partialUpdate !== 'object' || Object.keys(partialUpdate).length === 0) {
      return createErrorResponse(400, 'MISSING_PARAMETER', '업데이트할 설정 데이터가 필요합니다');
    }
    
    // 인증 검증: 자신의 설정만 수정 가능
    if (userIdFromAuth && userId !== userIdFromAuth) {
      return createErrorResponse(403, 'FORBIDDEN', '권한이 없습니다');
    }
    
    logger.info(`설정 부분 업데이트 요청 (userId: ${userId})`, { partialUpdate });
    
    // 기존 설정 조회
    const existingRecord = await prisma.settings.findUnique({
      where: { userId: userId }
    });
    
    let updatedRecord;
    
    if (existingRecord) {
      // 현재 데이터를 가져와 깊은 병합
      const existingSettingsData = (existingRecord as any).data || {};
      
      // 깊은 병합 수행 - lodash.merge 사용
      const newSettingsData = merge({}, existingSettingsData, partialUpdate);
      
      // 병합된 데이터 검증 (Zod 스키마)
      try {
        validateSettings('full', newSettingsData, 'safe');
      } catch (validationError) {
        logger.error('설정 데이터 검증 실패', { error: validationError, newSettingsData });
        return createErrorResponse(400, 'VALIDATION_ERROR', '업데이트할 설정 데이터가 올바르지 않습니다');
      }
      
      logger.debug('기존 설정과 병합 결과', {
        currentFields: Object.keys(existingSettingsData),
        updateFields: Object.keys(partialUpdate),
        resultFields: Object.keys(newSettingsData),
      });
      
      // 설정 업데이트
      updatedRecord = await prisma.settings.update({
        where: { id: existingRecord.id },
        data: {
          data: newSettingsData as any, // 필드명 'settings'에서 'data'로 변경
          updatedAt: new Date()
        } as any
      });
      
      logger.info(`설정 업데이트 완료 (userId: ${userId})`);
    } else {
      // 기본 설정과 병합
      const defaultSettings = getDefaultSettings('full');
      const newSettingsData = merge({}, defaultSettings, partialUpdate);
      
      // 병합된 데이터 검증 (Zod 스키마)
      try {
        validateSettings('full', newSettingsData, 'safe');
      } catch (validationError) {
        logger.error('설정 데이터 검증 실패', { error: validationError, newSettingsData });
        return createErrorResponse(400, 'VALIDATION_ERROR', '업데이트할 설정 데이터가 올바르지 않습니다');
      }
      
      logger.debug('기본 설정과 병합 결과', {
        defaultFields: Object.keys(defaultSettings),
        updateFields: Object.keys(partialUpdate),
        resultFields: Object.keys(newSettingsData),
      });
      
      // 새 설정 생성
      updatedRecord = await prisma.settings.create({
        data: {
          data: newSettingsData as any, // 필드명 변경
          user: { // user 관계 필드를 통해 연결 방식 지정
            connect: { // 기존 User에 연결
              id: userId
            }
          }
        }
      });
      
      logger.info(`새 설정 생성 완료 (userId: ${userId})`);
    }
    
    // 응답 구조 개선: 업데이트된 전체 설정 데이터를 반환
    return NextResponse.json({ 
      success: true,
      settingsData: (updatedRecord as any).data
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