---
description: 
globs: 
alwaysApply: false
---
**목표:** 현재 `lib` 폴더의 인증 관련 로직(특히 `auth-storage.ts`, `crypto.ts`, `auth.ts`의 `signOut` 로직)을 리팩토링하여 Supabase의 표준적인 세션 관리 및 스토리지 메커니즘을 사용하도록 변경하고, 보안 및 안정성을 개선합니다.

**전제 조건:**

* 프로젝트는 Next.js를 사용하고 Vercel에 배포될 예정입니다.
* Supabase 인증 라이브러리 `@supabase/ssr`과 `@supabase/supabase-js`가 설치되어 있습니다.
* 단위 테스트 환경(예: Vitest)이 설정되어 있습니다.

---

**Cursor Agent 지시용 태스크리스트**

**단계 0: 준비 및 현재 상태 확인**

1.  **[Goal]** 리팩토링 시작 전 현재 코드 상태를 확인하고 기준점을 마련합니다.
2.  **[Instruction]** 현재 브랜치에서 모든 단위 테스트 (`npm test` 또는 `yarn test`)를 실행하고 결과를 기록합니다. (실패하는 테스트가 있다면 기록해둡니다.)
3.  **[Instruction]** 변경 사항을 추적하기 위해 새로운 Git 브랜치(예: `refactor/auth-simplification`)를 생성합니다.

**단계 1: Supabase 클라이언트 초기화 표준화 (`@supabase/ssr` 활용)**

1.  **[Goal]** 클라이언트 및 서버 환경 모두에서 Supabase 클라이언트를 생성하고 관리하는 방식을 `@supabase/ssr` 라이브러리의 표준 방식으로 통일합니다. 복잡하게 얽힌 `hybrid-supabase.ts`, `supabase-instance.ts`, `supabase.ts`를 정리하고, Supabase가 제공하는 기본 스토리지(클라이언트: localStorage, 서버: 쿠키)를 사용하도록 설정합니다.
2.  **[Files to Modify]**
    * `lib/supabase-client.ts` (새 파일 또는 기존 파일 통합)
    * `lib/supabase-server.ts` (기존 파일 활용 또는 통합)
    * `lib/auth.ts` (클라이언트 가져오는 부분 수정)
    * `lib/auth-server.ts` (클라이언트 가져오는 부분 수정, 필요시)
    * (삭제 대상) `lib/hybrid-supabase.ts`, `lib/supabase-instance.ts`, `lib/supabase.ts`
3.  **[Instruction]**
    * `@supabase/ssr` 문서(Next.js App Router 가이드 참고)에 따라 클라이언트 컴포넌트용 Supabase 클라이언트 생성 함수(`createClientComponentClient` 또는 유사한 이름)와 서버 액션/라우트 핸들러/서버 컴포넌트용 클라이언트 생성 함수(`createServerActionClient`, `createServerRouteHandlerClient`, `createServerComponentClient` 등)를 구현하는 유틸리티 파일(`lib/supabase/client.ts`, `lib/supabase/server.ts` 등)을 만듭니다. 이 클라이언트들은 기본적으로 쿠키 또는 localStorage를 사용하여 세션을 관리합니다.
    * 기존의 `lib/hybrid-supabase.ts`, `lib/supabase-instance.ts`, `lib/supabase.ts` 파일을 삭제합니다.
    * `lib/auth.ts` 및 애플리케이션 전체에서 Supabase 클라이언트를 가져오는 부분을 새로 만든 유틸리티 함수를 사용하도록 수정합니다. (예: `getAuthClient` 대신 `createClientComponentClient` 사용)
    * `lib/supabase-server.ts`와 `lib/auth-server.ts`도 새로운 서버 클라이언트 유틸리티를 사용하도록 업데이트합니다.
    * `supabase-instance.ts`에서 설정했던 전역 `window.__SUPABASE_AUTH_...` 헬퍼 함수들을 제거합니다. (Supabase 클라이언트가 내부적으로 처리하도록 맡깁니다.)
