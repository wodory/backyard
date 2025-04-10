/**
 * 파일명: env.d.ts
 * 목적: 환경 변수 타입 정의
 * 역할: 환경 변수의 타입 안전성을 보장하기 위한 타입 선언
 * 작성일: 2025-03-30
 */

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_ENABLE_DB_INIT: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 