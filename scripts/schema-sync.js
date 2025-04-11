#!/usr/bin/env node

/**
 * Prisma 스키마 동기화 스크립트
 * 
 * 이 스크립트는 마스터 템플릿에서 각 환경별 스키마를 생성합니다.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 경로 설정
const basePath = path.join(__dirname, '../prisma');
const masterSchemaPath = path.join(basePath, 'schema.master.prisma');
const sqliteSchemaPath = path.join(basePath, 'schema.sqlite.prisma');
const postgresSchemaPath = path.join(basePath, 'schema.postgresql.prisma');

console.log('Prisma 스키마 동기화를 시작합니다...');

// 마스터 스키마 파일 확인
if (!fs.existsSync(masterSchemaPath)) {
  console.log('마스터 스키마 파일이 없습니다. 현재 schema.prisma를 마스터로 사용합니다.');
  const currentSchemaPath = path.join(basePath, 'schema.prisma');
  if (fs.existsSync(currentSchemaPath)) {
    fs.copyFileSync(currentSchemaPath, masterSchemaPath);
    console.log(`현재 스키마를 마스터 템플릿으로 복사했습니다: ${masterSchemaPath}`);
  } else {
    console.error('오류: 현재 스키마 파일도 찾을 수 없습니다!');
    process.exit(1);
  }
}

// 마스터 스키마 읽기
console.log(`마스터 스키마 파일 읽기: ${masterSchemaPath}`);
const masterSchema = fs.readFileSync(masterSchemaPath, 'utf8');

// SQLite 스키마 생성
const sqliteSchema = masterSchema
  .replace(/provider(\s*)=(\s*)"postgresql"/g, 'provider$1=$2"sqlite"')
  .replace(/directUrl(\s*)=(\s*)env\("DIRECT_URL"\)/g, '')
  .replace(/extensions(\s*)=(\s*)\[.*?\]/g, '')
  .replace(/\/\/ This is your Prisma schema file for.*?,/g, '// This is your Prisma schema file for SQLite,');

// PostgreSQL 스키마 생성
const postgresSchema = masterSchema
  .replace(/provider(\s*)=(\s*)"sqlite"/g, 'provider$1=$2"postgresql"')
  .replace(/\/\/ This is your Prisma schema file for.*?,/g, '// This is your Prisma schema file for PostgreSQL,');

// 생성된 스키마 파일 저장
fs.writeFileSync(sqliteSchemaPath, sqliteSchema);
console.log(`SQLite 스키마 파일이 생성되었습니다: ${sqliteSchemaPath}`);

fs.writeFileSync(postgresSchemaPath, postgresSchema);
console.log(`PostgreSQL 스키마 파일이 생성되었습니다: ${postgresSchemaPath}`);

console.log('스키마 동기화가 완료되었습니다.');
console.log('이제 환경에 맞는 스키마를 적용하려면 다음 명령을 실행하세요:');
console.log('- 개발 환경: yarn db:setup:dev');
console.log('- 프로덕션 환경: yarn db:setup:prod');

