**목표:** Google OAuth 로그인 성공 후 `/login`으로 잘못 리디렉션되는 문제를 해결하고, 정상적으로 홈페이지(`/`)로 이동하여 로그인 상태가 유지되도록 합니다.

**Phase 1: Supabase SSR 구성 재확인 (이전 Tasklist 결과 확인 포함)**

*   **Task 1.1: Supabase 유틸리티 경로 및 설정 확인**
    *   **Action:** `src/lib/supabase` 디렉토리에 `client.ts`, `server.ts`, `middleware.ts`가 있는지 확인합니다. `src/lib/supabase/client.ts`에서 `createBrowserClient` 호출 시 `auth` 옵션이 없는지 다시 확인합니다. 프로젝트 전체에서 `@/utils/supabase/...` import가 없는지 최종 확인합니다.
    *   **Verification:** 파일 구조와 `client.ts` 내용이 이전 Tasklist 결과와 일치해야 합니다. 타입 검사 통과.
    *   **Rules:** [file-structure], [config-simplification], [supabase-ssr]
    *   **Expected Result:** Supabase 설정 및 경로가 일관되고 표준화된 상태입니다.

*   **Task 1.2: 미들웨어 로직 정밀 검토**
    *   **File:** `src/lib/supabase/middleware.ts`
    *   **Action:** `updateSession` 함수 내부 로직을 다음 사항에 유의하여 검토합니다.
        1.  `createServerClient` 호출 시 쿠키 `get`, `set`, `remove` 핸들러가 올바르게 구현되었는지 확인합니다. 특히 `response.cookies.set`과 `request.cookies.set` (및 delete)이 모두 사용되는지 확인합니다. (제공된 코드는 이 부분을 올바르게 처리하고 있습니다.)
        2.  함수 마지막에 `return response`가 올바르게 실행되는지 확인합니다. 오류 발생 시에도 `NextResponse.next()`를 반환하여 요청 흐름을 막지 않는지 확인합니다.
        3.  **[중요]** `await supabase.auth.getUser()` 호출이 있는지 확인합니다. 이 호출은 세션 갱신을 트리거하는 핵심입니다.
    *   **Verification:** 코드가 Supabase SSR 공식 문서의 미들웨어 예제와 기능적으로 동일해야 합니다. 특히 쿠키 처리와 `getUser()` 호출 여부 확인.
    *   **Rules:** [supabase-ssr], [code-review], [session-management]
    *   **Expected Result:** 미들웨어가 세션 쿠키를 안정적으로 읽고 쓰고, 세션을 갱신합니다.

*   **Task 1.3: 메인 미들웨어 (`src/middleware.ts`) 확인**
    *   **File:** `src/middleware.ts`
    *   **Action:** `middleware` 함수가 단순히 `await updateSession(request)`를 호출하고 그 결과를 반환하는지 확인합니다. 여기에 추가적인 리디렉션 로직이나 인증 확인 로직이 **없어야** 합니다. `config`의 `matcher`가 의도대로 설정되어 있는지 확인합니다.
    *   **Verification:** 코드가 매우 단순해야 하며, `updateSession` 호출 외 다른 로직이 없어야 합니다.
    *   **Rules:** [middleware-logic], [separation-of-concerns]
    *   **Expected Result:** 메인 미들웨어는 세션 업데이트 책임만 가집니다.

**Phase 2: OAuth 콜백 처리 단순화 및 검증**

