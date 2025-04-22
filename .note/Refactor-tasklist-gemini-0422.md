# Backyard 프로젝트 리팩토링 Tasklist

## 원칙 
  - ['three-layer-standard'] 아키텍처를 준수하고 
  - ['three-layer-standard'] 룰에 맞추어 파일 최상단에 @rule, @layer, @tag를 추가한다. 

*   ## A. 인증 개선 & React Query 기본 세팅

    ### Task 1: 통합 테스트 시나리오 점검 및 보강
    - 관련 파일: (테스트 파일 전반)
    - 변경 유형: [✅코드 추가]
    - 설명: 리팩토링에 앞서 **로그인/로그아웃**, **카드 생성/수정/삭제**, **태그 추가/삭제**, **아이디어맵 노드 추가/연결** 등의 핵심 플로우에 대한 통합 테스트를 확인합니다. 기존에 테스트가 없다면 이러한 시나리오의 테스트를 추가합니다. (예: 로그인 후 카드 생성 → 목록에 새로운 카드 표시, 카드 편집 → 내용이 업데이트됨, 카드 삭제 → 목록에서 제거, 태그 추가/삭제 → 태그 목록 갱신, 아이디어맵에서 카드 드롭 생성 → 목록/맵에 카드 반영 등)
    - 함수 시그니처: N/A (테스트 코드)
    - import 경로 변경: N/A
    - 적용 규칙: [pre-test]
    - 예상 결과: 리팩토링 전후에 주요 기능이 그대로 동작하는지 검증하는 안전망이 갖춰집니다. 로그인 상태 유지, 카드 CRUD, 태그 CRUD, 아이디어맵 상호작용 등 핵심 시나리오에서 회귀(regression)가 없는지 테스트를 통해 확인합니다.
    - 테스트 포인트: 
    - **인증**: 올바른 크리덴셜로 로그인 → 대시보드 접근 성공, 로그아웃 → 보호된 페이지 접근 차단.
    - **카드**: 카드 생성 → `CardList`에 새 카드 제목 나타남, 카드 수정 → 목록 아이템 내용 업데이트, 카드 삭제 → 목록에서 해당 카드 사라짐.
    - **태그**: 새 태그 추가 → 태그 필터/목록에 나타남, 태그 삭제 → 목록에서 제거되고 관련 카드의 태그 표시 업데이트.
    - **아이디어맵**: 맵 영역에 새 카드 드롭 → DB에 카드 생성되고 맵/목록에 노드 추가, 노드 클릭 → 사이드바에 내용 표시, 노드 연결(엣지) → 엣지 렌더링 확인.

    ---

    ### Task 2: React Query 클라이언트 Provider 컴포넌트 생성
    - 관련 파일: `/src/app/ReactQueryProvider.tsx` (신규)
    - 변경 유형: [✅코드 추가]
    - 설명: Next.js App Router에서 React Query를 사용하기 위해 클라이언트 컴포넌트를 생성합니다. `QueryClient` 인스턴스를 만들고 어플리케이션을 `QueryClientProvider`로 감싸는 `ReactQueryProvider` 컴포넌트를 구현합니다 ([Setting up React Query in a Next.js application](https://brockherion.dev/blog/posts/setting-up-and-using-react-query-in-nextjs/#:~:text=)). 이 컴포넌트는 `'use client'` 지시자를 최상단에 포함해 클라이언트 컴포넌트로 동작하도록 합니다.
    - 함수 시그니처:
    ```ts
    // /src/app/ReactQueryProvider.tsx
    "use client";
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

    export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
        const [queryClient] = useState(() => new QueryClient());
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }
    ```
    - import 경로 변경: N/A (새 컴포넌트 추가)
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: `ReactQueryProvider` 컴포넌트를 통해 전역 QueryClient 컨텍스트가 제공됩니다. 이로써 어플리케이션 내 어디서든 `useQuery`/`useMutation` 훅을 사용할 수 있으며, React Query DevTools를 설치했다면 개발 모드에서 쿼리 캐시를 확인할 수 있습니다.
    - 테스트 포인트: 어플리케이션 렌더 시 오류 없이 `QueryClientProvider`가 적용되는지 확인. React Query 훅 (`useQuery` 등) 사용 컴포넌트가 정상 동작하고, React Query DevTools를 열면 쿼리 목록이 표시되는지 확인.

    ### Task 3: QueryClientProvider를 레이아웃에 적용
    - 관련 파일: `/src/app/layout.tsx`
    - 변경 유형: [✅코드 추가]
    - 설명: Next.js 15 환경에서 최상위 레이아웃(서버 컴포넌트)에 바로 QueryClientProvider를 사용할 수 없으므로 ([Using React Query with Next.js App Router and Supabase Cache Helpers](https://supabase.com/blog/react-query-nextjs-app-router-cache-helpers#:~:text=The%20,g)), 앞서 만든 `ReactQueryProvider`를 레이아웃에서 활용합니다. 레이아웃 JSX에서 자식 컴포넌트를 `ReactQueryProvider`로 감싸 React Query 컨텍스트를 주입합니다.
    - 함수 시그니처:
    ```tsx
    // src/app/layout.tsx (일부 발췌)
    import { ReactQueryProvider } from '@/app/ReactQueryProvider';

    export default function RootLayout({ children }) {
        return (
        <html lang="ko">
            <body>
            <ReactQueryProvider>
                {children}
            </ReactQueryProvider>
            </body>
        </html>
        );
    }
    ```
    - import 경로 변경:
    ```ts
    import { ReactQueryProvider } from '@/app/ReactQueryProvider';
    ```
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 모든 페이지와 컴포넌트가 QueryClient 컨텍스트 하에 랜더링되며, 쿼리 훅들이 정상적으로 동작합니다. 
    - 테스트 포인트: 페이지를 로드하여 에러 없이 표시되는지 확인. React Query를 사용하는 테스트용 훅(예: `useQuery(['test'], fetchFn)`)을 임시로 만들어 정상 동작 여부를 확인하거나 React Query DevTools로 쿼리가 표시되는지 확인합니다.

    ### Task 4: 클라이언트 인증 유틸 (`lib/auth.ts`) 정리
    - 관련 파일: `/src/lib/auth.ts`
    - 변경 유형: [🗑️코드 삭제], [🔁리팩토링]
    - 설명: 클라이언트 측 인증 로직을 간소화합니다. 기존에 `localStorage/sessionStorage` 등을 사용해 토큰이나 `codeVerifier`를 저장/관리했다면 이를 제거합니다. Supabase의 쿠키 기반 세션을 활용하므로 더 이상 수동으로 토큰을 저장할 필요가 없습니다. `signInWith...`, `signOut` 등의 함수는 내부 구현을 Supabase JS SDK 호출로 단순화합니다. 예를 들어 OAuth 로그인은 `supabase.auth.signInWithOAuth()`로 바로 처리하고, 이메일 로그인은 `supabase.auth.signInWithPassword()` 등을 사용합니다.
    - 함수 시그니처:
    ```ts
    export async function signInWithEmail(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    }

    export async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Logout failed:', error);
    }
    ```
    - import 경로 변경:
    ```ts
    import { supabase } from '@/lib/supabaseClient'; // Supabase 클라이언트 초기화 객체
    ```
    - 적용 규칙: [supabase-ssr], [auth-refactor]
    - 예상 결과: `auth.ts`에는 더 이상 브라우저 저장소를 다루는 코드가 없고, Supabase SDK 호출로 인증이 수행됩니다. 로그인 함수 호출 시 Supabase가 자동으로 세션 쿠키를 설정하며, 로그아웃 시 쿠키를 삭제합니다.
    - 테스트 포인트: 이메일/비밀번호 또는 OAuth로 로그인 시 `supabase.auth.signIn...`이 호출되어 성공적으로 세션이 설정되는지 확인. 로그인 후 새로고침해도 세션 유지되는지 (Supabase 쿠키 기반), 로그아웃 호출 후 `supabase.auth.session()` 결과가 null인지 확인. 콘솔에 토큰 관련 경고나 에러가 더 이상 나오지 않아야 합니다.

    ### Task 5: `useAuth` 훅 구현 (클라이언트 인증 상태 구독)
    - 관련 파일: `/src/hooks/useAuth.ts` (신규)
    - 변경 유형: [✅코드 추가]
    - 설명: Supabase Auth 변경 이벤트를 구독하여 앱 상태에 반영하는 커스텀 훅을 만듭니다. 이 훅은 컴포넌트 최초 렌더 시 Supabase의 `supabase.auth.onAuthStateChange`를 등록하고, 인증 상태(event와 session 정보)를 수신합니다. 이벤트가 발생하면 `useAuthStore`의 사용자 프로필(`profile`)과 로딩 상태를 업데이트합니다. 또한 언마운트 시 리스너를 정리해 메모리 누수를 방지합니다. 이 훅은 전역에서 한 번 호출되어야 하며(예: `_app` 또는 레이아웃에서), 반환값으로 현재 사용자와 로딩/에러 상태를 제공해 필요 시 사용할 수 있게 합니다.
    - 함수 시그니처:
    ```ts
    interface AuthStatus {
        user: User | null;
        isLoading: boolean;
        error: Error | null;
    }

    export function useAuth(): AuthStatus {
        // ...
    }
    ```
    - import 경로 변경:
    ```ts
    import { supabase } from '@/lib/supabaseClient';
    import { useAuthStore } from '@/store/useAuthStore';
    ```
    - 적용 규칙: [supabase-ssr]
    - 예상 결과: `useAuth` 훅을 사용하면 애플리케이션이 실행될 때 Supabase 인증 상태 변화(로그인, 로그아웃)를 감지하여 전역 상태에 반영합니다. 예를 들어 사용자가 로그인하면 `useAuthStore`의 `profile`이 즉시 세팅되고, 로그아웃하면 `profile`이 `null`로 변경됩니다.
    - 테스트 포인트: 
    - 페이지에 `useAuth()`를 한 번 사용하고, 로그인/로그아웃 시 `useAuthStore`의 상태 변화가 일어나는지 확인. 
    - 로그인 시 `profile` 정보가 store에 저장되고, 로그아웃 시 `profile === null`이 되는지 DevTools로 확인.
    - 잘못된 인증 시 error 상태가 저장되는지 확인. 

    ### Task 6: `useAuthStore` Zustand 스토어 리팩토링
    - 관련 파일: `/src/store/useAuthStore.ts`
    - 변경 유형: [🗑️코드 삭제], [🔁리팩토링]
    - 설명: 인증 정보를 전역 상태로 관리하는 `useAuthStore`를 정리합니다. 기존에 토큰이나 코드베리파이어 등을 저장했다면 제거하고, Supabase 세션에 담긴 사용자 정보만 저장합니다. `useAuthStore`는 **프로필 정보**(예: `profile: User | null`), **로딩 상태**(`isLoading`), **에러 상태**(`error`)만 유지하도록 간소화합니다. 이 store는 주로 `useAuth` 훅의 이벤트에서 업데이트됩니다.
    - 함수 시그니처:
    ```ts
    interface AuthState {
        profile: User | null;
        isLoading: boolean;
        error: string | null;
        setProfile: (user: User | null) => void;
        setLoading: (loading: boolean) => void;
        setError: (error: string | null) => void;
    }
    export const useAuthStore = create<AuthState>((set) => ({
        profile: null,
        isLoading: true,
        error: null,
        setProfile: (user) => set({ profile: user }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (err) => set({ error: err }),
    }));
    ```
    - import 경로 변경: N/A (동일한 useAuthStore 훅을 유지)
    - 적용 규칙: [zustand-slice]
    - 예상 결과: `useAuthStore`에는 더 이상 `accessToken`, `refreshToken`, `codeVerifier` 등의 항목이 없고, 오직 현재 사용자 정보와 로딩/에러 상태만 존재합니다. 인증 관련 부가 액션 함수들도 제거되거나 단순화되었습니다. 이제 실제 인증 동작은 Supabase 클라이언트가 담당하고, store는 UI 표시를 위한 상태만 들고 있게 됩니다.
    - 테스트 포인트: 
    - `useAuthStore.getState()` 출력에 `profile`, `isLoading`, `error`만 포함되는지 확인.
    - 애플리케이션 시작 시 `isLoading`이 true로 설정되었다가, `useAuth` 훅을 통해 인증 확인 완료 후 false로 바뀌는지 확인.
    - 로그인 후 `profile`에 사용자의 이메일 등 정보가 들어가고, 로그아웃 후 `profile`이 `null`이 되는지 확인.

    ### Task 7: `AuthContext` 컨텍스트 제거
    - 관련 파일: `/src/context/AuthContext.tsx` (및 사용 부분)
    - 변경 유형: [🗑️코드 삭제]
    - 설명: 기존에 사용 중이던 AuthContext를 삭제합니다. 이제 인증 상태는 Supabase와 `useAuthStore`로 관리되므로, 별도의 React Context가 필요하지 않습니다. `AuthProvider`로 자식을 감싸는 코드를 제거하고, 그 대신 최상단에서 `useAuth()` 훅을 실행하여 인증 상태를 초기화합니다. 컴포넌트들이 인증 정보가 필요하면 `useAuthStore`를 직접 구독하거나 Supabase 클라이언트 (`supabase.auth.getUser()`)를 사용할 수 있습니다.
    - 함수 시그니처: N/A (컨텍스트 삭제)
    - import 경로 변경:
    ```ts
    // 예: 레이아웃 또는 _app에서
    - import { AuthProvider } from '@/context/AuthContext';
    ...
    - <AuthProvider>{children}</AuthProvider>
    + {children}
    ```
    - 적용 규칙: [no-context]
    - 예상 결과: 코드베이스에서 `AuthContext` 관련 코드가 모두 없어집니다. 예를 들어 `<AuthProvider>` JSX 래퍼와 `useContext(AuthContext)`로 인증 정보를 얻던 부분이 사라지고, 대신 `useAuthStore` 또는 Supabase API 사용으로 대체됩니다.
    - 테스트 포인트: 
    - 애플리케이션이 정상적으로 렌더링되고 콘솔 오류가 없는지 확인 (AuthContext missing 등 오류가 없어야 함).
    - 기존 `AuthContext`를 참조하던 컴포넌트들이 `useAuthStore`로 대체된 경우, 로그인 상태 표시 등이 여전히 정상 작동하는지 확인.
    - 로그인/로그아웃 시 화면 업데이트가 예상대로 이루어지는지 확인.

    ### Task 8: 로그인 페이지 액션 수정 (`login` 페이지)
    - 관련 파일: `/src/app/login/actions.ts` (또는 `/src/app/login/page.tsx` 내부)
    - 변경 유형: [🔁리팩토링]
    - 설명: 로그인 페이지의 폼 제출 액션 함수를 Supabase 기반으로 수정합니다. Next.js 15에서는 Server Action을 사용해 폼 데이터를 처리할 수 있으므로, 기존에 별도 API를 호출하거나 Context를 업데이트하던 로직을 단순화합니다. 예를 들어, `loginAction` 함수는 `lib/auth.ts`의 `signInWithEmail` 또는 `signInWithOAuth`를 호출하고, 에러가 있으면 throw하거나 redirect를 처리합니다. PKCE 코드 처리도 Supabase가 처리하므로 추가 로직이 필요 없습니다.
    - 함수 시그니처:
    ```ts
    'use server';
    import { signInWithEmail } from '@/lib/auth';

    export async function loginAction(formData: FormData) {
        "use server";
        const email = formData.get('email') as string;
        const pass = formData.get('password') as string;
        await signInWithEmail(email, pass);
        // (성공 시 페이지 리디렉션 등 처리)
    }
    ```
    - import 경로 변경:
    ```ts
    import { signInWithEmail, signInWithOAuth } from '@/lib/auth';
    ```
    - 적용 규칙: [server-action-ts]
    - 예상 결과: 로그인 폼 제출 시 별도의 Context 업데이트 없이도 Supabase 세션 쿠키를 통해 인증이 이루어집니다. `loginAction`은 성공하면 통상 `/` 등 보호된 페이지로 redirect하고, 실패하면 오류를 UI에 전달합니다. 
    - 테스트 포인트: 
    - 잘못된 자격 증명으로 로그인 시 에러 메시지가 표시되는지 확인 (`useAuthStore.error`를 사용하거나 `redirect('/auth/error')` 동작 확인).
    - 올바른 자격 증명 입력 후 로그인 액션이 호출되어 `supabase.auth.session()`에 세션이 생기고, `loginAction`이 끝난 뒤 원하는 페이지로 이동하는지 확인.

    ### Task 9: OAuth 콜백 Route 개선
    - 관련 파일: `/src/app/auth/callback/route.ts`
    - 변경 유형: [🔁리팩토링]
    - 설명: 소셜 로그인 OAuth 콜백 처리를 Supabase 헬퍼에 맡깁니다. Supabase Next.js 통합에서는 OAuth 로그인 후 이 콜백에서 `supabase.auth.exchangeCodeForSession` 등을 호출해 세션을 완료할 수 있습니다. 기존에 수동으로 코드와 code_verifier를 처리하던 로직이나 `AuthProvider`로부터 토큰을 받아 저장하던 부분이 있었다면 제거합니다. Supabase의 미들웨어(`supabase/middleware.ts`)가 PKCE code verifier 쿠키를 자동 처리하므로, 콜백에서는 할 일이 최소화됩니다. 구현은 인증 성공 시 메인 페이지로 redirect, 실패 시 에러 페이지로 redirect하는 정도입니다.
    - 함수 시그니처:
    ```ts
    import { NextResponse } from 'next/server';
    import { supabase } from '@/lib/supabaseClient';

    export async function GET(request: Request) {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.redirect(new URL('/auth/error', request.url));
    }
    ```
    - import 경로 변경: (불필요한 기존 import 제거)
    - 적용 규칙: [server-action-ts]
    - 예상 결과: OAuth 로그인(예: 구글 로그인)을 시도하면 Supabase가 제공한 redirect URI (`/auth/callback`)로 돌아오며, 이때 이 route가 호출되어 곧장 세션이 확립되고 홈 화면 등으로 이동합니다. 이전까지 수동으로 토큰을 다뤘다면 그런 코드가 삭제되어도 정상 동작해야 합니다.
    - 테스트 포인트:
    - 구글 등 OAuth 로그인 시 `/auth/callback`이 호출되고, 화면이 바로 대시보드로 넘어가는지 확인.
    - 네트워크 탭이나 로그에서 `exchangeCodeForSession` 호출 후 에러가 없는지 확인.
    - 의도적으로 OAuth 동의 창에서 취소하거나 오류를 발생시켜 `/auth/error`로 redirect되는지 확인.

    ### Task 10: 인증 에러 페이지 오류 표시
    - 관련 파일: `/src/app/auth/error/page.tsx`
    - 변경 유형: [🔁리팩토링]
    - 설명: 인증 실패 시 에러 메시지를 표시하는 페이지를 개선합니다. Supabase OAuth 실패나 기타 오류 상황에서 쿼리 스트링으로 전달된 `error` 내용을 읽어 사용자에게 보여줍니다. Next.js App Router의 `useSearchParams` 훅을 사용해 쿼리 파라미터를 읽고, 해당 오류 메시지를 페이지에 렌더링합니다.
    - 함수 시그니처:
    ```tsx
    import { useSearchParams } from 'next/navigation';

    export default function AuthErrorPage() {
        const searchParams = useSearchParams();
        const error = searchParams.get('error') || 'Unknown error';
        return <p>인증 도중 오류가 발생했습니다: {error}</p>;
    }
    ```
    - import 경로 변경:
    ```ts
    import { useSearchParams } from 'next/navigation';
    ```
    - 적용 규칙: [server-action-ts]
    - 예상 결과: `/auth/error` 페이지에 접근했을 때 쿼리로 전달된 오류 메시지가 화면에 표시됩니다. 예를 들어 `...?error=Access+Denied`로 들어오면 "인증 도중 오류가 발생했습니다: Access Denied" 문구를 보여줍니다.
    - 테스트 포인트:
    - 의도적으로 OAuth 흐름에서 에러를 발생시켜 `/auth/error?error=...`에 도달하게 하고, 해당 메시지가 잘 노출되는지 확인.
    - `useSearchParams` 훅 사용으로 인한 클라이언트 사이드 렌더링 이슈가 없는지(Next.js에서 해당 페이지를 클라이언트 컴포넌트로 두었는지) 확인.

    ---

*   ## B. 서비스 계층 구축 + 카드 모듈 React Query 적용

    ### Task 11: 카드 API 서비스 모듈 생성
        - 관련 파일: `/src/services/cardService.ts`
        - 변경 유형: [✅코드 추가]
    - 설명: 
        - 카드 관련 모든 서버 통신을 한 모듈로 집약한다.
        - 단건 + 소배치 작업은 기존 /api/cards 엔드포인트, 대량(비동기) 작업은 /api/cards/bulk (202 Accepted) 패턴을 따른다.
        - 상위(Hooks·Components)는 이 Service 함수를 통해서만 네트워크를 호출한다.
    
    - 구현 함수 목록 & 시그니처
    ```ts
    // /src/services/cardService.ts
    import { Card, CardInput, CardPatch } from '@/types';

    /* ---------------- 조회 ---------------- */
    export async function fetchCards(
    params?: { q?: string; tag?: string }
    ): Promise<Card[]> { /* ... */ }

    export async function fetchCardById(id: string): Promise<Card> { /* ... */ }

    /* ---------------- 생성 ---------------- */
    /** 단건 또는 소배치(≤50) */
    export async function createCardsAPI(
    input: CardInput | CardInput[]
    ): Promise<Card[]> { /* ... */ }

    /** 대량(>50) 비동기 생성 → 202 + 토큰 */
    export async function createCardsBulkAPI(
    batch: CardInput[]
    ): Promise<{ token: string }> { /* ... */ }

    /* ---------------- 수정 ---------------- */
    /** 단건(부분 수정) */
    export async function updateCardAPI(
    id: string,
    patch: CardPatch
    ): Promise<Card> { /* ... */ }

    /** 대량(비동기) 부분 수정 */
    export async function updateCardsBulkAPI(
    patches: CardPatch[]
    ): Promise<{ token: string }> { /* ... */ }

    /* ---------------- 삭제 ---------------- */
    /** 단건 삭제 */
    export async function deleteCardAPI(id: string): Promise<void> { /* ... */ }

    /** 다건(≤100) 동기 삭제 */
    export async function deleteCardsAPI(ids: string[]): Promise<void> { /* ... */ }

    /** 대량(비동기) 삭제 */
    export async function deleteCardsBulkAPI(
    ids: string[]
    ): Promise<{ token: string }> { /* ... */ }
    ```
    - 에러 처리 
        - res.ok 가 false 면 throw new Error(res.statusText).<br>응답 파싱 — return res.json() (필요 시 Zod 검증).
        - Bulk API 는 202 Accepted + Location 헤더(URL /api/bulk-status/{token})를 기대.

    - 앤드 포인트 매핑
        함수 | Method / URI | Body 예시
        fetchCards | GET /api/cards?tag=... | —
        fetchCardById | GET /api/cards/{id} | —
        createCardsAPI | POST /api/cards | {…} or [{…},{…}]
        createCardsBulkAPI | POST /api/cards/bulk | [{…}, …]
        updateCardAPI | PATCH /api/cards/{id} | { title?: … }
        updateCardsBulkAPI | PATCH /api/cards/bulk | [ {id, patch}, … ]
        deleteCardAPI | DELETE /api/cards/{id} | —
        deleteCardsAPI | DELETE /api/cards?ids=1,2 | —
        deleteCardsBulkAPI | POST /api/cards/bulk-delete | { ids: [...] }

    - 사용 예시 (import 경로 변경)
    ```ts
    import * as cardService from '@/services/cardService';

    const cards = await cardService.createCardsAPI({ title: 'New' });
    await cardService.createCardsBulkAPI(manyCards);        // 202 flow

    ```
    - 테스트 포인트 (@service-msw 태그)
        - **단건 / 배열 POST:** MSW 로 POST /api/cards 핸들러 작성, createCardsAPI([{…},{…}]).length === 2 검사.
        - **Bulk 202:** POST /api/cards/bulk → 202 + Location 헤더 mock, 반환 토큰이 예상 형식인지 확인.
        - **오류 케이스:** 404 응답 시 함수가 throw 하는지 검증.
        - 테스트 파일 위치 /src/services/cardService.test.ts
        - MSW 핸들러 /src/tests/msw/cardHandlers.ts 에 엔드포인트 추가.

    - 예상 결과
        - 컴포넌트·훅은 직접 fetch 하지 않고 cardService.*만 사용.
        - Bulk 작업은 토큰→폴링 패턴으로 비동기 진행.
        - API URI·스키마가 중앙 집중되어 유지보수성이 향상된다.

    ### Task 12: `useCards` 목록 조회 훅 생성
    - 관련 파일: `/src/hooks/useCards.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 카드 목록을 가져오는 React Query 훅을 구현합니다. `useQuery`를 사용하여 서버에서 카드 데이터를 불러오고 캐싱합니다. 쿼리 키는 **`['cards', { q, tag }]`** 형태로 정의하여 검색어나 태그별로 캐시를 구분합니다. `queryFn`으로 앞서 만든 `cardService.fetchCards`를 호출합니다. 옵션으로 `enabled`를 통해 필요한 경우에만 실행하거나, `staleTime` 등을 설정할 수 있습니다 (예: 실시간성보다는 약간 stale 허용 가능).
    - 함수 시그니처:
    ```ts
    import { useQuery, UseQueryResult } from '@tanstack/react-query';
    import { fetchCards } from '@/services/cardService';

    export function useCards(q?: string, tag?: string): UseQueryResult<Card[], Error> {
        return useQuery({
        queryKey: ['cards', { q: q || '', tag: tag || '' }],
        queryFn: () => fetchCards({ q, tag }),
        staleTime: 1000 * 5, // 5초 정도 데이터 캐시
        });
    }
    ```
    - import 경로 변경:
    ```ts
    import { useCards } from '@/hooks/useCards';
    ```
    - 적용 규칙: [tanstack-query-hook], [query-key-structure]
    - 예상 결과: 이 훅을 사용하면 카드 리스트를 서버에서 가져와 `data`, `isLoading`, `error` 등을 반환합니다. 검색어나 태그 필터가 변경되면 쿼리 키가 달라져 자동으로 새로운 요청을 보내거나 캐시된 결과를 제공합니다. 
    - 테스트 포인트: 
    - 컴포넌트에서 `const { data: cards, isLoading, error } = useCards();`를 호출했을 때 초기에는 `isLoading=true`로 표시되고, 서버 응답 후 `cards` 배열이 채워지는지 확인.
    - `useCards('검색어')` 등으로 호출 시 쿼리 키가 달라져 별도의 요청이 일어나는지 확인.
    - React Query DevTools에서 `['cards', {...}]` 형태의 캐시가 생성되고 상태가 관리됨을 확인.

    - 관련 파일: `/src/app/api/users/first/route.ts`
    - 변경 유형: [🗑️코드 삭제]
    - 설명: 리팩토링 전 임시로 사용되던 API 엔드포인트와 관련 코드를 삭제합니다. 특히 `/api/users/first`는 첫 번째 사용자 ID를 가져오는 용도로 썼을 가능성이 있는데, 이제 Supabase 인증으로 사용자 정보를 얻을 수 있으므로 불필요합니다. 
    - `/api/users/first` 라우트 파일 삭제.
    - 이를 호출하던 부분 (예: `fetchFirstUserId` useEffect 등) 제거. CreateCardModal에서 userId를 세팅하던 로직이 있었다면, 이제 `useAuthStore.profile?.id`를 쓰거나, 서버에서 userId를 자동 할당하도록 변경했으므로 제거합니다.
    - 함수 시그니(표 제약으로 인해 나머지 Task는 다음 메시지에 계속됩니다.)

    ### Task 13: `useCard` 단건 조회 훅 생성
    - 관련 파일: `/src/hooks/useCard.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 특정 카드 ID에 대한 상세 정보를 가져오는 훅입니다. `useQuery`의 `queryKey`를 **`['card', cardId]`**로 설정하고, `queryFn`으로 `cardService.fetchCardById`를 사용합니다. `cardId`가 유효할 때만 동작하도록 `enabled: !!cardId` 옵션을 사용합니다.
    - 함수 시그니처:
    ```ts
    import { useQuery, UseQueryResult } from '@tanstack/react-query';
    import { fetchCardById } from '@/services/cardService';
    import { Card } from '@/types'; // 카드 타입 임포트 가정

    export function useCard(cardId?: string): UseQueryResult<Card, Error> {
        return useQuery({
        queryKey: ['card', cardId],
        queryFn: () => fetchCardById(cardId!),
        enabled: !!cardId,
        });
    }
    ```
    - import 경로 변경: `import { useCard } from '@/hooks/useCard';`
    - 적용 규칙: [tanstack-query-hook], [query-key-structure]
    - 예상 결과: 카드 상세 페이지나 편집 모달에서 개별 카드 데이터를 최신 상태로 유지하는 데 사용됩니다. `cardId`가 설정되면 자동으로 데이터를 가져옵니다.
    - 테스트 포인트: `useCard('id')` 호출 시 `/api/cards/[id]` 요청 확인, 반환 데이터 확인, `enabled` 옵션 동작 확인.

    ### Task 14: `CardList` 컴포넌트 Query 훅으로 리팩토링
    - 관련 파일: `/src/components/cards/CardList.tsx`
    - 변경 유형: [🗑️코드 삭제], [🔁리팩토링]
    - 설명: `CardList` 컴포넌트에서 카드 목록을 가져오는 로직을 `useCards` 훅 사용으로 변경합니다.
        - `useAppStore` 또는 `useEffect` + `fetch` 로직 제거.
        - `const { data: cards, isLoading, error } = useCards(qParam, tagParam);` 호출로 데이터 가져오기 (`qParam`, `tagParam`은 `useSearchParams`로 얻음).
        - `isLoading`, `error` 상태를 사용하여 로딩 및 에러 UI 처리.
    - 함수 시그니처: (예시)
    ```tsx
    import { useCards } from '@/hooks/useCards';
    import { useSearchParams } from 'next/navigation';

    export default function CardList() {
        const searchParams = useSearchParams();
        const q = searchParams.get('q') || '';
        const tag = searchParams.get('tag') || '';
        const { data: cards, isLoading, error } = useCards(q, tag);

        if (isLoading) return <p>Loading...</p>;
        if (error) return <p>Error: {error.message}</p>;
        return ( /* 카드 목록 렌더링 */ );
    }
    ```
    - import 경로 변경: `useCards` 추가, `useAppStore` 및 관련 상태 훅 제거.
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: `CardList`가 전역 store 의존 없이 자체적으로 카드 목록을 가져오고 캐시 관리합니다. URL 파라미터 변경 시 자동으로 목록이 갱신됩니다.
    - 테스트 포인트: 페이지 로드 시 `useCards`로 데이터 받아 렌더링 확인, 로딩/에러 상태 UI 확인, URL 파라미터 변경 시 목록 업데이트 확인.

    ### Task 15: `useCreateCard` 카드 생성 Mutation 훅 생성
    - 관련 파일: `/src/hooks/useCreateCard.ts` (기존 파일 수정 또는 신규 생성)
    - 변경 유형: [✅코드 추가] + [🛠기존 코드 수정]
    - 설명: 카드 생성을 위한 `useMutation` 훅을 구현합니다. `mutationFn`으로 `cardService.createCardsAPI`를 호출하고, 성공 시 `queryClient.invalidateQueries({ queryKey: ['cards'] })`로 카드 목록 캐시를 무효화합니다.
    - 함수 시그니처: (Task 16 내용 참고)
    ```ts
    import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
    import { Card, CardInput } from '@/types';
    import { createCardsAPI } from '@/services/cardService';

    export function useCreateCard(): UseMutationResult<Card[], Error, CardInput | CardInput[]> {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (payload) => createCardsAPI(payload),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['cards'] });
            },
        });
    }
    ```
    - import 경로 변경: `import { useCreateCard } from '@/hooks/useCreateCard';`
    - 적용 규칙: [tanstack-query-hook], [cache-inval]
    - 예상 결과: 이 훅을 사용하여 카드를 생성하면, 성공 후 `CardList`가 자동으로 최신 목록을 다시 로드합니다.
    - 테스트 포인트: `mutate` 호출 시 `/api/cards` POST 요청 확인, 성공 시 `['cards']` 쿼리 invalidated 확인, 실패 시 `error` 상태 확인.

    ### Task 16: `useUpdateCard` 카드 수정 Mutation 훅 생성
    - 관련 파일: `/src/hooks/useUpdateCard.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 단일 카드 수정을 위한 `useMutation` 훅을 구현합니다. `mutationFn`으로 `cardService.updateCardAPI`를 호출하고, 성공 시 `['cards']` 목록 캐시와 `['card', cardId]` 상세 캐시를 모두 무효화합니다.
    - 함수 시그니처: (Task 17 내용 참고)
    ```ts
    import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
    import { Card, CardPatch } from '@/types';
    import { updateCardAPI } from '@/services/cardService';

    export function useUpdateCard(cardId: string): UseMutationResult<Card, Error, CardPatch> {
        const queryClient = useQueryClient();
        return useMutation({
            mutationKey: ['updateCard', cardId], // mutation key 추가
            mutationFn: (patch) => updateCardAPI(cardId, patch),
            onSuccess: (updatedCard) => {
                queryClient.invalidateQueries({ queryKey: ['cards'] });
                queryClient.invalidateQueries({ queryKey: ['card', cardId] });
                // 선택적으로 상세 캐시를 직접 업데이트할 수도 있음
                // queryClient.setQueryData(['card', cardId], updatedCard);
            },
        });
    }
    ```
    - import 경로 변경: `import { useUpdateCard } from '@/hooks/useUpdateCard';`
    - 적용 규칙: [tanstack-query-hook], [cache-inval], [query-key]
    - 예상 결과: 카드 수정 성공 시, 카드 목록과 해당 카드의 상세 정보가 자동으로 갱신됩니다.
    - 테스트 포인트: `mutate` 호출 시 `/api/cards/[id]` PATCH 요청 확인, 성공 시 `['cards']` 및 `['card', id]` 쿼리 invalidated 확인, 실패 시 `error` 상태 확인.

    ### Task 17: `useDeleteCard` 카드 삭제 Mutation 훅 생성
    - 관련 파일: `/src/hooks/useDeleteCard.ts` (및 Bulk 버전 추가)
    - 변경 유형: [✅코드 추가]
    - 설명: 단일 카드 삭제를 위한 `useMutation` 훅을 구현합니다. `mutationFn`으로 `cardService.deleteCardAPI`를 호출하고, 성공 시 `['cards']` 목록 캐시를 무효화하고 `['card', cardId]` 상세 캐시를 제거(`removeQueries`)합니다. (Bulk 삭제 훅도 필요시 Task 18 내용 참고하여 추가)
    - 함수 시그니처: (Task 18 내용 참고 - 단건)
    ```ts
    import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
    import { deleteCardAPI } from '@/services/cardService';

    export function useDeleteCard(cardId: string): UseMutationResult<void, Error, void> {
        const queryClient = useQueryClient();
        return useMutation({
            mutationKey: ['deleteCard', cardId],
            mutationFn: () => deleteCardAPI(cardId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['cards'] });
                queryClient.removeQueries({ queryKey: ['card', cardId] });
            },
        });
    }
    ```
    - import 경로 변경: `import { useDeleteCard } from '@/hooks/useDeleteCard';`
    - 적용 규칙: [tanstack-query-hook], [cache-inval]
    - 예상 결과: 카드 삭제 성공 시, 카드 목록이 갱신되고 해당 카드의 상세 정보 캐시가 제거됩니다.
    - 테스트 포인트: `mutate` 호출 시 `/api/cards/[id]` DELETE 요청 확인, 성공 시 `['cards']` 쿼리 invalidated 및 `['card', id]` 캐시 제거 확인, 실패 시 `error` 상태 확인.

    ### Task 18: `CreateCardModal` 컴포넌트 리팩토링
    - 관련 파일: `/src/components/cards/CreateCardModal.tsx`
    - 변경 유형: [🔁리팩토링]
    - 설명: 새 카드 생성 모달에서 `useCreateCard` 훅을 사용하도록 변경합니다.
        - `const { mutate: createCard, isLoading, error, isSuccess } = useCreateCard();` 호출.
        - 폼 `onSubmit`에서 `createCard(formData)` 호출.
        - `isLoading`, `error` 상태를 UI에 반영.
        - `isSuccess` 상태를 사용하여 성공 시 모달 닫기 처리 (`useEffect` 또는 `onSuccess` 콜백).
        - `useAppStore` 관련 액션 호출 제거.
    - 함수 시그니처: (Task 19 내용 참고)
    - import 경로 변경: `useCreateCard` 추가, `useAppStore` 제거.
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 카드 생성 모달이 React Query mutation 기반으로 동작하며, 성공 시 자동으로 카드 목록이 갱신됩니다.
    - 테스트 포인트: 모달에서 카드 추가 시 `/api/cards` POST 요청 후 모달 닫힘 및 `CardList` 업데이트 확인, 에러/로딩 상태 UI 확인.

    ### Task 19: 카드 편집 컴포넌트 리팩토링
    - 관련 파일: `/src/components/cards/EditCardContent.tsx` (또는 `EditCardModal.tsx`)
    - 변경 유형: [🔁리팩토링]
    - 설명: 카드 편집 UI에서 `useUpdateCard` 훅을 사용하도록 변경합니다.
        - `const { mutate: updateCard, isLoading, error, isSuccess } = useUpdateCard(cardId);` 호출.
        - 폼 저장 시 `updateCard({ title, content })` 호출.
        - `isLoading`, `error`, `isSuccess` 상태를 UI 및 편집 모드 종료 로직에 반영.
        - `useAppStore` 관련 액션 호출 제거.
    - 함수 시그니처: (Task 20 내용 참고)
    - import 경로 변경: `useUpdateCard` 추가, `useAppStore` 제거.
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 카드 편집 및 저장 시 React Query mutation 기반으로 동작하며, 성공 시 자동으로 카드 목록 및 상세 정보가 갱신됩니다.
    - 테스트 포인트: 내용 수정 후 저장 시 `/api/cards/[id]` PATCH 요청 후 UI 업데이트 확인, 에러/로딩 상태 UI 확인.

    ### Task 20: 카드 삭제 버튼 컴포넌트 리팩토링
    - 관련 파일: `/src/components/cards/DeleteButton.tsx` (또는 CardList 내 로직)
    - 변경 유형: [🔁리팩토링]
    - 설명: 카드 삭제 버튼(또는 관련 UI)에서 `useDeleteCard` 훅을 사용하도록 변경합니다.
        - `const { mutate: deleteCard, isLoading } = useDeleteCard(cardId);` 호출.
        - 삭제 확인 후 `deleteCard()` 호출.
        - `isLoading` 상태를 UI에 반영 (예: 버튼 비활성화).
        - `useAppStore` 관련 액션 호출 제거.
    - 함수 시그니처: (Task 21 내용 참고)
    - import 경로 변경: `useDeleteCard` 추가, `useAppStore` 제거.
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 카드 삭제 시 React Query mutation 기반으로 동작하며, 성공 시 자동으로 카드 목록이 갱신됩니다.
    - 테스트 포인트: 삭제 버튼 클릭 및 확인 시 `/api/cards/[id]` DELETE 요청 후 `CardList`에서 해당 카드 제거 확인, 로딩 상태 UI 확인.

    ### Task 21: `useAppStore`에서 카드 액션 제거
    - 관련 파일: `/src/store/useAppStore.ts`
    - 변경 유형: [🗑️코드 삭제]
    - 설명: 이제 카드 생성/수정/삭제가 모두 React Query mutation 훅으로 처리되므로, `useAppStore`에 남아있던 관련 액션(`createCard`, `updateCard`, `deleteCard` 등)과 관련 로딩 상태(`isCreating`, `isDeleting` 등)를 완전히 제거합니다.
    - 함수 시그니처: (Task 22 내용 참고)
    - import 경로 변경: N/A
    - 적용 규칙: [zustand-slice]
    - 예상 결과: `useAppStore`는 더 이상 카드 데이터 CRUD 액션을 가지지 않습니다. 책임이 Query 훅으로 완전히 이전되었습니다.
    - 테스트 포인트: 앱 빌드 및 실행 시 오류 없는지 확인, `useAppStore.getState()` 결과에 카드 CRUD 액션이 없는지 확인.

    **(섹션 B 완료 후)** 애플리케이션을 실행하여 카드 목록 조회, 생성, 편집, 삭제 기능이 모두 정상적으로 동작하는지 수동으로 테스트합니다. React Query DevTools를 통해 캐시 상태와 쿼리/뮤테이션 동작을 확인합니다.

---

*   ## C. 태그 관리 기능 React Query 적용

*이 섹션 완료 후, 태그 목록 조회, 생성, 삭제 및 태그 필터 기능이 React Query 기반으로 동작해야 합니다.*

### Task 22: 태그 API 서비스 모듈 생성 (`/src/services/tagService.ts`)
- 관련 파일: `/src/services/tagService.ts`
- 변경 유형: [✅코드 추가]
- 설명: 태그 관련 API 호출 함수(`fetchTags`, `createTagAPI`, `deleteTagAPI`)를 포함하는 서비스 모듈을 생성합니다.
- 함수 시그니처: (Task 23 내용 참고)
- import 경로 변경: N/A (신규 파일)
- 적용 규칙: [api-service-layer]
- 예상 결과: 태그 관련 API 호출 로직이 중앙화됩니다.
- 테스트 포인트: 각 서비스 함수가 예상된 API 엔드포인트로 요청을 보내고 응답을 처리하는지 단위 테스트 또는 MSW로 검증.

### Task 23: `useTags` 태그 목록 조회 훅 생성
- 관련 파일: `/src/hooks/useTags.ts`
- 변경 유형: [✅코드 추가]
- 설명: 모든 태그 목록을 가져오는 `useQuery` 훅을 구현합니다. `queryKey`는 `['tags']`, `queryFn`은 `tagService.fetchTags`를 사용합니다.
- 함수 시그니처: (Task 24 내용 참고)
- import 경로 변경: `import { useTags } from '@/hooks/useTags';`
- 적용 규칙: [tanstack-query-hook], [query-key-structure]
- 예상 결과: 앱 전체에서 태그 목록을 일관되게 가져오고 캐싱할 수 있습니다.
- 테스트 포인트: `useTags()` 호출 시 `/api/tags` GET 요청 확인, 반환 데이터 확인.

### Task 24: `useCreateTag` 태그 생성 Mutation 훅 생성
- 관련 파일: `/src/hooks/useCreateTag.ts`
- 변경 유형: [✅코드 추가]
- 설명: 새 태그 생성을 위한 `useMutation` 훅을 구현합니다. `mutationFn`으로 `tagService.createTagAPI`를 호출하고, 성공 시 `['tags']` 쿼리를 무효화합니다.
- 함수 시그니처: (Task 25 내용 참고)
- import 경로 변경: `import { useCreateTag } from '@/hooks/useCreateTag';`
- 적용 규칙: [tanstack-query-hook], [cache-inval]
- 예상 결과: 태그 생성 성공 시 태그 목록이 자동으로 갱신됩니다.
- 테스트 포인트: `mutate('태그명')` 호출 시 `/api/tags` POST 요청 확인, 성공 시 `['tags']` 쿼리 invalidated 확인.

### Task 25: `useDeleteTag` 태그 삭제 Mutation 훅 생성
- 관련 파일: `/src/hooks/useDeleteTag.ts`
- 변경 유형: [✅코드 추가]
- 설명: 태그 삭제를 위한 `useMutation` 훅을 구현합니다. `mutationFn`으로 `tagService.deleteTagAPI`를 호출하고, 성공 시 `['tags']` 쿼리를 무효화합니다.
- 함수 시그니처: (Task 26 내용 참고)
- import 경로 변경: `import { useDeleteTag } from '@/hooks/useDeleteTag';`
- 적용 규칙: [tanstack-query-hook], [cache-inval]
- 예상 결과: 태그 삭제 성공 시 태그 목록이 자동으로 갱신됩니다.
- 테스트 포인트: `mutate('태그ID')` 호출 시 `/api/tags/[id]` DELETE 요청 확인, 성공 시 `['tags']` 쿼리 invalidated 확인.

### Task 26: `TagList` 컴포넌트 리팩토링
- 관련 파일: `/src/components/tags/TagList.tsx`
- 변경 유형: [🔁리팩토링]
- 설명: 태그 목록을 표시하는 컴포넌트에서 `useTags` 훅을 사용하도록 변경합니다. 로딩/에러 상태를 처리하고, 태그 삭제 버튼이 있다면 `useDeleteTag` 훅을 사용하도록 수정합니다.
- 함수 시그니처: (Task 27 내용 참고 - 일부)
  ```tsx
  import { useTags } from '@/hooks/useTags';
  import { useDeleteTag } from '@/hooks/useDeleteTag'; // 삭제 기능이 있다면

  function TagList() {
      const { data: tags, isLoading, error } = useTags();
      const { mutate: deleteTag } = useDeleteTag(); // 삭제 기능 hook

      const handleDelete = (tagId: string) => {
          // 확인 절차 후
          // deleteTag(tagId);
      };
      // ... 렌더링 로직 ...
  }
  ```
- import 경로 변경: `useTags`, `useDeleteTag` 추가, `useAppStore` 제거.
- 적용 규칙: [tanstack-query-hook]
- 예상 결과: 태그 목록 UI가 React Query 기반으로 동작하며, 태그 추가/삭제 시 자동으로 업데이트됩니다.
- 테스트 포인트: 태그 목록 정상 렌더링 확인, 태그 삭제 버튼 클릭 시 동작 및 목록 갱신 확인.

### Task 27: 태그 생성 폼 컴포넌트 리팩토링
- 관련 파일: `/src/components/tags/TagForm.tsx`
- 변경 유형: [🔁리팩토링]
- 설명: 태그 생성 폼에서 `useCreateTag` 훅을 사용하도록 변경합니다. 폼 제출 시 `mutate` 함수를 호출하고, 로딩/에러/성공 상태를 UI에 반영합니다.
- 함수 시그니처: (Task 28 내용 참고)
- import 경로 변경: `useCreateTag` 추가, `useAppStore` 제거.
- 적용 규칙: [tanstack-query-hook]
- 예상 결과: 태그 생성 폼이 React Query 기반으로 동작하며, 성공 시 자동으로 태그 목록이 갱신됩니다.
- 테스트 포인트: 태그 추가 시 `/api/tags` POST 요청 및 `TagList` 업데이트 확인, 로딩/에러 상태 UI 확인.

### Task 28: 태그 필터 컴포넌트 리팩토링
- 관련 파일: `/src/components/tags/TagFilter.tsx`
- 변경 유형: [🔁리팩토링]
- 설명: 태그 필터 UI에서 `useTags` 훅으로 태그 목록을 가져오고, 태그 선택 시 URL 파라미터(`?tag=`)를 변경하여 `CardList`와 연동되도록 수정합니다 (`useRouter` 또는 `Link` 사용).
- 함수 시그니처: (Task 29 내용 참고)
- import 경로 변경: `useTags` 추가, `useAppStore` 제거.
- 적용 규칙: [tanstack-query-hook], [query-key-structure]
- 예상 결과: 태그 필터가 URL 상태 기반으로 동작하며, 선택 시 `CardList`가 자동으로 해당 태그의 카드만 보여줍니다.
- 테스트 포인트: 필터 버튼 클릭 시 URL 파라미터 변경 및 `CardList` 필터링 확인.

### Task 29: `useAppStore`에서 태그 상태 제거 (있는 경우)
- 관련 파일: `/src/store/useAppStore.ts`
- 변경 유형: [🗑️코드 삭제]
- 설명: `useAppStore`에 태그 관련 상태(`tags`, `selectedTag`)나 액션이 있었다면 제거합니다.
- 함수 시그니처: (Task 30 내용 참고)
- import 경로 변경: N/A
- 적용 규칙: [zustand-slice]
- 예상 결과: 태그 관련 상태는 전역 store에서 완전히 제거됩니다.
- 테스트 포인트: 앱 빌드 및 실행 시 오류 없는지 확인, `useAppStore.getState()` 결과에 태그 관련 상태 없는지 확인.

**(섹션 C 완료 후)** 애플리케이션을 실행하여 태그 목록 조회, 생성, 삭제 및 카드 필터링 기능이 모두 정상적으로 동작하는지 수동으로 테스트합니다.

---

*   ## D. Zustand 스토어 슬라이스 분리 및 통합

*이 섹션 완료 후, Zustand 스토어가 UI 상태 중심으로 재구성되고, 기존 기능이 새 스토어 구조에서 동작해야 합니다.*

### Task 30: UI 상태 슬라이스 (`createUiSlice`) 생성
- 관련 파일: `/src/store/uiSlice.ts`
- 변경 유형: [✅코드 추가]
- 설명: 사이드바 열림/닫힘, 너비 등 UI 관련 전역 상태와 액션을 관리하는 Zustand 슬라이스를 생성합니다.
- 함수 시그니처: (Task 31 내용 참고)
- 적용 규칙: [zustand-slice]
- 예상 결과: UI 관련 상태 로직이 별도 파일로 분리됩니다.

### Task 31: 카드 선택 상태 슬라이스 (`createCardStateSlice`) 생성
- 관련 파일: `/src/store/cardStateSlice.ts`
- 변경 유형: [✅코드 추가]
- 설명: 카드 선택(`selectedCardIds`) 및 확장(`expandedCardId`) 상태와 관련 액션을 관리하는 Zustand 슬라이스를 생성합니다. 기존 단일 선택 로직은 다중 선택 기반으로 통합합니다.
- 함수 시그니처: (Task 32 내용 참고)
- 적용 규칙: [zustand-slice]
- 예상 결과: 카드 선택 관련 상태 로직이 별도 파일로 분리됩니다.

### Task 32: 테마 설정 슬라이스 (`createThemeSlice`) 생성
- 관련 파일: `/src/store/themeSlice.ts`
- 변경 유형: [✅코드 추가]
- 설명: 앱 테마(light/dark) 및 노드 크기 등 테마 관련 전역 상태와 액션을 관리하는 Zustand 슬라이스를 생성합니다. (기존 `ThemeContext` 대체 목적)
- 함수 시그니처: (Task 33 내용 참고)
- 적용 규칙: [zustand-slice]
- 예상 결과: 테마 관련 상태 로직이 별도 파일로 분리됩니다.

### Task 33: `useAppStore` 루트 스토어에 슬라이스 통합
- 관련 파일: `/src/store/useAppStore.ts`
- 변경 유형: [🔁리팩토링]
- 설명: 생성된 슬라이스들(`createUiSlice`, `createCardStateSlice`, `createThemeSlice`)을 `create` 함수의 콜백 내에서 spread syntax (...)를 사용하여 하나의 루트 스토어(`useAppStore`)로 통합합니다. `AppState` 타입도 모든 슬라이스 타입을 합쳐 정의합니다. **주의:** 이 단계에서 기존 `useAppStore`에 남아있던 다른 상태(예: `cards`는 아직 제거 전일 수 있음)도 함께 통합하거나, 다음 섹션에서 제거할 때까지 유지해야 합니다.
- 함수 시그니처: (Task 34 내용 참고)
- 적용 규칙: [zustand-slice]
- 예상 결과: `useAppStore`가 슬라이스 기반으로 재구성됩니다. 외부 사용 방식은 동일하지만 내부 구조가 모듈화됩니다.
- 테스트 포인트: 앱 실행 후 `useAppStore.getState()`로 전체 상태 구조 확인, 기존 UI 기능(사이드바, 테마 등) 동작 확인.

**(섹션 D 완료 후)** 애플리케이션을 실행하여 기존의 UI 상태 관련 기능(사이드바, 테마 등)이 슬라이스 통합 후에도 정상적으로 동작하는지 확인합니다. Zustand DevTools를 사용하면 상태 구조 변화를 더 명확히 볼 수 있습니다.

---

*## E. 전역 상태 관리 전환 (Context -> Zustand)

*이 섹션 완료 후, 기존에 Context API로 관리되던 상태들이 Zustand 스토어 기반으로 전환되어야 합니다.*

### Task 34: `ThemeContext` 삭제 및 테마 전역 상태 통합
- 관련 파일: `/src/context/ThemeContext.tsx` (및 사용처)
- 변경 유형: [🗑️코드 삭제]
- 설명: `ThemeContext`와 `ThemeProvider`를 프로젝트에서 완전히 제거합니다.
- 함수 시그니처: N/A (삭제)
- 적용 규칙: [no-context]
- 예상 결과: ThemeContext 관련 코드가 사라지고, 테마 상태는 `useAppStore`를 통해 관리됩니다.
- 테스트 포인트: 앱 빌드 및 실행 시 `ThemeContext` 참조 오류 없는지 확인.

### Task 35: 테마/노드 크기 컨텍스트 사용부 `useAppStore`로 변경
- 관련 파일: 테마/노드 크기 설정을 사용/변경하던 컴포넌트들 (예: `/src/components/settings/NodeSizeSettings.tsx`)
- 변경 유형: [🔁리팩토링]
- 설명: `useContext(ThemeContext)`를 사용하던 곳을 `useAppStore` 훅을 사용하도록 변경합니다.
    - `const theme = useAppStore(state => state.theme);`
    - `const updateTheme = useAppStore(state => state.updateTheme);`
    - `const nodeSize = useAppStore(state => state.nodeSize);`
    - `const updateNodeSize = useAppStore(state => state.updateNodeSize);`
- 함수 시그니처: (Task 36 내용 참고)
- 적용 규칙: [zustand-slice]
- 예상 결과: 테마 및 노드 크기 관련 UI가 Zustand 스토어와 연동되어 동작합니다.
- 테스트 포인트: 테마 토글, 노드 크기 조절 기능이 정상 동작하고 `useAppStore` 상태가 업데이트되는지 확인.

### Task 36: 카드 선택 상태 사용부 업데이트
- 관련 파일: 카드 선택/확장 상태를 사용하던 컴포넌트들 (예: `/src/components/layout/Sidebar.tsx`, IdeaMap 노드 컴포넌트)
- 변경 유형: [🔁리팩토링]
- 설명: 카드 선택/확장 상태를 `useAppStore`의 `cardStateSlice` 부분에서 가져오도록 수정합니다.
    - `const selectedIds = useAppStore(state => state.selectedCardIds);`
    - `const expandedId = useAppStore(state => state.expandedCardId);`
    - 카드 선택/해제 액션 호출: `selectCards`, `toggleSelectedCard`, `clearSelectedCards`, `toggleExpandCard` 사용.
- 함수 시그니처: (Task 37 내용 참고)
- 적용 규칙: [zustand-slice]
- 예상 결과: 카드 선택/확장 UI가 새로운 Zustand 슬라이스 기반으로 동작합니다.
- 테스트 포인트: 단일/다중 카드 선택, 선택 해제, 카드 상세보기 확장/축소 기능이 정상 동작하는지 확인.

### Task 37: `useNodeStore` (노드 인스펙터 상태) 제거
- 관련 파일: `/src/store/useNodeStore.ts` (및 사용처)
- 변경 유형: [🗑️코드 삭제]
- 설명: 별도로 존재했던 `useNodeStore`를 제거하고, 노드 상세 보기/인스펙터 기능은 `useAppStore`의 `expandedCardId` 상태를 사용하도록 통합/리팩토링합니다.
- 함수 시그니처: N/A (삭제)
- 적용 규칙: [no-context] (Store 중복 제거)
- 예상 결과: 노드 인스펙터 관련 중복 상태 관리가 제거되고 `useAppStore`로 일원화됩니다.
- 테스트 포인트: 노드 상세보기/인스펙터 기능이 `expandedCardId` 기반으로 정상 동작하는지 확인.

**(섹션 E 완료 후)** 애플리케이션을 실행하여 테마, 카드 선택, 노드 상세보기 등의 기능이 Context API 대신 Zustand 스토어를 통해 잘 동작하는지 확인합니다.

---

*   ## F. 아이디어맵 (IdeaMap) 리팩토링 및 최종 상태 분리

*이 섹션 완료 후, IdeaMap 컴포넌트가 React Query 및 분리된 Zustand 스토어 기반으로 동작하며, `useAppStore`에서 카드 데이터가 완전히 제거됩니다.*

### Task 38: `useIdeaMapStore` 리팩토링 (아이디어맵 UI 상태 전용)
- 관련 파일: `/src/store/useIdeaMapStore.ts`
- 변경 유형: [🗑️코드 삭제], [🔁리팩토링]
- 설명: `useIdeaMapStore`에서 데이터 로딩/저장, 레이아웃 계산 등 UI 상태와 직접 관련 없는 로직을 제거합니다. React Flow의 `nodes`, `edges`, `viewport` 상태와 `onNodesChange`, `onEdgesChange`, `onConnect` 등의 핸들러만 남깁니다.
- 함수 시그니처: (Task 38 내용 참고)
- 적용 규칙: [zustand-slice]
- 예상 결과: `useIdeaMapStore`가 순수하게 React Flow UI 상태 관리 역할만 수행합니다. **이 단계에서 IdeaMap 기능이 일시적으로 깨질 수 있습니다.**
- 테스트 포인트: 스토어 구조 변경 확인, 기본적인 노드 드래그/연결 등 UI 인터랙션은 유지되는지 확인 (데이터 로딩/저장은 아직 동작하지 않음).

### Task 39: `useIdeaMapSync` 훅 생성 (서버-로컬 데이터 동기화)
- 관련 파일: `/src/hooks/useIdeaMapSync.ts`
- 변경 유형: [✅코드 추가]
- 설명: `useCards` 훅으로 카드 데이터를 구독하고, 이 데이터가 변경될 때마다 `useIdeaMapStore`의 `nodes` 상태를 업데이트하는 훅을 구현합니다. 카드 추가/삭제/변경 시 노드 배열을 재계산하여 `setNodes`를 호출합니다. 초기 로딩 및 레이아웃 정보 로드(localStorage 등) 로직도 포함될 수 있습니다.
- 함수 시그니처: (Task 39 내용 참고)
- 적용 규칙: [tanstack-query-hook], [zustand-slice]
- 예상 결과: 이 훅을 사용하는 컴포넌트(IdeaMap)는 서버의 카드 데이터 변경에 따라 자동으로 React Flow 노드를 업데이트합니다.
- 테스트 포인트: 카드 생성/삭제/수정 시 IdeaMap 노드가 동기화되는지 확인, 초기 로딩 시 노드가 정상적으로 표시되는지 확인.

### Task 40: `useIdeaMapInteractions` 훅 생성 (상호작용 핸들러 통합)
- 관련 파일: `/src/hooks/useIdeaMapInteractions.ts`
- 변경 유형: [✅코드 추가]
- 설명: IdeaMap의 이벤트 핸들러(노드 클릭, 배경 클릭, 드롭, 엣지 연결 등) 로직을 모아놓은 훅을 구현합니다. 내부적으로 `useAppStore`(카드 선택), `useCreateCard`(드롭 시 생성), `useIdeaMapStore`(엣지 추가) 등을 사용합니다.
- 함수 시그니처: (Task 40 내용 참고)
- 적용 규칙: [zustand-slice], [tanstack-query-hook]
- 예상 결과: IdeaMap 컴포넌트의 이벤트 처리 로직이 간결해지고, 관련 로직이 이 훅에 캡슐화됩니다.
- 테스트 포인트: 노드 클릭 시 카드 선택, 배경 클릭 시 선택 해제, 드롭 시 카드 생성, 엣지 연결 기능 등이 정상 동작하는지 확인.

### Task 41: `useIdeaMapLayout` 훅 생성 (레이아웃 및 저장)
- 관련 파일: `/src/hooks/useIdeaMapLayout.ts`
- 변경 유형: [✅코드 추가]
- 설명: 자동 레이아웃 적용(`applyAutoLayout`) 및 현재 레이아웃 저장/로드(`saveLayout`, `loadLayout`) 기능을 제공하는 훅을 구현합니다. 레이아웃 정보는 localStorage 또는 추후 API를 통해 관리할 수 있습니다.
- 함수 시그니처: (Task 41 내용 참고)
- 적용 규칙: [zustand-slice] (노드 상태 접근/수정)
- 예상 결과: 자동 레이아웃 및 레이아웃 저장/복원 기능이 이 훅을 통해 제공됩니다.
- 테스트 포인트: 자동 레이아웃 적용 확인, 레이아웃 저장 후 새로고침 시 복원 확인.

### Task 42: `IdeaMap` 컴포넌트 최종 리팩토링 및 `store.cards` 완전 제거
- 관련 파일: `/src/components/ideamap/components/IdeaMap.tsx`, `/src/store/useAppStore.ts`
- 변경 유형: [🔁리팩토링], [🗑️코드 삭제]
- 설명:
    1.  `IdeaMap` 컴포넌트 내부 로직을 대폭 수정하여, `useIdeaMapSync`, `useIdeaMapInteractions`, `useIdeaMapLayout` 훅들을 사용하도록 변경합니다. 컴포넌트 자체는 상태 관리나 복잡한 로직 없이 훅에서 반환된 상태와 핸들러를 React Flow 컴포넌트에 전달하는 역할 위주로 단순화됩니다.
    2.  **이제 모든 컴포넌트가 `useCards` 또는 `useIdeaMapSync`를 통해 카드 데이터를 얻으므로, `useAppStore`에서 `cards` 필드와 `setCards` 액션을 완전히 제거합니다.**
- 함수 시그니처: (Task 42 내용 참고 - IdeaMap 예시)
- 적용 규칙: [tanstack-query-hook], [zustand-slice], [separation-of-concerns]
- 예상 결과: `IdeaMap` 컴포넌트 코드가 훨씬 간결해지고, 상태 관리 및 로직이 커스텀 훅으로 분리됩니다. `useAppStore`에는 더 이상 카드 데이터 배열이 존재하지 않습니다.
- 테스트 포인트: IdeaMap의 모든 기능(노드 표시, 상호작용, 레이아웃)이 정상 동작하는지 최종 확인. `useAppStore.getState()` 결과에 `cards` 필드가 없는지 확인.

**(섹션 F 완료 후)** 애플리케이션을 실행하여 아이디어맵 기능이 새 구조에서 완전히 동작하는지, 그리고 카드 데이터가 더 이상 전역 Zustand 스토어에 의존하지 않는지 확인합니다.

---

*   ## G. 최종 정리 및 문서화

*이 섹션은 리팩토링 완료 후 마무리 작업입니다.*

### Task 43: (선택) `useEdge` 훅 구현 또는 엣지 관리 방식 확정
- 관련 파일: (신규 또는 `/src/components/ideamap/hooks/useEdges.ts` 개선)
- 변경 유형: [✅코드 추가] / [🔁리팩토링]
- 설명: 현재 엣지는 `useIdeaMapStore`에서 로컬 상태로 관리되고 있습니다. 만약 엣지도 서버에 저장/로드해야 한다면, 카드와 유사하게 `edgeService`, `useEdges`, `useCreateEdge`, `useDeleteEdge` 등을 구현하고 관련 컴포넌트(주로 `useIdeaMapInteractions`)를 업데이트해야 합니다. 만약 엣지를 계속 로컬(localStorage)로 관리한다면, `useIdeaMapLayout` 훅에서 `saveEdges`, `loadEdges` 로직을 구현하거나 별도 훅으로 분리합니다. (Task 44 내용 기반으로 구체화 필요)

### Task 44: (선택) 아이디어맵 설정 저장 기능 확정
- 관련 파일: `/src/hooks/useIdeaMapLayout.ts` 또는 신규 훅
- 변경 유형: [🔁리팩토링]
- 설명: 아이디어맵의 UI 설정(스냅 그리드, 엣지 스타일 등)을 저장하는 방식을 확정합니다. 현재 `useAppStore.themeSlice` 등에서 일부 관리되지만, 영구 저장이 필요하다면 `saveIdeaMapSettingsToServer` API 호출 등을 `useIdeaMapLayout` 또는 별도 설정 훅에 통합합니다. (Task 45 내용 기반으로 구체화 필요)

### Task 45: 불필요한 API 및 코드 제거
- 관련 파일: `/src/app/api/users/first/route.ts` 등
- 변경 유형: [🗑️코드 삭제]
- 설명: 리팩토링 과정에서 더 이상 사용되지 않는 임시 API 엔드포인트나 유틸리티 함수, 컴포넌트 등을 최종적으로 정리하고 삭제합니다. (Task 46 내용)
- 예상 결과: 코드베이스가 정리되고 불필요한 파일이 제거됩니다.

### Task 46: 아키텍처 및 리팩토링 문서화
- 관련 파일: README.md 또는 별도 아키텍처 문서
- 변경 유형: [📝문서 추가/수정]
- 설명: 변경된 아키텍처(React Query 도입, Zustand 슬라이스 구조, 서비스 계층 분리 등)를 문서화합니다. 각 훅과 스토어의 역할, 데이터 흐름 등을 명확히 기록하여 향후 유지보수 및 협업에 도움을 줍니다. AI 협업 과정에서 얻은 인사이트나 결정 사항도 포함할 수 있습니다.

### Task 47: 최종 통합 테스트 및 회귀 테스트
- 관련 파일: (테스트 파일 전반)
- 변경 유형: [✅테스트 추가/수정]
- 설명: 리팩토링 완료 후 전체 애플리케이션의 핵심 기능들이 모두 정상적으로 동작하는지 다시 한번 확인합니다. Task 1에서 작성/보강했던 통합 테스트 시나리오를 실행하여 회귀(regression)가 없는지 검증합니다.

---

이 재구성된 Tasklist는 각 주요 UI 영역별로 리팩토링을 진행하고, 각 섹션 완료 시 해당 기능이 동작 가능한 상태가 되도록 의존성을 고려하여 배치했습니다. 특히 위험도가 높은 전역 상태 제거(예: `useAppStore.cards`)는 관련 컴포넌트들이 모두 새로운 방식(Query Hooks)으로 업데이트된 후에 수행하도록 순서를 조정했습니다.

이제 이 Tasklist를 기반으로 차근차근 진행하시면 중간 단계에서도 애플리케이션을 실행하며 테스트하기 용이할 것입니다. 행운을 빌어요!