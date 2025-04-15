#!/usr/bin/env node

/**
 * 배포 전 환경 설정 스크립트
 * 
 * 이 스크립트는 Vercel 등의 프로덕션 환경에 배포하기 전에
 * 환경 파일을 확인하고 필요한 설정을 적용합니다.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('배포 전 환경 설정 확인 중...');

// 기본 필수 환경 변수 목록
let requiredEnvVars = [
  'DATABASE_PROVIDER',
  'DATABASE_URL'
];

// 데이터베이스 프로바이더에 따라 추가 변수 검증
if (process.env.DATABASE_PROVIDER === 'postgresql') {
  requiredEnvVars.push('DIRECT_URL');
  requiredEnvVars.push('NEXT_PUBLIC_SUPABASE_URL');
  requiredEnvVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('NEXT_PUBLIC_OAUTH_REDIRECT_URL');
  }
}

// 환경 변수 검증
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ 누락된 환경 변수가 있습니다:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  process.exit(1);
}

console.log('✅ 모든 필수 환경 변수가 설정되어 있습니다.');

// 프로덕션 환경 확인
if (process.env.NODE_ENV === 'production') {
  console.log('프로덕션 환경 감지: 설정을 확인합니다...');

  if (process.env.DATABASE_PROVIDER !== 'postgresql') {
    console.error('❌ 프로덕션 환경에서는 DATABASE_PROVIDER가 postgresql이어야 합니다.');
    process.exit(1);
  }

  if (process.env.DATABASE_PROVIDER === 'postgresql' && !process.env.DATABASE_URL.includes('supabase.co')) {
    console.error('❌ 프로덕션 환경에서 DATABASE_URL이 Supabase 연결 문자열이 아닙니다.');
    process.exit(1);
  }
}

console.log('✅ 환경 설정 확인 완료');

// Prisma 클라이언트 생성
console.log('Prisma 클라이언트를 생성합니다...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma 클라이언트가 생성되었습니다.');
} catch (error) {
  console.error(`⚠️ Prisma 클라이언트 생성 중 오류가 발생했습니다: ${error.message}`);
  console.error('하지만 배포 과정을 계속 진행합니다.');
} 