알겠습니다. `src/lib` 디렉토리의 파일들이 사용하는 외부 의존성 및 브라우저/Node.js API를 분석하고, 어떤 것들이 공용 모킹(Mocking) 대상으로 적합한지, 그리고 현재 `src/tests/setup.ts`에서 이미 공용으로 모킹되고 있는지 확인해 보겠습니다.

**`src/lib` 에서 공용 모킹 후보 객체/API 선별:**

분석 결과, 여러 `src/lib` 파일 또는 이를 사용하는 컴포넌트들의 테스트에서 공통적으로 모킹이 필요할 수 있는 주요 대상은 다음과 같습니다:

1.  **Browser Storage API:**
    *   `localStorage`: `auth-storage.ts`, `board-utils.ts`, `debug-utils.ts`, `logger.ts`, `supabase-instance.ts` 등에서 사용됩니다.
    *   `sessionStorage`: `auth-storage.ts`, `supabase-instance.ts` 등에서 사용됩니다.
    *   `indexedDB`: `auth-storage.ts`에서 사용됩니다.
2.  **Cookies:**
    *   `document.cookie`: `cookie.ts`를 통해 `auth-storage.ts`, `hybrid-supabase.ts`, `supabase-instance.ts` 등에서 사용됩니다.
3.  **Network API:**
    *   `fetch`: `board-utils.ts`, `logger.ts`, `auth.ts` (API 호출 시), `card-service` 등 다양한 곳에서 API 호출에 사용됩니다.
4.  **Web Crypto API:**
    *   `crypto` (특히 `getRandomValues`, `subtle.digest`): `auth.ts`에서 PKCE 구현에 사용됩니다.
5.  **Core Browser Objects:**
    *   `window`, `document`: 많은 브라우저 API의 기반이며, 환경 감지(`environment.ts`)에도 사용됩니다.
    *   `ResizeObserver`: React Flow 같은 라이브러리에서 내부적으로 사용될 수 있으며, UI 컴포넌트 테스트에도 필요할 수 있습니다.
6.  **Logging Utility:**
    *   `logger.ts`: 프로젝트 전반에서 로깅을 위해 사용됩니다.
7.  **Supabase Clients:**
    *   `@supabase/ssr`, `@supabase/supabase-js`: 인증, 데이터베이스 접근 등 핵심 기능에 광범위하게 사용됩니다 (`auth.ts`, `hybrid-supabase.ts`, `supabase-instance.ts`, `supabase.ts` 등).
8.  **Server-side Specific (API/Server Component Tests):**
    *   `next/headers` (`cookies`): 서버 측 Supabase 클라이언트(`auth-server.ts`, `supabase-server.ts`)에서 사용됩니다.
    *   `@prisma/client`: 데이터베이스 상호작용(`prisma.ts`, `db-check.js`, `db-init.ts` 및 API 라우트)에 사용됩니다.

**현재 `src/tests/setup.ts` 에서 공용으로 모킹 중인 객체 확인:**

제공된 `src/tests/setup.ts` 파일을 기준으로 이미 공용(전역)으로 모킹 설정이 되어 있는 항목들은 다음과 같습니다:

*   **`fetch` API:** ✅ (MSW `server` 설정을 통해 전역적으로 API 요청 가로채기 및 모킹)
*   **`localStorage` / `sessionStorage`:** ✅ (`vi.stubGlobal`을 사용하여 `createMockStorage`로 모킹)
*   **`indexedDB`:** ✅ (`vi.stubGlobal`을 사용하지만, 구현이 불완전하여 개선 필요)
*   **`crypto`:** ✅ (`vi.stubGlobal`을 사용하여 `mockCrypto`로 모킹)
*   **`logger.ts`:** ✅ (`vi.mock('@/lib/logger', ...)`를 통해 모킹)
*   **`ResizeObserver`:** ✅ (`vi.stubGlobal`을 사용하여 `MockResizeObserver`로 모킹)
*   **`next/navigation` (useRouter, useSearchParams 등):** ✅ (`vi.mock('next/navigation', ...)`를 통해 모킹)
*   **`@supabase/supabase-js`:** ✅ (`vi.mock('@supabase/supabase-js', ...)`를 통해 복잡한 모킹 구현됨)
*   **`document.body` 및 기본 DOM 구조:** ✅ (테스트 환경에서 기본적으로 존재하도록 설정)
*   **`DOMStringList`:** ✅ (`vi.stubGlobal`을 통해 모킹)
*   **`@react-native-async-storage/async-storage`:** ✅ (모킹되어 있으나, 웹 프로젝트에서는 불필요해 보임)

**결론 및 추가 고려 사항:**

*   **이미 잘 모킹된 것:** `localStorage`, `sessionStorage`, `fetch`(MSW), `crypto`, `logger`, `next/navigation`, `ResizeObserver` 등은 이미 `setup.ts`에서 공용으로 처리되고 있습니다.
*   **개선 필요한 공용 모킹:**
    *   **`indexedDB`:** 현재 모킹 구현(`mockIndexedDB` 플레이스홀더)을 더 견고하게 만들어야 합니다. 말씀하신 대로 `src/tests/mocks/indexeddb-mock.ts` 같은 공용 파일로 분리하고 `fake-indexeddb` 사용을 고려하는 것이 좋습니다.
*   **주의 필요한 공용 모킹:**
    *   **`@supabase/supabase-js` / `@supabase/ssr`:** 현재 `setup.ts`에 복잡한 모킹이 있지만, 전역 모킹이 모든 테스트 시나리오에 적합하지 않을 수 있습니다. 특히 `hybrid-supabase.ts`처럼 환경에 따라 동작이 다른 경우, 테스트별로 필요한 부분만 모킹하는 것이 더 관리하기 쉬울 수 있습니다. 전역 모킹을 유지한다면, 해당 모킹이 다양한 사용 사례(인증 상태 변경, 세션 교환, 데이터 조회 등)를 정확히 시뮬레이션하는지 지속적인 검증이 필요합니다.
    *   **`cookie.ts` / `document.cookie`:** JSDOM이 기본적인 `document.cookie` 동작을 제공하지만, 복잡한 쿠키 옵션(HttpOnly, SameSite, Secure 등)이나 `cookie.ts` 유틸리티의 특정 동작을 테스트하려면 더 명시적인 공용 모킹이 유용할 수 있습니다. 현재 `setup.ts`에는 명시적인 쿠키 *스토어* 모킹은 보이지 않습니다.
*   **서버 전용 모킹:** `@prisma/client`나 `next/headers`는 서버 환경 테스트(API 라우트, 서버 액션 등)에서 주로 필요하며, 해당 테스트 파일이나 별도의 서버 테스트 설정 파일에서 모킹하는 것이 적합합니다. 모든 테스트에 전역적으로 포함될 필요는 없습니다.
*   **불필요해 보이는 모킹:** `@react-native-async-storage/async-storage` 모킹은 웹 프로젝트와 관련 없어 보이므로 제거를 고려해야 합니다.

요약하면, 대부분의 핵심 브라우저 API와 로거 등은 이미 공용으로 모킹되고 있지만, `indexedDB` 모킹의 완성도를 높이고, Supabase 클라이언트와 쿠키 모킹의 전략을 재검토할 필요가 있습니다.