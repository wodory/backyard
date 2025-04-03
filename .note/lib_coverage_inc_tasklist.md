
## Cursor Agent 지침: `lib` 폴더 테스트 커버리지 90% 달성 (종합 경로 및 예외 처리 강화)

**최상위 목표:** `lib` 폴더 내 모든 `.ts` 파일 (테스트 파일 제외)에 대해 **라인, 브랜치, 함수 커버리지 모두 90% 이상**을 달성하도록 단위 테스트 및 통합 테스트 코드를 추가합니다.

**주요 개선 목표:** 현재 Agent가 `if (error) { throw error; }`와 같이 단순해 보이는 에러 전파 로직 테스트를 누락하는 경향이 있습니다. 이 규칙은 **모든 코드 경로, 특히 모든 에러 처리 및 예외 발생 경로가 명시적으로 테스트되도록** 보장하는 데 중점을 둡니다.

**핵심 테스트 원칙:**

1.  **테스트 프레임워크:** Vitest (`vi`, `describe`, `it`, `expect`, `beforeEach`, `afterEach` 등)를 사용합니다.
2.  **철저한 모킹 (성공 및 실패):**
    *   모든 외부 의존성(Supabase Client 메서드, Prisma Client, `fetch`, `localStorage`, `sessionStorage`, `document.cookie`, `crypto`, `window` 객체 및 속성, `Date`, `process.env`, `logger` 등)은 `vi.mock`, `vi.spyOn`, `vi.fn`, `vi.stubGlobal` 등을 사용하여 **반드시 모킹**합니다.
    *   모킹 시 성공 케이스뿐만 아니라, **다양한 실패/오류 시나리오** (예: API 호출 실패 시 `{ data: null, error: new Error(...) }` 반환, `fetch` 실패 시 `{ ok: false, ... }` 반환, 스토리지 접근 실패, 함수 내부에서 예외 발생 등)를 **적극적으로 시뮬레이션**하여 에러 처리 로직을 테스트해야 합니다.
3.  **모든 코드 경로 커버:**
    *   `if/else`, `try/catch`, `switch`, 삼항 연산자 등 모든 조건 분기문의 **각 브랜치가 최소 한 번 이상 실행**되도록 테스트 케이스를 작성합니다. **브랜치 커버리지 90% 이상 달성**이 매우 중요합니다.
    *   엣지 케이스(null, undefined, 빈 배열/문자열, 잘못된 형식의 입력 등)를 고려하여 테스트합니다.
4.  **명시적 에러 발생 검증:**
    *   함수 내에서 에러를 `throw` 하도록 설계된 모든 경로(예: `if (error) throw error;`, `catch (e) { throw e; }`)에 대해,
    *   해당 에러 조건을 발생시키는 테스트 케이스를 **반드시** 작성하고,
    *   `expect(...).rejects.toThrow(...)` (비동기 함수) 또는 `try/catch`와 `expect` (동기 함수) 구문을 사용하여 **에러가 실제로 던져지는지 명시적으로 검증**해야 합니다.
    *   가능하다면 던져진 에러 객체 자체(`toBe`, `toBeInstanceOf`, `toHaveProperty`)를 검증하여 정확성을 높입니다. **단순해 보이는 에러 전파 로직도 예외 없이 테스트해야 합니다.**
5.  **반환 값 및 부수 효과 검증:**
    *   함수의 모든 가능한 실행 경로에 대한 **반환 값을 검증**합니다.
    *   함수 실행으로 인해 발생하는 **부수 효과** (예: `setAuthData` 호출, `logger` 호출, `localStorage.setItem` 호출, `window.location.href` 할당 시도 등)를 `expect(...).toHaveBeenCalled()`, `expect(...).toHaveBeenCalledWith(...)` 등을 사용하여 검증합니다.
6.  **환경 분기 테스트:**
    *   `isClient()`, `isClientEnvironment()` 등 환경에 따라 로직이 분기되는 경우, `vi.mock` 또는 `vi.spyOn`으로 해당 함수를 모킹하여 **클라이언트 환경과 서버 환경 각각을 시뮬레이션**하는 별도의 테스트 케이스를 작성하고, 각 환경별 로직이 올바르게 실행되는지 검증합니다.
7.  **단위 테스트 vs 통합 테스트:**
    *   **단위 테스트 (`파일명.test.ts`):** 개별 파일/모듈의 내부 로직과 분기 처리에 집중합니다. 외부 의존성은 철저히 모킹합니다.
    *   **통합 테스트 (`__tests__/파일명.test.ts`):** 여러 모듈 간의 상호작용 및 데이터 흐름을 검증합니다. 최외곽 의존성(실제 API 호출 지점, DB 접근 지점 등)은 모킹하되, 테스트 대상 모듈 간의 호출은 실제 함수를 사용하도록 설정할 수 있습니다.

