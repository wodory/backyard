#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 환경 확인
const isProduction = process.env.NODE_ENV === 'production';
const dbType = isProduction ? 'postgresql' : 'sqlite';

// 경로 설정
const basePath = path.join(__dirname, '../prisma');
const schemaPath = path.join(basePath, 'schema.prisma');
const sourceSchemaPath = path.join(basePath, `schema.${dbType}.prisma`);

console.log(`환경: ${isProduction ? '프로덕션' : '개발'}`);
console.log(`데이터베이스: ${dbType}`);
console.log(`소스 스키마: ${sourceSchemaPath}`);
console.log(`타겟 스키마: ${schemaPath}`);

// 파일 복사
try {
  // 소스 파일 존재 확인
  if (!fs.existsSync(sourceSchemaPath)) {
    console.error(`오류: 소스 스키마 파일을 찾을 수 없습니다: ${sourceSchemaPath}`);
    process.exit(1);
  }

  // 파일 복사
  fs.copyFileSync(sourceSchemaPath, schemaPath);
  console.log(`✅ 성공: ${dbType} 스키마를 복사했습니다.`);

  // Prisma 생성 명령어 안내
  console.log('이제 다음 명령어를 실행하세요: npx prisma generate');
} catch (error) {
  console.error(`❌ 오류 발생: ${error.message}`);
  process.exit(1);
} 