#!/usr/bin/env node

/**
 * 배포 전 스키마 확인 스크립트
 * 
 * 이 스크립트는 Vercel 등의 프로덕션 환경에 배포하기 전에
 * 로컬 DB 스키마 변경사항을 확인하고 Supabase DB에 적용할지 결정합니다.
 */

const { execSync } = require('child_process');
const path = require('path');

// 스키마 동기화 스크립트 경로
const syncScriptPath = path.resolve(__dirname, 'sync-schema.js');

console.log('배포 전 스키마 확인 중...');
console.log('현재 로컬 DB의 스키마 변경사항을 프로덕션 Supabase DB에 반영할지 여부를 결정합니다.');
console.log('');

// 스키마 동기화 스크립트 실행
try {
  execSync(`node ${syncScriptPath}`, { stdio: 'inherit' });
  console.log('');
  console.log('스키마 확인 및 처리가 완료되었습니다.');
  console.log('배포를 계속 진행합니다...');
  process.exit(0);
} catch (error) {
  console.error('스키마 확인 중 오류 발생:', error.message);
  console.log('스키마 업데이트를 건너뛰고 배포를 계속합니다.');
  process.exit(0); // 오류가 있어도 배포는 계속 진행
} 