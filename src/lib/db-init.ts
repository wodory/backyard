/**
 * 파일명: db-init.ts
 * 목적: 데이터베이스 초기화 및 테이블 생성
 * 역할: 애플리케이션 시작 시 필요한 데이터베이스 구조 설정
 * 작성일: 2025-03-08
 * 수정일: 2025-04-09
 */

import { createClient } from './supabase/server';
import { PrismaClient } from '@prisma/client';

// 테이블 정의 및 생성 SQL
const tableDefinitions = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  cards: `
    CREATE TABLE IF NOT EXISTS cards (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      content TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
  `,
  tags: `
    CREATE TABLE IF NOT EXISTS tags (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  card_tags: `
    CREATE TABLE IF NOT EXISTS card_tags (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(card_id, tag_id)
    );
  `,
  board_settings: `
    CREATE TABLE IF NOT EXISTS board_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      settings JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `
};

// RLS 정책 설정 SQL
const rlsPolicies = {
  users: `
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    -- 사용자는 자신의 정보만 볼 수 있음
    CREATE POLICY "사용자는 자신의 정보만 볼 수 있음" ON users
      FOR SELECT
      USING (auth.uid() = id);
      
    -- 사용자는 자신의 정보만 업데이트할 수 있음
    CREATE POLICY "사용자는 자신의 정보만 업데이트할 수 있음" ON users
      FOR UPDATE
      USING (auth.uid() = id);
  `,
  cards: `
    ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
    
    -- 모든 사용자가 카드를 볼 수 있음
    CREATE POLICY "모든 사용자가 카드를 볼 수 있음" ON cards
      FOR SELECT
      USING (true);
      
    -- 카드 소유자만 카드를 수정할 수 있음
    CREATE POLICY "카드 소유자만 카드를 수정할 수 있음" ON cards
      FOR UPDATE
      USING (auth.uid() = user_id);
      
    -- 카드 소유자만 카드를 삭제할 수 있음
    CREATE POLICY "카드 소유자만 카드를 삭제할 수 있음" ON cards
      FOR DELETE
      USING (auth.uid() = user_id);
      
    -- 인증된 사용자만 카드를 생성할 수 있음
    CREATE POLICY "인증된 사용자만 카드를 생성할 수 있음" ON cards
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  `,
  tags: `
    ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
    
    -- 모든 사용자가 태그를 볼 수 있음
    CREATE POLICY "모든 사용자가 태그를 볼 수 있음" ON tags
      FOR SELECT
      USING (true);
      
    -- 인증된 사용자만 태그를 생성할 수 있음
    CREATE POLICY "인증된 사용자만 태그를 생성할 수 있음" ON tags
      FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  `,
  card_tags: `
    ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
    
    -- 모든 사용자가 카드 태그를 볼 수 있음
    CREATE POLICY "모든 사용자가 카드 태그를 볼 수 있음" ON card_tags
      FOR SELECT
      USING (true);
      
    -- 카드 소유자만 카드 태그를 수정할 수 있음
    CREATE POLICY "카드 소유자만 카드 태그를 수정할 수 있음" ON card_tags
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM cards
          WHERE cards.id = card_id AND cards.user_id = auth.uid()
        )
      );
  `,
  board_settings: `
    ALTER TABLE board_settings ENABLE ROW LEVEL SECURITY;
    
    -- 사용자는 자신의 보드 설정만 볼 수 있음
    CREATE POLICY "사용자는 자신의 보드 설정만 볼 수 있음" ON board_settings
      FOR SELECT
      USING (auth.uid() = user_id);
      
    -- 사용자는 자신의 보드 설정만 수정할 수 있음
    CREATE POLICY "사용자는 자신의 보드 설정만 수정할 수 있음" ON board_settings
      FOR ALL
      USING (auth.uid() = user_id);
  `
};

/**
 * 특정 테이블이 존재하는지 확인
 */
async function tableExists(supabase: any, tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_table_exists', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`테이블 존재 여부 확인 오류:`, error);
      
      // RPC 함수가 없을 수 있으므로, 대체 방법으로 시도
      const { data: tableData, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
      
      if (tableError) {
        console.error(`대체 방법으로 테이블 존재 여부 확인 오류:`, tableError);
        return false;
      }
      
      return tableData && tableData.length > 0;
    }
    
    return data;
  } catch (error) {
    console.error(`테이블 존재 여부 확인 중 오류 발생:`, error);
    return false;
  }
}

/**
 * check_table_exists RPC 함수 생성
 */
async function createCheckTableExistsFunction(supabase: any): Promise<void> {
  try {
    const { error } = await supabase.rpc('create_check_table_exists_function', {});
    
    if (error) {
      // 함수가 이미 존재할 수 있으므로, SQL 쿼리로 직접 생성 시도
      const { error: sqlError } = await supabase.sql(`
        CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
        RETURNS BOOLEAN AS $$
        DECLARE
          exists BOOLEAN;
        BEGIN
          SELECT INTO exists 
            COUNT(*) > 0 
          FROM 
            information_schema.tables 
          WHERE 
            table_schema = 'public' 
            AND table_name = check_table_exists.table_name;
          
          RETURN exists;
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      if (sqlError) {
        console.error(`check_table_exists 함수 생성 오류:`, sqlError);
      }
    }
  } catch (error) {
    console.error(`check_table_exists 함수 생성 중 오류 발생:`, error);
  }
}

