-- PostgreSQL 확장 활성화
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 테이블 생성 순서 중요: 참조 관계 때문에 순서대로 생성해야 함

-- 사용자 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카드 테이블
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 태그 테이블
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카드-태그 연결 테이블
CREATE TABLE IF NOT EXISTS card_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id, tag_id)
);

-- 보드 설정 테이블
CREATE TABLE IF NOT EXISTS board_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 트리거 함수: 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_modtime
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_cards_modtime
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tags_modtime
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_board_settings_modtime
  BEFORE UPDATE ON board_settings
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS (Row Level Security) 정책 설정

-- 테이블 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_settings ENABLE ROW LEVEL SECURITY;

-- 사용자 테이블 정책
CREATE POLICY "사용자는 자신의 정보만 조회할 수 있음" ON users
  FOR SELECT USING (auth.uid()::TEXT = id);
CREATE POLICY "사용자는 자신의 정보만 업데이트할 수 있음" ON users
  FOR UPDATE USING (auth.uid()::TEXT = id);

-- 카드 테이블 정책
CREATE POLICY "모든 인증된 사용자는 카드를 조회할 수 있음" ON cards
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "사용자는 자신의 카드만 생성할 수 있음" ON cards
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "사용자는 자신의 카드만 업데이트할 수 있음" ON cards
  FOR UPDATE USING (auth.uid()::TEXT = user_id);
CREATE POLICY "사용자는 자신의 카드만 삭제할 수 있음" ON cards
  FOR DELETE USING (auth.uid()::TEXT = user_id);

-- 태그 테이블 정책
CREATE POLICY "모든 인증된 사용자는 태그를 조회할 수 있음" ON tags
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "인증된 사용자는 태그를 생성할 수 있음" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- 태그 업데이트 및 삭제는 관리자만 가능하도록 설정할 수도 있음

-- 카드-태그 연결 테이블 정책
CREATE POLICY "인증된 사용자는 카드-태그 연결을 조회할 수 있음" ON card_tags
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "사용자는 자신의 카드에만 태그를 연결할 수 있음" ON card_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_id AND cards.user_id = auth.uid()::TEXT
    )
  );
CREATE POLICY "사용자는 자신의 카드에서만 태그 연결을 삭제할 수 있음" ON card_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_id AND cards.user_id = auth.uid()::TEXT
    )
  );

-- 보드 설정 테이블 정책
CREATE POLICY "사용자는 자신의 보드 설정만 조회할 수 있음" ON board_settings
  FOR SELECT USING (auth.uid()::TEXT = user_id);
CREATE POLICY "사용자는 자신의 보드 설정만 생성할 수 있음" ON board_settings
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "사용자는 자신의 보드 설정만 업데이트할 수 있음" ON board_settings
  FOR UPDATE USING (auth.uid()::TEXT = user_id);
CREATE POLICY "사용자는 자신의 보드 설정만 삭제할 수 있음" ON board_settings
  FOR DELETE USING (auth.uid()::TEXT = user_id); 