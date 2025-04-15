/**
 * 파일명: route.ts
 * 목적: 저장된 로그를 확인할 수 있는 API 엔드포인트
 * 역할: 서버에 저장된 로그를 조회하고 필터링하여 제공
 * 작성일: 2025-03-27
 * 수정일: 2025-04-09
 * 수정일: 2024-05-28 : module 변수명을 logModule로 변경하여 Next.js 오류 해결
 * 수정일: 2024-05-28 : any 타입을 구체적인 타입으로 변경
 */

import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// 로그 항목 인터페이스 정의
interface LogEntry {
  module: string;
  level: string;
  message: string;
  timestamp: string;
  sessionId?: string;
  details?: Record<string, unknown>;
}

// 로그 파일 경로
const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_FILE = path.join(process.cwd(), LOG_DIR, 'client-logs.json');

/**
 * 로그 조회 API 핸들러
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인 (관리자만 접근 가능하도록 설정)
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    
    // 개발 환경이 아니고 인증되지 않은 경우 접근 거부
    if (process.env.NODE_ENV !== 'development' && !sessionData.session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 로그 파일이 존재하지 않는 경우
    if (!fs.existsSync(LOG_FILE)) {
      return NextResponse.json(
        { error: '로그 파일이 존재하지 않습니다.' },
        { status: 404 }
      );
    }
    
    // 로그 파일 읽기
    const fileContent = fs.readFileSync(LOG_FILE, 'utf-8');
    const logs = JSON.parse(fileContent) as LogEntry[];
    
    // URL 파라미터로 필터링
    const searchParams = request.nextUrl.searchParams;
    const logModule = searchParams.get('module');
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const sessionId = searchParams.get('sessionId');
    
    // 필터링 적용
    let filteredLogs = logs;
    
    if (logModule) {
      filteredLogs = filteredLogs.filter((log: LogEntry) => log.module === logModule);
    }
    
    if (level) {
      filteredLogs = filteredLogs.filter((log: LogEntry) => log.level === level);
    }
    
    if (sessionId) {
      filteredLogs = filteredLogs.filter((log: LogEntry) => log.sessionId === sessionId);
    }
    
    // 최근 로그 순으로 정렬
    filteredLogs.sort((a: LogEntry, b: LogEntry) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
    
    // 로그 개수 제한
    filteredLogs = filteredLogs.slice(0, limit);
    
    // 모듈 목록 추출 (필터링을 위한 옵션)
    const modules = Array.from(new Set(logs.map((log: LogEntry) => log.module)));
    
    // 세션 ID 목록 추출
    const sessionIds = Array.from(new Set(logs.map((log: LogEntry) => log.sessionId))).filter(Boolean);
    
    return NextResponse.json({
      logs: filteredLogs,
      total: logs.length,
      filtered: filteredLogs.length,
      modules,
      sessionIds
    });
  } catch (error) {
    console.error('로그 조회 오류:', error);
    return NextResponse.json(
      { error: `로그 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 