4.  **[Verification]**
    * 관련 단위 테스트(예: `hybrid-supabase.test.ts`는 삭제, `auth.test.ts`, `auth-server.test.ts` 등 클라이언트/서버 생성 관련 부분)를 수정하거나 새로 작성하여, 각 환경에 맞는 Supabase 클라이언트가 `@supabase/ssr` 방식으로 올바르게 생성되고 반환되는지 확인합니다.
    * 기존 테스트 중 실패하는 것이 없는지 확인하고 수정합니다.

**단계 2: 커스텀 인증 스토리지 로직 제거 (`auth-storage.ts`)**

1.  **[Goal]** 복잡하고 비표준적인 커스텀 스토리지 로직(`auth-storage.ts`)을 제거하고, Supabase 클라이언트가 제공하는 내장 세션 관리 및 스토리지 메커니즘을 사용하도록 전환합니다.
2.  **[Files to Modify]**
    * `lib/auth.ts` (및 `auth-storage`를 사용하는 다른 모든 파일)
    * `lib/auth-storage.ts` (삭제 대상)
    * `lib/auth-storage.test.ts` (삭제 대상)
3.  **[Instruction]**
    * `lib/auth-storage.ts` 파일과 관련 테스트 파일(`lib/auth-storage.test.ts`)을 삭제합니다.
    * `lib/auth.ts` 파일 및 다른 파일들에서 `getAuthData`, `setAuthData`, `removeAuthData`, `clearAllAuthData`, `STORAGE_KEYS` 등 `auth-storage`에서 가져온 모든 함수와 상수의 사용을 제거합니다.
    * **대체 로직:**
        * 세션/사용자 정보 가져오기: `getAuthData` 대신 Supabase 클라이언트의 `supabase.auth.getSession()` 및 `supabase.auth.getUser()`를 사용합니다. (`lib/auth.ts`의 `getCurrentUser`, `getSession`, `getUser` 함수는 이 클라이언트 메소드를 호출하도록 유지하거나 직접 사용합니다.)
        * 토큰 저장/삭제: 명시적으로 토큰을 저장/삭제할 필요가 없습니다. Supabase 클라이언트(`createBrowserClient`, `createServerClient` 등)가 로그인/로그아웃 시 자동으로 처리합니다. `signIn`, `signUp`, `signOut` 함수 내에서 `setAuthData`, `removeAuthData`, `clearAllAuthData` 호출을 제거합니다.
        * `code_verifier` 처리:
            * `signInWithGoogle` 함수 내: `code_verifier` 생성 후, 이를 임시로 저장해야 합니다. `sessionStorage`를 직접 사용하는 것이 간단합니다. (예: `sessionStorage.setItem('pkce_code_verifier', verifier)`).
            * OAuth 콜백 처리 시 (Supabase 클라이언트가 내부적으로 처리하지만, 만약 직접 코드를 교환해야 한다면): `sessionStorage`에서 `code_verifier`를 가져와 사용하고 즉시 삭제합니다. (예: `const verifier = sessionStorage.getItem('pkce_code_verifier'); sessionStorage.removeItem('pkce_code_verifier');`). **주의:** `@supabase/ssr`과 `createBrowserClient`는 PKCE 흐름을 내부적으로 처리하므로, `code_verifier`를 직접 저장/관리할 필요가 없을 수 있습니다. Supabase 문서를 확인하여 클라이언트 라이브러리가 PKCE를 자동으로 처리하는지 확인하고, 그렇다면 이 저장/삭제 로직도 제거합니다.
4.  **[Verification]**
    * `lib/auth.test.ts`, `lib/auth-integration.test.ts`, `lib/__tests__/auth-integration.test.ts` 등 인증 관련 테스트를 업데이트합니다. `auth-storage` 모킹을 제거하고, Supabase 클라이언트의 `getSession`, `getUser` 등의 메소드 호출을 모킹하여 테스트합니다.
    * 로그인/로그아웃 시 Supabase 클라이언트의 관련 메소드가 호출되는지, 세션 정보가 올바르게 반환되는지 확인하는 테스트를 강화합니다.
    * PKCE 흐름 테스트(`auth-pkce-flow.test.ts`)에서 `code_verifier`가 더 이상 `auth-storage`를 통해 관리되지 않음을 확인합니다. (필요시 `sessionStorage` 모킹 사용)
    * 모든 관련 테스트를 실행하여 통과하는지 확인합니다.

