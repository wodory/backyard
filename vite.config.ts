/**
 * 파일명: vite.config.ts
 * 목적: Vite 빌드 도구 설정
 * 역할: 프로젝트의 빌드 및 개발 환경 설정 제공
 * 작성일: 2024-03-31
 * 수정일: 2025-04-11
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}); 