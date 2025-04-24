**핵심 전략:**

1.  **로컬 우선:** Supabase 로컬 개발 환경을 설정합니다.
2.  **스키마 마이그레이션:** Supabase 마이그레이션을 사용하여 데이터베이스 스키마를 정의합니다.
3.  **타입 생성:** Supabase 스키마로부터 TypeScript 타입을 생성합니다.
4.  **인증 계층:** Prisma/커스텀 인증 로직을 Supabase Auth (`@supabase/ssr`)로 교체합니다.
5.  **데이터 접근 계층:** API 라우트, 서비스, 훅에서 Prisma 호출을 직접적인 Supabase 클라이언트 호출(클라이언트 측 또는 서버 측)로 교체합니다.
6.  **설정 업데이트:** 환경 변수를 업데이트하고 Prisma 관련 설정을 제거합니다.
7.  **스크립트 업데이트/제거:** Prisma 스키마 관리, 시딩, DB 전환 관련 스크립트를 수정하거나 제거합니다.
8.  **테스팅:** Prisma/API 라우트 대신 Supabase 상호작용을 모킹하도록 테스트(단위, 통합, MSW)를 업데이트합니다.

---

## Supabase 통합 Tasklist (초정밀 유도 및 검증)

**1단계: 로컬 Supabase 환경 설정**

