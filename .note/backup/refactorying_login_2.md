알겠습니다. 리팩토링 작업 후 발생한 테스트 오류들을 분석하고, Cursor Agent가 이 문제들을 해결하기 위한 새로운 태스크리스트를 작성해 드릴게요. 오류 메시지와 이전 리팩토링 내용을 바탕으로 원인을 파악하고 해결 방법을 제시하겠습니다.

**오류 분석 요약:**

1.  **`api/logs/view/route.test.ts` 오류:** 리팩토링 과정에서 삭제된 `lib/supabase-instance` 파일을 여전히 import 하려고 해서 발생했습니다.
2.  **`auth-integration.test.ts` (`signUp`) 오류:** `@supabase/ssr`의 `createBrowserClient`가 테스트 환경(Node.js 기반)에서 실행되면서 필요한 쿠키 처리 함수(`getAll`, `setAll`)가 없다고 오류를 발생시킵니다. 테스트 환경 설정이나 클라이언트 모킹 방식에 문제가 있을 수 있습니다.
3.  **`auth-integration.test.ts` (`signIn/signOut`) 오류:** `getAuthClient` 내부의 `isClient()` 환경 체크가 실패하여 "브라우저 환경에서만 사용 가능합니다" 오류가 발생합니다. 테스트 환경에서 `window` 객체 모킹이 제대로 안 되었거나 `isClient` 함수 모킹이 잘못되었을 수 있습니다.
4.  **`auth-integration.test.ts` (Google OAuth) 오류:** `result.success`가 `false`로 나와 실패했습니다. 이는 앞선 환경 문제(Failure 3)로 인해 `getAuthClient` 호출이 실패했거나, PKCE 관련 로직 또는 임시 `code_verifier` 저장/조회 방식(이제 `auth-storage` 대신 `sessionStorage` 사용 등)에 문제가 있을 수 있습니다. Failure 3 해결 시 같이 해결될 가능성이 높습니다.
5.  **`__tests__/auth-integration.test.ts` (로그아웃) 오류:** 테스트가 여전히 `mockStorage.removeItem` 호출을 기대하고 있습니다. 하지만 리팩토링 후에는 Supabase 클라이언트의 `signOut`을 호출하고 토큰 정리는 클라이언트 라이브러리가 담당하므로, 이 테스트 단언(assertion)은 더 이상 유효하지 않습니다.
6.  **`__tests__/auth-integration.test.ts` (서버 환경) 오류:** 서버 환경을 시뮬레이션했을 때 `getAuthClient`가 예상대로 오류를 발생시키지 않았습니다. 리팩토링 과정에서 `getAuthClient` 함수가 변경/제거되었거나, 테스트의 환경 시뮬레이션 또는 오류 발생 기대 로직이 잘못되었을 수 있습니다.

---

**Cursor Agent 지시용 태스크리스트 (테스트 오류 해결)**

**단계 0: 준비**

1.  **[Goal]** 현재 오류 상태를 명확히 하고 해결 작업을 시작할 준비를 합니다.
2.  **[Instruction]** 현재 브랜치에서 `npm test` 또는 `yarn test`를 다시 실행하여 실패하는 테스트 목록과 오류 메시지를 최신 상태로 확인합니다.

**단계 1: API 라우트 테스트의 잘못된 Import 수정**

1.  **[Goal]** 삭제된 `lib/supabase-instance` 대신 새로운 Supabase 서버 클라이언트 유틸리티를 사용하도록 API 라우트 테스트 코드를 수정합니다.
2.  **[File to Modify]** `src/app/api/logs/view/route.test.ts`
3.  **[Instruction]**
    * 파일 상단의 `import ... from "@/lib/supabase-instance"` 라인을 삭제합니다.
    * 이 테스트(및 관련 라우트 핸들러 `route.ts`)에서 Supabase 클라이언트가 필요하다면, 리팩토링 단계 1에서 생성한 **서버용 Supabase 클라이언트 생성 함수**(예: `lib/supabase/server.ts`의 `createServerRouteHandlerClient` 또는 유사 함수)를 import하여 사용하도록 코드를 수정합니다. 해당 함수를 모킹해야 할 수도 있습니다.
4.  **[Verification]**
    * `npm test src/app/api/logs/view/route.test.ts` 를 실행하여 해당 테스트 파일의 import 오류가 해결되었는지 확인합니다. (다른 오류가 발생할 수 있지만 import 오류는 없어야 합니다.)

**단계 2: `lib/auth-integration.test.ts` 환경 설정 및 모킹 수정**

