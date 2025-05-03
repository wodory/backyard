/**
 * 파일명: src/app/api/health-check/route.ts
 * 목적: API 서버 헬스 체크
 * 역할: 서버가 응답하는지 확인하고 등록된 API 라우트 목록 반환
 * 작성일: 2025-04-21
 * 수정일: 2025-05-02 : 등록된 API 라우트 목록 반환 기능 추가
 */

import { NextRequest, NextResponse } from 'next/server';
import { readdirSync } from 'fs';
import { join } from 'path';
import createLogger from '@/lib/logger';

const logger = createLogger('api:health-check');

/**
 * API 라우트 경로 스캔 함수
 * @returns {string[]} 등록된 API 라우트 경로 목록
 */
function scanApiRoutes(): string[] {
  try {
    const apiDir = join(process.cwd(), 'src', 'app', 'api');
    const entries = readdirSync(apiDir, { withFileTypes: true });
    
    const routes = entries
      .filter(entry => entry.isDirectory())
      .map(dir => {
        try {
          const subDirPath = join(apiDir, dir.name);
          const subEntries = readdirSync(subDirPath);
          return subEntries.includes('route.ts') ? `/api/${dir.name}` : null;
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean) as string[];
      
    return routes;
  } catch (error) {
    logger.error('API 라우트 스캔 오류:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  logger.debug('헬스 체크 요청 수신', { url: request.url });
  
  const routes = scanApiRoutes();
  logger.debug('스캔된 API 라우트:', { count: routes.length, routes });
  
  const edgesRouteExists = routes.includes('/api/edges');
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    apiRoutes: routes,
    edgesRouteExists,
    message: 'API 서버가 정상적으로 작동 중입니다.'
  });
} 