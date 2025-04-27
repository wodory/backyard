-- 모든 테이블의 RLS 정책 제거 스크립트

-- 1. users 테이블
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "사용자는 자신의 정보만 조회할 수 있음" ON public.users;
DROP POLICY IF EXISTS "사용자는 자신의 정보만 업데이트할 수 있음" ON public.users;

-- 2. profiles 테이블
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "인증된 사용자는 프로필 조회 가능" ON public.profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 생성 가능" ON public.profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 수정 가능" ON public.profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 삭제 가능" ON public.profiles;

-- 3. projects 테이블
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "프로젝트 멤버는 프로젝트 조회 가능" ON public.projects;
DROP POLICY IF EXISTS "프로젝트 소유자만 프로젝트 생성/수정/삭제 가능" ON public.projects;
DROP POLICY IF EXISTS "프로젝트 소유자만 프로젝트 생성 가능" ON public.projects;
DROP POLICY IF EXISTS "프로젝트 소유자만 프로젝트 수정 가능" ON public.projects;
DROP POLICY IF EXISTS "프로젝트 소유자만 프로젝트 삭제 가능" ON public.projects;

-- 4. project_members 테이블
ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "프로젝트 멤버는 멤버 목록 조회 가능" ON public.project_members;
DROP POLICY IF EXISTS "프로젝트 소유자만 멤버 추가/삭제/수정 가능" ON public.project_members;
DROP POLICY IF EXISTS "프로젝트 소유자만 멤버 추가 가능" ON public.project_members;
DROP POLICY IF EXISTS "프로젝트 소유자만 멤버 삭제 가능" ON public.project_members;
DROP POLICY IF EXISTS "프로젝트 소유자만 멤버 수정 가능" ON public.project_members;

-- 5. cards 테이블
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "프로젝트 멤버는 카드 조회 가능" ON public.cards;
DROP POLICY IF EXISTS "카드 생성자만 카드 수정/삭제 가능" ON public.cards;
DROP POLICY IF EXISTS "프로젝트 멤버는 카드 생성 가능" ON public.cards;
DROP POLICY IF EXISTS "카드 생성자만 카드 수정 가능" ON public.cards;
DROP POLICY IF EXISTS "카드 생성자만 카드 삭제 가능" ON public.cards;

-- 6. tags 테이블
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "프로젝트 멤버는 태그 조회 가능" ON public.tags;
DROP POLICY IF EXISTS "태그 생성자만 태그 수정/삭제 가능" ON public.tags;
DROP POLICY IF EXISTS "프로젝트 멤버는 태그 생성 가능" ON public.tags;
DROP POLICY IF EXISTS "태그 생성자만 태그 수정 가능" ON public.tags;
DROP POLICY IF EXISTS "태그 생성자만 태그 삭제 가능" ON public.tags;

-- 7. edges 테이블
ALTER TABLE public.edges DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "프로젝트 멤버는 엣지 조회 가능" ON public.edges;
DROP POLICY IF EXISTS "엣지 생성자만 엣지 수정/삭제 가능" ON public.edges;
DROP POLICY IF EXISTS "프로젝트 멤버는 엣지 생성 가능" ON public.edges;
DROP POLICY IF EXISTS "엣지 생성자만 엣지 수정 가능" ON public.edges;
DROP POLICY IF EXISTS "엣지 생성자만 엣지 삭제 가능" ON public.edges;

-- 8. card_tags 테이블
ALTER TABLE public.card_tags DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "카드 조회 가능 사용자는 연결 조회 가능" ON public.card_tags;
DROP POLICY IF EXISTS "카드 소유자만 태그 연결/해제 가능" ON public.card_tags;
DROP POLICY IF EXISTS "카드 소유자만 태그 연결 가능" ON public.card_tags;
DROP POLICY IF EXISTS "카드 소유자만 태그 해제 가능" ON public.card_tags;

-- 9. board_settings 테이블
ALTER TABLE public.board_settings DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "사용자는 자신의 보드 설정만 조회할 수 있음" ON public.board_settings;
DROP POLICY IF EXISTS "사용자는 자신의 보드 설정만 생성/수정/삭제 가능" ON public.board_settings; 