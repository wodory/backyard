/**
 * 파일명: global.d.ts
 * 목적: 전역 타입 선언
 * 역할: 전역 변수 및 확장 타입을 선언
 * 작성일: 2025-03-27
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './supabase';

declare global {
  interface Window {
    /**
     * 전역 Supabase 싱글톤 인스턴스
     */
    __SUPABASE_SINGLETON_CLIENT?: SupabaseClient<Database>;
    
    /**
     * Supabase 경고 비활성화 플래그
     */
    __SUPABASE_DISABLE_WARNING?: boolean;
  }
  
  /**
   * 콘솔 메서드 오버라이드를 위한 타입 선언
   */
  interface Console {
    warn: (...data: any[]) => void;
    originalWarn?: (...data: any[]) => void;
  }
} 