**단계 3: 플레이스홀더 암호화 로직 제거 (`crypto.ts`)**

1.  **[Goal]** 실제 암호화 기능이 없는 플레이스홀더 `crypto.ts` 모듈을 제거합니다. (단계 2에서 `auth-storage`가 제거되면서 이 모듈의 필요성도 사라졌을 것입니다.)
2.  **[Files to Modify]**
    * `lib/crypto.ts` (삭제 대상)
    * `lib/crypto.test.ts` (삭제 대상)
    * (만약 다른 곳에서 임포트했다면 해당 파일)
3.  **[Instruction]**
    * `lib/crypto.ts` 파일과 `lib/crypto.test.ts` 파일을 삭제합니다.
    * 프로젝트 내에서 `crypto.ts`의 함수(`encryptValue`, `decryptValue` 등)를 임포트하거나 사용하는 부분이 없는지 확인하고 모두 제거합니다.
4.  **[Verification]**
    * 관련 테스트 파일이 삭제되었는지 확인합니다.
    * 전체 테스트를 실행하여 `crypto.ts` 관련 오류가 발생하지 않는지 확인합니다.

**단계 4: `signOut` 함수 로직 단순화 (`auth.ts`)**

1.  **[Goal]** `lib/auth.ts`의 `signOut` 함수에서 비표준적인 `code_verifier` 저장/복원 로직을 제거하고, Supabase 클라이언트의 `signOut` 호출만 남겨 단순화합니다.
2.  **[Files to Modify]**
    * `lib/auth.ts`
3.  **[Instruction]**
    * `signOut` 함수 내부를 수정합니다.
    * `getAuthData`로 `code_verifier`를 가져오는 부분, `sessionStorage`에 백업하는 부분, `Object.values(STORAGE_KEYS).forEach(...)` 루프, `setAuthData`로 `code_verifier`를 복원하는 부분을 모두 제거합니다.
    * 함수 내용은 단순히 Supabase 클라이언트를 가져와 `client.auth.signOut()`를 호출하는 것만 남깁니다. (오류 처리 로깅은 유지해도 좋습니다.) 토큰 및 세션 정리는 Supabase 클라이언트가 담당합니다.
        ```typescript
        // lib/auth.ts 수정 예시
        export async function signOut() {
          try {
            logger.info('로그아웃 시작');
            const client = getAuthClient(); // 또는 createClientComponentClient()
            const { error } = await client.auth.signOut();
            if (error) {
              throw error; // Supabase 오류 다시 던지기
            }
            logger.info('로그아웃 완료 (Supabase 호출)');
          } catch (error) {
            logger.error('로그아웃 중 오류 발생:', error);
            throw error;
          }
        }
        ```
4.  **[Verification]**
    * `lib/auth.test.ts` 및 관련 통합 테스트에서 `signOut` 테스트를 업데이트합니다. 더 이상 `auth-storage` 관련 모킹이나 `code_verifier` 관련 로직을 검증할 필요가 없습니다. Supabase 클라이언트의 `signOut` 메소드가 호출되었는지 확인하는 것으로 충분합니다.
    * 로그아웃 후 `getCurrentUser` 또는 `getSession` 호출 시 null 또는 에러가 반환되는지 확인하는 테스트를 추가/강화합니다.
    * 테스트를 실행하여 통과하는지 확인합니다.

**단계 5: 로그아웃 액션 리팩토링 (`useAppStore.ts`)**

