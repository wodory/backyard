/**
 * 파일명: route.ts
 * 목적: 클라이언트 로그를 서버에 저장하는 API 엔드포인트
 * 역할: 로그 데이터를 받아 서버 로그에 기록하고 필요시 데이터베이스에 저장
 * 작성일: 2025-03-27
 * 수정일: 2024-05-22 : import 순서 수정, any 타입 구체화
 */

import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';
// import { createBrowserSupabaseClient } from '@/lib/supabase-browser'; // 클라이언트용 함수 제거

// 로그 파일 경로 설정
const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_FILE = path.join(process.cwd(), LOG_DIR, 'client-logs.json');

// 서버 전용 Supabase 클라이언트 생성 함수
const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase 환경 변수가 설정되지 않았습니다');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * ensureLogDir: 로그 디렉토리가 존재하는지 확인하고, 없으면 생성
 */
const ensureLogDir = () => {
  const logDirPath = path.join(process.cwd(), LOG_DIR);
  if (!fs.existsSync(logDirPath)) {
    fs.mkdirSync(logDirPath, { recursive: true });
    console.log(`로그 디렉토리 생성: ${logDirPath}`);
  }
};

/**
 * saveLogToFile: 로그 데이터를 파일에 저장
 * @param logData 저장할 로그 데이터
 */
const saveLogToFile = (logData: {
  module: string;
  level: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}) => {
  try {
    ensureLogDir();
    
    // 기존 로그 파일 읽기
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      const fileContent = fs.readFileSync(LOG_FILE, 'utf-8');
      logs = JSON.parse(fileContent);
    }
    
    // 새 로그 추가
    logs.push({
      ...logData,
      serverTimestamp: new Date().toISOString()
    });
    
    // 로그 파일 크기 제한 (최대 1000개 로그)
    if (logs.length > 1000) {
      logs = logs.slice(logs.length - 1000);
    }
    
    // 파일에 저장
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    
    // 서버 콘솔에도 로그 출력
    console.log(`[SERVER-LOG][${logData.module}][${logData.level}] ${logData.message}`, logData.data || '');
    
    return true;
  } catch (error) {
    console.error('로그 파일 저장 오류:', error);
    return false;
  }
};

/**
 * 로그 저장 API 핸들러
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const logData = await request.json();
    
    // 필수 필드 확인
    if (!logData.module || !logData.level || !logData.message) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // 로그 파일에 저장
    saveLogToFile(logData);
    
    // 서버 전용 Supabase 클라이언트 생성 (오류 발생 시 로그만 저장)
    try {
      const supabase = createServerSupabaseClient();
      if (supabase) {
        // 세션 확인은 필요 없음 - 서버 측에서는 모든 로그 저장
        // 실제 프로젝트에서는 데이터베이스에 로그 저장 로직 구현
        // 예: await supabase.from('logs').insert({ ...logData })
      }
    } catch (supabaseError) {
      console.error('Supabase 클라이언트 생성 오류:', supabaseError);
      // 오류가 발생해도 API 응답은 성공으로 처리 (파일에는 저장됨)
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('로그 API 오류:', error);
    return NextResponse.json(
      { error: '로그 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 