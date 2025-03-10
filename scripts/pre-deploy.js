#!/usr/bin/env node

/**
 * 배포 전 환경 설정 스크립트
 * 
 * 이 스크립트는 Vercel 등의 프로덕션 환경에 배포하기 전에
 * 환경 파일을 확인하고 필요한 설정을 적용합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('배포 전 환경 확인 중...');

// 환경 변수 확인
const requiredEnvVars = [
  'DATABASE_PROVIDER',
  'DATABASE_URL'
];

// 프로덕션 환경 변수 확인
if (process.env.NODE_ENV === 'production') {
  console.log('프로덕션 환경 감지: 환경 변수를 확인합니다...');
  
  const missingVars = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    console.warn(`경고: 다음 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}`);
    console.log('Vercel 대시보드에서 이러한 환경 변수를 설정했는지 확인하세요.');
  } else {
    console.log('모든 필수 환경 변수가 설정되었습니다.');
  }

  // 프로덕션 환경의 데이터베이스 공급자 확인
  console.log(`사용 중인 데이터베이스 공급자: ${process.env.DATABASE_PROVIDER || '미설정'}`);
}

// Prisma 생성
try {
  console.log('Prisma 클라이언트를 생성합니다...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma 클라이언트가 성공적으로 생성되었습니다.');
  process.exit(0);
} catch (error) {
  console.error('Prisma 클라이언트 생성 중 오류 발생:', error.message);
  console.log('오류가 있지만 배포를 계속 진행합니다.');
  process.exit(0); // 오류가 있어도 배포는 계속 진행
} 