/**
 * 파일명: supabase-browser.ts
 * 목적: 브라우저에서 Supabase 클라이언트 접근
 * 역할: 전역 Supabase 싱글톤 인스턴스 접근 (기존 코드와의 호환성 유지)
 * 작성일: 2024-03-29
 */

'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types/supabase';
import createLogger from './logger';
import { getSupabaseInstance } from './supabase-instance';

// 로거 생성
const logger = createLogger('SupabaseBrowser');

/**
 * createBrowserSupabaseClient: 브라우저에서 Supabase 클라이언트 인스턴스 반환
 * @returns 전역 Supabase 클라이언트 인스턴스
 * @deprecated getSupabaseInstance 함수를 직접 사용하세요
 */
export function createBrowserSupabaseClient() {
  try {
    // 전역 인스턴스 반환 (기존 코드와의 호환성 유지)
    logger.info('전역 Supabase 인스턴스 접근');
    return getSupabaseInstance();
  } catch (error) {
    logger.error('Supabase 인스턴스 접근 오류', error);
    throw error;
  }
} 