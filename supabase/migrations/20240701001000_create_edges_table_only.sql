-- edges 테이블 생성
CREATE TABLE IF NOT EXISTS edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  source_handle TEXT,
  target_handle TEXT,
  type TEXT NOT NULL DEFAULT 'default',
  animated BOOLEAN NOT NULL DEFAULT false,
  style JSONB,
  data JSONB,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 외래 키 추가
ALTER TABLE edges
  ADD CONSTRAINT edges_source_fkey FOREIGN KEY (source) REFERENCES cards(id) ON DELETE CASCADE,
  ADD CONSTRAINT edges_target_fkey FOREIGN KEY (target) REFERENCES cards(id) ON DELETE CASCADE;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);
CREATE INDEX IF NOT EXISTS idx_edges_user_id ON edges(user_id);

-- RLS 설정
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- 누구나 조회 가능 (카드처럼)
CREATE POLICY "모든 사용자가 엣지를 볼 수 있음" ON edges
  FOR SELECT USING (true);

-- 소유자만 생성/수정/삭제 가능
CREATE POLICY "인증된 사용자만 엣지를 생성할 수 있음" ON edges
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "소유자만 엣지를 수정할 수 있음" ON edges
  FOR UPDATE USING (auth.uid()::TEXT = user_id);

CREATE POLICY "소유자만 엣지를 삭제할 수 있음" ON edges
  FOR DELETE USING (auth.uid()::TEXT = user_id);

-- 트리거: 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_edges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER edges_updated_at
BEFORE UPDATE ON edges
FOR EACH ROW
EXECUTE FUNCTION update_edges_updated_at(); 