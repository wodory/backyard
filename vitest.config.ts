import { defineConfig } from 'vitest/config';
// @ts-ignore - 타입 문제 해결
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './src/setupTests.ts')],
    include: ['**/*.test.{ts,tsx}'],
    globals: true,
    server: {
      deps: {
        inline: [
          '@testing-library/jest-dom',
          '@testing-library/user-event',
          '@testing-library/react'
        ]
      }
    },
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        '**/.next/**',
        '**/scripts/**',
        '**/eslint.config.mjs',
        '**/next.config.ts',
        '**/postcss.config.mjs',
        '**/next-env.d.ts',
        '**/vitest.config.ts',
        '**/src/components/ui/**', // shadcn UI 컴포넌트 제외
        '**/jest.setup.js',
        '**/jest.config.js',
        '**/tailwind.config.js',
        '**/src/lib/prisma.ts' // Prisma 클라이언트 설정 파일 제외
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: true,
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/hooks': path.resolve(__dirname, 'src/hooks')
    }
  }
}); 