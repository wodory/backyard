/**
 * 파일명: vite.config.ts
 * 목적: Vite 빌드 도구 설정
 * 역할: 프로젝트의 빌드 및 개발 환경 설정 제공
 * 작성일: 2024-03-31
 * 수정일: 2025-03-30
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}); 