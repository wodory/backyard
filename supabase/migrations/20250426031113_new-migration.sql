-- Supabase 초기 셋업용 최종 스키마 정의

-- 1. 사용자 테이블 (Supabase Auth 연동)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.users IS 'Supabase Auth 사용자와 연결된 사용자 기본 정보';

-- 사용자 테이블 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "사용자는 자신의 정보만 조회할 수 있음" ON public.users;
DROP POLICY IF EXISTS "사용자는 자신의 정보만 업데이트할 수 있음" ON public.users;
CREATE POLICY "사용자는 자신의 정보만 조회할 수 있음" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "사용자는 자신의 정보만 업데이트할 수 있음" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. 프로필 테이블
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.profiles IS '사용자 프로필 정보 (이름, 아바타 등)';

-- 프로필 테이블 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "인증된 사용자는 프로필 조회 가능" ON public.profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 생성 가능" ON public.profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 수정 가능" ON public.profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 삭제 가능" ON public.profiles;
CREATE POLICY "인증된 사용자는 프로필 조회 가능" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "사용자는 자신의 프로필만 생성 가능" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "사용자는 자신의 프로필만 수정 가능" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "사용자는 자신의 프로필만 삭제 가능" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- 3. 프로젝트 테이블
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.projects IS '사용자들이 협업하는 프로젝트 단위';

-- 4. 프로젝트 멤버 테이블
CREATE TABLE IF NOT EXISTS public.project_members (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (project_id, user_id)
);
COMMENT ON TABLE public.project_members IS '프로젝트별 참여 멤버 및 역할 정보';

-- 프로젝트 테이블 RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "프로젝트 멤버는 프로젝트 조회 가능" ON public.projects;
DROP POLICY IF EXISTS "프로젝트 소유자만 프로젝트 생성/수정/삭제 가능" ON public.projects;
CREATE POLICY "프로젝트 멤버는 프로젝트 조회 가능" ON public.projects FOR SELECT USING (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()));
CREATE POLICY "프로젝트 소유자만 프로젝트 생성 가능" ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "프로젝트 소유자만 프로젝트 수정 가능" ON public.projects FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "프로젝트 소유자만 프로젝트 삭제 가능" ON public.projects FOR DELETE USING (auth.uid() = owner_id);

-- 프로젝트 멤버 테이블 RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "프로젝트 멤버는 멤버 목록 조회 가능" ON public.project_members;
DROP POLICY IF EXISTS "프로젝트 소유자만 멤버 추가/삭제/수정 가능" ON public.project_members;
CREATE POLICY "프로젝트 멤버는 멤버 목록 조회 가능" ON public.project_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.project_members pm_check WHERE pm_check.project_id = project_members.project_id AND pm_check.user_id = auth.uid()));
CREATE POLICY "프로젝트 소유자만 멤버 추가 가능" ON public.project_members
  FOR INSERT -- INSERT 작업에만 적용
  WITH CHECK ( -- 삽입될 데이터가 이 조건을 만족해야 함
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id AND p.owner_id = auth.uid()
    )
  );
CREATE POLICY "프로젝트 소유자만 멤버 삭제 가능" ON public.project_members FOR DELETE USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_members.project_id AND p.owner_id = auth.uid()));
CREATE POLICY "프로젝트 소유자만 멤버 수정 가능" ON public.project_members FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_members.project_id AND p.owner_id = auth.uid()));

-- 5. 카드 테이블
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.cards IS '프로젝트 내의 카드 데이터';