1.  **[Goal]** `auth-integration.test.ts` 파일의 테스트들이 올바른 환경(클라이언트)에서 실행되는 것처럼 시뮬레이션하고, `@supabase/ssr`의 `createBrowserClient` 관련 오류 및 `getAuthClient` 환경 체크 오류를 해결합니다.
2.  **[File to Modify]** `src/lib/auth-integration.test.ts`
3.  **[Instruction]**
    * `beforeEach` 또는 테스트 파일 상단에서 `window` 객체 및 관련 브라우저 API(특히 `localStorage`, `sessionStorage`, `crypto`, `document.cookie` 접근/설정)가 Vitest의 `vi.stubGlobal` 등을 사용하여 **일관되고 정확하게 모킹**되었는지 다시 확인합니다.
    * `@supabase/ssr`의 `createBrowserClient`가 테스트 환경에서 쿠키 관련 오류를 일으키지 않도록 모킹합니다. `@supabase/ssr` 자체를 모킹하여 `createBrowserClient`가 필요한 인터페이스(auth 객체 등)를 갖춘 간단한 모의 객체를 반환하도록 설정하는 것을 고려합니다. (예시: `vi.mock('@supabase/ssr', () => ({ createBrowserClient: vi.fn(() => mockSupabaseClient) }))`)
    * `lib/environment.ts`의 `isClient` 함수가 이 테스트 파일 내에서 항상 `true`를 반환하도록 `vi.spyOn` 또는 `vi.mock`을 사용하여 설정합니다. (예: `vi.spyOn(environmentModule, 'isClient').mockReturnValue(true);`)
    * `getAuthClient` 함수 자체를 모킹하여, 환경 검사를 건너뛰고 미리 정의된 `mockSupabaseClient`를 반환하도록 설정할 수도 있습니다. (예: `vi.spyOn(authModule, 'getAuthClient').mockReturnValue(mockSupabaseClient);`)
    * `signInWithGoogle` 테스트 실패(Failure 4)는 위의 환경 문제가 해결되면 같이 해결될 가능성이 높습니다. 만약 해결되지 않으면, `code_verifier`를 임시 저장하는 방식(예: `sessionStorage`)이 테스트 내에서 올바르게 모킹되고 접근 가능한지 확인합니다.
4.  **[Verification]**
    * `npm test src/lib/auth-integration.test.ts` 를 실행하여 Failure 2, 3, 4 오류가 해결되었는지 확인합니다.

**단계 3: `lib/__tests__/auth-integration.test.ts` 테스트 로직 수정**

1.  **[Goal]** 리팩토링된 코드의 동작 방식에 맞게 `__tests__/auth-integration.test.ts` 파일의 테스트 단언(assertion)과 환경 체크 로직을 수정합니다.
2.  **[File to Modify]** `src/lib/__tests__/auth-integration.test.ts`
3.  **[Instruction]**
    * **로그아웃 테스트 (Failure 5):**
        * `expect(mockStorage.removeItem).toHaveBeenCalled();` 단언을 제거합니다.
        * 대신, `signOut` 함수가 호출된 후 `mockSupabaseAuth.signOut` (Supabase 클라이언트의 로그아웃 메소드 모의 객체)이 호출되었는지 확인하는 단언을 추가합니다.
        * 추가적으로, 로그아웃 후 `supabase.auth.getSession()` 등을 호출했을 때 세션이 `null`이 되는지 확인하는 단언을 넣을 수 있습니다.
    * **서버 환경 테스트 (Failure 6):**
        * `getAuthClient` 함수가 리팩토링 후에도 여전히 존재하는지, 존재한다면 내부의 환경 체크 로직(`if (!isClient()) ...`)이 그대로 있는지 확인합니다.
        * 만약 `getAuthClient`가 없어지고 `createClientComponentClient` 등으로 대체되었다면, 이 테스트 케이스 자체가 유효하지 않을 수 있습니다. 해당 함수가 서버 환경에서 호출될 경우 에러를 던지는 것이 의도된 동작인지 확인하고, 그렇지 않다면 테스트를 제거하거나 수정합니다.
        * 만약 함수와 로직이 그대로인데 에러가 발생하지 않는다면, `beforeEach` 등에서 서버 환경 시뮬레이션 (`vi.spyOn(hybridSupabase, 'isClientEnvironment').mockReturnValue(false);` 등)이 올바르게 적용되었는지 다시 확인합니다.
4.  **[Verification]**
    * `npm test src/lib/__tests__/auth-integration.test.ts` 를 실행하여 Failure 5, 6 오류가 해결되었는지 확인합니다.

**단계 4: 전체 테스트 실행 및 최종 확인**

1.  **[Goal]** 모든 테스트 오류가 해결되었는지 최종 확인하고 코드를 정리합니다.
2.  **[Instruction]**
    * `npm test` 또는 `yarn test`를 실행하여 모든 테스트가 통과하는지 확인합니다.
    * 만약 여전히 실패하는 테스트가 있다면, 해당 오류 메시지를 분석하여 추가적인 디버깅 및 수정을 진행합니다. (필요시 이전 단계들을 다시 검토합니다.)
    * 테스트 환경 설정(`setupTests.ts` 또는 `vitest.config.ts` 등)이 `@supabase/ssr` 라이브러리와 잘 호환되는지 검토할 필요가 있을 수 있습니다.
3.  **[Verification]**
    * 모든 단위 테스트 통과.