*   **Task 2.1: 서버 콜백 라우트 (`/auth/callback/route.ts`) 역할 명확화**
    *   **File:** `src/app/auth/callback/route.ts`
    *   **Action:** 이 파일의 역할을 **오직 `code`를 Supabase 세션으로 교환하고 성공 시 최종 목적지(`/`)로 리디렉션**하는 것으로 제한합니다.
        1.  `supabase.auth.exchangeCodeForSession(code)` 호출 후 `error`가 없다면, **다른 작업 없이 즉시** `return NextResponse.redirect(new URL('/', request.url))`를 실행하여 홈페이지로 보냅니다.
        2.  오류 발생 시에는 현재처럼 `/login?error=...`로 리디렉션합니다.
        3.  **[중요]** 성공 경로에서 추가적인 사용자 생성/확인 로직 등을 **수행하지 않습니다.** (사용자 생성/동기화는 `ClientLayout` 등 다른 곳에서 처리).
    *   **Verification:** 성공 시 즉시 `/`로 리디렉션하고, 실패 시 `/login`으로 리디렉션하는지만 확인합니다.
    *   **Rules:** [separation-of-concerns], [simplification], [redirect-logic]
    *   **Expected Result:** 서버 콜백 라우트의 역할이 명확해지고 단순화됩니다.

*   **Task 2.2: 클라이언트 콜백 페이지 (`/auth/callback/page.tsx`) 제거 (권장)**
    *   **Action:** `src/app/auth/callback/page.tsx` 파일과 관련 테스트 파일(`page.test.tsx`), 그리고 `useAuthCallback` 훅 (`src/hooks/useAuthCallback.ts`) 및 `AuthService` (`src/services/auth-service.ts`) 파일을 **삭제**합니다. Task 2.1에서 서버 라우트가 모든 처리를 하고 최종 리디렉션을 수행하므로 클라이언트 페이지는 더 이상 필요하지 않습니다.
    *   **Verification:** 해당 파일들이 프로젝트에서 완전히 삭제되었는지 확인합니다. `yarn build` 또는 타입 검사 시 관련 import 오류가 없는지 확인합니다.
    *   **Rules:** [simplification], [redundancy-removal], [supabase-ssr]
    *   **Expected Result:** 불필요한 클라이언트 측 콜백 처리 로직이 제거되어 흐름이 단순화됩니다.

*   **Task 2.3: Google 로그인 시작 로직 확인**
    *   **File:** `src/app/login/actions.ts` (또는 Google 로그인을 시작하는 다른 위치)
    *   **Action:** `signInWithGoogle` 함수(또는 유사 함수) 내에서 `supabase.auth.signInWithOAuth`를 호출할 때 `options.redirectTo` 값이 `http://<당신의_도메인>/auth/callback` 으로 올바르게 설정되어 있는지 다시 확인합니다.
    *   **Verification:** `redirectTo` URL이 서버 콜백 라우트(`/auth/callback/route.ts`)를 정확히 가리키는지 확인합니다.
    *   **Rules:** [configuration], [oauth]
    *   **Expected Result:** Google 로그인이 올바른 콜백 URL로 사용자를 돌려보냅니다.

**Phase 3: 클라이언트 측 상태 동기화 및 리디렉션 방지**

*   **Task 3.1: `AuthContext`의 `onAuthStateChange` 리스너 확인**
    *   **File:** `src/contexts/AuthContext.tsx`
    *   **Action:** `useEffect` 훅 안에 있는 `supabase.auth.onAuthStateChange` 리스너를 확인합니다.
        1.  `SIGNED_IN` 이벤트 발생 시 `session`과 `user` 상태가 올바르게 설정되는지 확인합니다.
        2.  `SIGNED_OUT` 이벤트 발생 시 `session`과 `user` 상태가 `null`로 설정되는지 확인합니다.
        3.  **[수정]** 이전에 언급된 `localStorage` 정리 코드가 있다면, **제거하는 것을 강력히 권장**합니다. 상태 업데이트는 `setUser`, `setSession`으로 충분합니다.
    *   **Verification:** 리스너가 상태를 올바르게 업데이트하고 불필요한 `localStorage` 조작이 없는지 확인합니다.
    *   **Rules:** [state-management], [supabase-ssr], [event-handling]
    *   **Expected Result:** `AuthContext`가 Supabase 인증 상태 변경을 안정적으로 감지하고 내부 상태를 업데이트합니다.

