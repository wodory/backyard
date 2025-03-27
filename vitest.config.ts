/**
 * 파일명: vitest.config.ts
 * 목적: Vitest 테스트 프레임워크 설정
 * 역할: 테스트 환경, 경로 별칭, 변환기 등의 설정 제공
 * 작성일: 2024-03-26
 */

import { defineConfig } from 'vitest/config';
// @ts-ignore - 타입 문제 해결
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    testTransformMode: {
      web: ['.jsx', '.js', '.tsx', '.ts'],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        'test/**',
        'src/tests/**',
      ],
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default', 'json'],
    outputFile: {
      json: './src/tests/results/test-results.json',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/lib': resolve(__dirname, 'src/lib'),
      '@/app': resolve(__dirname, 'src/app'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/hooks': resolve(__dirname, 'src/hooks')
    }
  }
}); 