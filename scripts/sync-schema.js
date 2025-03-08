#!/usr/bin/env node

/**
 * 스키마 동기화 스크립트
 * 
 * 이 스크립트는 로컬 SQLite DB와 Supabase PostgreSQL DB 간의
 * 스키마 차이를 확인하고, 사용자 확인 후 Supabase DB를 업데이트합니다.
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// 대화형 명령 처리를 위한 설정
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 프로젝트 루트 경로
const projectRoot = path.resolve(__dirname, '..');

// 환경 로드 함수
function loadEnv(envFile) {
  const envPath = path.join(projectRoot, envFile);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        envVars[key] = value;
      }
    });
    
    return envVars;
  }
  return {};
}

// Supabase 연결 정보 가져오기
const prodEnv = loadEnv('.env.production');
const devEnv = loadEnv('.env.development');

// SQLite 파일 경로 확인
const sqliteFilePath = devEnv.DATABASE_URL ? devEnv.DATABASE_URL.replace('file:', '') : './prisma/dev.db';
const fullSqlitePath = path.join(projectRoot, sqliteFilePath);

// 환경별 스키마 파일 복사
function setupSchemaFiles() {
  try {
    // 프로덕션 환경용 스키마 임시 복사
    const prodSchemaPath = path.join(projectRoot, 'prisma/schema.production.prisma');
    const tempProdSchemaPath = path.join(projectRoot, 'prisma/schema.prod.prisma');
    
    if (fs.existsSync(prodSchemaPath)) {
      fs.copyFileSync(prodSchemaPath, tempProdSchemaPath);
      console.log('프로덕션 환경용 스키마 파일을 임시 복사했습니다.');
    }
    
    return {
      prodSchemaPath: tempProdSchemaPath
    };
  } catch (error) {
    console.error('스키마 파일 설정 중 오류 발생:', error.message);
    return {};
  }
}

// 스키마 차이 확인
function checkSchemaDiff() {
  try {
    // SQLite 데이터베이스 파일이 없는 경우
    if (!fs.existsSync(fullSqlitePath)) {
      console.log('로컬 SQLite 데이터베이스 파일이 존재하지 않습니다. 먼저 로컬 개발 환경을 설정해주세요.');
      return false;
    }

    // 스키마 파일 설정
    const { prodSchemaPath } = setupSchemaFiles();
    
    // 현재 로컬 스키마와 Supabase 스키마 비교
    console.log('로컬 DB와 Supabase DB의 스키마 차이를 확인 중...');
    
    // 개발 및 프로덕션 스키마 비교
    const diffCommand = `cd ${projectRoot} && npx prisma-diff ${fullSqlitePath} ${prodEnv.DATABASE_URL} --script`;
    
    try {
      const diff = execSync(diffCommand, { encoding: 'utf-8' });
      
      if (!diff || diff.trim() === '' || diff.includes('No difference detected')) {
        console.log('스키마 차이가 없습니다.');
        return false;
      }
      
      console.log('다음과 같은 스키마 차이가 감지되었습니다:');
      console.log('------------------------------------------');
      console.log(diff);
      console.log('------------------------------------------');
      return diff;
    } catch (error) {
      console.log('prisma-diff 명령 실행 중 오류 발생. 대체 방법으로 시도합니다.');
      
      // prisma-diff가 설치되지 않은 경우 다른 방법으로 시도
      const altDiffCommand = `cd ${projectRoot} && npx prisma db pull --schema=${prodSchemaPath} --print`;
      const prodSchema = execSync(altDiffCommand, { encoding: 'utf-8' });
      
      return prodSchema ? prodSchema : false;
    }
  } catch (error) {
    console.error('스키마 비교 중 오류 발생:', error.message);
    return false;
  } finally {
    // 임시 파일 정리
    cleanupTempFiles();
  }
}

// 임시 파일 정리
function cleanupTempFiles() {
  const tempProdSchemaPath = path.join(projectRoot, 'prisma/schema.prod.prisma');
  
  if (fs.existsSync(tempProdSchemaPath)) {
    fs.unlinkSync(tempProdSchemaPath);
  }
}

// 스키마 변경사항 저장
function saveSchemaChanges(diff) {
  const migrationDir = path.join(projectRoot, 'prisma/migrations/supabase-sync');
  
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const migrationFile = path.join(migrationDir, `${timestamp}_schema_update.sql`);
  
  fs.writeFileSync(migrationFile, diff);
  console.log(`스키마 변경사항이 ${migrationFile}에 저장되었습니다.`);
  
  return migrationFile;
}

// Supabase에 스키마 적용
async function applySchemaToSupabase(migrationFile) {
  return new Promise((resolve) => {
    rl.question('Supabase DB에 위의 변경사항을 적용하시겠습니까? (y/n) ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        try {
          console.log('Supabase DB에 스키마 변경사항을 적용합니다...');
          
          // 프로덕션 환경용 스키마를 임시로 복사
          fs.copyFileSync(
            path.join(projectRoot, 'prisma/schema.production.prisma'),
            path.join(projectRoot, 'prisma/schema.prisma.bak')
          );
          
          // 기존 스키마 백업
          fs.copyFileSync(
            path.join(projectRoot, 'prisma/schema.prisma'),
            path.join(projectRoot, 'prisma/schema.dev.bak')
          );
          
          // 프로덕션 스키마를 활성 스키마로 설정
          fs.copyFileSync(
            path.join(projectRoot, 'prisma/schema.production.prisma'),
            path.join(projectRoot, 'prisma/schema.prisma')
          );
          
          // Prisma DB push 명령으로 Supabase에 스키마 적용
          const pushCommand = `cd ${projectRoot} && DATABASE_URL="${prodEnv.DATABASE_URL}" DIRECT_URL="${prodEnv.DIRECT_URL}" npx prisma db push --accept-data-loss`;
          
          execSync(pushCommand, { stdio: 'inherit' });
          
          // 원래 스키마 복원
          fs.copyFileSync(
            path.join(projectRoot, 'prisma/schema.dev.bak'),
            path.join(projectRoot, 'prisma/schema.prisma')
          );
          
          // 백업 파일 정리
          fs.unlinkSync(path.join(projectRoot, 'prisma/schema.prisma.bak'));
          fs.unlinkSync(path.join(projectRoot, 'prisma/schema.dev.bak'));
          
          console.log('스키마 적용이 완료되었습니다.');
          resolve(true);
        } catch (error) {
          console.error('스키마 적용 중 오류 발생:', error.message);
          
          // 오류 발생 시 원래 스키마 복원 시도
          try {
            if (fs.existsSync(path.join(projectRoot, 'prisma/schema.dev.bak'))) {
              fs.copyFileSync(
                path.join(projectRoot, 'prisma/schema.dev.bak'),
                path.join(projectRoot, 'prisma/schema.prisma')
              );
              
              // 백업 파일 정리
              fs.unlinkSync(path.join(projectRoot, 'prisma/schema.prisma.bak'));
              fs.unlinkSync(path.join(projectRoot, 'prisma/schema.dev.bak'));
            }
          } catch (cleanupError) {
            console.error('스키마 복원 중 오류 발생:', cleanupError.message);
          }
          
          resolve(false);
        }
      } else {
        console.log('스키마 동기화가 취소되었습니다.');
        resolve(false);
      }
    });
  });
}

// 메인 함수
async function main() {
  console.log('로컬 SQLite DB와 Supabase PostgreSQL DB 간의 스키마 동기화를 시작합니다...');
  
  // 필요한 패키지 설치 확인
  try {
    execSync('npx prisma-diff --help', { stdio: 'ignore' });
  } catch (error) {
    console.log('prisma-diff 패키지를 설치합니다...');
    execSync('npm install --save-dev prisma-diff', { stdio: 'inherit' });
  }
  
  // 스키마 차이 확인
  const diff = checkSchemaDiff();
  
  if (!diff) {
    rl.close();
    return;
  }
  
  // 변경사항 저장
  const migrationFile = saveSchemaChanges(diff);
  
  // 사용자에게 확인 후 적용
  const success = await applySchemaToSupabase(migrationFile);
  
  if (success) {
    console.log('스키마 동기화가 성공적으로 완료되었습니다!');
  }
  
  rl.close();
}

// 스크립트 실행
main(); 