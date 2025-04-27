/**
 * 파일명: src/app/api/settings/route.ts
 * 목적: 사용자 설정 API 엔드포인트
 * 역할: 아이디어맵 설정 및 기타 사용자 설정 관리
 * 작성일: 2024-07-06
 */

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth-server';
import { DEFAULT_SETTINGS } from '@/lib/ideamap-utils';
import prisma from '@/lib/prisma';
import createLogger from '@/lib/logger';

// 로거 생성
const logger = createLogger('SettingsAPI');

// 설정 조회 API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    // 필수 파라미터 확인
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    logger.info(`설정 조회 요청 (user_id: userId(${userId}))`);
    
    // 설정 조회
    const userSettings = await prisma.settings.findFirst({
      where: { 
        user_id: userId
      }
    });
    
    // 설정이 없는 경우 기본값 반환
    if (!userSettings) {
      logger.info(`사용자 설정이 없음, 기본값 반환 (userId: ${userId})`);
      
      // 기본 설정 생성 및 저장 (비동기로 처리)
      try {
        await prisma.settings.create({
          data: {
            user_id: userId,
            settings: DEFAULT_SETTINGS,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        logger.info(`기본 설정 생성 완료 (userId: ${userId})`);
      } catch (error) {
        logger.error(`기본 설정 생성 실패 (userId: ${userId}):`, error);
      }
      
      return NextResponse.json({
        settings: DEFAULT_SETTINGS
      });
    }
    
    return NextResponse.json({
      settings: userSettings.settings
    });
  } catch (error) {
    logger.error('설정 조회 오류:', error);
    return NextResponse.json(
      { error: '설정을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// 설정 저장 API
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { settings, userId } = data;
    
    // 필수 필드 확인
    if (!settings || !userId) {
      return NextResponse.json(
        { error: '설정 데이터와 사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    logger.info(`설정 저장 요청 (userId: ${userId})`);
    
    // 기존 설정 확인
    const existingSettings = await prisma.settings.findFirst({
      where: { user_id: userId }
    });
    
    if (existingSettings) {
      // 설정 업데이트
      await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          settings,
          updated_at: new Date()
        }
      });
      
      logger.info(`설정 업데이트 완료 (userId: ${userId})`);
    } else {
      // 새 설정 생성
      await prisma.settings.create({
        data: {
          user_id: userId,
          settings,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      logger.info(`새 설정 생성 완료 (userId: ${userId})`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('설정 저장 오류:', error);
    return NextResponse.json(
      { error: '설정을 저장하는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// 설정 부분 업데이트 API
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { settings: partialSettings, userId } = data;
    
    // 필수 필드 확인
    if (!partialSettings || !userId) {
      return NextResponse.json(
        { error: '업데이트할 설정 데이터와 사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    logger.info(`설정 부분 업데이트 요청 (userId: ${userId})`);
    
    // 기존 설정 확인
    const existingSettings = await prisma.settings.findFirst({
      where: { user_id: userId }
    });
    
    if (existingSettings) {
      // 기존 설정과 병합
      const updatedSettings = {
        ...existingSettings.settings,
        ...partialSettings
      };
      
      // 설정 업데이트
      await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          settings: updatedSettings,
          updated_at: new Date()
        }
      });
      
      logger.info(`설정 부분 업데이트 완료 (userId: ${userId})`);
      return NextResponse.json({ 
        success: true, 
        settings: updatedSettings 
      });
    } else {
      // 기존 설정이 없으면 기본값과 병합하여 새 설정 생성
      const newSettings = {
        ...DEFAULT_SETTINGS,
        ...partialSettings
      };
      
      // 새 설정 생성
      await prisma.settings.create({
        data: {
          user_id: userId,
          settings: newSettings,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      logger.info(`새 설정 생성 완료 (userId: ${userId})`);
      return NextResponse.json({ 
        success: true, 
        settings: newSettings 
      });
    }
  } catch (error) {
    logger.error('설정 부분 업데이트 오류:', error);
    return NextResponse.json(
      { error: '설정을 업데이트하는데 실패했습니다' },
      { status: 500 }
    );
  }
} 