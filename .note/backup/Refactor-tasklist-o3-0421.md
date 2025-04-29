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

    ### Task 13: `useCard` 단건 조회 훅 생성
    - 관련 파일: `/src/hooks/useCard.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 특정 카드 ID에 대한 상세 정보를 가져오는 훅입니다. `useQuery`의 `queryKey`를 **`['card', cardId]`**로 설정하고, `queryFn`으로 `cardService.fetchCardById`를 사용합니다. 이 훅은 `cardId`가 유효할 때만 동작하도록 `enabled: !!cardId` 옵션을 주어, `cardId`가 `undefined` 또는 빈 경우에 쿼리를 생략합니다.
    - 함수 시그니처:
    ```ts
    import { useQuery, UseQueryResult } from '@tanstack/react-query';
    import { fetchCardById } from '@/services/cardService';

    export function useCard(cardId?: string): UseQueryResult<Card, Error> {
        return useQuery({
        queryKey: ['card', cardId],
        queryFn: () => fetchCardById(cardId!),
        enabled: !!cardId,
        });
    }
    ```
    - import 경로 변경:
    ```ts
    import { useCard } from '@/hooks/useCard';
    ```
    - 적용 규칙: [tanstack-query-hook], [query-key-structure]
    - 예상 결과: 컴포넌트가 `useCard(cardId)`를 사용하면 해당 카드의 상세 정보를 서버에서 가져옵니다. `cardId`가 아직 없으면 요청을 보내지 않고 대기하며, `cardId`가 설정되면 자동으로 fetch를 수행합니다. 이 훅은 상세 페이지나 카드 편집 모달에서 개별 카드 데이터를 최신 상태로 유지하는 데 사용될 수 있습니다.
    - 테스트 포인트: 
    - `useCard('abcd-1234')` 사용 시 `/api/cards/abcd-1234`로 요청이 발생하고, 응답 데이터가 `data`로 반환되는지 확인.
    - 없는 ID로 호출 시 쿼리 결과의 `error`가 세팅되는지 확인.
    - `enabled` 옵션 작동 확인: `useCard(undefined)`일 때 네트워크 요청이 발생하지 않아야 합니다.

    ### Task 14: `CardList` 컴포넌트 Query 훅으로 리팩토링
    - 관련 파일: `/src/components/cards/CardList.tsx`
    - 변경 유형: [🗑️코드 삭제], [🔁리팩토링]
    - 설명: 카드 목록을 표시하는 `CardList` 컴포넌트를 React Query 기반으로 수정합니다. 기존에는 컴포넌트 내에서 `useAppStore`를 통해 `cards` 상태를 가져오고, `useEffect`에서 직접 `fetch('/api/cards')`를 호출한 뒤 `setCards`로 상태를 업데이트했을 것입니다. 이를 제거하고 다음과 같이 변경합니다:
    - 상단에서 `const { data: cards, isLoading, error } = useCards(qParam, tagParam);`를 호출해 카드 데이터를 가져옵니다. `qParam`과 `tagParam`는 `useSearchParams()`를 사용해 URL에서 읽어온 검색어와 태그값입니다.
    - 더 이상 `useAppStore()`로 `cards`를 가져오지 않고, `setCards`도 호출하지 않습니다. 대신 `useCards` 훅이 제공하는 `cards` 데이터를 바로 사용합니다.
    - 로딩 상태 표시: `isLoading`이 true이면 로딩 스피너나 메시지를 표시하고, `error`가 있으면 에러 메시지를 표시합니다. 기존에 `useState`로 관리하던 `loading`은 제거합니다.
    - 필터링: 이전에 `filteredCards = useMemo(...)`로 `cards`를 클라이언트 필터링하던 로직이 있었다면, 필터 값을 쿼리 키에 포함시켰으므로 서버 응답이 이미 필터링된 상태일 수 있습니다. 만약 서버측 필터를 아직 구현하지 않았다면, 기존 방식대로 `cards`를 `q`와 `tag`로 필터링하는 로직을 유지해도 됩니다.
    - 함수 시그니처:
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
        return (
        <div>
            {cards?.map(card => (
            <CardItem key={card.id} card={card} />
            ))}
        </div>
        );
    }
    ```
    - import 경로 변경:
    ```ts
    import { useCards } from '@/hooks/useCards';
    - import { useAppStore } from '@/store/useAppStore';
    - import { useEffect, useState } from 'react';
    ```
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: `CardList`는 전역 store에 의존하지 않고 자체적으로 카드 목록을 가져옵니다. React Query가 캐시를 관리하므로 목록은 필요한 시점에 자동 최신화됩니다. 예를 들어, 다른 컴포넌트에서 카드 생성 후 `invalidateQueries(['cards'])`가 호출되면 이 `CardList`가 알아서 최신 데이터를 받아 표시합니다.
    - 테스트 포인트: 
    - 페이지 로드 시 CardList가 `useCards`를 통해 데이터를 받고 정상 렌더링하는지 확인. 기존과 동일한 카드 목록이 표시되어야 합니다.
    - 로딩 중/에러 발생 시 UI에 해당 상태가 잘 반영되는지 확인 (예: 네트워크를 느리게 해서 "Loading..." 표시 확인, 의도적으로 API를 실패하게 해서 "Error: ..." 표시 확인).
    - (통합) 다른 곳에서 카드가 추가/삭제된 후 이 컴포넌트가 자동으로 업데이트되는지는 이후 뮤테이션 훅 적용 후 추가로 확인합니다.

    ### Task 15: `useAppStore`에서 카드 목록 상태 제거
    - 관련 파일: `/src/store/useAppStore.ts`
    - 변경 유형: [🗑️코드 삭제]
    - 설명: 이제 카드 목록은 React Query로 관리되므로, `useAppStore`가 `cards` 배열을 들고 있을 필요가 없습니다. 또한 `setCards` 액션과, `updateCard`처럼 카드 리스트를 직접 조작하는 함수도 제거합니다. **주의:** IdeaMap 등 다른 부분에서 `useAppStore().cards`를 사용 중이라면, 추후 IdeaMap 리팩토링(Task 38~43)에서 대체될 것이므로 여기서는 우선 store에서 제거하고 해당 사용처에서 문제 없도록 함께 처리하거나 주석해둡니다.
    - 함수 시그니처:
    ```diff
    interface AppState {
    -   cards: Card[];
    -   setCards: (cards: Card[]) => void;
    -   updateCard: (updated: Card) => void;
        // ... (다른 상태와 액션들)
    }
    export const useAppStore = create<AppState>((set) => ({
    -   cards: [],
    -   setCards: (cards) => set({ cards }),
    -   updateCard: (updated) => set((state) => ({
    -     cards: state.cards.map(c => c.id === updated.id ? updated : c)
    -   })),
        // ... (기타 상태 및 액션)
    }));
    ```
    - import 경로 변경: N/A
    - 적용 규칙: [zustand-slice]
    - 예상 결과: 전역 store에서 더 이상 카드 데이터가 유지되지 않습니다. `useAppStore.getState().cards` 등의 접근은 undefined가 되거나 존재하지 않게 됩니다. 이제 카드 목록의 단일 원천은 React Query 캐시에 있는  ([Query Invalidation | TanStack Query React Docs](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation#:~:text=%2F%2F%20Invalidate%20every%20query%20with,queryKey%3A%20%5B%27todos%27%5D))†L323-L330】. (IdeaMap 등에서 이 데이터를 쓰던 부분은 곧 `useCards` 등으로 대체됩니다.)
    - 테스트 포인트: 
    - 애플리케이션 빌드 시 `useAppStore(state => state.cards)` 등을 참조하던 곳에서 타입 오류가 없는지 확인 (해당 참조도 삭제/변경되어야 합니다).
    - CardList가 store가 아닌 Query에서 데이터를 가져오므로, store에서 cards 제거 후에도 CardList 기능이 정상임을 확인.
    - (IdeaMap 관련은 추후 task에서 처리 예정이므로, 이 단계에서는 IdeaMap에서 오류가 발생할 수 있습니다. 일시적으로 IdeaMap 관련 코드를 `null` 체크하거나 추후 수정 시까지 예외 처리해둘 수 있습니다.)

    ---

    ### Task 16: `useCreateCard` 카드 생성 Mutation 훅 생성
    - 관련 파일: `/src/hooks/useCreateCard.ts` (🛠 기존 useCreateCard.ts → 이름·시그니처 변경)
    - 변경 유형: [✅ 코드 추가] + [🛠 기존 코드 수정]
    - 설명: 
        - TanStack React Query의 useMutation 훅으로 단일 객체 또는 50 개 이하 배열을 처리한다.
        - 서비스 함수 cardService.createCardsAPI 를 호출해 /api/cards POST 요청을 보낸다.
        - 성공 시 queryClient.invalidateQueries({ queryKey: ['cards'] }) 로 카드 목록을 무효화하여 자동 새로고침한다. (추후 낙관적 업데이트나 캐시 직접 조정으로 성능을 높일 수 있지만 1차 리팩터에서는 간단 invalidate 전략 사용.)
    - 함수 시그니처:
    ```ts
    /**
     * @rule   Backyard-ThreeLayer-Standard
    * @layer  hook
    * @tag    @tanstack-mutation-msw useCreateCards
    */

    'use client';

    import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
    import { Card, CardInput } from '@/types';
    import { createCardsAPI } from '@/services/cardService';

    export function useCreateCards(): UseMutationResult<Card[], Error, CardInput | CardInput[]> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => createCardsAPI(payload),
        onSuccess: () => {
        // 단건·배열 모두 목록 캐시를 무효화
        queryClient.invalidateQueries({ queryKey: ['cards'] });
        },
    });
    }

    ```
    - import 경로 변경:
    ```ts
    import { useCreateCards } from '@/hooks/useCreateCards';
    ```
    - 적용 규칙: [tanstack-query-hook] + [cache-inval]
    - 예상 결과
        - 폼에서 mutate를 호출하면 /api/cards에 POST가 발생한다.
        - 성공 시 ['cards'] 쿼리가 invalidated → CardList가 자동으로 최신 목록을 다시 가져온다.
    - 테스트 포인트 (@tanstack-mutation-msw)
        - 단건 payload → MSW 201 응답 → cards 캐시 길이 +1 확인
        - 배열 2 건 payload → 캐시 +2 확인
        - 실패(500) 시 error 객체 노출 및 UI 에러 표시(예: Toast)
        - React Query DevTools에서 mutation 상태(isLoading 등) 및 cards 쿼리 재‑fetch 여부 확인
        - 주의: 50 개 초과 배치는 Task 17 useCreateCardsBulk 를 사용해야 하며, 이 훅 내부에서 createCardsBulkAPI(202) 로 자동 전환되도록 구현한다.

    ### Task 17: `useUpdateCard` 카드 수정 Mutation 훅 생성
    - 관련 파일: `/src/hooks/useUpdateCard.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 
        - TanStack React Query의 useMutation 훅으로 단일 카드를 부분 수정한다.
        - 서비스 함수 cardService.updateCardAPI 를 호출하고, 성공 시 목록·상세 캐시를 모두 무효화해 UI를 자동 갱신한다.
    - 함수 시그니처:
    ```ts
    /**
    * @rule   Backyard-ThreeLayer-Standard
    * @layer  hook
    * @tag    @tanstack-mutation-msw useUpdateCard
    */

    'use client';

    import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
    import { Card, CardPatch } from '@/types';
    import { updateCardAPI } from '@/services/cardService';

    export function useUpdateCard(
    cardId: string
    ): UseMutationResult<Card, Error, CardPatch> {
        const queryClient = useQueryClient();

        return useMutation({
            mutationKey: ['updateCard', cardId],
            mutationFn: (patch) => updateCardAPI(cardId, patch),

            onSuccess: (updated) => {
            // 1) 목록 캐시
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            // 2) 상세 캐시 (존재할 경우)
            queryClient.invalidateQueries({ queryKey: ['card', cardId] });
            },
        });
    }
    ```
    ```ts
    CardPatch = Partial<Card> /* title, content, tag 등 선택 필드 */
    ```

    - import 경로 변경:
    ```ts
    import { useUpdateCard } from '@/hooks/useUpdateCard';
    ```
    - 적용 규칙: [tanstack-mutation-msw], [cache-inval], [query-key]
    - 예상 결과
        - 편집 폼에서 mutate({ title: '새 제목' }) 호출 → PATCH /api/cards/{id}
        - 성공 시 ['cards'], ['card', id] 쿼리가 stale → 자동 refetch
        - 리스트와 상세 화면 모두 새 제목으로 갱신됨
    - 테스트 포인트:
        케이스 | 검증 내용
        정상 수정 | MSW PATCH /api/cards/{id} → 200 mockCard, waitFor → queryClient.getQueryData(['card',id]).title === '새 제목'
        목록 invalidate | getQueryState(['cards']).isInvalidated === true
        검증 실패 | MSW 400 응답 시 error 객체 전달, UI 에러 토스트 표시
        ~~~
        Bulk(여러 카드) 수정은 Task 18 useUpdateCardsBulk 에서 처리하므로, 이 훅은 단건 전용입니다.
        ~~~

    ### Task 18: `useDeleteCard` 카드 삭제 Mutation 훅 생성
    - 관련 파일: `/src/hooks/useDeleteCard.ts`, '/src/hooks/useDeleteCardsBulk.ts'
    - 변경 유형: [✅코드 추가]
    - 쿼리 키 정책
        - ['cards'] invalidate
        - ['card', id] remove
    - 설명
        - 단건 삭제는 리스트/상세 캐시를 즉시 정리한다.
        - 대량 삭제는 토큰 기반 폴링(useBulkStatus)으로 완료를 감지한 뒤 캐시를 무효화한다.

    - 함수 시그니처: 단건 삭제 useDeleteCard
    ```ts
    /**
     * @rule   Backyard-ThreeLayer-Standard
    * @layer  hook
    * @tag    @tanstack-mutation-msw useDeleteCard
    */

    'use client';

    import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
    import { deleteCardAPI } from '@/services/cardService';

    export function useDeleteCard(
    cardId: string
    ): UseMutationResult<void, Error, void> {
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
    - 함수 시그니처 : 대량 삭제 useDeleteCardsBulk
    ```ts
    /**
     * @rule   Backyard-ThreeLayer-Standard
    * @layer  hook
    * @tag    @tanstack-mutation-msw useDeleteCardsBulk
    */

    'use client';

    import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
    import { deleteCardsBulkAPI } from '@/services/cardService';
    import { useBulkStatus } from '@/hooks/useBulkStatus';

    export function useDeleteCardsBulk(): UseMutationResult<
    { token: string },
    Error,
    string[]
    > {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteCardsBulk'],
        mutationFn: (ids) => deleteCardsBulkAPI(ids), // POST /api/cards/bulk-delete → 202
        onSuccess: ({ token }) => {
        // 1) 상태 폴링
        useBulkStatus(token, {
            onCompleted: () => {
            // 2) 완료 시 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            },
        });
        },
    });
    }
    ```
    - import 경로 변경:
    ```ts
    /* /src/hooks/useDeleteCard.ts */
    import { deleteCardAPI } from '@/services/cardService';     // 서비스 함수
    import { useDeleteCard } from '@/hooks/useDeleteCard';      // 훅 사용시 컴포넌트 + 다른 훅에서 

    /* /src/hooks/useDeleteCardsBulk.ts */
    import { deleteCardsBulkAPI } from '@/services/cardService';    // 서비스 함수 
    import { useBulkStatus } from '@/hooks/useBulkStatus';     // 상태 폴링 훅
    import { useDeleteCardsBulk } from '@/hooks/useDeleteCardsBulk';    // 훅 사용시
    ```
    - MSW 핸들러 : /src/tests/msw/cardHandlers.ts
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과:
        - 단건 삭제 버튼 : useDeleteCard(card.id).mutate() → 리스트에서 즉시 사라짐, 상세 캐시 제거.
        - 다건 선택 후 “Delete” : useDeleteCardsBulk(ids).mutate() → 작업 진행률 표시, 완료 후 리스트 새로 고침.
    - 테스트 포인트:
        케이스 | 단건(useDeleteCard) | 대량(useDeleteCardsBulk)
        정상 | MSW DELETE /api/cards/{id} → 204, 캐시 invalidate·remove 확인 | MSW POST /api/cards/bulk-delete → 202 + Location, useBulkStatus 폴링 후 ['cards'] invalidate
        에러 | 404 응답 → error 노출, UI 에러 토스트 | 400 응답 → error 노출
        DevTools | cards 쿼리 stale → re‑fetch | bulk 쿼리 polling 확인

*   ## C. 태그 관리 리팩터링

    ### Task 19: `CreateCardModal` 컴포넌트 리팩토링 (카드 생성)
    - 관련 파일: `/src/components/cards/CreateCardModal.tsx`
    - 변경 유형: [🔁리팩토링]
    - 설명: 새 카드 생성 모달 컴포넌트를 React Query 기반으로 변경합니다. 기존에 이 컴포넌트는 내부 상태로 입력 값을 관리하고, 폼 제출 시 `fetch('/api/cards')`를 호출하거나 `useAppStore.createCard` 액션을 사용했을 것입니다. 이를 다음과 같이 수정합니다:
    - 상단에서 `const { mutate: createCard, isLoading, error } = useCreateCard();` 를 호출해 mutation 훅을 사용합니다.
    - 폼 `onSubmit` 이벤트에서 `createCard(formData)`를 호출하여 새 카드 생성을 트리거합니다. `createCard` 호출 시 알아서 API 요청 → 성공 시 캐시 무효화까지 처리됩니다.
    - 요청 진행 중에는 `isLoading`을 활용해 생성 버튼을 비활성화하거나 로딩 인디케이터를 표시합니다. 에러 발생 시 `error.message`를 UI에 표시하거나 토스트로 알려줍니다.
    - 카드 생성이 성공하면 모달을 닫아야 합니다. `onSuccess` 시점에 부모로부터 받은 `onClose` 콜백을 호출하거나, `createCard` 호출 뒤 `.finally`에서 모달을 닫도록 처리합니다.
    - 더 이상 `useAppStore()`를 통해 상태를 업데이트하지 않습니다. (ex: `useAppStore.getState().createCard()` 같은 호출 제거)
    - 함수 시그니처:
    ```tsx
    import { useCreateCard } from '@/hooks/useCreateCard';

    function CreateCardModal({ open, onClose }) {
        const [title, setTitle] = useState('');
        const [content, setContent] = useState('');
        const { mutate: createCard, isLoading, error, isSuccess } = useCreateCard();

        const handleSubmit = () => {
        createCard({ title, content });
        };

        useEffect(() => {
        if (isSuccess) {
            onClose(); // 생성 성공 시 모달 닫기
        }
        }, [isSuccess]);

        return (
        <Dialog open={open} onOpenChange={onClose}>
            {/* ...모달 내용... */}
            <form onSubmit={handleSubmit}>
            {/* 제목, 내용 입력 필드 */}
            <button type="submit" disabled={isLoading}>추가</button>
            {error && <p>Error: {error.message}</p>}
            </form>
        </Dialog>
        );
    }
    ```
    - import 경로 변경:
    ```ts
    import { useCreateCard } from '@/hooks/useCreateCard';
    - import { useAppStore } from '@/store/useAppStore';
    ```
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: "새 카드 만들기" 모달에서 추가 버튼을 누르면 `useCreateCard`가 API 호출을 하고, 성공 시 자동으로 카드 리스트가 갱신됩니다. 이때 모달은 onSuccess에 의해 닫히고, `CardList`에 새 카드 항목이 나타납니다. 로컬 상태로 관리하던 로딩 플래그 등이 제거되어 코드가 간결해집니다 (React Query의 `isLoading` 활용).
    - 테스트 포인트:
    - 모달을 열고 제목/내용을 입력한 뒤 추가 버튼 클릭 → `/api/cards`에 POST 요청 후 모달이 닫히고 목록에 새 아이템이 나타나는지 확인.
    - 제목을 비우는 등 오류 조건 → `error` 메시지가 모달 내에 표시되고 모달이 유지되는지 확인.
    - 연속해서 여러 카드를 추가해보고, 매번 목록이 즉시 업데이트되는지 확인.
    - `isLoading` 동안 버튼이 disabled되어 중복 클릭이 방지되는지 확인.

    ### Task 20: 카드 편집 컴포넌트 리팩토링 (내용 수정)
    - 관련 파일: `/src/components/cards/EditCardContent.tsx` (또는 `EditCardModal.tsx`)
    - 변경 유형: [🔁리팩토링]
    - 설명: 카드 내용을 편집하는 컴포넌트를 React Query 기반으로 수정합니다. 이 컴포넌트는 아마 카드 상세 화면에서 내용 부분을 표시/편집하는 역할을 하고 있을 것입니다. 기존에는 내부에서 fetch로 PATCH 요청을 보내거나 `useAppStore.updateCard`를 호출했을 수 있습니다. 이를:
    - 상단에서 `const { mutate: updateCard, isLoading, error, isSuccess } = useUpdateCard(cardId);`를 호출.
    - 편집 폼 submit 시 `updateCard({ content: newContent, title: newTitle })` 등 변경된 필드만 보내도록 호출.
    - 성공 시 편집 UI를 닫거나, 편집 모드를 false로 전환합니다 (`isSuccess`를 effect로 감지하거나 `onSuccess` 옵션에서 처리).
    - 로딩 중에는 입력 필드나 버튼을 비활성화해 중복 요청을 막습니다.
    - `error`가 있다면 메시지를 표시합니다 (예: "내용 수정에 실패했습니다" 등).
    - (만약 이 컴포넌트에서만 카드 데이터를 관리했다면, 필요시 상위에서 `useCard(cardId)` 훅을 사용해 최신 데이터를 넘겨줄 수도 있음. 하지만 invalidateQueries로 CardList가 업데이트되므로, 이 컴포넌트는 로컬 상태 또는 props로 받은 `initialContent`를 편집해 submit하고, 완료 후 상위에서 리렌더시 최신 내용을 받을 것으로 보임.)
    - 함수 시그니처:
    ```tsx
    import { useUpdateCard } from '@/hooks/useUpdateCard';

    function EditCardContent({ cardId, initialContent, onCancel }) {
        const [content, setContent] = useState(initialContent);
        const { mutate: updateCard, isLoading, error, isSuccess } = useUpdateCard(cardId);

        const handleSave = () => updateCard({ content });

        useEffect(() => {
        if (isSuccess) {
            onCancel(); // Save 성공하면 편집 모드 종료
        }
        }, [isSuccess]);

        return (
        <div>
            <Editor value={content} onChange={setContent} disabled={isLoading} />
            <button onClick={handleSave} disabled={isLoading}>저장</button>
            <button onClick={onCancel} disabled={isLoading}>취소</button>
            {error && <p className="error">Error: {error.message}</p>}
        </div>
        );
    }
    ```
    - import 경로 변경:
    ```ts
    import { useUpdateCard } from '@/hooks/useUpdateCard';
    - import { useAppStore } from '@/store/useAppStore';
    ```
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 사용자가 카드 내용을 수정한 후 저장하면, `useUpdateCard` 훅이 API를 호출하고 카드가 업데이트됩니다. React Query invalidate에 의해 `CardList`나 다른 관련 UI가 갱신되고, 이 편집 컴포넌트는 편집모드가 종료되어 변경된 내용을 보여주는 뷰 모드로 돌아갈 것입니다. (상위 컴포넌트에서 props로 받은 content를 새로 fetch하거나, mutation의 onSuccess에서 state를 직접 업데이트하지 않아도 React Query가 해줍니다.)
    - 테스트 포인트:
    - 카드 내용을 변경 후 저장 → `/api/cards/[id]` PATCH 요청 성공 후 컴포넌트가 view 모드로 돌아가고, 화면에 변경된 내용이 표시되는지 확인.
    - 취소 버튼 클릭 시 아무 변화 없이 view 모드로 복귀하는지 확인.
    - 동시에 둘 이상의 카드 내용을 수정 시도해보기 (다른 컴포넌트 인스턴스) → 각자 별도의 mutation 인스턴스로 잘 동작하는지 확인.
    - 에러 발생 상황(예: 너무 긴 내용 등으로 서버 에러)에서 error 메시지가 표시되고 편집 모드가 유지되는지 확인.

    ### Task 21: 카드 삭제 버튼 컴포넌트 리팩토링
    - 관련 파일: `/src/components/cards/DeleteCardButton.tsx` (또는 CardList 내 삭제 로직)
    - 변경 유형: [🔁리팩토링]
    - 설명: 카드 삭제 UI를 TanStack Query 기반으로 수정합니다. CardList 내에서 루프마다 삭제 버튼을 렌더링하거나 별도 `DeleteCardButton` 컴포넌트가 있을 수 있습니다. 해당 부분을:
    - `const { mutate: deleteCard, isLoading } = useDeleteCard(card.id);` 훅 사용으로 변경.
    - 삭제 확인 다이얼로그에서 "예" 눌렀을 때 `deleteCard()` 호출 → 삭제 진행.
    - 진행 중에는 isLoading을 활용하여 버튼을 비활성화하거나 로딩 표시.
    - 성공/실패에 따른 UI 처리를 추가 (optional: toast로 "삭제 완료" 알림 등).
    - 더 이상 `useAppStore.deleteCard` 등을 호출하지 않습니다.
    - CardList 컴포넌트의 상태(`isDeleting`, `deletingCardId` 등)도 간소화할 수 있습니다. 예를 들어 하나의 삭제 모달만 관리하도록 했다면, Zustand 대신 local state로 `open`과 `targetId` 등을 관리해도 되고, React Query의 `isLoading`으로 처리할 수도 있습니다.
    - 함수 시그니처:
    ```tsx
    import { useDeleteCard } from '@/hooks/useDeleteCard';

    function DeleteCardButton({ cardId }) {
        const [confirmOpen, setConfirmOpen] = useState(false);
        const { mutate: deleteCard, isLoading } = useDeleteCard(cardId);

        const handleDelete = () => deleteCard();

        return (
        <>
            <button onClick={() => setConfirmOpen(true)} disabled={isLoading}>
            <TrashIcon />
            </button>
            {confirmOpen && (
            <Dialog onConfirm={handleDelete} onCancel={() => setConfirmOpen(false)}>
                {isLoading ? 'Deleting...' : '정말 삭제하시겠습니까?'}
            </Dialog>
            )}
        </>
        );
    }
    ```
    - import 경로 변경:
    ```ts
    import { useDeleteCard } from '@/hooks/useDeleteCard';
    ```
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 삭제 버튼을 누르면 모달 확인 후 삭제가 진행되고, React Query에 의해 카드 목록이 자동 갱신됩니다. 수동으로 목록에서 제거하거나 상태를 바꿀 필요가 없습니다. 또한 삭제 중에는 UI에 적절히 반영되어 사용자가 중복 클릭하는 것을 막습니다.
    - 테스트 포인트:
    - 삭제 버튼 클릭 → 확인 모달 "예" 선택 → `/api/cards/[id]` DELETE 요청 후 리스트에서 해당 카드 제거 확인.
    - 삭제 취소 혹은 모달 "아니오"를 눌렀을 때 카드가 그대로 유지되는지 확인.
    - 삭제 진행 중 다시 삭제 시도를 막기 위해 버튼/모달이 disabled되거나 "Deleting..." 표시되는지 확인.
    - 여러 카드를 연달아 삭제해보고, 매번 목록이 제대로 갱신되는지 확인.

    ### Task 22: `useAppStore`에서 카드 액션 제거
    - 관련 파일: `/src/store/useAppStore.ts`
    - 변경 유형: [🗑️코드 삭제]
    - 설명: TanStack Query로 카드 생성/수정/삭제가 이루어지므로, 기존 Zustand store의 카드 관련 액션들을 완전히 제거합니다. `createCard`, `updateCard`, `deleteCard`와 관련 상태 (`isCreating`, `isUpdating` 등) 모두 삭제합니다. 이제 이러한 기능은 **서버 상태**로 분류되어 Query/Mutation 훅에서 관리되므로, `useAppStore`는 관여하지 않습니다.
    - 함수 시그니처:
    ```diff
    interface AppState {
    -   createCard: (input: CreateCardInput) => Promise<Card | null>;
    -   deleteCard: (id: string) => Promise<boolean>;
    -   // updateCard는 앞서 제거함
        // ... 나머지 상태
    }
    export const useAppStore = create<AppState>()((set) => ({
    -   createCard: async (input) => { ... },
    -   deleteCard: async (id) => { ... },
        // ... 기타 slice 결합 결과 (Task 34에서 구현 예정)
    }));
    ```
    - import 경로 변경: N/A
    - 적용 규칙: [zustand-slice]
    - 예상 결과: `useAppStore`에는 더 이상 카드와 관련된 비동기 액션 함수가 없습니다. 컴포넌트들도 이를 전혀 사용하지 않으므로, 카드 관련 로직의 책임이 모두 Query 훅으로 넘어갔습니다. Store는 이제 **클라이언트 UI 상태**만 다룹니다.
    - 테스트 포인트:
    - 전역 검색으로 `useAppStore(` 호출 중 `createCard`, `updateCard`, `deleteCard` 등을 찾았을 때 모두 제거되었는지 확인.
    - 애플리케이션에서 카드 생성/편집/삭제 기능이 여전히 정상 동작하는지 (이제 Query 훅으로 구현된 부분이므로 앞서 테스트한 대로 확인).
    - `useAppStore`의 상태 구조를 콘솔에 찍어 이전과 비교해 불필요한 부분이 없어졌는지 확인.

    ---

    ### Task 23: 태그 API 서비스 모듈 생성
    - 관련 파일: `/src/services/tagService.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 태그(Tag) 관련 API 호출 함수를 구현합니다. 카드와 유사하게, 태그 조회/생성/삭제를 담당합니다:
    - `fetchTags()`: GET `/api/tags` - 모든 태그 목록 조회
    - `createTagAPI(name: string)`: POST `/api/tags` - 새로운 태그 생성 (보내는 데이터는 `{ name }`)
    - `deleteTagAPI(tagId: string)`: DELETE `/api/tags/[id]` - 태그 삭제
    (태그 수정은 필요 시 구현할 수 있으나 현재 계획에는 없음)
    각 함수는 `cardService`와 마찬가지로 fetch를 통해 API 호출 후 결과(JSON)를 반환합니다.
    - 함수 시그니처:
    ```ts
    // /src/services/tagService.ts
    import { Tag } from '@/types';

    export async function fetchTags(): Promise<Tag[]> {
        const res = await fetch('/api/tags');
        if (!res.ok) throw new Error('Failed to fetch tags');
        return res.json();
    }
    export async function createTagAPI(name: string): Promise<Tag> {
        const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('Failed to create tag');
        return res.json();
    }
    export async function deleteTagAPI(id: string): Promise<void> {
        const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete tag');
    }
    ```
    - import 경로 변경: (사용 시) 
    ```ts
    import * as tagService from '@/services/tagService';
    ```
    - 적용 규칙: [api-service-layer]
    - 예상 결과: 태그 관련 데이터 요청도 서비스 모듈로 분리됩니다. 이제 컴포넌트나 훅에서 직접 fetch 코드를 작성하지 않고 이 모듈의 함수를 재사용할 수 있습니다. (예: Tag 관리 훅들이 이 모듈을 이용)
    - 테스트 포인트:
    - 브라우저에서 `/api/tags` 엔드포인트를 테스트해보고, `tagService.fetchTags()` 호출 결과와 일치하는지 확인.
    - `tagService.createTagAPI('새태그')` 호출 시 네트워크 요청이 발생하고 새로운 태그 객체를 반환하는지 확인.
    - 태그 삭제 함수 호출 후 `/api/tags/[id]`에 DELETE 요청이 나가는지 확인. 

    ### Task 24: `useTags` 태그 목록 조회 훅 생성
    - 관련 파일: `/src/hooks/useTags.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 모든 태그 목록을 불러오는 훅을 구현합니다. `useQuery`를 사용하여 `tagService.fetchTags`를 호출하고, 쿼리 키는 **`['tags']`**로 설정합니다 (특별한 필터 없음). 태그는 변화가 비교적 적을 것으로 예상되므로, 필요에 따라 `staleTime`을 길게 주거나 `cacheTime`을 늘일 수 있지만 기본 설정으로도 무방합니다.
    - 함수 시그니처:
    ```ts
    import { useQuery, UseQueryResult } from '@tanstack/react-query';
    import { fetchTags } from '@/services/tagService';

    export function useTags(): UseQueryResult<Tag[], Error> {
        return useQuery({
        queryKey: ['tags'],
        queryFn: fetchTags,
        staleTime: 1000 * 60 * 5, // 5분 캐시 (예시)
        });
    }
    ```
    - import 경로 변경:
    ```ts
    import { useTags } from '@/hooks/useTags';
    ```
    - 적용 규칙: [tanstack-query-hook], [query-key-structure]
    - 예상 결과: 이 훅을 통해 전역 태그 목록을 가져와 사용할 수 있습니다. 예컨대 태그 필터 드롭다운이나 태그 관리 UI에서 `const { data: tags } = useTags();`로 모든 태그를 얻어옵니다. React Query가 캐싱하므로 태그 목록을 여러 컴포넌트에서 요청해도 한번만 fetch되고 재사용됩니다.
    - 테스트 포인트:
    - 컴포넌트에서 `useTags()` 호출 시 `/api/tags` 요청 후 태그 배열 `data`를 받는지 확인.
    - 태그가 많아도 페이징 없이 다 가져오는지, 성능에 문제 없는지 확인 (태그 수가 많으면 추후 lazy loading 고려).
    - React Query DevTools에서 `['tags']` 캐시가 생성되는지 확인.

*   ## D. Zustand 스토어 슬라이스 분리 & UI 전용화

    ### Task 25: `useCreateTag` 태그 생성 Mutation 훅 생성
    - 관련 파일: `/src/hooks/useCreateTag.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 새로운 태그를 추가하는 훅입니다. `mutationFn`으로 `tagService.createTagAPI`를 호출하고, onSuccess에서 태그 목록을 최신화하기 위해 `queryClient.invalidateQueries(['tags'])`를 실행합니다. 생성된 태그 정보(`Tag`)가 응답으로 온다면 활용할 수도 있지만, 단순 invalidate로 태그 목록을 refetch하여 일관성을 유지합니다.
    - 함수 시그니처:
    ```ts
    import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
    import { createTagAPI } from '@/services/tagService';

    export function useCreateTag(): UseMutationResult<Tag, Error, string> {
        const queryClient = useQueryClient();
        return useMutation({
        mutationFn: (name) => createTagAPI(name),
        onSuccess: (newTag) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
        });
    }
    ```
    - import 경로 변경:
    ```ts
    import { useCreateTag } from '@/hooks/useCreateTag';
    ```
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 이 훅으로 태그를 생성하면 태그 목록 쿼리(`['tags']`)가 stale 처리되어 다시 로드됩니다. UI에서는 새 태그가 자동으로 목록에 추가되어 보입니다.
    - 테스트 포인트:
    - 태그 생성 폼에서 `useCreateTag`의 `mutate('태그명')` 호출 → `/api/tags` POST 요청 후 태그 목록 UI에 새로운 태그가 나타나는지 확인.
    - 중복된 이름 등 오류 상황에서 `error` 상태가 제대로 설정되고 표시되는지 확인.
    - 연속으로 태그를 여러개 추가해도 매번 목록이 제대로 업데이트되는지 확인.

    ### Task 26: `useDeleteTag` 태그 삭제 Mutation 훅 생성
    - 관련 파일: `/src/hooks/useDeleteTag.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 태그를 삭제하는 훅입니다. `mutationFn`으로 `tagService.deleteTagAPI`를 호출하고, onSuccess에서 `queryClient.invalidateQueries(['tags'])`를 호출하여 태그 목록을 갱신합니다. (특정 태그에 연결된 카드 등의 처리는 백엔드 논리에 따라 달라지며, 여기서는 태그 목록 UI만 고려합니다.)
    - 함수 시그니처:
    ```ts
    import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
    import { deleteTagAPI } from '@/services/tagService';

    export function useDeleteTag(): UseMutationResult<void, Error, string> {
        const queryClient = useQueryClient();
        return useMutation({
        mutationFn: (id) => deleteTagAPI(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
        });
    }
    ```
    - import 경로 변경:
    ```ts
    import { useDeleteTag } from '@/hooks/useDeleteTag';
    ```
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 특정 태그 삭제 후 태그 목록에서 즉시 제거됩니다. (또한 해당 태그를 가진 카드들의 표시도 알아서 빠지거나, 카드와 태그 관계를 다시 fetch해야 할 수 있지만, 이는 카드 리스트의 cardTags를 통해 간접 반영되므로 여기서는 태그 목록만 갱신합니다.)
    - 테스트 포인트:
    - 태그 목록 UI에서 태그 삭제 액션 수행 → `/api/tags/[id]` DELETE 요청 후 목록에 해당 태그가 사라지는지 확인.
    - 존재하지 않는 태그 ID로 호출 시 에러를 잘 처리하는지 확인.
    - 연속해서 태그 삭제 시 매번 목록이 갱신되는지 확인.

    ### Task 27: `TagList` 컴포넌트 리팩토링 (태그 목록 표시)
    - 관련 파일: `/src/components/tags/TagList.tsx`
    - 변경 유형: [🔁리팩토링]
    - 설명: 태그를 나열하는 UI 컴포넌트를 React Query 훅으로 변경합니다. 예를 들어 사이드바에 전체 태그 목록을 보여주거나, 관리 페이지에서 태그 목록을 표시하는 컴포넌트가 있을 것입니다. 이를 `useTags` 훅을 활용하도록 합니다:
    - `const { data: tags, isLoading, error } = useTags();`로 태그 데이터를 가져옵니다.
    - 로딩 중이면 로딩 표시, 에러 시 에러 표시.
    - 태그 배열을 `.map`으로 렌더링. (예: 태그 이름 리스트, 혹은 버튼 목록)
    - 더 이상 `useAppStore`로 태그를 가져오는 부분이 있었다면 제거합니다. (기존 구현에 따라 다르지만, 혹시 `useAppStore.tags` 같은 게 있었다면 삭제)
    - 함수 시그니처:
    ```tsx
    import { useTags } from '@/hooks/useTags';

    function TagList() {
        const { data: tags, isLoading, error } = useTags();
        if (isLoading) return <p>태그 불러오는 중...</p>;
        if (error) return <p>태그 불러오기 실패: {error.message}</p>;
        return (
        <ul>
            {tags?.map(tag => <li key={tag.id}>{tag.name}</li>)}
        </ul>
        );
    }
    ```
    - import 경로 변경:
    ```ts
    import { useTags } from '@/hooks/useTags';
    - import { useAppStore } from '@/store/useAppStore';
    ```
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 태그 목록 UI가 항상 최신 태그 데이터를 표시합니다. 새로운 태그 추가/삭제 시 `useTags`가 알아서 갱신되므로 별도 처리 없이 목록 UI에 반영됩니다.
    - 테스트 포인트:
    - 태그 목록이 정상 표시되는지 확인 (기존과 동일한 태그들이 출력되어야 함).
    - 태그를 추가하거나 삭제한 후 이 `TagList` 컴포넌트가 자동으로 업데이트되는지 확인.
    - (만약 필터 선택 등의 인터랙션이 있다면, 그것은 TagFilter 컴포넌트에서 처리)

    ### Task 28: 태그 생성 폼 컴포넌트 리팩토링
    - 관련 파일: `/src/components/tags/TagForm.tsx`
    - 변경 유형: [🔁리팩토링]
    - 설명: 새 태그를 추가하는 UI를 React Query로 변경합니다. 만약 태그 입력 폼이 `TagList` 상단 등에 있고, 입력 -> 추가 버튼 클릭 시 태그를 생성했다면:
    - `const { mutate: createTag, isLoading, error } = useCreateTag();` 훅 사용.
    - 폼 제출 시 `createTag(name)` 호출.
    - 성공 시 입력 필드를 비우고, (React Query invalidate로 TagList는 자동 갱신됨).
    - 에러 시 에러 메시지를 표시.
    - `useAppStore`를 사용해 태그 목록을 업데이트하던 로직 제거.
    - 함수 시그니처:
    ```tsx
    import { useCreateTag } from '@/hooks/useCreateTag';

    function TagForm() {
        const [name, setName] = useState('');
        const { mutate: createTag, isLoading, error, isSuccess } = useCreateTag();

        const handleSubmit = (e) => {
        e.preventDefault();
        createTag(name, {
            onSuccess: () => setName('') // 성공 시 입력 초기화
        });
        };

        return (
        <form onSubmit={handleSubmit}>
            <input value={name} onChange={e => setName(e.target.value)} disabled={isLoading} />
            <button type="submit" disabled={isLoading || !name}>추가</button>
            {error && <p>추가 실패: {error.message}</p>}
        </form>
        );
    }
    ```
    - import 경로 변경:
    ```ts
    import { useCreateTag } from '@/hooks/useCreateTag';
    ```
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 태그 추가 UI에서 "추가" 버튼을 누르면 즉시 `tags` 쿼리가 invalidate되어 `TagList`에 새 태그가 보입니다. 폼 컴포넌트 자체는 이름 입력란을 초기화하는 정도만 수행하면 됩니다.
    - 테스트 포인트:
    - 새로운 태그 이름 입력 후 추가 → `/api/tags` POST 요청, 성공 시 태그 리스트에 추가된 태그 표시 & 입력란 초기화 확인.
    - 중복 이름 등 실패 시 에러 메시지 표시 확인.
    - 로딩 중 버튼 비활성화로 연타 방지 확인.

    ### Task 29: 태그 필터 컴포넌트 리팩토링
    - 관련 파일: `/src/components/tags/TagFilter.tsx`
    - 변경 유형: [🔁리팩토링]
    - 설명: 카드 목록을 태그별로 필터링하는 컴포넌트가 있다면, 이를 개선합니다. `useTags` 훅으로 모든 태그를 받아와 필터 옵션을 표시합니다. 각 태그를 클릭/선택하면 해당 태그로 필터된 카드 목록을 보여줘야 합니다. 구현은:
    - `const { data: tags } = useTags();` 로 태그 목록 가져오기.
    - UI로 모든 태그 이름을 버튼 또는 링크로 나열.
    - 선택 시 URL의 `?tag=` 파라미터를 변경합니다 (`useRouter().push` 또는 `<Link>` 활용). 예: `<Link href={`/?tag=${tag.name}`}>{tag.name}</Link>`.
    - 현재 선택된 태그를 강조 표시 (URL의 searchParams에서 현재 tag 값을 가져와 일치하면 강조).
    - 기존에 `useAppStore.selectedTag` 같은 전역 상태를 썼다면 제거하고 URL 상태로 일원화합니다.
    - 함수 시그니처:
    ```tsx
    import { useTags } from '@/hooks/useTags';
    import { useSearchParams, useRouter } from 'next/navigation';

    function TagFilter() {
        const { data: tags } = useTags();
        const searchParams = useSearchParams();
        const router = useRouter();
        const selectedTag = searchParams.get('tag') || '';

        const selectTag = (tagName: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (tagName) {
            params.set('tag', tagName);
        } else {
            params.delete('tag');
        }
        router.push('?' + params.toString());
        };

        return (
        <div>
            <button onClick={() => selectTag('')} className={!selectedTag ? 'active': ''}>#전체</button>
            {tags?.map(tag => (
            <button 
                key={tag.id} 
                onClick={() => selectTag(tag.name)} 
                className={selectedTag === tag.name ? 'active': ''}>
                #{tag.name}
            </button>
            ))}
        </div>
        );
    }
    ```
    - import 경로 변경:
    ```ts
    import { useTags } from '@/hooks/useTags';
    ```
    - 적용 규칙: [query-key-structure]
    - 예상 결과: 태그 필터 UI가 전역 store 없이 동작하며, URL 쿼리 파라미터를 통해 CardList의 `useCards` 훅과 연동됩니다. 사용자가 필터 버튼을 누르면 URL이 변경되고, `useCards`의 queryKey에 포함된 `tag` 값이 바뀌면서 자동으로 서버에서 해당 태그의 카드 목록을 가져옵니다.
    - 테스트 포인트:
    - "전체" 버튼과 개별 태그 버튼을 눌러 카드 목록이 필터링되는지 확인.
    - 필터 버튼 클릭 시 URL의 `?tag=` 값이 바뀌는지 확인, 새로고침해도 해당 필터가 유지되는지 확인.
    - 한 태그 선택 후 다른 태그 선택 시 UI와 카드 목록이 모두 변경되는지 확인.

    ### Task 30: `useAppStore`에서 태그 상태 제거 (있는 경우)
    - 관련 파일: `/src/store/useAppStore.ts`
    - 변경 유형: [🗑️코드 삭제]
    - 설명: 만약 `useAppStore`에 태그 목록이나 선택 태그 상태가 정의되어 있었다면 이를 삭제합니다. 예를 들어 `tags: Tag[]` 또는 `selectedTag: string` 등이 있었다면, 이제 사용되지 않으므로 정리합니다. (코드베이스에 존재하지 않을 수도 있습니다. 이 Task는 clean-up 성격입니다.)
    - 함수 시그니처:
    ```diff
    interface AppState {
    -   tags: Tag[];
    -   setTags: (tags: Tag[]) => void;
    -   selectedTag: string;
    -   selectTag: (tag: string) => void;
        // ...
    }
    ```
    - import 경로 변경: N/A
    - 적용 규칙: [zustand-slice]
    - 예상 결과: 태그 관련 상태가 전역 store에서 모두 제거됩니다. 태그는 React Query로 관리되고, 선택 태그는 URL 상태로 관리되므로 전역에 유지할 필요가 없습니다.
    - 테스트 포인트:
    - 전역 검색으로 `useAppStore(`에서 태그 관련 키를 찾았을 때 제거되었는지 확인.
    - 앱 구동 후 콘솔/DevTools로 store 상태를 살펴 태그 관련 slice가 없는지 확인.
    - 태그 필터/목록 기능이 여전히 정상 동작하는지 확인.

    ---

*   ## E. IdeaMap 상태·로직 분리

    ### Task 31: UI 상태 슬라이스 (`createUiSlice`) 생성
    - 관련 파일: `/src/store/uiSlice.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: Zustand 슬라이스 패턴에 따라 UI 관련 전역 상태를 담는 slice를 만듭니다. 사이드바 열림/닫힘, 사이드바 너비 등 UI 설정을 이곳에서 관리합니다. 기존 `useAppStore`에 흩어져 있던 것을 모듈화합니다:
    - `isSidebarOpen: boolean` 및 토글/설정 함수 (`toggleSidebar`, `setSidebarOpen`)
    - `sidebarWidth: number` 및 setter (`setSidebarWidth`)
    - 기타 UI 전역 상태가 있다면 추가 (예: 다크모드 여부는 themeSlice에서 처리하므로 여기서는 제외)
    - 함수 시그니처:
    ```ts
    import { StateCreator } from 'zustand';

    interface UISlice {
        isSidebarOpen: boolean;
        sidebarWidth: number;
        toggleSidebar: () => void;
        setSidebarOpen: (open: boolean) => void;
        setSidebarWidth: (width: number) => void;
    }

    export const createUiSlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
        isSidebarOpen: true,
        sidebarWidth: 300,
        toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (open) => set({ isSidebarOpen: open }),
        setSidebarWidth: (width) => set({ sidebarWidth: width }),
    });
    ```
    - import 경로 변경: (슬라이스를 사용 시)
    ```ts
    import { createUiSlice, UISlice } from '@/store/uiSlice';
    ```
    - 적용 규칙: [zustand-slice]
    - 예상 결과: UI 슬라이스가 정의되어 사이드바 상태 등을 캡슐화합니다. 이를 통합하여 `useAppStore` 생성 시 사용하게 됩니다 (Task 34에서). 기존에 `useAppStore` 내에 있던 UI 관련 코드와 동일한 초기값과 동작을 갖습니다.
    - 테스트 포인트:
    - `createUiSlice`의 타입과 반환 객체가 올바르게 정의되었는지 확인 (Zustand DevTools로 추후 state 구조 확인).
    - 사이드바 토글/열기/너비 관련 기존 기능과 값들이 유지되는지 (예: 기본 open 상태 true, 기본 width 300 등) 확인.

    ### Task 32: 카드 선택 상태 슬라이스 (`createCardStateSlice`) 생성
    - 관련 파일: `/src/store/cardStateSlice.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 카드 선택 및 확장 상태를 관리하는 slice를 만듭니다. 기존에 `useAppStore`에서 관리하던 `selectedCardIds`, `selectedCardId`, `expandedCardId` 및 여러 액션들을 정리합니다:
    - `selectedCardIds: string[]` (현재 선택된 카드들의 ID 목록, 멀티선택 지원)
    - `expandedCardId: string | null` (현재 확장되어 상세 표시 중인 카드 ID, 하나만 가질 수 있다고 가정)
    - 액션들:
        - `selectCards(ids: string[])`: 다중 선택 설정 (배열 교체)
        - `toggleSelectedCard(id: string)`: 해당 카드 ID를 선택 목록에 토글 (있으면 제거, 없으면 추가)
        - `clearSelectedCards()`: 선택 해제 (배열 비우기)
        - `toggleExpandCard(id: string)`: expandedCardId 토글 (같은 ID 다시 호출 시 닫힘)
    - (기존 `selectCard`(단일 선택)와 `addSelectedCard`, `removeSelectedCard` 등을 모두 위 로직으로 통합)
    - 함수 시그니처:
    ```ts
    import { StateCreator } from 'zustand';

    interface CardStateSlice {
        selectedCardIds: string[];
        expandedCardId: string | null;
        selectCards: (ids: string[]) => void;
        toggleSelectedCard: (id: string) => void;
        clearSelectedCards: () => void;
        toggleExpandCard: (id: string) => void;
    }

    export const createCardStateSlice: StateCreator<CardStateSlice, [], [], CardStateSlice> = (set, get) => ({
        selectedCardIds: [],
        expandedCardId: null,
        selectCards: (ids) => set({ selectedCardIds: ids }),
        toggleSelectedCard: (id) => set(state => {
        const currentlySelected = state.selectedCardIds;
        const isSelected = currentlySelected.includes(id);
        return {
            selectedCardIds: isSelected 
            ? currentlySelected.filter(cid => cid !== id) 
            : [...currentlySelected, id]
        };
        }),
        clearSelectedCards: () => set({ selectedCardIds: [] }),
        toggleExpandCard: (id) => set(state => ({
        expandedCardId: state.expandedCardId === id ? null : id
        })),
    });
    ```
    - import 경로 변경:
    ```ts
    import { createCardStateSlice, CardStateSlice } from '@/store/cardStateSlice';
    ```
    - 적용 규칙: [zustand-slice]
    - 예상 결과: 카드 선택/확장 관련 상태가 잘 분리되었습니다. 이후 `useAppStore`에 통합하면 전역에서 `useAppStore(state => state.selectedCardIds)` 등의 형태로 접근 가능하며, 중복이었던 `selectedCardId` (단일 선택) 상태는 제거됩니다. 필요한 경우 `selectedCardIds`[0]을 이용하거나, 헬퍼를 만들 수 있습니다.
    - 테스트 포인트:
    - `toggleSelectedCard`가 동작하는지 간단 테스트: 초기 [] 상태에서 호출하면 해당 ID 추가, 다시 호출하면 제거되는지.
    - `toggleExpandCard`가 동일 ID 두 번 호출 시 null로 돌아오는지 확인.
    - 멀티선택 시나리오: `selectCards(['a','b'])` 호출 후 `toggleSelectedCard('b')` → 결과가 ['a']가 되는지 등.

    ### Task 33: 테마 설정 슬라이스 (`createThemeSlice`) 생성
    - 관련 파일: `/src/store/themeSlice.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 기존 ThemeContext에서 관리하던 테마 관련 전역 상태를 Zustand slice로 옮깁니다. 여기서는 **앱 테마 및 노드 크기 설정** 등을 포함합니다:
    - `theme: string` (예: 'light' | 'dark' 모드 – 간단히 string으로 표현)
    - `nodeSize: number` (아이디어맵 카드 노드의 크기 배율 혹은 스타일 크기 – 기본값 설정 필요)
    - `updateTheme(theme: string)`: 테마 모드 변경 액션
    - `updateNodeSize(size: number)`: 노드 크기 설정 액션
    (기존 `ThemeContext`에 `updateNodeSize` 함수가 있었으므로 포함)
    - 함수 시그니처:
    ```ts
    import { StateCreator } from 'zustand';

    interface ThemeSlice {
        theme: string;
        nodeSize: number;
        updateTheme: (theme: string) => void;
        updateNodeSize: (size: number) => void;
    }

    export const createThemeSlice: StateCreator<ThemeSlice, [], [], ThemeSlice> = (set) => ({
        theme: 'light',
        nodeSize: 1,
        updateTheme: (theme) => set({ theme }),
        updateNodeSize: (size) => set({ nodeSize: size }),
    });
    ```
    - import 경로 변경:
    ```ts
    import { createThemeSlice, ThemeSlice } from '@/store/themeSlice';
    ```
    - 적용 규칙: [zustand-slice]
    - 예상 결과: 테마 관련 전역 상태가 컨텍스트가 아닌 Zustand store로 관리됩니다. 이후 이 slice를 `useAppStore`에 통합하면, 컴포넌트들은 `useAppStore(state => state.theme)` 등으로 접근할 수 있습니다. (Tailwind 등의 테마 적용이 있다면 `theme`값 변화를 body class에 반영하는 추가 처리 필요하지만, 이는 범위 밖이므로 생략)
    - 테스트 포인트:
    - `updateTheme('dark')` 호출 후 상태 `theme`이 'dark'로 바뀌는지 확인.
    - `updateNodeSize(1.5)` 호출 후 상태 `nodeSize`가 1.5로 바뀌는지 확인.
    - 기본값 'light', 1 이 적절히 설정되는지 확인.

    ### Task 34: `useAppStore` 루트 스토어에 슬라이스 통합
    - 관련 파일: `/src/store/useAppStore.ts`
    - 변경 유형: [🔁리팩토링]
    - 설명: 앞서 정의한 `createUiSlice`, `createCardStateSlice`, `createThemeSlice`를 합쳐 하나의 Zustand store를 만듭니다. Zustand의 슬라이스 패턴에 따라 여러 slice ([zustand/docs/guides/typescript.md at main · pmndrs/zustand · GitHub](https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#slices-pattern#:~:text=const%20useBoundStore%20%3D%20create,a%29%2C)) 반환합니다. 또한 DevTools, persist 등 미들웨어를 적용하려면 이 단계에서 래핑할 수 있습니다 (optional).
    - 모든 slice의 상태를 합친 `AppState` 타입을 정의 (`AppState = UISlice & CardStateSlice & ThemeSlice`).
    - `useAppStore = create<AppState>()((...a) => ({ ...createUiSlice(...a), ...createCardStateSlice(...a), ...createThemeSlice(...a) }));`
    - (windowCommandSlice를 구현했다면 같이 spread)
    - 이렇게 생성한 store 훅은 기존 `useAppStore`와 동일한 이름이므로, 기존 사용처는 그대로 쓸 수 있습니다.
    - *주의*: 이전 `useAppStore` 구현에 있던 기타 상태/액션(예: 프로젝트 관련 또는 아이디어맵 관련)이 아직 남아 있다면, 그것들도 슬라이스로 옮기거나 여기서 함께 spread해야 합니다. 현재 단계에서는 UI/Card/Theme 세 가지에 집중합니다.
    - 함수 시그니처:
    ```ts
    import { create } from 'zustand';
    import { UISlice, createUiSlice } from '@/store/uiSlice';
    import { CardStateSlice, createCardStateSlice } from '@/store/cardStateSlice';
    import { ThemeSlice, createThemeSlice } from '@/store/themeSlice';

    export type AppState = UISlice & CardStateSlice & ThemeSlice;
    export const useAppStore = create<AppState>()((...a) => ({
        ...createUiSlice(...a),
        ...createCardStateSlice(...a),
        ...createThemeSlice(...a),
    }));
    ```
    - import 경로 변경:
    ```ts
    import { useAppStore } from '@/store/useAppStore'; // (변경 없음, 구현만 변경)
    ```
    - 적용 규칙: [zustand-slice]
    - 예상 결과: `useAppStore`는 내부 구현이 슬라이스 조합으로 바뀌지만, 외부에서 사용하는 인터페이스는 큰 차이가 없습니다. 다만 `useAppStore.getState()`로 보면 state가 여러 슬라이스 속성을 모두 포함한 평평한 형태가 됩니다. 기존에 제거/수정된 키들을 제외하면, 컴포넌트들의 `useAppStore` 사용 부분은 대부분 동일하게 동작합니다.
    - 테스트 포인트:
    - 애플리케이션을 실행하고 `useAppStore.getState()`를 콘솔에 출력하여 초기 상태 구조를 확인 (예: `{ isSidebarOpen: true, sidebarWidth: 300, selectedCardIds: [], expandedCardId: null, theme: 'light', nodeSize: 1, ... }`).
    - 사이드바 토글/열기/닫기, 카드 선택/확장, 테마 변경 등 기능을 여러 군데에서 실행해보고, 상태가 일관되게 저장/공유되는지 확인.
    - Zustand DevTools (존재한다면)에서 store가 "useAppStore" 하나로 보이고, 그 안에 우리가 정의한 슬라이스 값들이 포함되어 있는지 확인.

    ### Task 35: `ThemeContext` 삭제 및 테마 전역 상태 통합
    - 관련 파일: `/src/context/ThemeContext.tsx` (및 사용처)
    - 변경 유형: [🗑️코드 삭제]
    - 설명: 기존 ThemeContext를 제거합니다. Task 33~34를 통해 theme과 nodeSize가 이제 `useAppStore`에서 관리되므로 Context는 불필요합니다. 
    - ThemeContext를 만들었던 Provider 컴포넌트와 관련 훅 (`useTheme` 같은게 있었다면) 삭제.
    - `<ThemeProvider>`로 감싸던 부분이 있으면 제거.
    - 컴포넌트에서 `useContext(ThemeContext)`를 사용하던 부분은 `useAppStore`로 대체될 예정 (Task 36에서 처리).
    - 함수 시그니처: N/A
    - import 경로 변경:
    ```ts
    - import { ThemeContext } from '@/context/ThemeContext';
    - const { theme, updateTheme } = useContext(ThemeContext);
    + // ThemeContext 제거됨, 대신 useAppStore 활용 (Task 36에서 대체)
    ```
    - 적용 규칙: [no-context]
    - 예상 결과: 프로젝트에서 ThemeContext 관련 정의와 사용이 모두 사라집니다. 전역 테마 상태는 이제 `useAppStore().theme`으로 접근합니다.
    - 테스트 포인트:
    - 컴파일 및 빌드시 ThemeContext 미참조로 인한 오류가 없는지 확인.
    - (Task 36에서 실제 사용부 변경 전이라면 잠시 theme 참조 부분에 오류가 있을 수 있으나, 곧바로 다음 Task에서 수정됨)

    ### Task 36: 테마/노드 크기 컨텍스트 사용부 `useAppStore`로 변경
    - 관련 파일: `/src/components/TopBar.tsx`, `/src/components/NodeSettings.tsx` 등 ThemeContext를 사용하던 컴포넌트
    - 변경 유형: [🔁리팩토링]
    - 설명: 테마나 노드 크기 설정을 읽거나 변경하는 컴포넌트들을 업데이트합니다. 기존에는 `useContext(ThemeContext)`로 `theme`, `updateTheme`, `updateNodeSize`를 가져왔겠지만, 이제:
    - `const theme = useAppStore(state => state.theme);`
    - `const updateTheme = useAppStore(state => state.updateTheme);`
    - `const nodeSize = useAppStore(state => state.nodeSize);`
    - `const updateNodeSize = useAppStore(state => state.updateNodeSize);`
    등으로 대체합니다.
    - UI 로직은 기존과 동일하게, 이 상태와 함수를 사용합니다.
    - 예: 다크모드 토글 스위치 onChange -> `updateTheme(theme === 'light' ? 'dark' : 'light')`
    - 노드 크기 슬라이더 onChange -> `updateNodeSize(newValue)`
    - 함수 시그니처:
    ```tsx
    import { useAppStore } from '@/store/useAppStore';

    function TopBar() {
        const theme = useAppStore(state => state.theme);
        const updateTheme = useAppStore(state => state.updateTheme);
        // ...
        <Toggle onChange={() => updateTheme(theme === 'light' ? 'dark' : 'light')} checked={theme === 'dark'} />
    }

    function NodeSettings() {
        const nodeSize = useAppStore(state => state.nodeSize);
        const updateNodeSize = useAppStore(state => state.updateNodeSize);
        // ...
        <Slider value={nodeSize} onChange={val => updateNodeSize(val)} />
    }
    ```
    - import 경로 변경:
    ```ts
    - import { useContext } from 'react';
    - import { ThemeContext } from '@/context/ThemeContext';
    import { useAppStore } from '@/store/useAppStore';
    ```
    - 적용 규칙: [zustand-slice]
    - 예상 결과: 테마 토글, 노드 크기 변경 등이 정상 작동하며, 전역 Zustand 상태를 업데이트합니다. UI에서 Context 사용 흔적이 없어지고 store 훅 사용으로 일관됩니다.
    - 테스트 포인트:
    - 다크/라이트 모드 토글 시 `useAppStore.getState().theme`이 변경되고, 해당 값이 UI (예: 페이지 클래스나 아이콘 상태)에 반영되는지 확인.
    - 노드 크기 슬라이더/버튼 조작 시 `nodeSize` 상태가 변하고, IdeaMap 노드의 표시가 즉시 반영되는지 확인 (예: 노드 컴포넌트에서 이 값을 font-size나 scale에 사용하고 있다면).
    - ThemeContext 제거 이후에도 기능적으로 동일하게 동작하는지 전체 흐름 테스트.

    ### Task 37: 카드 선택 상태 사용부 업데이트
    - 관련 파일: `/src/components/Sidebar.tsx`, `/src/components/IdeaMapItem.tsx` 등 카드 선택을 다루는 곳
    - 변경 유형: [🔁리팩토링]
    - 설명: 여러 컴포넌트에서 `useAppStore`의 카드 선택 상태를 사용하도록 수정합니다. 예를 들어:
    - 사이드바에 선택된 카드들의 정보 표시 또는 일괄 동작 버튼이 있다면 `const selectedIds = useAppStore(state => state.selectedCardIds);`로 가져옵니다.
    - IdeaMap에서 노드를 클릭하면 `useAppStore.getState().selectCards([id])` 등을 호출했다면, 이제 `useAppStore.getState().toggleSelectedCard(id)` 또는 `selectCards([id])`로 통일합니다. 단일 선택 동작이라도 멀티 선택에 통합되었으므로 `selectCards([id])` 사용을 권장합니다.
    - 다중 선택 기능이 있다면 (예: Ctrl+클릭) 노드 클릭 핸들러에서 `toggleSelectedCard(id)`를 사용하고, Ctrl 키 없을 때는 `selectCards([id])`로 단일 선택 구현 가능합니다.
    - `expandedCardId`를 사용하던 컴포넌트 (예: 상세보기 패널)도 `useAppStore(state => state.expandedCardId)`로 대체하고, 확장/축소 버튼이 `toggleExpandCard(id)`를 호출하도록 변경합니다.
    - 함수 시그니처:
    ```tsx
    // 사이드바 컴포넌트 예시
    const selectedCardIds = useAppStore(state => state.selectedCardIds);
    const clearSelection = useAppStore(state => state.clearSelectedCards);
    // "선택된 카드 X개" 표시 및 "선택 해제" 버튼 onClick -> clearSelection()

    // IdeaMap 노드 컴포넌트 예시
    const selectCards = useAppStore(state => state.selectCards);
    const toggleSelectedCard = useAppStore(state => state.toggleSelectedCard);
    function handleNodeClick(nodeId: string, isMultiSelect: boolean) {
        if (isMultiSelect) toggleSelectedCard(nodeId);
        else selectCards([nodeId]);
    }
    ```
    - import 경로 변경:
    ```ts
    import { useAppStore } from '@/store/useAppStore';
    ```
    - 적용 규칙: [zustand-slice]
    - 예상 결과: 이제 카드 선택/확장 관련 UI가 새 slice 기반으로 동작합니다. 이전에 존재하던 `selectedCardId` 단일 값은 없어졌으므로, 하나만 선택하는 경우에도 배열 형태를 사용하도록 코드가 조정됩니다. 
    - 테스트 포인트:
    - IdeaMap에서 노드를 클릭하면 해당 카드 ID가 `useAppStore.getState().selectedCardIds`에 들어가는지 확인. 다른 노드 클릭 시 배열이 한 개 ID로 교체되는지 (`selectCards` 사용 시).
    - Ctrl+클릭(또는 UI 상 다중 선택 조작) 시 여러 ID가 배열에 포함되고 UI에서 다중 선택 표시가 제대로 되는지 확인 (ex: 여러 카드 강조 표시).
    - 사이드바 등에서 "선택 해제" 기능이 모두 selection 배열을 비우는지 확인.
    - 확장 기능: 카드 상세보기 토글 버튼을 누르면 `expandedCardId`가 설정되고 사이드바 패널 등이 열리며, 다시 누르면 `expandedCardId`가 `null`로 돌아오는지 확인.

    ### Task 38: `useIdeaMapStore` 리팩토링 (아이디어맵 UI 상태 전용)
    - 관련 파일: `/src/store/useIdeaMapStore.ts`
    - 변경 유형: [🗑️코드 삭제], [🔁리팩토링]
    - 설명: IdeaMap의 Zustand 스토어를 UI 상태 전용으로 정리합니다. 기존에 IdeaMapStore에서 **노드/엣지 데이터 로딩 및 저장** 로직을 제거합니다:
    - 남기는 항목:
        - `nodes: Node<CardData>[]` (React Flow 노드 데이터)
        - `edges: Edge[]` (연결선 데이터)
        - `reactFlowInstance: ReactFlowInstance | null` (필요 시 저장)
        - `viewport: ExtendedViewport` (x, y, zoom 등의 뷰포트 상태)
        - 노드/엣지 변경 핸들러 (`onNodesChange`, `onEdgesChange`), 노드/엣지 설정 함수 (`setNodes`, `setEdges`), `onConnect` 핸들러 등 **순수 UI 업데이트** 로직
    - 제거하는 항목:
        - `ideaMapSettings` 및 `updateIdeaMapSettings`: 서버에 노드 위치 등을 저장하던 로직 삭제.
        - 레이아웃 관련 함수 (자동 정렬 등) -> `useIdeaMapLayout`으로 이동할 예정.
        - **데이터 변환**: 아마 IdeaMapStore 초기화 시 카드 데이터를 노드로 변환하는 코드를 없앱니다. 카드 데이터는 이제 `useIdeaMapSync`에서 관리합니다.
    - ExtendedViewport 타입이나 logger 등 부수 코드는 놔두되, 사용되지 않는 부분은 제거.
    - 함수 시그니처:
    ```diff
    interface IdeaMapState {
        // 노드 상태
        nodes: Node<CardData>[];
        setNodes: (nodes: Node<CardData>[]) => void;
        onNodesChange: (changes: NodeChange[]) => void;
        // 엣지 상태
        edges: Edge[];
        setEdges: (edges: Edge[]) => void;
        onEdgesChange: (changes: EdgeChange[]) => void;
        onConnect: (connection: Connection) => void;
        // (삭제) ideaMapSettings 및 관련 함수
    -    ideaMapSettings: IdeaMapSettings;
    -    setIdeaMapSettings: (settings: IdeaMapSettings) => void;
    -    updateIdeaMapSettings: (...) => Promise<void>;
        // 뷰포트 상태
        viewport: Viewport;
        setViewport: (viewport: Viewport) => void;
        // (삭제) 레이아웃 관련 함수
    -    applyAutoLayout: () => void;
    }
    export const useIdeaMapStore = create<IdeaMapState>((set) => ({
        nodes: [],
        setNodes: (nodes) => set({ nodes }),
        onNodesChange: (changes) => set(state => ({ nodes: applyNodeChanges(changes, state.nodes) })),
        edges: [],
        setEdges: (edges) => set({ edges }),
        onEdgesChange: (changes) => set(state => ({ edges: applyEdgeChanges(changes, state.edges) })),
        onConnect: (connection) => set(state => ({ edges: addEdge(connection, state.edges) })),
    -    ideaMapSettings: { ... },
    -    setIdeaMapSettings: (settings) => { ... },
    -    updateIdeaMapSettings: async (partial, isAuth, userId) => { ... },
        viewport: { x: 0, y: 0, zoom: 1 },
        setViewport: (viewport) => set({ viewport }),
    -    applyAutoLayout: () => { ... },
    }));
    ```
    - import 경로 변경: N/A (구현 변경)
    - 적용 규칙: [zustand-slice]
    - 예상 결과: `useIdeaMapStore`는 이제 React Flow 컴포넌트의 상태와 동작만 관리합니다. 서버 데이터와의 동기화나 영구 저장은 빠진 상태입니다. (이 부분은 `useIdeaMapSync`와 `useIdeaMapLayout`에서 담당할 예정)
    - 테스트 포인트:
    - IdeaMap 열었을 때 노드/엣지 데이터가 초기에는 빈 배열일 수 있습니다 (이제 데이터 로딩은 별개 훅에서 함).
    - 노드 드래그, 연결 생성/삭제 등의 상호작용이 여전히 작동하는지 확인 (onNodesChange, onEdgesChange, onConnect가 정상 동작).
    - IdeaMapSettings 저장 로직이 사라졌으므로, 더 이상 특정 액션 (예: “맵 저장” 버튼)이 동작하지 않을 수 있습니다. 이 부분은 Task 42에서 Layout 훅으로 대체되거나, 임시로 기능 제거를 용인합니다.

*   ## F. 공통 타입 정의 & 설정 정리

    ### Task 39: `useIdeaMapSync` 훅 생성 (서버-로컬 데이터 동기화)
    - 관련 파일: `/src/hooks/useIdeaMapSync.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 카드 서버 데이터와 아이디어맵 로컬 레이아웃을 결합하는 훅을 구현합니다. 이 훅은 **React Flow 노드/엣지 데이터를 반환**하며, 내부에서 다음을 수행합니다:
    - `const { data: cards } = useCards();`로 카드 목록을 구독합니다.
    - (만약 엣지도 서버에서 관리한다면 `useEdges` 같은 것을 써야 하지만, 현재는 엣지 서버 상태가 없으므로 생략)
    - 로컬에서 저장된 레이아웃 정보를 로드합니다 (예: `localStorage`에 저장된 좌표나 `IdeaMapSettings` DB 대체). 초기에는 좌표 정보가 없다고 가정하고, 기본 레이아웃은 `getGridLayout` 등을 이용해 계산합니다.
    - `cards` 데이터가 변할 때마다 React Flow 노드 배열을 생성/업데이트합니다. 
        - 신규 카드가 추가되면 해당 카드에 대한 Node 객체를 생성해 `useIdeaMapStore.setState({ nodes: [...] })`로 추가.
        - 카드가 삭제되면 해당 Node를 제거.
        - 카드 내용이 변경되면 Node의 label 등을 업데이트.
        - 최초 로드 시 모든 `cards` -> `nodes` 변환 (여기서 `cardsToCardNodes` 유틸 사용 가능).
    - 최종적으로 이 훅은 현재 `nodes`와 `edges`를 리턴합니다. (Alternatively, 훅 내에서 `useIdeaMapStore`의 `nodes`/`edges` 상태를 직접 관리하고, IdeaMap 컴포넌트에서는 store를 통해 받도록 해도 됨. 구현 선택에 따라 다름.)
    - 함수 시그니처:
    ```ts
    import { useEffect } from 'react';
    import { useCards } from '@/hooks/useCards';
    import { useIdeaMapStore } from '@/store/useIdeaMapStore';
    import { cardsToCardNodes } from '@/utils/cardsToCardNodes';

    export function useIdeaMapSync() {
        const { data: cards } = useCards();
        const nodes = useIdeaMapStore(state => state.nodes);
        const setNodes = useIdeaMapStore(state => state.setNodes);

        useEffect(() => {
        if (cards) {
            // 현재 저장된 노드들의 ID와 새 cards ID 비교
            const currentIds = nodes.map(n => n.id);
            const cardIds = cards.map(c => c.id);
            // 추가 또는 업데이트된 카드들을 Node로 변환
            const newNodes = cardsToCardNodes(cards, nodes);
            setNodes(newNodes);
            // (삭제된 카드에 대한 Node는 cardsToCardNodes 결과에 빠져 있으므로 자동 제거됨)
        }
        }, [cards]);

        const edges = useIdeaMapStore(state => state.edges);
        return { nodes, edges };
    }
    ```
    - import 경로 변경:
    ```ts
    import { useIdeaMapSync } from '@/hooks/useIdeaMapSync';
    ```
    - 적용 규칙: [tanstack-query-hook]
    - 예상 결과: 이 훅이 구독되면 카드 리스트 변화에 따라 IdeaMap 노드가 실시간으로 변환/반영됩니다. 예를 들어 카드가 추가되면 `cards`가 변화 -> `newNodes` 계산 -> `useIdeaMapStore.nodes` 업데이트 -> IdeaMap 컴포넌트에 새로운 노드 표시. 삭제/수정도 마찬가지. 
    - 테스트 포인트:
    - `CardList`에서 새 카드 생성 시 IdeaMap에 노드가 추가되는지 확인 (drag&drop 생성 외에도 리스트에서 추가된 카드도 맵에 표시).
    - `CardList`에서 카드 삭제 시 IdeaMap에서 해당 노드가 제거되는지 확인.
    - (만약 Node label에 카드 제목을 표시한다면) 카드 제목 수정 시 IdeaMap 노드 라벨도 업데이트되는지 확인.
    - 페이지 처음 열 때, cards 데이터 로드 후 IdeaMap 노드들이 한꺼번에 표시되는지 확인 (초기 layout은 제자리거나 util에 따라 배치).

    ### Task 40: `useIdeaMapInteractions` 훅 생성 (상호작용 핸들러 통합)
    - 관련 파일: `/src/hooks/useIdeaMapInteractions.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: IdeaMap (React Flow) 상호작용을 처리하는 훅을 구현합니다. 여기에는:
        - 노드 클릭시 호출될 핸들러: `onNodeClick(event, node)` -> 내부에서 `useAppStore`의 `selectCards` 또는 `toggleSelectedCard` 호출. (예: Ctrl/Shift 키 조합 여부에 따라 단일/다중 선택 구분)
        - 배경(Pane) 클릭 핸들러: `onPaneClick()` -> `clearSelectedCards()` 호출하여 모든 선택 해제.
        - 드래그 앤 드롭으로 새로운 카드 생성: React Flow에서는 외부 드래그 구현 시 `onDrop` 이벤트로 새 노드를 추가합니다. 여기서 `useCreateCard` Mutation을 호출하여 DB에 카드 생성. 생성이 성공하면 `useIdeaMapSync` 통해 노드 추가됨. *구현:* `onDrop(event)` -> 드롭 좌표 계산 -> `createCard({ title: '새 카드', x, y })` (x, y를 payload에 포함시켜 API가 위치 저장 가능하게 할 수도 있음; 현재는 위치 저장없으니 무시하거나 추후 Task 42 활용).
        - 엣지 연결 핸들러: `onConnect(connection)` -> 현재 edges는 로컬 상태라 `useIdeaMapStore.getState().setEdges(addEdge(...))`로 즉시 추가. (만약 서버에도 edge 저장한다면 `useCreateEdge` mutation을 호출하는 분기 처리; 현재는 로컬만.)
        - 기타: 노드 드래그 끝 이벤트 (onNodeDragStop) 등을 받아 필요하면 layout 저장하도록 처리(이 부분은 useIdeaMapLayout에서 담당).
    - 함수 시그니처:
        ```ts
        import { useAppStore } from '@/store/useAppStore';
        import { useCreateCard } from '@/hooks/useCreateCard';
        import { useIdeaMapStore } from '@/store/useIdeaMapStore';

        export function useIdeaMapInteractions() {
            const selectCards = useAppStore(state => state.selectCards);
            const toggleSelectedCard = useAppStore(state => state.toggleSelectedCard);
            const clearSelectedCards = useAppStore(state => state.clearSelectedCards);
            const { mutate: createCard } = useCreateCard();
            const setEdges = useIdeaMapStore(state => state.setEdges);
            const edges = useIdeaMapStore(state => state.edges);

            return {
            onNodeClick: (_, node) => {
                // Ctrl 키 눌렸는지 등은 node 객체나 글로벌 이벤트 통해 확인 필요
                // 예시: 다중선택 지원
                const multiSelect = window.event && (window.event as MouseEvent).ctrlKey;
                multiSelect ? toggleSelectedCard(node.id) : selectCards([node.id]);
            },
            onPaneClick: () => clearSelectedCards(),
            onDrop: (event) => {
                const reactFlowBounds = event.currentTarget.getBoundingClientRect();
                const position = {
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top
                };
                createCard({ title: 'New Card', position }); // position 정보와 함께 카드 생성 (API에서 활용 가능)
            },
            onConnect: (connection) => {
                setEdges([...edges, connection]);
                // (만약 edges를 서버에 저장할 경우 여기서 useCreateEdge().mutate 호출)
            }
            };
        }
        ```
    - import 경로 변경:
    ```ts
    import { useIdeaMapInteractions } from '@/hooks/useIdeaMapInteractions';
    ```
    - 적용 규칙: [zustand-slice], [tanstack-query-hook]
    - 예상 결과: IdeaMap 관련 이벤트 처리가 한 곳에 모입니다. IdeaMap 컴포넌트는 이 훅으로부터 이벤트 핸들러들을 받아 React Flow 컴포넌트에 넘겨주기만 하면 됩니다. 
    - 테스트 포인트:
        - 맵에서 노드 클릭 시 카드 선택 상태가 변경되고 사이드바에 반영되는지 확인.
        - 맵 배경 클릭 시 선택이 모두 해제되는지 확인.
        - 다른 컴포넌트(예: CardList)에서 카드 선택 시 IdeaMap에서도 선택 표시(하이라이트)가 연동되려면, React Flow `selected` 속성을 `selectedCardIds`와 비교해 적용해야 함. 이 부분도 IdeaMap.tsx에서 처리 가능 (ex: `selected={selectedCardIds.includes(node.id)}`).
        - 노드 드롭으로 새로운 카드 생성: 맵에 빈 영역에 드롭 (예: 외부에서 아이콘을 드래그) → 새 카드 생성되고 노드/리스트에 추가되는지 확인.
        - 노드 연결 생성: 한 노드에서 다른 노드로 엣지 연결 시 엣지가 즉시 나타나는지 확인 (현재는 로컬 추가이므로 즉시 반영).

    ### Task 41: `useIdeaMapLayout` 훅 생성 (레이아웃 및 저장)
    - 관련 파일: `/src/hooks/useIdeaMapLayout.ts`
    - 변경 유형: [✅코드 추가]
    - 설명: 자동 레이아웃 및 레이아웃 저장/로드를 처리하는 훅입니다.
        - `applyAutoLayout()`: 현재 `useIdeaMapStore.getState().nodes`를 가져와 `getLayoutedElements`나 `getGridLayout` 함수를 적용하여 새로운 좌표로 노드 배열을 계산, `setNodes`로 업데이트. (edges도 재계산 가능하지만 간단히 유지)
        - `saveLayout()`: 현재 노드 좌표 등을 `localStorage`에 저장하거나 (Optional) API 호출로 저장. (현재 DB 연동을 제거했으므로 localStorage 활용)
        - `loadLayout()`: 컴포넌트 마운트 시 localStorage에 저장된 좌표를 읽어 적용. (또는 Task 39에서 cardsToCardNodes 시 활용)
        - 이 훅은 IdeaMap 컴포넌트에서 호출하여, 필요 시 자동 레이아웃 버튼 클릭 핸들러 등에 사용합니다.
    - 함수 시그니처:
    ```ts
    import { useIdeaMapStore } from '@/store/useIdeaMapStore';
    import { getGridLayout } from '@/lib/layout-utils';

    export function useIdeaMapLayout() {
        const nodes = useIdeaMapStore(state => state.nodes);
        const setNodes = useIdeaMapStore(state => state.setNodes);

        const applyAutoLayout = () => {
        const { nodes: layoutedNodes } = getGridLayout(nodes);
        setNodes(layoutedNodes);
        };

        const saveLayout = () => {
        const layoutData = nodes.map(n => ({ id: n.id, position: n.position }));
        localStorage.setItem('ideaMapLayout', JSON.stringify(layoutData));
        };

        const loadLayout = () => {
        const data = localStorage.getItem('ideaMapLayout');
        if (data) {
            try {
            const layoutData: Array<{id: string; position: {x:number;y:number}}> = JSON.parse(data);
            // 현재 nodes와 매칭하여 위치 적용
            const updatedNodes = nodes.map(n => {
                const layout = layoutData.find(l => l.id === n.id);
                return layout ? { ...n, position: layout.position } : n;
            });
            setNodes(updatedNodes);
            } catch {}
        }
        };

        return { applyAutoLayout, saveLayout, loadLayout };
    }
    ```
    - import 경로 변경:
    ```ts
    import { useIdeaMapLayout } from '@/hooks/useIdeaMapLayout';
    ```
    - 적용 규칙: [zustand-slice]
    - 예상 결과
        - 사용자가 "자동 정렬" 버튼을 누르면 `applyAutoLayout`이 호출되어 노드들이 격자 형태 등으로 재배치됩니다. 
        - 페이지를 새로 고침해도 `loadLayout`을 통해 마지막 저장 상태를 복원할 수 있습니다. (현재 localStorage 사용이므로 본인 브라우저 한정)
    - 테스트 포인트:
        - 노드를 임의 배치 후 "자동 레이아웃" 버튼 (만들었다면) 클릭 → 노드들이 정의된 알고리즘대로 재배치되는지 확인.
        - "레이아웃 저장" 버튼 클릭 후 새로고침 → "레이아웃 불러오기" 혹은 자동으로 `loadLayout()` 실행되어 이전 배치가 유지되는지 확인.
        - (DB 저장이 필요하면, `saveLayout`에서 Supabase RPC나 Prisma API 호출로 user-specific layout 저장을 구현할 수 있지만 여기서는 범위 밖)

*   ## G. 아키텍처·AI 협업 문서화 및 테스트 

    ### Task 42: store.cards` 완전 제거 + IdeaMap 리팩토링
    
    ####  ✨ 목표
            1. **Zustand UI‑slice** (`useAppStore`)에서 **`cards` 필드와 관련 액션**을 완전히 삭제한다.  
            2. 모든 컴포넌트·훅이 **TanStack Query 훅 `useCards`** 또는 **`useIdeaMapSync`** 를 통해 카드 목록을 구독하도록 변경한다.  
            3. **IdeaMap** 컴포넌트를 새 구조(세 훅)로 리팩토링하여 store 의존을 제거하고 UI 코드를 단순화한다.

    #### 🔖 작업 범위 & 파일

        | 구분 | 파일 / 폴더 | 작업 유형 |
        |------|-------------|-----------|
        | **A. 카드 필드 제거** | `src/store/useAppStore.ts` (CardStateSlice) | 🔥 필드/액션 삭제 |
        | **B. IdeaMap 리팩토링** | `src/components/ideamap/components/IdeaMap.tsx` | 🔁 대규모 수정 |
        | **C. 기타 컴포넌트** | `CardList.tsx`, `Sidebar.tsx`, 검색/필터 관련 컴포넌트 등 `store.cards` 참조 파일 | 🛠 코드 수정 |
        | **D. 테스트** | 관련 테스트 파일 (`*.test.tsx`) | 🛠 업데이트 |
        | **E. 타입** | `src/types` (필요 시) | 🛠 정리 |

    #### 📋 세부 단계

        **42‑A : Zustand에서 카드 배열 제거**

            1. **필드 삭제**  
            ```diff
            // CardStateSlice
            - cards: Card[]
            - setCards: (cards: Card[]) ⇒ void
            ```
            2. **액션 삭제** – `createCard`, `updateCard`, `deleteCard` 가 cards 배열을 조작하고 있으면 제거(이미 Task 15에서 대부분 제거됨).  
            3. **Slice export 타입** 수정 후 **tsc 빌드 통과** 확인.

        **42‑B : IdeaMap 컴포넌트 리팩토링**

            ```tsx
            // /src/components/ideamap/components/IdeaMap.tsx
            "use client";

            import ReactFlow, { Background, Controls } from 'reactflow';
            import { useIdeaMapStore }     from '@/store/useIdeaMapStore';
            import { useIdeaMapSync }      from '@/hooks/useIdeaMapSync';
            import { useIdeaMapInteractions } from '@/hooks/useIdeaMapInteractions';
            import { useIdeaMapLayout }    from '@/hooks/useIdeaMapLayout';

            export default function IdeaMap() {
            /* 1. 서버 state ↔ 노드 동기화 */
            const { isLoading, error, /* nodes, edges set in store */ } = useIdeaMapSync();

            /* 2. React‑Flow UI state */
            const nodes        = useIdeaMapStore(s => s.nodes);
            const edges        = useIdeaMapStore(s => s.edges);
            const onNodesChange= useIdeaMapStore(s => s.onNodesChange);
            const onEdgesChange= useIdeaMapStore(s => s.onEdgesChange);

            /* 3. 상호작용 */
            const {
                onNodeClick, onPaneClick, onDrop, onConnect
            } = useIdeaMapInteractions();

            /* 4. 레이아웃 util */
            const { applyAutoLayout } = useIdeaMapLayout();

            if (isLoading) return <div>Loading…</div>;
            if (error)     return <div className="text-red-500">Error: {error.message}</div>;

            return (
                <div className="idea-map-container w-full h-full">
                <button onClick={applyAutoLayout}>자동 정렬</button>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onDrop={onDrop}
                    onConnect={onConnect}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
                </div>
            );
            }
            ```

            * `useAppStore(state ⇒ state.cards)` 관련 코드 ✂️ 삭제 완료.*

        **42‑C : 다른 컴포넌트 교체**

            | 기존 | 변경 |
            |------|------|
            | `const cards = useAppStore(s ⇒ s.cards);` | `const { data: cards = [], isLoading } = useCards(params);` |
            | `setCards(newCards)` 로컬 업데이트 | **삭제** (목록 갱신은 invalidate or refetch) |

            > **검색 패턴** `useAppStore\\([^)]*\\.cards` `\\.setCards\\(`

        **42‑D : 테스트 업데이트**

            - *스토어 테스트* → `cards` 관련 expect 제거.  
            - *컴포넌트 테스트* → **MSW** 로 `/api/cards` 모킹 후 `waitFor` 로 렌더 확인.  
            - *useIdeaMapSync.test.tsx* 의 타임아웃 문제는 **store 모킹 삭제** 이후 해결될 가능성이 높음—`MockSetNodes` 대기 조건에서 `nodes.length` 로 변경 권장.

        **42‑E : 타입 & 빌드 검증**

        1. `pnpm type-check` / `yarn tsc --noEmit` 통과.  
        2. 앱 실행 후 IdeaMap, Sidebar, CardList 모두 정상 동작.  
        3. React Query DevTools → `['cards', params]` 쿼리가 *active* 인지 확인.

    #### ✅ 완료 기준 (Definition of Done)

    - 코드베이스에서 **`cards`/`setCards` 필드·액션 0건**.  
    - IdeaMap 빌드 에러 해결 & 화면 정상.  
    - 모든 단위/통합 테스트 통과.  
    - 새 or 변경 테스트에서 **MSW + React‑Query** 흐름 검증.

    ---

    > **참고 문헌**  
    > • TanStack Query “Server State vs UI State” 가이드 (https://tanstack.com/query/latest/docs/framework/react/overview)  
    > • Zustand slice pattern – 협업에서 UI state 전용 유지 (https://docs.pmnd.rs/zustand/guides/slices-pattern)  
  
    ### Task 43: `useNodeStore` (노드 인스펙터 상태) 제거
    - 관련 파일: `/src/store/useNodeStore.ts`
    - 변경 유형: [🗑️코드 삭제]
    - 설명: 노드 상세 인스펙터 용도로 쓰이던 별도 Zustand store를 삭제합니다. 이 store는 아마 개별 노드에 대한 속성 편집 패널 열림 상태 등을 관리했을 것입니다. 이제 카드 선택/확장 상태가 통합되었으므로 중복됩니다. 
    - `inspectorOpen`이나 `inspectedNode` 상태가 필요한 경우, 간단히 IdeaMap 컴포넌트 내부 상태나 `expandedCardId`로 대체 가능합니다. (예: `expandedCardId`가 곧 inspectorOpen을 의미한다고 볼 수 있음)
    - 따라서 useNodeStore와 그 사용처를 제거하거나 `expandedCardId` 기반으로 리팩토링합니다.
    - 함수 시그니처: N/A (전체 삭제)
    - import 경로 변경: 해당 store를 import하던 부분 제거.
    - 적용 규칙: [no-context]
    - 예상 결과: 노드 인스펙터 관련 상태 관리가 `useAppStore.cardStateSlice`의 `expandedCardId`로 일원화됩니다. 더불어 코드베이스에서 `useNodeStore`를 찾으면 참조가 없어야 합니다.
    - 테스트 포인트:
    - 인스펙터 UI (예: 화면 오른쪽에 노드 속성 편집 패널이 있었다면) 여전히 동작하는지 확인. `expandedCardId`를 기준으로 해당 카드 정보를 표시하도록 했다면 계속 동작할 것입니다. 
    - `inspectorOpen`을 직접 사용하던 로직은 없어졌으므로, inspector 패널을 여닫는 것은 `expandedCardId !== null` 조건으로 처리되었는지 검증.
    - 전체 앱에서 useNodeStore 관련 오류가 없는지 확인.

    ---

    ### Task 44: useEdge

    ### Task 45: Setting - Production 저장 확인. 

    ### Task 46: 불필요한 API 및 코드 제거 (`/api/users/first` 등)
- 관련 파일: `/src/app/api/users/first/route.ts`
- 변경 유형: [🗑️코드 삭제]
- 설명: 리팩토링 전 임시로 사용되던 API 엔드포인트와 관련 코드를 삭제합니다. 특히 `/api/users/first`는 첫 번째 사용자 ID를 가져오는 용도로 썼을 가능성이 있는데, 이제 Supabase 인증으로 사용자 정보를 얻을 수 있으므로 불필요합니다. 
  - `/api/users/first` 라우트 파일 삭제.
  - 이를 호출하던 부분 (예: `fetchFirstUserId` useEffect 등) 제거. CreateCardModal에서 userId를 세팅하던 로직이 있었다면, 이제 `useAuthStore.profile?.id`를 쓰거나, 서버에서 userId를 자동 할당하도록 변경했으므로 제거합니다.
- 함수 시그니(표 제약으로 인해 나머지 Task는 다음 메시지에 계속됩니다.)