/**
 * 테이블 생성 및 초기화 함수
 */
async function createTablesIfNotExist(): Promise<void> {
  const prisma = new PrismaClient();
  
  try {
    console.log('Prisma 클라이언트를 사용하여 데이터베이스 초기화를 시작합니다...');
    
    // Prisma를 통한 사용자 테이블 존재 여부 및 생성
    try {
      // 간단한 쿼리로 테이블 존재 여부 확인
      await prisma.user.findFirst();
      console.log('사용자 테이블이 이미 존재합니다.');
    } catch (error) {
      console.log('사용자 테이블이 없습니다. Prisma 마이그레이션이 필요합니다.');
      // 여기서는 Prisma 스키마가 이미 설정되어 있다고 가정하고
      // 실제 테이블 생성은 별도의 마이그레이션 명령어를 통해 수행해야 합니다.
      // npx prisma db push 등의 명령어를 사용해야 합니다.
    }
    
    console.log('데이터베이스 초기화 검사 완료');
  } catch (error) {
    console.error('테이블 생성 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 데이터베이스 초기화 함수
 * Next.js 앱 시작 시 호출
 */
export async function initDatabase(): Promise<void> {
  try {
    console.log('데이터베이스 초기화 시작...');
    await createTablesIfNotExist();
    
    // Prisma를 사용하여 기본 사용자 생성
    const prisma = new PrismaClient();
    try {
      // 기본 사용자가 있는지 확인
      const defaultUser = await prisma.user.findFirst();
      
      // 사용자가 없으면 생성
      if (!defaultUser) {
        const newUser = await prisma.user.create({
          data: {
            email: 'test@example.com',
            name: '테스트 사용자'
          }
        });
        console.log('기본 사용자 생성 완료:', newUser.id);
      } else {
        console.log('기존 사용자 ID 확인:', defaultUser.id);
      }
    } catch (error) {
      console.error('기본 사용자 생성 중 오류:', error);
    } finally {
      await prisma.$disconnect();
    }
    
    console.log('데이터베이스 초기화 완료');
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류 발생:', error);
  }
}

/**
 * Prisma 클라이언트를 통해 테이블 존재 여부 확인
 * 이 함수는 Prisma 연결이 가능한 환경에서만 사용
 */
export async function checkTablesWithPrisma(): Promise<boolean> {
  try {
    const prisma = new PrismaClient();
    
    // 간단한 쿼리를 실행하여 테이블 존재 여부 확인
    await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`;
    await prisma.$disconnect();
    
    return true;
  } catch (error) {
    console.error('Prisma를 통한 테이블 확인 오류:', error);
    return false;
  }
} 