-- 카드 테이블 RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "프로젝트 멤버는 카드 조회 가능" ON public.cards;
DROP POLICY IF EXISTS "카드 생성자만 카드 수정/삭제 가능" ON public.cards;
DROP POLICY IF EXISTS "프로젝트 멤버는 카드 생성 가능" ON public.cards;
CREATE POLICY "프로젝트 멤버는 카드 조회 가능" ON public.cards FOR SELECT USING (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = cards.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "프로젝트 멤버는 카드 생성 가능" ON public.cards FOR INSERT WITH CHECK (cards.user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = cards.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "카드 생성자만 카드 수정 가능" ON public.cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "카드 생성자만 카드 삭제 가능" ON public.cards FOR DELETE USING (auth.uid() = user_id);

-- 6. 태그 테이블
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (project_id, name)
);
COMMENT ON TABLE public.tags IS '프로젝트 내 카드에 사용될 태그 목록';

-- 태그 테이블 RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "프로젝트 멤버는 태그 조회 가능" ON public.tags;
DROP POLICY IF EXISTS "태그 생성자만 태그 수정/삭제 가능" ON public.tags;
DROP POLICY IF EXISTS "프로젝트 멤버는 태그 생성 가능" ON public.tags;
CREATE POLICY "프로젝트 멤버는 태그 조회 가능" ON public.tags FOR SELECT USING (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = tags.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "프로젝트 멤버는 태그 생성 가능" ON public.tags FOR INSERT WITH CHECK (tags.user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = tags.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "태그 생성자만 태그 수정 가능" ON public.tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "태그 생성자만 태그 삭제 가능" ON public.tags FOR DELETE USING (auth.uid() = user_id);

-- 7. Edges 테이블
CREATE TABLE IF NOT EXISTS public.edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  source_handle TEXT,
  target_handle TEXT,
  type TEXT,
  animated BOOLEAN DEFAULT FALSE,
  style JSONB,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.edges IS '프로젝트 내 노드(카드 등) 간의 연결 정보';

-- Edges 테이블 RLS
ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "프로젝트 멤버는 엣지 조회 가능" ON public.edges;
DROP POLICY IF EXISTS "엣지 생성자만 엣지 수정/삭제 가능" ON public.edges;
DROP POLICY IF EXISTS "프로젝트 멤버는 엣지 생성 가능" ON public.edges;
CREATE POLICY "프로젝트 멤버는 엣지 조회 가능" ON public.edges FOR SELECT USING (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = edges.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "프로젝트 멤버는 엣지 생성 가능" ON public.edges FOR INSERT WITH CHECK (edges.user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = edges.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "엣지 생성자만 엣지 수정 가능" ON public.edges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "엣지 생성자만 엣지 삭제 가능" ON public.edges FOR DELETE USING (auth.uid() = user_id);

-- 8. 카드-태그 연결 테이블
CREATE TABLE IF NOT EXISTS public.card_tags (
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (card_id, tag_id)
);
COMMENT ON TABLE public.card_tags IS '카드와 태그의 다대다 관계 연결 테이블';

-- 카드-태그 연결 테이블 RLS
ALTER TABLE public.card_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "카드 조회 가능 사용자는 연결 조회 가능" ON public.card_tags;
DROP POLICY IF EXISTS "카드 소유자만 태그 연결/해제 가능" ON public.card_tags;
CREATE POLICY "카드 조회 가능 사용자는 연결 조회 가능" ON public.card_tags FOR SELECT USING (EXISTS (SELECT 1 FROM public.cards c JOIN public.project_members pm ON c.project_id = pm.project_id WHERE c.id = card_tags.card_id AND pm.user_id = auth.uid()));
CREATE POLICY "카드 소유자만 태그 연결 가능" ON public.card_tags
  FOR INSERT -- INSERT 작업에만 적용
  WITH CHECK ( -- 삽입될 데이터가 이 조건을 만족해야 함 (USING 대신 WITH CHECK 사용)
    EXISTS (
      SELECT 1 FROM public.cards c
      WHERE c.id = card_tags.card_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "카드 소유자만 태그 해제 가능" ON public.card_tags FOR DELETE USING (EXISTS (SELECT 1 FROM public.cards c WHERE c.id = card_tags.card_id AND c.user_id = auth.uid()));

-- 9. 보드 설정 테이블
CREATE TABLE IF NOT EXISTS public.board_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.board_settings IS '사용자 개인별 보드 레이아웃 등 설정 정보';

-- 보드 설정 테이블 RLS
ALTER TABLE public.board_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "사용자는 자신의 보드 설정만 조회할 수 있음" ON public.board_settings;
DROP POLICY IF EXISTS "사용자는 자신의 보드 설정만 생성/수정/삭제 가능" ON public.board_settings;
CREATE POLICY "사용자는 자신의 보드 설정만 조회할 수 있음" ON public.board_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 보드 설정만 생성/수정/삭제 가능" ON public.board_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. 트리거 함수 (업데이트 시간 자동 갱신)
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION public.update_modified_column() IS '행 업데이트 시 updated_at 컬럼을 현재 시간으로 자동 갱신하는 트리거 함수';

-- 11. 각 테이블에 트리거 적용
DROP TRIGGER IF EXISTS update_users_modtime ON public.users;
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_projects_modtime ON public.projects;
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_cards_modtime ON public.cards;
CREATE TRIGGER update_cards_modtime BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_tags_modtime ON public.tags;
CREATE TRIGGER update_tags_modtime BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_edges_modtime ON public.edges;
CREATE TRIGGER update_edges_modtime BEFORE UPDATE ON public.edges FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_board_settings_modtime ON public.board_settings;
CREATE TRIGGER update_board_settings_modtime BEFORE UPDATE ON public.board_settings FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- (선택) 프로젝트 생성 시 소유자 자동 멤버 추가 트리거
-- CREATE OR REPLACE FUNCTION public.handle_new_project()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.project_members (project_id, user_id, role)
--   VALUES (NEW.id, NEW.owner_id, 'owner');
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- DROP TRIGGER IF EXISTS on_project_created ON public.projects;
-- CREATE TRIGGER on_project_created AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();

-- (선택) 사용자 생성 시 프로필 자동 생성 트리거
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- raw_user_meta_data 필드는 JSON 타입이므로 ->> 연산자 사용
--   INSERT INTO public.profiles (id, username, full_name, avatar_url)
--   VALUES (
--     NEW.id,
--     NEW.raw_user_meta_data->>'username', -- 가입 시 메타데이터로 전달된 값 사용 예시
--     NEW.raw_user_meta_data->>'full_name',
--     NEW.raw_user_meta_data->>'avatar_url'
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();