1.  **[Goal]** `useAppStore.ts`의 `logoutAction`이 단순화된 `signOut` 함수를 올바르게 호출하고, 페이지 이동을 위해 `window.location.href` 대신 표준 라우터를 사용하도록 수정합니다.
2.  **[Files to Modify]**
    * `src/store/useAppStore.ts`
    * `src/components/layout/ProjectToolbar.tsx` (또는 `logoutAction`을 호출하는 컴포넌트)
3.  **[Instruction]**
    * `useAppStore.ts`의 `logoutAction` 내부에서 `window.location.href = '/login';` 라인을 제거합니다.
    * `ProjectToolbar.tsx` (또는 해당 액션을 사용하는 다른 컴포넌트)에서 `logoutAction`을 호출하는 부분을 수정합니다. `logoutAction`이 `Promise`를 반환하므로 `await`를 사용하고, 그 후에 Next.js의 `useRouter` 훅을 사용하여 `router.push('/login')`을 호출하도록 변경합니다.
        ```typescript
        // 예시: ProjectToolbar.tsx
        import { useRouter } from 'next/navigation'; // 또는 'next/router'
        // ...
        const router = useRouter();
        const { logoutAction, isLoading } = useAppStore();

        const handleLogoutClick = async () => {
          await logoutAction();
          router.push('/login');
        };
        // ...
        // <DropdownMenuItem onClick={handleLogoutClick} disabled={isLoading}>...</DropdownMenuItem>
        ```
4.  **[Verification]**
    * `useAppStore.test.ts`에서 `logoutAction` 테스트를 업데이트합니다. `window.location.href` 모킹 대신, `signOut` 함수 호출과 상태 초기화만 검증합니다.
    * `ProjectToolbar.test.tsx`에서 로그아웃 메뉴 클릭 시 `logoutAction`이 호출되는지 확인합니다. (라우터 모킹은 복잡할 수 있으므로 액션 호출까지만 테스트하거나, E2E 테스트로 넘길 수 있습니다.)
    * 테스트를 실행하여 통과하는지 확인합니다.

**단계 6: 최종 테스트 및 정리**

1.  **[Goal]** 리팩토링된 인증 로직이 전체적으로 문제없이 동작하는지 확인하고 코드를 정리합니다.
2.  **[Instruction]**
    * 모든 단위 테스트(`npm test` 또는 `yarn test`)를 다시 실행하여 전부 통과하는지 확인합니다.
    * 수동으로 애플리케이션을 실행하여 다음 시나리오를 테스트합니다:
        * 이메일/비밀번호 회원가입
        * 이메일/비밀번호 로그인
        * 로그아웃
        * Google 계정으로 로그인 (PKCE 흐름 전체 확인)
        * 로그아웃 후 다시 Google 계정으로 로그인
        * 세션이 유지되는지 확인 (페이지 새로고침 등)
    * 삭제된 파일(`auth-storage.ts`, `crypto.ts` 등)과 관련된 import 문이나 사용되지 않는 코드가 남아있지 않은지 확인하고 정리합니다.
    * 리팩토링된 코드의 가독성 및 일관성을 검토합니다.
3.  **[Verification]**
    * 모든 단위 테스트 통과.
    * 주요 인증 기능 수동 테스트 통과.
    * 코드 정리 완료.

**단계 7: 브라우저 모킹 정리 및 auth.test.ts 테스트 최종 수정**

1.  **[Goal]** 브라우저 환경 모킹을 수정해서 auth.test.ts가 테스트를 통과한다.
2.  **[Instruction]**
    * isClient() 함수 모킹 확인 : isClient() 함수가 항상 true를 반환하도록 모킹되어 있음에도 오류가 발생하는 것은 모킹이 올바르게 적용되지 않았음을 의미.
    * 불필요한 테스트 제거: 중복되거나 실제로 필요하지 않은 테스트 제거 
    * 특정 테스트 케이스 개선: signOut 테스트 간소화 및 다른 인증 관련 테스트를 리펙토링 결과에 맞게 개선
3.  **[Verification]**
    * auth.test.ts는 모든 단위 테스트 통과.
    * 주요 인증 기능 수동 테스트 통과.
    * 코드 정리 완료.