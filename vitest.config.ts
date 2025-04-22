/**
 * 파일명: viconfig.ts
 * 목적: Vitest 테스트 환경 설정
 * 역할: 테스트 실행을 위한 Vite 설정과 통합된 설정 제공
 * 작성일: 2024-03-31
 * 수정일: 2025-04-11
 */

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { loadEnv } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.js';

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // 환경 변수 설정
      env: loadEnv('test', process.cwd(), ''),
      
      // 테스트 환경 설정
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/tests/setup.ts'],
      
      // 성능 최적화 설정
      testTimeout: 2000, // 전역 타임아웃 설정 (2초로 변경)
      hookTimeout: 2000, // 훅 타임아웃 설정 (2초로 변경)
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: true,
        },
      },
      // isolate: true,
      
      // Node.js v20의 Undici 타임아웃 문제 처리
      environmentOptions: {
        // jsdom 환경에서 글로벌 변수 설정
        jsdom: {
          // JS 타이머 이벤트가 즉시 처리되도록 설정
          // Undici의 타임아웃 이슈 해결
          pretendToBeVisual: true,
        }
      },
      
      // 테스트 파일 패턴 설정
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**', // Next.js 빌드 결과물
        '**/coverage/**', // 커버리지 리포트 폴더
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,storybook,eslint,prettier}.config.*', // 각종 설정 파일
        '**/prisma/seed/**', // Prisma Seed 파일
        '**/scripts/**', // 스크립트 폴더
        // '**/src/tests/**', // 테스트 관련 폴더
        '**/src/components/board/nodes/NodeInspect*.tsx', //디버깅용 NodeInspector
        // src/lib
        '**/src/lib/debug-utils.ts',  // 디버깅 유틸리티 
        '**/test-utils.ts',                
        '**/src/lib/cookie.ts',
        '**/src/lib/auth-server.ts',
        '**/src/lib/prisma.ts',
        '**/src/lib/supabase-instance.ts',
        '**/src/lib/supabase-server.ts',
        '**/src/lib/supabase.ts',
        '**/src/lib/debug-utils.ts',
        '**/src/lib/ideamap-utils.ts',
        '**/src/lib/layout-utils.ts',
        // root       // 모든 서브 폴더의 test-utils.ts 파일 제외
        './*.config.js', // 루트 경로의 config 파일들
        './*.config.ts',
        './*.config.mjs',
        './*.d.ts', // 루트 경로의 타입 정의 파일
      ],
      
      // 타입스크립트 설정
      typecheck: {
        enabled: false, // 타입 체크 비활성화 (필요한 경우 별도로 실행)
        tsconfig: './tsconfig.json',
        checker: 'tsc',
        ignoreSourceErrors: true, // 소스 파일의 타입 오류 무시
      },
      
      // 커버리지 설정
      coverage: {
        provider: 'v8', // 또는 'istanbul'
        reporter: ['text', 'json', 'html', 'json-summary'], // 리포트 형식
        reportsDirectory: './coverage',
        // --- 커버리지 측정에서 제외할 파일/폴더 ---
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/.next/**',
          '**/coverage/**',
          '**/.{idea,git,cache,output,temp}/**',
          '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,storybook,eslint,prettier}.config.*',
          '**/prisma/seed/**',
          '**/scripts/**',
          '**/src/tests/**', // 모든 테스트 관련 파일/폴더 (mocks, msw, utils, *.* 포함)
          '**/src/components/debug/**', // 디버그 컴포넌트 폴더
          '**/src/setupTests.ts',
          '**/*.d.ts', // 모든 타입 정의 파일
          '**/virtual:*', // 가상 모듈
          '**/main.tsx', // React 앱 진입점 (선택 사항)
          '**/App.tsx', // 루트 컴포넌트 (선택 사항)
          '**/src/types/**', // src 아래의 타입 폴더 (만약 있다면)
          '**/src/lib/constants.ts', // 단순 상수 파일 (선택 사항)
          '**/src/components/ui/**', // UI 라이브러리 컴포넌트 (선택 사항)
          '**/src/contexts/**', // 단순 Context (선택 사항)
          '**/src/components/board/nodes/NodeInspect*.tsx', //디버깅용 NodeInspector
          // src/lib
          '**/src/lib/debug-utils.ts', // 디버깅 유틸리티 
          '**/src/lib/cookie.ts',
          '**/src/lib/auth-server.ts',
          '**/src/lib/prisma.ts',
          '**/src/lib/supabase-instance.ts',
          '**/src/lib/supabase-server.ts',
          '**/src/lib/supabase.ts',
          '**/src/lib/debug-utils.ts',
          '**/src/lib/ideamap-utils.ts',
          '**/src/lib/layout-utils.ts',
          '**/src/lib/db-check.js',
          '**/src/lib/db-init.ts',
          // root       // 모든 서브 폴더의 test-utils.ts 파일 제외
          '**/test-utils.ts',       // 모든 서브 폴더의 test-utils.ts 파일 제외
          './*.config.js',
          './*.config.ts',
          './*.config.mjs',
        ],
      },
      // 경로 별칭 설정
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  })
); 