*   **Task 3.2: 초기 로딩 시 인증 상태 처리 개선 (ClientLayout 또는 최상위 레이아웃)**
    *   **File:** `src/components/layout/ClientLayout.tsx` (또는 인증 상태를 확인하는 최상위 클라이언트 컴포넌트)
    *   **Action:** 컴포넌트가 마운트될 때 또는 `AuthContext`의 `isLoading` 상태를 사용하여, 인증 상태가 **확인되기 전까지** (즉, `isLoading`이 `true`인 동안)는 리디렉션 로직을 실행하지 않도록 합니다.
        ```typescript
        // 예시 (ClientLayout 또는 DashboardLayout 등)
        import { useAuth } from '@/contexts/AuthContext';
        import { useRouter } from 'next/navigation';
        import { useEffect } from 'react';
        import Spinner from '@/components/ui/spinner'; // 로딩 스피너 컴포넌트 예시

        export function ProtectedLayout({ children }: { children: React.ReactNode }) {
          const { user, isLoading } = useAuth();
          const router = useRouter();

          useEffect(() => {
            // 로딩 중이 아니고, 사용자가 없으면 로그인 페이지로 리디렉션
            if (!isLoading && !user) {
              router.push('/login');
            }
          }, [isLoading, user, router]);

          // 로딩 중일 때는 로딩 표시 또는 아무것도 표시 안 함
          if (isLoading) {
            return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>; // 로딩 상태 표시
          }

          // 사용자가 확인되었고 로그인 상태일 때만 자식 컴포넌트 렌더링
          if (user) {
            return <>{children}</>;
          }

          // 리디렉션이 발생하기 전까지는 null 반환 (깜빡임 방지)
          return null;
        }
        ```
    *   **Verification:** 로그인 직후 홈페이지 로드 시, `AuthContext`의 `isLoading`이 `false`가 되고 `user` 객체가 채워진 *이후에* 리디렉션 로직이 실행되는지 확인합니다. 로딩 상태가 적절히 표시되는지 확인합니다.
    *   **Rules:** [client-side-logic], [state-management], [async-handling]
    *   **Expected Result:** 초기 로딩 시 인증 상태가 불확실할 때 로그인 페이지로 잘못 리디렉션되는 것을 방지합니다.

**Phase 4: 최종 E2E 검증 (재수행)**

*   **Task 4.1: Google 로그인/로그아웃 E2E 테스트 (재수행)**
    *   **Action:** 애플리케이션을 실행하고, 브라우저에서 다음 시나리오를 다시 테스트합니다.
        1.  로그인 페이지 접근 -> Google 로그인 버튼 클릭 -> Google 계정 선택/로그인 -> 앱으로 리디렉션 -> **홈페이지(`/`)로 성공적으로 이동하고 로그인 상태가 유지되는지 확인.**
        2.  로그인된 상태에서 로그아웃 버튼 클릭 -> 로그아웃 처리 확인 -> **로그인 페이지로 정상적으로 리디렉션되는지 확인.**
    *   **Verification:**
        *   리디렉션 루프가 발생하는지 확인합니다. (발생하지 않아야 함)
        *   로그인/로그아웃 후 원하는 페이지로 이동하고 세션 상태가 올바르게 반영되는지 확인합니다.
        *   콘솔 오류 및 네트워크 요청을 다시 확인합니다.
    *   **Rules:** [e2e-verification], [supabase-ssr]
    *   **Expected Result:** 사용자가 로그인 후 홈페이지로 정상 이동하고, 로그아웃 후 로그인 페이지로 정상 이동합니다. 세션이 안정적으로 관리됩니다.

---

이 수정된 Tasklist는 NextAuth.js를 완전히 제거하고 Supabase SSR 방식에 맞춰 콜백 처리와 클라이언트 상태 동기화 문제를 해결하는 데 중점을 둡니다. 특히 Phase 2와 3이 리디렉션 루프 문제를 해결하는 핵심 단계가 될 것입니다.