1.  **Task:** Supabase CLI 설치
    *   **액션:** 만약 전역으로 설치되어 있지 않다면, Supabase CLI를 설치합니다.
    *   **명령어:** `npm install supabase --save-dev` (프로젝트 로컬 설치) 또는 Supabase 문서의 전역 설치 지침을 따릅니다.
    *   **검증:** 프로젝트 루트에서 `npx supabase --version`을 실행하여 버전 정보를 확인합니다.
    *   **참고:** [Supabase CLI 설치](https://supabase.com/docs/guides/cli)

2.  **Task:** Supabase 프로젝트 초기화
    *   **액션:** 프로젝트 내에서 Supabase 설정을 초기화합니다. 이 과정에서 `supabase` 디렉토리가 생성됩니다.
    *   **명령어:** 프로젝트 루트에서 `npx supabase init` 실행
    *   **예상 결과:** `supabase` 디렉토리와 그 안에 `config.toml`, `migrations` 하위 디렉토리가 생성됩니다.
    *   **검증:** `supabase` 디렉토리 및 내용물의 존재 여부를 확인합니다.

3.  **Task:** 로컬 Supabase 서비스 시작
    *   **액션:** Docker를 사용하여 로컬 Supabase 스택(Postgres, GoTrue, Storage 등)을 시작합니다.
    *   **명령어:** `npx supabase start`
    *   **예상 결과:** Docker 컨테이너가 실행되고, 로컬 Supabase Studio URL, API URL, 키(anon key, service_role key)가 콘솔에 출력됩니다.
    *   **검증:** 출력된 로컬 Supabase Studio URL에 접속하여 대시보드를 확인합니다. 로컬 `anon key`와 `service_role key`를 기록해둡니다.

**2단계: 데이터베이스 스키마 정의 및 타입 생성**

4.  **Task:** 초기 데이터베이스 스키마 마이그레이션 정의
    *   **액션:** 기존 Prisma 스키마(`prisma/schema.prisma`)를 기반으로 초기 SQL 마이그레이션 파일을 생성합니다. Prisma 스키마 정의를 SQL `CREATE TABLE` 문으로 수동 변환합니다. `users`(Supabase `auth.users`로 충분한지, 별도의 `profiles` 테이블이 필요한지 고려), `cards`, `tags`, `card_tags`, `edges`, `board_settings` 테이블을 포함합니다. 관계(외래 키), 제약 조건(UNIQUE, NOT NULL), 기본값에 주의합니다. **(중요)** 만약 `profiles` 테이블을 사용한다면, 사용자 ID를 외래 키로 사용하여 `auth.users` 테이블과 연결합니다. RLS(Row Level Security) 정책과 필요한 DB 함수/트리거(예: 새 사용자 가입 시 프로필 자동 생성)를 반드시 포함합니다.
    *   **파일:** `supabase/migrations/0000_initial_schema.sql` (또는 유사한 타임스탬프 형식의 이름) 생성
    *   **SQL 예시 (개념적 - `prisma/schema.prisma`에서 변환 필요):**
        ```sql
        -- profiles 테이블 (Supabase auth users와 연결됨)
        CREATE TABLE public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT,
          updated_at TIMESTAMPTZ DEFAULT now()
        );
        COMMENT ON TABLE public.profiles IS 'Stores public profile information for users.';

        -- 새 사용자 가입 시 프로필 생성을 위한 함수
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, name)
          VALUES (new.id, new.raw_user_meta_data->>'full_name'); -- Supabase에서 전달되는 메타데이터에 따라 조정
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile entry for new users.';

        -- 함수를 호출하는 트리거
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

        -- cards 테이블
        CREATE TABLE public.cards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          content TEXT,
          x REAL, -- 노드 위치 x
          y REAL, -- 노드 위치 y
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
        COMMENT ON TABLE public.cards IS 'Stores individual card data.';

        -- tags 테이블
        CREATE TABLE public.tags (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- 태그가 사용자별인 경우 user_id 추가
          name TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          CONSTRAINT unique_tag_name_per_user UNIQUE (user_id, name) -- 사용자별 태그 이름 고유성 보장
        );
        COMMENT ON TABLE public.tags IS 'Stores tags created by users.';

        -- card_tags 테이블 (다대다 관계)
        CREATE TABLE public.card_tags (
           card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
           tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
           PRIMARY KEY (card_id, tag_id)
        );
        COMMENT ON TABLE public.card_tags IS 'Associates cards with tags.';

        -- edges 테이블
        CREATE TABLE public.edges (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          source TEXT NOT NULL, -- card.id 참조
          target TEXT NOT NULL, -- card.id 참조
          source_handle TEXT,
          target_handle TEXT,
          type TEXT DEFAULT 'default',
          animated BOOLEAN DEFAULT false,
          style JSONB,
          data JSONB,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
        COMMENT ON TABLE public.edges IS 'Stores connections (edges) between cards.';

        -- board_settings 테이블 (아이디어맵 설정 저장용)
        CREATE TABLE public.board_settings (
            user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
            settings JSONB,
            updated_at TIMESTAMPTZ DEFAULT now()
        );
        COMMENT ON TABLE public.board_settings IS 'Stores user-specific settings for the idea map.';

        -- RLS 정책 활성화 및 정의 (매우 중요!)
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

        ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can manage their own cards." ON public.cards FOR ALL USING (auth.uid() = user_id);

        ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can manage their own tags." ON public.tags FOR ALL USING (auth.uid() = user_id);

        ALTER TABLE public.card_tags ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can manage card_tags for their cards." ON public.card_tags FOR ALL
          USING (auth.uid() = (SELECT user_id FROM public.cards WHERE id = card_id));

        ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can manage their own edges." ON public.edges FOR ALL USING (auth.uid() = user_id);

        ALTER TABLE public.board_settings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can manage their own board settings." ON public.board_settings FOR ALL USING (auth.uid() = user_id);

        -- 성능 향상을 위한 인덱스 추가
        CREATE INDEX idx_cards_user_id ON public.cards(user_id);
        CREATE INDEX idx_tags_user_id_name ON public.tags(user_id, name); -- UNIQUE 제약 조건으로 이미 생성될 수 있음
        CREATE INDEX idx_card_tags_card_id ON public.card_tags(card_id);
        CREATE INDEX idx_card_tags_tag_id ON public.card_tags(tag_id);
        CREATE INDEX idx_edges_user_id ON public.edges(user_id);
        CREATE INDEX idx_edges_source ON public.edges(source);
        CREATE INDEX idx_edges_target ON public.edges(target);
        ```
    *   **규칙:** `[supabase-schema]`
    *   **예상 결과:** 초기 데이터베이스 구조를 정의하는 SQL 파일이 생성됩니다.
    *   **검증:** 생성된 SQL 파일을 검토하여 Prisma 스키마와의 일치 여부 및 정확성을 확인합니다.
    *   **참고:** [Supabase 마이그레이션](https://supabase.com/docs/guides/database/migrations), [PostgreSQL CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html), [Supabase Auth 트리거 예제](https://supabase.com/docs/guides/auth/managing-user-data#trigger-to-profiles-table), [Supabase RLS](https://supabase.com/docs/guides/database/row-level-security)

5.  **Task:** 로컬에 초기 마이그레이션 적용
    *   **액션:** 로컬 데이터베이스를 리셋하고 새로 생성된 마이그레이션을 적용합니다.
    *   **명령어:** `npx supabase db reset`
    *   **예상 결과:** 로컬 데이터베이스 스키마가 `0000_initial_schema.sql` 파일의 내용과 일치하게 됩니다.
    *   **검증:** 로컬 Supabase Studio (테이블 섹션)에서 테이블과 컬럼이 생성되었는지 확인합니다.

6.  **Task:** TypeScript 타입 생성
    *   **액션:** *로컬* Supabase 데이터베이스 스키마를 기반으로 TypeScript 타입을 생성합니다.
    *   **명령어:** `npx supabase gen types typescript --local > src/types/supabase.ts` (출력 경로가 올바른지 확인)
    *   **예상 결과:** `src/types/supabase.ts` 파일이 SQL 스키마를 반영하는 타입으로 업데이트되거나 생성됩니다.
    *   **검증:** `src/types/supabase.ts` 파일을 검사합니다. `Database['public']['Tables']` 내에 `profiles`, `cards`, `tags`, `card_tags`, `edges`, `board_settings` 인터페이스가 있는지 확인합니다.
    *   **참고:** [Supabase 타입 생성](https://supabase.com/docs/guides/database/api/generating-types)

**3단계: 구성**

7.  **Task:** 환경 변수 업데이트
    *   **액션:** `.env.local` 파일을 업데이트하고 (추후 Vercel 환경 변수도 설정) Supabase 키를 추가합니다. Prisma 관련 변수는 제거합니다.
    *   **파일:** `.env.local`
    *   **변경 전:**
        ```env
        DATABASE_PROVIDER=...
        DATABASE_URL=... # Prisma 연결 문자열
        DIRECT_URL=... # Prisma 직접 연결 문자열
        # 기존 Supabase 변수 (있을 경우)
        ```
    *   **변경 후:**
        ```env
        # 핵심 Supabase 변수
        NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 # 'supabase start' 출력에서 가져오기
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_LOCAL_ANON_KEY # 'supabase start' 출력에서 가져오기
        SUPABASE_SERVICE_ROLE_KEY=YOUR_LOCAL_SERVICE_ROLE_KEY # 'supabase start' 출력에서 가져오기

        # 로컬 Supabase CLI 자주 사용할 경우 추가
        SUPABASE_DB_PASSWORD=postgres # 로컬 Supabase 기본값

        # OAuth 리디렉션 URL (로컬/프리뷰/프로덕션에 맞게 조정)
        # 로컬 예시:
        NEXT_PUBLIC_OAUTH_REDIRECT_URL=http://localhost:3000/auth/callback
        # 프로덕션 예시 (자신의 도메인으로 변경):
        # NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://your-app.vercel.app/auth/callback

        # 애플리케이션 URL (리디렉션 등에 사용)
        NEXT_PUBLIC_APP_URL=http://localhost:3000

        # Prisma 변수 제거
        # DATABASE_PROVIDER=... (제거 또는 주석 처리)
        # DATABASE_URL=... (제거 또는 주석 처리)
        # DIRECT_URL=... (제거 또는 주석 처리)
        ```
    *   **규칙:** `[config-env]`
    *   **예상 결과:** 로컬 Supabase 개발을 위한 환경 변수가 구성됩니다.
    *   **검증:** 앱이 해당 변수(`process.env.NEXT_PUBLIC_SUPABASE_URL` 등)에 접근할 수 있는지 확인합니다.

8.  **Task:** Prisma 설정 및 종속성 제거
    *   **액션:** `prisma` 디렉토리를 삭제하고 Prisma 종속성을 제거합니다. `package.json` 파일을 업데이트합니다.
    *   **파일/디렉토리:** `prisma/` 삭제.
    *   **명령어:** `npm uninstall @prisma/client prisma` 또는 `yarn remove @prisma/client prisma`
    *   **파일:** `package.json` - Prisma 종속성이 제거되었는지 확인합니다.
    *   **파일:** `package copy.json` - 삭제합니다 (백업 파일로 추정됨).
    *   **규칙:** `[config-prisma-remove]`
    *   **예상 결과:** 프로젝트가 더 이상 Prisma에 의존하지 않게 됩니다.
    *   **검증:** `package.json`을 확인하고 `prisma` 디렉토리가 사라졌는지 확인합니다.

9.  **Task:** `next.config.ts` 업데이트 (필요시)
    *   **액션:** `next.config.ts` 파일을 검토합니다. 만약 Prisma 관련 설정이 있다면 제거합니다 (제공된 스니펫 기준으로는 없을 가능성이 높음).
    *   **파일:** `next.config.ts`
    *   **규칙:** `[config-next]`
    *   **예상 결과:** `next.config.ts` 파일에 Prisma 관련 설정이 없습니다.
    *   **검증:** `next.config.ts` 수동 검토.

**4단계: 인증 계층 리팩토링**

10. **Task:** Supabase 클라이언트 인스턴스화 업데이트 (`lib/supabase/`)
    *   **액션:** 클라이언트(`client.ts`), 서버(`server.ts`), 미들웨어(`middleware.ts`)의 Supabase 클라이언트가 `@supabase/ssr` 및 환경 변수를 사용하여 올바르게 설정되었는지 확인합니다. 제공된 스니펫은 대부분 올바르게 보이지만, `@supabase/ssr` 문서와 비교하여 다시 확인합니다.
    *   **파일:** `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`
    *   **규칙:** `[supabase-client]`, `[supabase-ssr]`
    *   **예상 결과:** 브라우저, 서버 컴포넌트, 미들웨어에 대해 일관되고 올바른 Supabase 클라이언트 설정이 완료됩니다.
    *   **검증:** 이후 변경 사항 적용 후에도 인증 흐름이 여전히 작동해야 합니다.
    *   **참고:** [@supabase/ssr 빠른 시작](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs#ssr-implementation)

11. **Task:** 서버 측 인증 유틸리티 리팩토링 (`lib/auth-server.ts`)
    *   **액션:** Prisma 클라이언트 사용 부분을 제거합니다. 함수들이 인증 확인을 위해 Supabase 서버 클라이언트를 사용하도록 수정합니다.
    *   **파일:** `src/lib/auth-server.ts`
    *   **함수:** `auth()`
        *   **변경 전:** `createClient()` (아마도 Prisma 래퍼)를 사용했을 수 있습니다.
        *   **변경 후:** `@supabase/ssr`의 `createServerClient` (또는 `lib/supabase/server.ts` 래퍼)를 사용하여 세션을 가져옵니다.
            ```typescript
            import { createClient } from '@/lib/supabase/server'; // 서버 클라이언트 래퍼 사용

            export const auth = async () => {
              try {
                const supabase = await createClient(); // 서버 클라이언트
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    logger.error('세션 가져오기 오류:', error);
                    return null;
                }
                return session;
              } catch (error) {
                logger.error('서버 인증 오류:', error);
                return null;
              }
            };
            ```
    *   **함수:** `getCurrentUser()`
        *   **변경 전:** `createClient()` (아마도 Prisma 래퍼)를 사용했을 수 있습니다.
        *   **변경 후:** `createServerClient` (또는 래퍼)를 사용하여 사용자를 가져옵니다. Supabase `User` 객체를 반환합니다. 필요한 경우 `profiles` 테이블에서 프로필 데이터를 가져오는 로직을 추가합니다.
            ```typescript
            import { createClient } from '@/lib/supabase/server';

            // 선택 사항: 사용자와 함께 프로필 가져오기
            export const getCurrentUserWithProfile = async () => {
                try {
                    const supabase = await createClient();
                    const { data: { user }, error: userError } = await supabase.auth.getUser();
                    if (userError || !user) {
                        logger.warn('사용자 가져오기 오류 또는 사용자 없음:', userError);
                        return null;
                    }

                    // 'profiles' 테이블에서 프로필 가져오기
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single(); // 사용자는 하나만 존재해야 함

                    if (profileError) {
                        // 사용자는 존재하지만 프로필이 없을 수 있음 (예: 트리거 실패)
                        logger.warn('프로필 가져오기 오류:', profileError);
                        // 프로필 없이 사용자 정보만 반환할지, null 반환할지 결정
                    }

                    // 사용자 정보와 프로필 정보 결합 (구조는 필요에 따라 조정)
                    return { ...user, profile };

                } catch (error) {
                    logger.error('현재 사용자/프로필 가져오기 오류:', error);
                    return null;
                }
            };

            // 원래 함수 (Supabase 사용자만 반환)
             export const getCurrentUser = async () => {
               try {
                 const supabase = await createClient();
                 const { data: { user }, error } = await supabase.auth.getUser();
                 if (error) {
                    logger.error('사용자 가져오기 오류:', error);
                    return null;
                 }
                 return user;
               } catch (error) {
                 logger.error('현재 사용자 가져오기 오류:', error);
                 return null;
               }
             };
            ```
    *   **함수:** `serverSignInWithGoogle()`
        *   **액션:** `createClient()` (Supabase 서버 클라이언트 래퍼)를 올바르게 사용하는지 확인합니다. 기존 코드는 대부분 괜찮아 보이지만, `redirectTo`가 환경 변수를 사용하는지 확인합니다.
    *   **규칙:** `[auth-server]`, `[supabase-auth]`
    *   **예상 결과:** 서버 측 인증 유틸리티가 Supabase에만 의존하게 됩니다.
    *   **검증:** 서버 컴포넌트 및 API 라우트에서의 로그인/인증 확인이 올바르게 작동해야 합니다.

12. **Task:** 클라이언트 측 인증 유틸리티 리팩토링 (`lib/auth.ts`)
    *   **액션:** Prisma 상호작용을 제거합니다. 함수들이 Supabase 브라우저 클라이언트를 사용하도록 수정합니다. `signUp` 함수는 프로필 생성을 위해 RPC 호출을 사용하거나 마이그레이션에서 정의한 트리거에 의존하도록 업데이트합니다. `signIn`, `signOut`, `signInWithGoogle` 함수가 Supabase 브라우저 클라이언트(`@supabase/ssr`의 `createBrowserClient`)를 사용하는지 확인합니다.
    *   **파일:** `src/lib/auth.ts`
    *   **함수:** `getAuthClient()`
        *   **액션:** `@supabase/ssr`의 `createBrowserClient()`를 반환하는지 확인합니다 (`lib/supabase/client.ts` 래퍼 통해). 기존 코드는 괜찮아 보입니다.
    *   **함수:** `signUp()`
        *   **변경 전:** Supabase `auth.signUp` 호출 후, 별도의 API 호출 (`/api/user/register`)로 Prisma 사용자를 생성했을 가능성이 있습니다.
        *   **변경 후:**
            1.  `supabase.auth.signUp()`을 호출합니다. 필요한 경우 사용자 메타데이터(예: 프로필 트리거용 `name`)를 포함합니다.
            2.  `fetch('/api/user/register')` 호출을 **제거**합니다. `profiles` 테이블 항목은 마이그레이션에서 생성한 데이터베이스 트리거(`handle_new_user`)에 의해 자동으로 처리되어야 합니다.
            ```typescript
            export async function signUp(email: string, password: string, name: string | null = null) {
              try {
                const client = getAuthClient();
                // 트리거에서 사용할 수 있도록 options.data에 이름 전달
                const { data: authData, error: authError } = await client.auth.signUp({
                  email,
                  password,
                  options: {
                    data: {
                      full_name: name // 트리거에서 이 메타데이터를 사용하도록 설정했다면 전달
                    }
                  }
                });

                if (authError) {
                  logger.error('Supabase 회원가입 오류:', authError);
                  throw authError;
                }
                if (!authData.user) {
                  throw new Error('사용자 등록 실패 (사용자 데이터 없음)');
                }

                logger.info('Supabase 회원가입 성공:', { userId: authData.user.id });
                // 더 이상 /api/user/register 호출 필요 없음
                return { user: authData.user, session: authData.session }; // 세션 정보도 반환

              } catch (error) {
                logger.error('회원가입 처리 오류:', error);
                throw error;
              }
            }
            ```
    *   **함수:** `signIn()`
        *   **액션:** `client.auth.signInWithPassword()`만 호출해야 합니다. 로그인 후 Prisma 확인 로직을 제거합니다.
        *   **변경 후:**
            ```typescript
            export async function signIn(email: string, password: string) {
              try {
                const client = getAuthClient();
                const { data, error } = await client.auth.signInWithPassword({
                  email,
                  password,
                });
                if (error) {
                  logger.error('Supabase 로그인 오류:', error);
                  throw error;
                }
                 if (!data.session) {
                  throw new Error('로그인 실패 (세션 데이터 없음)');
                 }
                logger.info('로그인 성공:', { userId: data.user?.id });
                return { user: data.user, session: data.session };
              } catch (error) {
                logger.error('로그인 처리 오류:', error);
                throw error;
              }
            }
            ```
    *   **함수:** `signOut()`
        *   **액션:** `client.auth.signOut()`을 호출해야 합니다. 기존 코드는 괜찮아 보입니다.
    *   **함수:** `signInWithGoogle()`
        *   **액션:** `client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: ... } })`를 호출해야 합니다. 서버 액션을 통해 `serverSignInWithGoogle`를 사용하는 현재 패턴도 유효합니다. 일단 서버 액션 패턴을 유지한다고 가정합니다. *이 경우, 해당 서버 액션(`src/app/login/actions.ts`)이 올바른 서버 측 Supabase 클라이언트를 사용하는지 확인해야 합니다.*
    *   **함수:** `getCurrentUser()`
        *   **액션:** `client.auth.getUser()`를 통해 사용자를 가져옵니다. 선택적으로 `client.from('profiles')...`를 통해 프로필 데이터를 가져옵니다.
            ```typescript
            // 클라이언트 측에서 사용자 및 프로필 가져오기 예시
            export async function getCurrentUserClient() {
                 try {
                    const client = getAuthClient();
                    const { data: { user }, error: userError } = await client.auth.getUser();
                     if (userError || !user) return null; // 오류 또는 사용자 없음

                    // 'profiles' 테이블에서 프로필 가져오기
                    const { data: profile, error: profileError } = await client
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    // 사용자 정보와 프로필 정보 결합
                    return { ...user, profile }; // 프로필이 없어도 사용자 정보는 반환될 수 있음
                 } catch (error) {
                    logger.error('클라이언트 측 현재 사용자 가져오기 오류:', error);
                    return null;
                 }
            }
            ```
    *   **규칙:** `[auth-client]`, `[supabase-auth]`
    *   **예상 결과:** 클라이언트 측 인증 유틸리티가 Supabase 클라이언트를 직접 사용합니다. 회원가입 흐름은 DB 트리거에 의존합니다.
    *   **검증:** 로그인, 회원가입, 로그아웃 흐름이 올바르게 작동해야 합니다. 로그인 후 사용자 프로필 데이터를 사용할 수 있어야 합니다.

13. **Task:** 인증 미들웨어 업데이트 (`src/middleware.ts`)
    *   **액션:** 미들웨어가 `@supabase/ssr`의 `updateSession`을 올바르게 사용하는지 확인합니다 (`lib/supabase/middleware.ts` 래퍼 통해). 로그인한 사용자를 `/login`에서 리디렉션하는 로직은 괜찮아 보입니다.
    *   **파일:** `src/middleware.ts`
    *   **규칙:** `[middleware]`, `[supabase-ssr]`
    *   **예상 결과:** 세션 갱신 및 경로 보호가 예상대로 작동합니다.
    *   **검증:** 세션 만료 및 갱신을 테스트합니다. 로그인 상태에 따라 보호된 경로/공개 경로 접근을 테스트합니다.

14. **Task:** Auth 스토어 업데이트 (`src/store/useAuthStore.ts`)
    *   **액션:** 스토어가 Supabase `User` 및 잠재적으로 `Profile` 데이터를 저장하도록 조정합니다. Prisma 관련 사용자 필드를 제거합니다. `profile: User | null`에 초점을 맞춘 현재 구조는 적합해 보입니다. `useAuth` 훅이 이 스토어를 올바르게 업데이트하는지 확인합니다.
    *   **파일:** `src/store/useAuthStore.ts`
    *   **규칙:** `[zustand-auth]`
    *   **예상 결과:** Auth 스토어가 Supabase 사용자/프로필 구조를 반영합니다.
    *   **검증:** Redux DevTools (또는 Zustand 동등 도구)를 사용하여 인증 이벤트 중 스토어 상태 업데이트를 확인합니다.

15. **Task:** `useAuth` 훅 업데이트 (`src/hooks/useAuth.ts`)
    *   **액션:** 훅이 Supabase `onAuthStateChange`를 올바르게 구독하고 `useAuthStore`를 Supabase `User` (및 프로필 - 가져온 경우)로 업데이트하는지 확인합니다.
    *   **파일:** `src/hooks/useAuth.ts`
    *   **규칙:** `[react-hook-auth]`, `[supabase-auth]`
    *   **예상 결과:** 훅이 Zustand 스토어에서 Supabase 인증 상태 변경을 올바르게 반영합니다.
    *   **검증:** 로그인/로그아웃 중 훅과 스토어의 로그 메시지에 올바른 사용자 상태 전파가 표시되어야 합니다.

**5단계: 데이터 접근 계층 리팩토링 (서비스 & 훅)**

16. **Task:** `cardService.ts` 리팩토링
    *   **액션:** 모든 `fetch('/api/cards...')` 호출을 직접적인 Supabase 클라이언트 호출(`supabase.from('cards').select()`, `supabase.from('cards').insert()`, `supabase.from('cards').update()`, `supabase.from('cards').delete()`)로 교체합니다. 필요한 경우 Supabase 조인 또는 별도 쿼리/RPC 호출을 사용하여 태그 관계를 처리합니다. RLS 정책이 존중되는지 확인합니다 (클라이언트 측 호출은 자동으로 로그인된 사용자의 정책을 사용합니다). 태그 업데이트의 경우, RPC 함수를 사용하거나, 가능하면 트랜잭션 내에서 여러 Supabase 호출을 사용하거나, 순차적으로 처리하는 등 클라이언트 측에서 처리해야 할 수 있습니다.
    *   **파일:** `src/services/cardService.ts`
    *   **함수:** `fetchCards()`
        *   **변경 후:**
            ```typescript
            import { createClient } from '@/lib/supabase/client'; // 또는 서버 측 사용 시 서버 클라이언트
            import { Card } from '@/types/card'; // 필요시 타입 조정
            import createLogger from '@/lib/logger';
            const logger = createLogger('cardService');

            export async function fetchCards(params?: { q?: string; tag?: string; userId?: string }): Promise<Card[]> {
              try {
                const supabase = createClient(); // 적절한 클라이언트 사용
                // cards 테이블을 기본으로 profiles와 tags 정보를 함께 가져옵니다.
                // card_tags와 tags 테이블을 inner join하여 특정 태그를 포함하는 카드만 필터링할 수 있습니다.
                let query = supabase.from('cards').select(`
                  id, title, content, created_at, updated_at, user_id,
                  user:profiles!inner(id, name),
                  cardTags:card_tags!inner(
                    tag:tags!inner(id, name)
                  )
                `); // 관계 및 필요에 따라 select 쿼리 조정

                if (params?.q) {
                  // 제목 또는 내용에서 검색어 포함 (대소문자 구분 없음)
                  query = query.or(`title.ilike.%${params.q}%,content.ilike.%${params.q}%`);
                }
                if (params?.tag) {
                  // cardTags를 통해 연결된 tags 테이블의 name 필터링
                  query = query.eq('cardTags.tag.name', params.tag);
                }
                if (params?.userId) { // RLS가 보통 처리하지만, 명시적 필터링도 가능
                   query = query.eq('user_id', params.userId);
                }

                const { data, error } = await query.order('created_at', { ascending: false });

                if (error) {
                  // 'PGRST116'은 'relation "..." does not exist' 또는 'missing FROM-clause entry for table "..."' 에러일 수 있음
                  // 특히 조인 관련 오류일 가능성이 높음
                  if (error.code === 'PGRST116' && params?.tag) {
                      logger.warn(`태그 '${params.tag}' 필터링 중 오류 또는 결과 없음:`, error.message);
                      // 태그 필터링 시 결과가 없으면 빈 배열 반환
                      return [];
                  }
                  logger.error('Supabase fetchCards 오류:', error);
                  throw error;
                }

                // Supabase 데이터 구조를 Card 타입에 맞게 매핑 (필요한 경우)
                // 예: 태그 평탄화
                return data.map(card => ({
                    id: card.id,
                    title: card.title,
                    content: card.content,
                    createdAt: card.created_at,
                    updatedAt: card.updated_at,
                    userId: card.user_id,
                    // user 객체 매핑 (null 가능성 처리)
                    user: card.user ? { id: card.user.id, name: card.user.name } : undefined,
                    // cardTags 배열 매핑 (null 또는 빈 배열 가능성 처리)
                    cardTags: card.cardTags?.map((ct: any) => ({ tag: { id: ct.tag.id, name: ct.tag.name } })) || []
                })) as Card[]; // 매핑이 Card 타입을 보장하는 경우 타입 단언 사용
              } catch (error) {
                logger.error('카드 목록 가져오기 오류:', error);
                throw error; // 오류를 다시 던져 상위 호출자(훅)가 처리하도록 함
              }
            }
            ```
    *   **함수:** `fetchCardById()`
        *   **변경 후:** `supabase.from('cards').select('id, title, content, created_at, updated_at, user_id, user:profiles!inner(id, name), cardTags:card_tags(tag:tags(id, name))').eq('id', id).single()` 사용.
    *   **함수:** `createCardAPI()`
        *   **변경 후:** `supabase.from('cards').insert({ title, content, user_id /* 세션에서 가져오기 */ }).select()` 사용. 태그 생성/연결은 별도로 처리 (예: 루프 돌며 `tags`, `card_tags`에 삽입 또는 RPC 함수 사용).
    *   **함수:** `updateCardAPI()`
        *   **변경 후:** `supabase.from('cards').update({ title, content }).eq('id', id).select()` 사용. 태그 업데이트는 별도로 처리.
    *   **함수:** `deleteCardAPI()`
        *   **변경 후:** `supabase.from('cards').delete().eq('id', id)` 사용. Cascade delete가 `card_tags`를 처리해야 함.
    *   **규칙:** `[service-crud]`, `[supabase-data]`
    *   **예상 결과:** `cardService`가 데이터 작업을 위해 Supabase 클라이언트를 사용합니다.
    *   **검증:** React Query 훅 (`useCards`, `useCard`, 뮤테이션)이 서비스를 통해 데이터를 올바르게 가져오고 변경해야 합니다.

17. **Task:** `tagService.ts` 리팩토링
    *   **액션:** `fetch('/api/tags...')` 호출을 Supabase 클라이언트 호출 (`supabase.from('tags')...`)로 교체합니다. 태그가 사용자별이라면 `user_id` 필터링을 추가합니다.
    *   **파일:** `src/services/tagService.ts`
    *   **함수:** `fetchTags()`
        *   **변경 후:** `supabase.from('tags').select('*').order('name')` 사용. 사용자별이라면 `.eq('user_id', auth.uid())` 추가. 카운트가 필요하다면 `card_tags`와 조인 고려 (`select('*, count:card_tags(count)')`).
            ```typescript
            // 카운트 포함 태그 가져오기 예시 (Supabase 집계 또는 뷰 사용)
             export async function fetchTags(): Promise<Tag[]> {
                 const supabase = createClient();
                 // 옵션 1: 조인 및 카운트 (태그 많을 시 성능 저하 가능)
                 // const { data, error } = await supabase
                 //  .from('tags')
                 //  .select('*, card_tags(count)') // card_tags 테이블과의 관계를 이용한 카운트
                 //  .order('name');

                 // 옵션 2: Postgres 뷰 또는 함수 사용 (권장)
                 // 'tags_with_count_view'라는 뷰가 있다고 가정
                 const { data, error } = await supabase
                     .from('tags_with_count_view') // 또는 rpc('get_tags_with_counts') 함수 호출
                     .select('*') // 뷰에서 정의된 컬럼들 (id, name, count, created_at 등)
                     .order('name');

                 if (error) {
                     logger.error("Supabase fetchTags 오류:", error);
                     throw error;
                 }
                 // 데이터 매핑 (뷰의 컬럼 이름이 Tag 인터페이스와 다를 경우)
                 // 예: 뷰에서 count 컬럼 이름이 card_count라면 -> count: tag.card_count ?? 0
                 // count가 null일 수 있으므로 기본값 0 처리
                 return data.map(tag => ({
                     id: tag.id,
                     name: tag.name,
                     count: tag.count ?? 0, // count 필드가 뷰에 있다고 가정, null이면 0
                     createdAt: tag.created_at
                 })) as Tag[]; // Tag 타입으로 단언
             }
            ```
    *   **함수:** `createTagAPI()`
        *   **변경 후:** `supabase.from('tags').insert({ name, user_id }).select()` 사용. 잠재적인 unique 제약 조건 오류(`unique_tag_name_per_user`) 처리.
    *   **함수:** `deleteTagAPI()`
        *   **변경 후:** `supabase.from('tags').delete().eq('id', id)` 사용. Cascade delete가 `card_tags`를 처리해야 함.
    *   **규칙:** `[service-crud]`, `[supabase-data]`
    *   **예상 결과:** `tagService`가 Supabase 클라이언트를 사용합니다.
    *   **검증:** React Query 훅 (`useTags`, 뮤테이션)이 올바르게 작동해야 합니다.

18. **Task:** `edgeService.ts` 리팩토링
    *   **액션:** `fetch('/api/edges...')` 호출을 Supabase 클라이언트 호출 (`supabase.from('edges')...`)로 교체합니다.
    *   **파일:** `src/services/edgeService.ts`
    *   **함수:** `fetchEdges()`
        *   **변경 후:** `supabase.from('edges').select('*').eq('user_id', auth.uid())` 사용 (RLS가 사용자 ID를 처리하지만, 명시적 필터도 가능). `source`, `target` 필터 제공 시 추가.
    *   **함수:** `fetchEdgeById()`
        *   **변경 후:** `supabase.from('edges').select('*').eq('id', id).single()` 사용.
    *   **함수:** `createEdgeAPI()`
        *   **변경 후:** `supabase.from('edges').insert({ ...edgeInput, user_id }).select()` 사용. 단일 또는 배열 입력 처리. `source`, `target` 등 스네이크 케이스로 변환 필요.
            ```typescript
             export async function createEdgeAPI(input: EdgeInput | EdgeInput[]): Promise<Edge[]> {
                const supabase = createClient();
                const inputs = Array.isArray(input) ? input : [input];
                const { data: { user } } = await supabase.auth.getUser(); // 현재 사용자 ID 가져오기

                if (!user) throw new Error("User not authenticated");

                const edgesToInsert = inputs.map(edge => ({
                    ...toEdge(edge, user.id), // toEdge 유틸리티 사용하여 Supabase 스키마에 맞게 변환
                    source_handle: edge.sourceHandle, // 스네이크 케이스로 명시적 매핑
                    target_handle: edge.targetHandle
                }));

                const { data, error } = await supabase
                    .from('edges')
                    .insert(edgesToInsert)
                    .select(); // 삽입된 데이터 반환

                if (error) throw error;
                return data as Edge[]; // Edge 타입으로 단언
            }
            ```
    *   **함수:** `updateEdgeAPI()`
        *   **변경 후:** `supabase.from('edges').update({ ...edgePatch /* 스네이크 케이스 변환 */ }).eq('id', id).select()` 사용.
    *   **함수:** `deleteEdgeAPI()`
        *   **변경 후:** `supabase.from('edges').delete().eq('id', id)` 사용.
    *   **함수:** `deleteEdgesAPI()`
        *   **변경 후:** `supabase.from('edges').delete().in('id', edgeIds)` 사용.
    *   **규칙:** `[service-crud]`, `[supabase-data]`
    *   **예상 결과:** `edgeService`가 Supabase 클라이언트를 사용합니다.
    *   **검증:** React Query 훅 (`useEdges`, 뮤테이션)이 올바르게 작동해야 합니다.

19. **Task:** React Query 훅 업데이트 (`src/hooks/useCard*.ts`, `useTag*.ts`, `useEdge*.ts`)
    *   **액션:** 모든 React Query 훅 (`useQuery`, `useMutation`)을 검토합니다. 리팩토링된 서비스 함수를 호출하는지 확인합니다. 필요한 경우 쿼리 키를 업데이트합니다. 서비스 함수 시그니처가 비슷하게 유지된다면 훅 자체는 크게 변경되지 않을 수 있습니다. *`fetch('/api/...')`를 직접 호출했던 훅은 제거합니다.*
    *   **파일:** `src/hooks/useCard.ts`, `src/hooks/useCards.ts`, `src/hooks/useCreateCard.ts`, `src/hooks/useUpdateCard.ts`, `src/hooks/useDeleteCard.ts`, `src/hooks/useTags.ts`, `src/hooks/useCreateTag.ts`, `src/hooks/useDeleteTag.ts`, `src/hooks/useEdge.ts`, `src/hooks/useEdges.ts`, `src/hooks/useCreateEdge.ts`, `src/hooks/useUpdateEdge.ts`, `src/hooks/useDeleteEdge.ts`, `src/hooks/useDeleteEdges.ts`.
    *   **규칙:** `[react-query-supabase]`
    *   **예상 결과:** 훅이 Supabase 기반 서비스와 올바르게 상호작용합니다.
    *   **검증:** 이 훅을 사용하는 컴포넌트가 데이터를 올바르게 표시하고 뮤테이션이 작동해야 합니다. 관련 훅 단위/통합 테스트를 실행합니다.

**6단계: 컴포넌트 & 상태 관리 리팩토링**

20. **Task:** 컴포넌트/페이지 데이터 페칭 업데이트
    *   **액션:** 데이터를 직접 페칭하거나 이제 제거/변경된 API 라우트에 의존했던 컴포넌트 및 페이지(예: `src/app/cards/page.tsx`, `src/app/tags/page.tsx`, 서버 컴포넌트 가능성)를 검토합니다. 직접 페칭 또는 Prisma 호출을 리팩토링된 React Query 훅 또는 Supabase 클라이언트 함수(서버 컴포넌트용) 호출로 교체합니다.
    *   **파일:** `src/app/cards/page.tsx`, `src/app/tags/page.tsx`, `src/app/cards/[id]/page.tsx`, `src/app/test-db/page.tsx` (Prisma 대신 Supabase 연결 확인으로 교체), `src/components/cards/CardList.tsx`, `src/components/tags/TagList.tsx`, `src/components/layout/Sidebar.tsx` 등.
    *   **예시 (`src/app/tags/page.tsx` - 서버 컴포넌트):** 서버 컴포넌트에서는 Supabase *서버* 클라이언트를 사용해야 합니다.
        ```typescript
        import { createClient } from '@/lib/supabase/server'; // 서버 클라이언트 임포트
        import { formatDate } from "@/lib/utils";
        import TagForm from "@/components/tags/TagForm";
        import TagList from "@/components/tags/TagList"; // 클라이언트 컴포넌트
        import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
        import { Metadata } from "next";

        export const metadata: Metadata = { /*...*/ };

        // 서버 컴포넌트에서 데이터 가져오기
        async function getTagsWithCount() {
           const supabase = await createClient();
           // 뷰 또는 함수 사용 예시
           const { data, error } = await supabase
               .from('tags_with_count_view') // 생성한 뷰 이름
               .select('*')
               .order('name');
           if (error) {
               console.error("태그 가져오기 오류 (서버):", error);
               return []; // 오류 시 빈 배열 반환
           }
           // 데이터 포맷팅
           return data.map(tag => ({
               id: tag.id,
               name: tag.name,
               count: tag.count ?? 0,
               createdAt: formatDate(tag.created_at) // 서버에서 포맷팅
           }));
        }

        export default async function TagsPage() {
           // 서버 컴포넌트에서 데이터 페칭
           const initialTags = await getTagsWithCount();

           return (
             <div className="container mx-auto py-8">
               <h1 className="text-3xl font-bold mb-6">태그 관리</h1>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-1">
                   <Card>
                     <CardHeader><CardTitle>새 태그 추가</CardTitle></CardHeader>
                     <CardContent><TagForm /></CardContent> {/* TagForm은 클라이언트 컴포넌트 */}
                   </Card>
                 </div>
                 <div className="md:col-span-2">
                   <Card>
                     <CardHeader><CardTitle>태그 목록</CardTitle></CardHeader>
                     <CardContent>
                       {/* 초기 데이터를 props로 전달 */}
                       <TagList initialTags={initialTags} />
                     </CardContent>
                   </Card>
                 </div>
               </div>
             </div>
           );
        }
        ```
        **참고:** 위 예시에서 `TagList`는 클라이언트 컴포넌트로 가정합니다. `TagList` 내부에서는 `useTags` 훅을 사용하여 초기 데이터 이후의 업데이트(예: 새 태그 추가 후 목록 새로고침)를 처리할 수 있습니다.
    *   **규칙:** `[data-fetching]`, `[supabase-data]`
    *   **예상 결과:** 컴포넌트가 새로운 Supabase 데이터 계층을 사용하여 데이터를 가져옵니다.
    *   **검증:** 페이지와 컴포넌트가 데이터를 올바르게 표시해야 합니다.

21. **Task:** 상태 관리 업데이트 (`useAppStore`, `useIdeaMapStore`)
    *   **액션:**
        *   `useAppStore` 및 `useIdeaMapStore`를 검토합니다.
        *   Prisma 또는 API 라우트 페칭과 직접 관련된 상태나 액션(만약 있다면)을 제거합니다 (훅/서비스가 처리).
        *   스토어 내 데이터 구조가 Supabase 응답(또는 서비스에서 매핑된 타입)과 일치하는지 확인합니다.
        *   `loadIdeaMapData`, `saveLayout`, `saveEdges`와 같은 액션이 이전에 `localStorage` 또는 다른 API를 사용했다면 업데이트합니다. 레이아웃/엣지 데이터를 이제 `localStorage` 대신 Supabase `board_settings` 또는 `edges` 테이블에 유지할지 고려합니다. `loadIdeaMapData`는 이미 DB에서 엣지를 가져오도록 부분적으로 업데이트된 것으로 보이며, 이것이 완전히 정렬되었는지 확인합니다.
        *   엣지에 대한 `localStorage` 사용 (`IDEAMAP_EDGES_STORAGE_KEY`)을 제거합니다.
        *   `IDEAMAP_LAYOUT_STORAGE_KEY`를 유지할지, 아니면 레이아웃을 Supabase로 옮길지 결정합니다. 옮긴 경우 저장/로딩 로직을 업데이트합니다. 레이아웃 정보(노드 위치 등)는 `cards` 테이블의 `x`, `y` 컬럼에 저장하는 것이 더 일반적일 수 있습니다.
    *   **파일:** `src/store/useAppStore.ts`, `src/store/useIdeaMapStore.ts`
    *   **규칙:** `[zustand-state]`, `[localstorage-removal]`
    *   **예상 결과:** Zustand 스토어가 Supabase 데이터 모델 및 페칭 전략과 정렬됩니다. 영구 데이터에 대한 LocalStorage 의존성이 감소/제거됩니다.
    *   **검증:** DevTools를 사용하여 애플리케이션 상태를 확인합니다. 레이아웃 저장/로딩, 엣지 지속성을 테스트합니다.

22. **Task:** UI 컴포넌트 업데이트 (`UserProfile`, `Sidebar` 등)
    *   **액션:** 사용자 정보를 표시하거나 데이터와 상호작용하는 컴포넌트를 업데이트합니다. `UserProfile`은 Supabase `auth.users.user_metadata` 또는 `profiles` 테이블에서 사용자 `name` 및 `avatar_url`을 가져와야 합니다. `Sidebar`는 Supabase 기반 훅(`useCards`, `useDeleteCard`)을 사용해야 합니다.
    *   **파일:** `src/components/auth/UserProfile.tsx`, `src/components/layout/Sidebar.tsx`
    *   **규칙:** `[component-data-binding]`
    *   **예상 결과:** UI 컴포넌트가 Supabase에서 가져온 데이터를 올바르게 표시합니다.
    *   **검증:** 사용자 프로필 정보가 올바르게 표시되어야 합니다. 사이드바 기능이 예상대로 작동해야 합니다.

**7단계: API 라우트 & 스크립트 리팩토링/제거**

23. **Task:** API 라우트 리팩토링/제거 (`src/app/api/...`)
    *   **액션:** 데이터 접근이 직접적인 Supabase 클라이언트 호출(서비스/훅 또는 서버 컴포넌트 통해)로 이동함에 따라 많은 API 라우트가 중복됩니다.
        *   `/api/cards/**`: 제거 가능성 높음. 카드 CRUD는 `cardService`가 처리합니다.
        *   `/api/tags/**`: 제거 가능성 높음. 태그 CRUD는 `tagService`가 처리합니다.
        *   `/api/edges/**`: 제거 가능성 높음. 엣지 CRUD는 `edgeService`가 처리합니다.
        *   `/api/user/**`: `/api/user/register` 제거. 클라이언트/서버 컴포넌트로 커버되지 않는 특정 서버 측 조회가 절대적으로 필요한 경우에만 `/api/user/[id]` 유지.
        *   `/api/auth/status`: 유지 (클라이언트 측 확인에 유용해 보임). `createClient`(Supabase 서버 클라이언트)를 사용하는지 확인.
        *   `/api/health-check`: 유지하되, Prisma 대신 Supabase 연결 확인(`supabase.rpc('echo', { message: 'hello' })` 또는 유사 방식)하도록 수정.
        *   `/api/db-init`: 제거. DB 초기화는 `supabase db reset`이 처리합니다.
        *   `/api/ideamap-settings`: 유지하되, Prisma 대신 Supabase 클라이언트 (`board_settings` 테이블) 사용하도록 리팩토링.
        *   `/api/logs/**`: 그대로 유지 (파일 시스템 또는 별도 로깅 서비스와 상호작용한다고 가정, 주 DB 아님).
    *   **파일:** `src/app/api/` 아래 모든 파일
    *   **규칙:** `[api-route-removal]`, `[api-route-refactor]`
    *   **예상 결과:** 불필요한 API 라우트가 제거되고, 남은 라우트는 Supabase를 사용합니다.
    *   **검증:** 제거된 API 라우트에 의존하지 않고 애플리케이션이 올바르게 작동해야 합니다. 남은 API 라우트를 테스트합니다.

24. **Task:** 스크립트 리팩토링/제거 (`scripts/`)
    *   **액션:** Prisma와 상호작용하거나 스키마를 관리했던 스크립트를 업데이트하거나 제거합니다.
        *   `check-port.js`: 유지.
        *   `coverage-report.js`: 유지.
        *   `create-user.js`: 제거 (사용자 생성은 Supabase auth가 처리).
        *   `listUsers.ts`: Supabase 어드민 클라이언트를 사용하여 `auth.users` 목록을 가져오도록 리팩토링.
        *   `migrateEdgesToDB.ts`: 유지/검토. 올바른 Supabase 키와 스키마를 사용하는지 확인.
        *   `pre-deploy.js`: 리팩토링. Prisma 검사 제거. Supabase 환경 변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) 검사 추가.
        *   `run-tests.sh`: 테스트 명령 변경 시 유지/업데이트.
        *   `schema-sync.js`: 제거 (Supabase 마이그레이션이 스키마 처리).
        *   `select-db.js`: 제거 (DB 전환 불필요).
        *   `test-db.js`: Supabase 클라이언트를 사용하여 Supabase 연결 테스트하도록 리팩토링.
        *   `update-file-dates.js`: 유지.
        *   `prisma/seed/index.js`: `prisma` 디렉토리 제거. Supabase 시딩 스크립트(`supabase/seed.sql`) 또는 Supabase 클라이언트를 사용하는 TS 스크립트 생성.
    *   **파일:** `scripts/` 아래 파일, `prisma/seed/`.
    *   **규칙:** `[script-refactor]`, `[script-removal]`
    *   **예상 결과:** 스크립트가 Supabase 워크플로우와 정렬됩니다.
    *   **검증:** 리팩토링된 스크립트(`listUsers`, `test-db`, `pre-deploy`)를 실행하여 작동하는지 확인합니다. Supabase 시딩을 설정합니다.
    *   **참고:** [Supabase 시딩](https://supabase.com/docs/guides/database/seed-data)

**8단계: 테스팅 리팩토링**

25. **Task:** MSW 핸들러 업데이트
    *   **액션:** MSW 핸들러(`src/tests/msw/handlers.ts`, `edgeHandlers.ts`, `tagHandlers.ts` 등)를 수정하여 `fetch('/api/...')` 대신 Supabase 클라이언트 메서드를 가로채고 모킹합니다. 이는 복잡할 수 있으며, Supabase 클라이언트 라이브러리 자체를 모킹하거나, Supabase가 만드는 기본 HTTP 요청(구조를 파악할 수 있다면)을 MSW로 가로채야 할 수 있습니다. *통합* 테스트를 위한 더 간단한 접근 방식은 Supabase 호출에 대해 MSW를 우회하고 테스트 중 *로컬* Supabase 인스턴스에 연결하는 것일 수 있습니다(데이터가 수정되는 경우 테스트 격리 보장). *단위* 테스트의 경우, 서비스 함수(`cardService.fetchCards` 등)를 직접 모킹합니다.
    *   **파일:** `src/tests/msw/handlers/*.ts`
    *   **규칙:** `[testing-msw]`, `[supabase-mocking]`
    *   **예상 결과:** MSW 핸들러가 새로운 데이터 접근 계층을 올바르게 모킹합니다.
    *   **검증:** MSW를 사용하는 통합 테스트가 통과해야 합니다.

26. **Task:** 단위 & 통합 테스트 업데이트
    *   **액션:** 모든 테스트 파일 (`*.test.tsx`, `*.test.ts`)을 검토합니다.
        *   Prisma 관련 모킹 (`@/lib/prisma`)을 제거합니다.
        *   훅 (`useCards`, `useAuth` 등)에 대한 모킹을 잠재적인 새 반환 타입이나 종속성을 반영하도록 업데이트합니다.
        *   특정 API 응답 또는 Prisma 데이터 구조에 의존했던 컴포넌트 테스트를 업데이트합니다.
        *   통합 테스트 (`src/tests/integration/`)를 새로운 Supabase 기반 흐름에 맞게 조정합니다.
    *   **파일:** 모든 `*.test.tsx` / `*.test.ts` 파일.
    *   **규칙:** `[testing-unit]`, `[testing-integration]`
    *   **예상 결과:** 모든 테스트가 Supabase 데이터 계층에서 통과합니다.
    *   **검증:** `npm run test` 또는 `yarn test` 실행.

**9단계: 최종 단계 & 배포**

27. **Task:** 로컬 프로젝트 Supabase 프로젝트 연결
    *   **액션:** 로컬 Supabase 설정을 호스팅된 Supabase 프로젝트에 연결합니다. `[PROJECT_ID]`를 실제 Supabase 프로젝트 ID로 교체합니다.
    *   **명령어:** `npx supabase link --project-ref [PROJECT_ID]` (필요시 DB 비밀번호 프롬프트 따르기)
    *   **예상 결과:** 로컬 프로젝트가 연결되어 스키마 푸시가 가능해집니다.
    *   **검증:** 명령어가 성공적으로 완료됩니다.

28. **Task:** 호스팅된 Supabase에 마이그레이션 푸시
    *   **액션:** 로컬 마이그레이션을 라이브/스테이징 Supabase 프로젝트에 적용합니다.
    *   **명령어:** `npx supabase db push`
    *   **예상 결과:** 호스팅된 Supabase 데이터베이스 스키마가 로컬 마이그레이션과 일치하게 됩니다.
    *   **검증:** 호스팅된 프로젝트의 Supabase 대시보드 (테이블 편집기, 마이그레이션)를 확인합니다.

29. **Task:** 프로덕션 환경 변수 구성
    *   **액션:** 배포 환경(예: Vercel)에 프로덕션 Supabase URL, anon key, service role key, OAuth 리디렉션 URL을 설정합니다.
    *   **규칙:** `[config-deploy]`
    *   **예상 결과:** 배포된 애플리케이션이 올바른 Supabase 프로젝트에 연결됩니다.
    *   **검증:** 배포된 애플리케이션이 인증 및 데이터 접근을 포함하여 올바르게 작동해야 합니다.

30. **Task:** README 및 문서 업데이트
    *   **액션:** `README.md` 및 기타 문서를 업데이트하여 새로운 Supabase 설정, 로컬 개발 워크플로우(`supabase start`, `supabase db reset`), 환경 변수 요구 사항을 반영합니다. Prisma 관련 지침을 제거합니다.
    *   **파일:** `README.md`
    *   **규칙:** `[docs-update]`
    *   **예상 결과:** 문서가 프로젝트 설정을 정확하게 반영합니다.

---

이 상세한 Tasklist는 마이그레이션을 위한 구조화된 접근 방식을 제공합니다. 각 주요 작업이나 단계를 완료하고 검증한 후 변경 사항을 자주 커밋하는 것을 잊지 마세요. 행운을 빕니다!