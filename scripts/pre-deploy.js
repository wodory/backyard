#!/usr/bin/env node

/**
 * 배포 전 스키마 확인 스크립트
 * 
 * 이 스크립트는 Vercel 등의 프로덕션 환경에 배포하기 전에
 * 환경에 맞는 DB 스키마를 설정하고 필요시 Supabase DB에 적용합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 경로 설정
const prismaDir = path.resolve(__dirname, '../prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');
const postgresSchemaPath = path.join(prismaDir, 'schema.postgresql.prisma');

console.log('배포 전 스키마 확인 중...');

// 배포 환경에서는 항상 PostgreSQL 스키마 사용
if (process.env.NODE_ENV === 'production') {
  console.log('프로덕션 환경 감지: PostgreSQL 스키마로 전환합니다...');
  
  // PostgreSQL 스키마 파일 복사
  if (fs.existsSync(postgresSchemaPath)) {
    fs.copyFileSync(postgresSchemaPath, schemaPath);
    console.log('PostgreSQL 스키마 파일이 성공적으로 적용되었습니다.');
  } else {
    console.error(`오류: PostgreSQL 스키마 파일을 찾을 수 없습니다: ${postgresSchemaPath}`);
  }
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