**세부 Tasklist:**

1.  **`auth.ts` (`auth.test.ts` 분석 및 개선):**
    *   `auth.test.ts`를 검토하고, 위 **핵심 테스트 원칙**에 따라 `auth.ts`의 모든 함수(`generateCodeVerifier` ~ `validateSession`)에 대한 테스트를 보강합니다.
    *   **특히 다음 사항을 중점적으로 확인 및 추가:**
        *   모든 `if (error) throw error;` 및 `try...catch...throw` 구문에 대한 명시적 에러 throw 검증 테스트 (`expect(...).rejects.toThrow(...)`).
        *   `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `getCurrentUser`, `exchangeCodeForSession` 함수 내부의 `fetch`, Supabase API 호출, `auth-storage` 함수 호출에 대한 **실패 시나리오 모킹** 및 해당 경로 테스트. (예: `response.ok`가 false일 때, API가 error 객체를 반환할 때, `setAuthData`가 false를 반환할 때 등)
        *   `signInWithGoogle`, `googleLogin`, `exchangeCodeForSession` 등 브라우저 환경 의존 함수에 대한 **환경 분기 테스트** (`isClientEnvironment` 모킹).
        *   `googleLogin` 내부의 `window.location.href` 할당 로직 테스트 (모킹된 `window.location` 객체 확인).
        *   `getCurrentUser` 내부 `fetch` 호출의 성공, 실패(`ok: false`), 네트워크 에러(`Promise.reject`) 시나리오별 반환 값 검증.
        *   `validateSession`에서 `accessToken` 또는 `expiryTime`이 없는 경우, `parseInt` 실패 가능한 경우 등 엣지 케이스 테스트.

2.  **`auth-storage.ts` (`auth-storage.test.ts` 분석 및 개선):**
    *   `auth-storage.test.ts`를 검토하고, **핵심 테스트 원칙**에 따라 모든 함수 및 내부 로직 테스트를 보강합니다.
    *   **특히 다음 사항을 중점적으로 확인 및 추가:**
        *   `setAuthData`, `getAuthData`, `removeAuthData`: 모든 스토리지(localStorage, sessionStorage, cookie, 전역 변수, IndexedDB 등) 접근 시 **개별/전체 실패 시나리오** 테스트 및 에러 처리(로깅, fallback) 검증.
        *   `encryptValue`/`decryptValue`: `process.env.NODE_ENV` 분기, `window.location`, `navigator.userAgent` 사용 로직, `btoa`/`atob` 실패 시 예외 처리 및 로깅 검증.
        *   `syncValueToAllStorages`: 각 스토리지 동기화 실패 시 로깅 및 계속 진행 여부 검증.
        *   IndexedDB 관련 함수: 모든 비동기 작업(open, transaction, put/get/delete)의 성공/실패(`onsuccess`/`onerror`/`onupgradeneeded`) 경로 테스트 및 콜백 검증.

3.  **`hybrid-supabase.ts` (`hybrid-supabase.test.ts` 분석 및 개선):**
    *   `hybrid-supabase.test.ts`를 검토하고, **핵심 테스트 원칙**에 따라 모든 함수 및 환경 감지 로직 테스트를 보강합니다.
    *   **특히 다음 사항을 중점적으로 확인 및 추가:**
        *   `detectEnvironment`: 브라우저/Node.js/Unknown 환경 감지 로직 검증.
        *   `createServerSupabaseClient`, `createClientSupabaseClient`: 환경 변수 누락 시 **에러 throw 및 로깅** 검증. 각 클라이언트 생성 함수(`createClient`, `createBrowserClient`) 호출 시 전달되는 **옵션** 상세 검증. `createClientSupabaseClient`의 싱글톤 동작 및 쿠키 핸들러 로직 검증.
        *   `getHybridSupabaseClient`: 환경 감지 결과에 따른 분기 및 올바른 클라이언트 생성 함수 호출 검증. **클라이언트 생성 실패 시 에러 전파** 검증.

4.  **`auth-server.ts` (테스트 파일 `auth-server.test.ts` 생성):**
    *   `auth-server.test.ts` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성.
    *   **특히 다음 사항을 중점적으로 확인 및 추가:**
        *   `getSupabaseServer`: `cookies()` 및 `createServerClient` 호출 검증. 쿠키 핸들러 내부 로직 및 **`try...catch` 에러 처리(로깅)** 검증.
        *   `auth`, `getCurrentUser`: `getSupabaseServer` 호출 및 반환된 클라이언트의 `auth.getSession`/`auth.getUser` 호출 검증. **API 호출 실패 시 null 반환 및 에러 로깅** 검증.

5.  **`base64.ts` (`base64.test.ts` 분석 및 개선):**
    *   `base64.test.ts` 검토 및 **핵심 테스트 원칙**에 따라 보강.
    *   **특히 다음 사항을 중점적으로 확인 및 추가:**
        *   브라우저/Node.js **환경 분기** 테스트 강화.
        *   URL-safe 인코딩/디코딩의 `replace` 및 패딩 처리 로직 상세 검증.
        *   `stringToArrayBuffer`의 `TextEncoder` 유무 분기 테스트.

6.  **`cookie.ts` (`cookie.test.ts` 분석 및 개선):**
    *   `cookie.test.ts` 검토 및 **핵심 테스트 원칙**에 따라 보강.
    *   **특히 다음 사항을 중점적으로 확인 및 추가:**
        *   `document` undefined 시 **조기 반환 및 로깅** 검증.
        *   `setCookie` 옵션 조합 및 `sameSite='none'` 시 `secure` 강제 설정 검증.
        *   `getCookie` 파싱 로직 엣지 케이스 검증.
        *   `deleteCookie`가 `setCookie`를 올바른 인자(days: -1)로 호출하는지 검증.

7.  **`crypto.ts` (`crypto.test.ts` 분석 및 개선):**
    *   `crypto.test.ts` 검토. 현재 더미 로직이므로 함수 호출 및 반환 값 포맷 검증 유지. (실제 로직 구현 시 상세 테스트 필요)

8.  **`db-check.js` (테스트 파일 `db-check.test.js` 생성):**
    *   `db-check.test.js` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성.
    *   `prisma.$queryRaw` **실패 시 `catch` 블록 실행, 반환 값, `console.error` 호출** 검증.

9.  **`db-init.ts` (테스트 파일 `db-init.test.ts` 생성):**
    *   `db-init.test.ts` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성 (DB 호출은 모킹).
    *   모든 함수의 **`try...catch` 블록 및 에러 로깅** 검증. RPC/SQL 호출 실패 시나리오 테스트. `prisma.user.findFirst` 결과에 따른 분기(사용자 생성/미생성) 테스트.

10. **`debug-utils.ts` (테스트 파일 `debug-utils.test.ts` 생성):**
    *   `debug-utils.test.ts` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성.
    *   모든 함수의 **`try...catch` 에러 처리 및 로깅** 검증. `localStorage` 접근 실패 시나리오 테스트.

11. **`environment.ts` (테스트 파일 `environment.test.ts` 생성):**
    *   `environment.test.ts` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성.
    *   모든 함수의 환경 분기(`window` 객체 유무) 테스트 강화.

12. **`layout-utils.ts` (`layout-utils.test.ts` 분석 및 개선):**
    *   `layout-utils.test.ts` 검토 및 **핵심 테스트 원칙**에 따라 보강.
    *   `getLayoutedElements`: `nodes.length === 0` 분기 테스트. 수평/수직 방향 분기에 따른 `targetPosition`, `sourcePosition`, `sourceHandle`, `targetHandle` 설정 검증. `dagre` 라이브러리 모킹 정교화.
    *   `getGridLayout`: `nodes.length === 0` 분기 테스트. `cardsPerRow` 기본값 사용 검증. 위치 계산 로직 검증.

13. **`logger.ts` (테스트 파일 `logger.test.ts` 생성):**
    *   `logger.test.ts` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성.
    *   `LogStorage`의 싱글톤, 생성자 로직(localStorage 복원/저장), `addLog` (최대 개수 제한, localStorage 저장 실패), `clearLogs` 테스트.
    *   `logger`: 레벨별 `console` 호출, `LogStorage.addLog` 호출, `sendLogToServer` 호출 조건(브라우저, WARN/ERROR 레벨) 검증.
    *   `sendLogToServer`: `fetch` 호출 인자 및 성공/실패 시 동작 검증 (실패 시 무시).

14. **`prisma.ts` (테스트 파일 `prisma.test.ts` 생성):**
    *   `prisma.test.ts` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성.
    *   `validateEnv` 로직 및 로깅 검증.
    *   Prisma 클라이언트 초기화 로직의 모든 분기(**`globalForPrisma.prisma` 존재 여부**, **`NODE_ENV` 값**, **`validateEnv` 결과**, **초기화 중 에러 발생**) 테스트 및 로깅/반환 값 검증. 더미 Proxy 클라이언트 동작 검증.

15. **`supabase-browser.ts` (테스트 파일 `supabase-browser.test.ts` 생성):**
    *   `supabase-browser.test.ts` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성.
    *   `getSupabaseInstance` 호출 및 성공/실패 시 동작 검증.

16. **`supabase-instance.ts` (테스트 파일 `supabase-instance.test.ts` 생성):**
    *   `supabase-instance.ts` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성.
    *   `console.warn` 오버라이드 로직 및 에러 처리 검증.
    *   전역 인스턴스 초기화 로직의 모든 분기(인스턴스 존재 여부, 환경 변수 누락, `createBrowserClient` 실패) 테스트 및 에러 처리/로깅 검증.
    *   스토리지 헬퍼 함수(`__SUPABASE_AUTH_...`) 내부 로직 및 에러 처리 상세 검증.
    *   `getSupabaseInstance`의 브라우저 환경 체크 및 인스턴스 미존재 시 에러 발생 검증.

17. **`supabase-server.ts` (테스트 파일 `supabase-server.test.ts` 생성):**
    *   `supabase-server.test.ts` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성.
    *   `createServerSupabaseClient`: 쿠키 핸들러 로직(`get`) 및 `createServerClient` 호출 검증.
    *   `getServerSession`: `createServerSupabaseClient` 및 `auth.getSession` 호출 검증. **API 호출 실패 시 null 반환 및 에러 로깅** 검증.

18. **`supabase.ts` (테스트 파일 `supabase.test.ts` 생성):**
    *   `supabase.test.ts` 생성 및 **핵심 테스트 원칙**에 따라 테스트 작성.
    *   `createSupabaseClient`: 환경 분기, 인스턴스 재사용, 환경 변수 누락, 클라이언트 생성 실패 시 **로깅 및 더미 클라이언트 반환** 검증.
    *   `createBrowserClient`: 환경 분기, `getSupabaseInstance` 호출 및 실패 시 **로깅 및 더미 클라이언트 반환** 검증.
    *   `createSafeClient`: 환경 분기 및 에러 발생 시 **더미 클라이언트 반환** 검증.

19. **`utils.ts` (`utils.test.ts` 분석 및 개선):**
    *   `utils.test.ts` 검토 및 **핵심 테스트 원칙**에 따라 보강.
    *   `formatDate`: 잘못된 입력 및 내부 에러 발생 시 **`catch` 블록 실행 및 원본 값 반환** 검증.
    *   `hexToHsl`: 잘못된 입력 시 `null` 반환 검증.
    *   `hslToHex`: 입력 값 범위 검증 (필요시).

20. **`board-ui-config.ts` (`board-ui-config.test.ts` 분석 및 개선):**
    *   `board-ui-config.test.ts` 검토 및 **핵심 테스트 원칙**에 따라 보강.
    *   `loadDefaultBoardUIConfig`: 설정 로드 중 **에러 발생 시 `catch` 블록 실행, `console.error` 호출, 하드코딩된 fallback 반환** 검증.

21. **`board-utils.ts` (`board-utils.test.ts` 분석 및 개선):**
    *   `board-utils.test.ts` 검토 및 **핵심 테스트 원칙**에 따라 보강.
    *   모든 함수의 **`try...catch` 블록 및 `console.error` 로깅** 검증. `localStorage` 또는 `fetch` 실패 시나리오 테스트. `JSON.parse`/`stringify` 실패 시나리오 테스트.

22. **통합 테스트 (`__tests__/auth-integration.test.ts` 분석 및 확장):**
    *   기존 통합 테스트 검토 및 **핵심 테스트 원칙**에 따라 시나리오 확장.
    *   PKCE 흐름, 로그인/로그아웃/재로그인, 세션 만료/갱신 등 주요 사용자 시나리오 테스트. 각 단계에서의 **성공 및 실패 케이스** 포함. 모듈 간 상호작용 및 상태 변경(스토리지) 검증.

**최종 검토:**

*   모든 Task 완료 후, **Vitest 커버리지 리포트 (`npx vitest run --coverage`)를 생성**하여 라인, **브랜치**, 함수 커버리지가 모두 90% 이상 달성되었는지 확인합니다.
*   미달성 부분이 있다면, **커버리지 리포트의 Uncovered Lines/Branches를 분석**하여 해당 부분을 커버하는 테스트 케이스를 추가로 지시합니다.