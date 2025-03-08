-- Supabase 스키마 정의

-- 사용자 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 테이블 정책 (RLS - Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 정보만 조회할 수 있음" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "사용자는 자신의 정보만 업데이트할 수 있음" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 카드 테이블
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카드 테이블 정책 (RLS)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 모든 카드를 조회할 수 있음" ON cards
  FOR SELECT USING (true);
CREATE POLICY "사용자는 자신의 카드만 생성/수정/삭제할 수 있음" ON cards
  FOR ALL USING (auth.uid() = user_id);

-- 태그 테이블
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 태그 테이블 정책 (RLS)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 모든 태그를 조회할 수 있음" ON tags
  FOR SELECT USING (true);
CREATE POLICY "인증된 사용자는 태그를 생성할 수 있음" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "인증된 사용자는 태그를 수정할 수 있음" ON tags
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "인증된 사용자는 태그를 삭제할 수 있음" ON tags
  FOR DELETE USING (auth.role() = 'authenticated');

-- 카드-태그 연결 테이블
CREATE TABLE IF NOT EXISTS card_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id, tag_id)
);

-- 카드-태그 연결 테이블 정책 (RLS)
ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 모든 카드-태그 연결을 조회할 수 있음" ON card_tags
  FOR SELECT USING (true);
CREATE POLICY "사용자는 자신의 카드에만 태그를 연결할 수 있음" ON card_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_id AND cards.user_id = auth.uid()
    )
  );
CREATE POLICY "사용자는 자신의 카드에서만 태그 연결을 삭제할 수 있음" ON card_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_id AND cards.user_id = auth.uid()
    )
  );

-- 보드 설정 테이블
CREATE TABLE IF NOT EXISTS board_settings (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 보드 설정 테이블 정책 (RLS)
ALTER TABLE board_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 보드 설정만 조회할 수 있음" ON board_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 보드 설정만 생성/수정할 수 있음" ON board_settings
  FOR ALL USING (auth.uid() = user_id);

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