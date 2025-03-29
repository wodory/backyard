/**
 * 파일명: vitest.config.ts
 * 목적: Vitest 테스트 환경 설정
 * 역할: 테스트 실행을 위한 Vite 설정과 통합된 설정 제공
 * 작성일: 2024-03-31
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';
import { loadEnv } from 'vite';
import path from 'path';

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
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: false,
        },
      },
      isolate: true,
      
      // 테스트 파일 패턴 설정
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
      
      // 타입스크립트 설정
      typecheck: {
        enabled: true,
        tsconfig: './tsconfig.json',
      },
      
      // 커버리지 설정
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/tests/setup.ts',
        ],
      },
      
      // 경로 별칭 설정
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  })
); 