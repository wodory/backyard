/**
 * 파일명: scripts/migrateEdgesToDB.ts
 * 목적: 로컬 스토리지에 저장된 엣지 데이터를 Supabase DB로 마이그레이션
 * 사용법: `ts-node scripts/migrateEdgesToDB.ts {USER_ID}`
 * 작성일: 2024-07-01
 */

import { createClient } from '@supabase/supabase-js';
import { EdgeInput } from '../src/types/edge';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM 환경에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
dotenv.config({ path: '.env.local' });
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// 서비스 롤 키 직접 설정
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZGFydHBqanJrd2dmZWpxbnNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQxMTY1MCwiZXhwIjoyMDU2OTg3NjUwfQ.eApC6IHYxp6Yv4_x7U61INEHcR1RN8aXKRQ4btkrh9s';

console.log('환경 변수 확인:');
console.log('SUPABASE_URL:', SUPABASE_URL ? '설정됨' : '없음');
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '설정됨' : '없음');
console.log('SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '설정됨' : '없음');

// Supabase 클라이언트 초기화 (서비스 롤 키 사용)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

// 로컬 스토리지 키 상수
const IDEAMAP_EDGES_STORAGE_KEY = 'ideamap-edges';

async function migrateEdgesToDB() {
  try {
    // 커맨드 라인 인자에서 사용자 ID 가져오기
    const userId = process.argv[2];
    if (!userId) {
      console.error('사용자 ID를 지정해주세요: ts-node scripts/migrateEdgesToDB.ts {USER_ID}');
      process.exit(1);
    }
    
    // 로컬 스토리지 모방: 같은 폴더에 저장된 JSON 파일 읽기
    const storagePath = path.join(__dirname, 'localStorage.json');
    
    if (!fs.existsSync(storagePath)) {
      console.error('localStorage.json 파일을 찾을 수 없습니다.');
      console.log('현재 디렉토리에 localStorage.json 파일을 생성해주세요.');
      console.log('파일 형식: { "ideamap-edges": "[{...엣지 데이터...}]" }');
      process.exit(1);
    }
    
    const storageData = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
    const edgesData = storageData[IDEAMAP_EDGES_STORAGE_KEY];
    
    if (!edgesData) {
      console.log('마이그레이션할 엣지 데이터가 없습니다.');
      process.exit(0);
    }
    
    const edges = JSON.parse(edgesData);
    console.log(`로컬에서 ${edges.length}개의 엣지를 찾았습니다.`);
    
    // 엣지 데이터를 DB 형식으로 변환
    const edgesToInsert = edges.map((edge: any) => ({
      source: edge.source,
      target: edge.target,
      source_handle: edge.sourceHandle,
      target_handle: edge.targetHandle,
      type: edge.type || 'default',
      animated: edge.animated || false,
      style: edge.style || {},
      data: edge.data || {},
      user_id: userId
    }));
    
    // 일괄 삽입
    try {
      const result = await supabase
        .from('edges')
        .insert(edgesToInsert)
        .select();
        
      if (result.error) {
        console.error('Supabase 삽입 오류:', result.error);
        console.error('오류 세부 정보:', JSON.stringify(result.error, null, 2));
        console.error('오류 상태:', result.status);
        process.exit(1);
      }
      
      console.log(`${result.data?.length || 0}개의 엣지를 DB로 성공적으로 마이그레이션했습니다.`);
    } catch (dbError) {
      console.error('Supabase 데이터베이스 요청 실패:', dbError);
      process.exit(1);
    }
    
    // 선택적: 로컬 백업 생성
    const backupPath = path.join(
      __dirname, 
      `localStorage_edges_backup_${new Date().toISOString().replace(/:/g, '-')}.json`
    );
    fs.writeFileSync(backupPath, edgesData);
    console.log(`로컬 데이터 백업이 생성되었습니다: ${backupPath}`);
    
  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
migrateEdgesToDB(); 