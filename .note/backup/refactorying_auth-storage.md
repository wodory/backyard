알겠습니다. MSW 사용을 명시적으로 포함하고, 단일 책임 원칙(SRP) 및 테스트 가능성 향상을 더욱 강조하여 `auth-storage.ts` 리팩토링 Tasklist를 재구성해 드리겠습니다.

---

## Cursor Agent 지침: Zustand, MSW 기반 인증 로직 리팩토링 및 테스트 강화

**최상위 목표:**

1.  기존 `auth-storage.ts`를 **단일 책임 원칙(SRP)**에 따라 여러 모듈로 분해합니다.
2.  Zustand를 도입하여 클라이언트 측 인증 상태를 중앙 집중적으로 관리하고, **테스트하기 쉬운 구조**를 만듭니다.
3.  MSW(Mock Service Worker)를 활용하여 **API 호출을 안정적으로 모킹**하고, 네트워크 의존성 없는 단위/통합 테스트를 구현합니다.
4.  리팩토링 후 `lib` 폴더 관련 모듈의 **테스트 커버리지(라인, 브랜치, 함수)를 90% 이상**으로 유지 또는 향상시킵니다.

**핵심 리팩토링 방향:**

*   **상태 관리:** Zustand 스토어 (`store/auth.store.ts`) - 토큰, 사용자 정보, 로딩/에러 상태 등 관리, `persist` 미들웨어로 localStorage 연동.
*   **API 호출:** `fetch` 사용 부분은 MSW로 모킹하여 테스트. (실제 구현은 `auth.ts` 또는 별도 API 서비스 모듈에서 담당)
*   **쿠키 처리:** 서버 세션용 쿠키 로직만 `lib/cookie.ts`에 남김 (클라이언트 상태용 제거).
*   **암호화:** `lib/crypto.utils.ts` 로 분리 (현재 더미 로직 유지).
*   **PKCE 로직:** `lib/pkce.utils.ts` 로 분리 (선택적이지만 권장).
*   **`auth.ts`:** API 호출 로직 + Zustand 스토어 상태 업데이트 로직 담당. 스토리지 직접 접근 제거.

**세부 Tasklist:**

1.  **사전 준비 및 설정:**
    *   **백업:** 작업 시작 전 `auth-storage.ts`, `auth-storage.test.ts`, `auth.ts`, `auth.test.ts`, `__tests__/auth-integration.test.ts` 파일을 백업합니다.
    *   **MSW 설정:**
        *   필요한 MSW 패키지(`msw`)가 설치되어 있는지 확인합니다.
        *   테스트 환경에서 MSW 서버를 설정하고 시작/종료하는 로직을 추가합니다. (예: `src/tests/msw/server.ts`, `src/tests/msw/handlers.ts`, 테스트 설정 파일(`setupTests.ts` 또는 각 테스트 파일 `beforeAll`/`afterAll`)).
2.  **Zustand 스토어 정의 (`store/auth.store.ts` 생성):**
    *   `store/auth.store.ts` 파일을 생성합니다.
    *   인증 상태(State: `accessToken`, `refreshToken`, `userId`, `provider`, `codeVerifier`, `isLoading`, `error` 등)와 상태 변경 함수(Actions: `setTokens`, `setUser`, `setCodeVerifier`, `setLoading`, `setError`, `clearAuth`, `removeCodeVerifier`)를 포함하는 Zustand 스토어를 `create` 함수를 사용하여 정의합니다.
    *   **SRP:** 이 스토어는 오직 클라이언트 측 **인증 '상태' 관리** 책임만 가집니다.
3.  **Zustand Persist 미들웨어 적용:**
    *   `persist` 미들웨어를 사용하여 스토어를 감쌉니다.
    *   `name: 'auth-storage'`, `storage: createJSONStorage(() => localStorage)`로 설정합니다.
    *   `partialize` 옵션을 사용하여 영속화할 상태(`accessToken`, `refreshToken`, `userId`, `provider`)만 선택합니다. (`codeVerifier`, `isLoading`, `error` 등 일시적 상태는 제외합니다.)
4.  **유틸리티 분리:**
    *   **(필수)** 암호화 로직: 기존 `auth-storage.ts`의 `encryptValue`, `decryptValue` 함수를 `lib/crypto.utils.ts` 파일로 이동합니다. (Agent에게: **우선 현재 더미 로직을 그대로 이동**해주세요.)
    *   **(권장)** PKCE 로직: `auth.ts`의 `generateCodeVerifier`, `generateCodeChallenge` 함수를 `lib/pkce.utils.ts` 파일로 이동하고 export 합니다. `auth.ts`에서는 이 유틸리티 함수들을 import하여 사용하도록 수정합니다.
5.  **`auth.ts` 리팩토링:**
    *   `auth.ts` 파일에서 `auth-storage` 함수(`setAuthData`, `getAuthData` 등) 직접 호출 부분을 모두 Zustand 스토어의 액션(`useAuthStore.getState().액션명(...)`) 또는 상태(`useAuthStore.getState().상태명`) 사용으로 변경합니다.
    *   PKCE 로직을 분리했다면, `lib/pkce.utils.ts`에서 import하여 사용하도록 수정합니다.
    *   `fetch`를 사용하는 부분(예: `signUp` 내 `/api/user/register` 호출, `getCurrentUser` 내 `/api/user/:id` 호출, `exchangeCodeForSession` 내 토큰 엔드포인트 호출)은 그대로 유지합니다. (이 부분은 MSW로 테스트합니다.)
    *   **SRP:** `auth.ts`는 이제 Supabase API 호출 조정 및 Zustand 스토어 업데이트 책임에 집중합니다.
6.  **`cookie.ts` 정리:**
    *   `lib/cookie.ts` 파일에서 클라이언트 상태 저장/조회 목적의 함수(`setAuthCookie`, `getAuthCookie`, `deleteAuthCookie`의 클라이언트 상태 관련 사용)를 제거하거나 주석 처리합니다. 서버 측 세션 관리에 필요한 쿠키 로직(있다면)만 남깁니다.
7.  **MSW 핸들러 작성 (`src/tests/msw/handlers.ts`):**
    *   `auth.ts`에서 사용하는 `fetch` API 엔드포인트들에 대한 MSW 요청 핸들러를 작성합니다.
        *   `/api/user/register` (POST)
        *   `/api/user/:id` (GET)
        *   `OAUTH_CONFIG.tokenEndpoint` (POST) - `exchangeCodeForSession`용
    *   각 핸들러는 **성공 응답(2xx)**과 **실패 응답(4xx, 5xx)** 시나리오를 모두 모킹할 수 있도록 준비합니다.
8.  **단위 테스트 작성 및 업데이트:**
    *   **`store/auth.store.test.ts` 생성:**
        *   새로 만든 Zustand 스토어의 초기 상태, 액션 호출에 따른 상태 변경, 셀렉터 동작을 테스트합니다.
        *   `persist` 미들웨어 동작(모킹된 `localStorage` 사용)을 검증합니다.
    *   **`lib/pkce.utils.test.ts` 생성 (PKCE 분리 시):**
        *   `generateCodeVerifier`, `generateCodeChallenge` 함수의 단위 테스트를 작성합니다. (기존 `auth.test.ts` 내용 이전 및 보강)
    *   **`lib/crypto.utils.test.ts` 생성/업데이트:**
        *   `encryptValue`, `decryptValue` 함수의 단위 테스트를 작성/업데이트합니다. (기존 `auth-storage.test.ts` 내용 이전 및 보강)
    *   **`auth.test.ts` 업데이트:**
        *   `auth-storage` 모킹 대신, Zustand 스토어의 상태를 초기화하거나(`useAuthStore.setState(...)`) 액션을 모킹/스파이(`vi.spyOn(useAuthStore.getState(), '액션명')`)하는 방식으로 변경합니다.
        *   `fetch` 호출이 포함된 함수(`signUp`, `getCurrentUser`, `exchangeCodeForSession`) 테스트 시, **MSW 핸들러를 사용하여 API 응답을 제어**합니다. 성공 및 실패 시나리오 모두 테스트합니다.
        *   **"종합적인 코드 경로 및 예외 처리 테스트 규칙"**을 적용하여 모든 분기 및 에러 경로(`expect(...).rejects.toThrow()` 사용)를 테스트합니다.
9.  **통합 테스트 업데이트 (`__tests__/auth-integration.test.ts`):**
    *   `auth-storage` 관련 로직을 Zustand 스토어 상태 검증 및 액션 호출 검증으로 변경합니다.
    *   API 호출이 포함된 시나리오(예: PKCE 전체 흐름, 로그인 후 사용자 정보 로드) 테스트 시, **MSW 핸들러를 사용하여 API 응답을 제어**합니다.
10. **최종 정리 및 검증:**
    *   리팩토링 및 테스트 업데이트 완료 후, 백업했던 원본 `auth-storage.ts`와 `auth-storage.test.ts` 파일을 프로젝트에서 **삭제**합니다.
    *   `vitest run` 명령으로 모든 테스트가 통과하는지 확인합니다.
    *   `vitest run --coverage` 명령으로 커버리지 리포트를 생성하여 관련 파일들의 **라인, 브랜치, 함수 커버리지가 모두 90% 이상**인지 확인합니다. 미달 시 추가 테스트 케이스를 작성합니다.
    *   애플리케이션을 실행하여 인증 관련 기능(로그인, 로그아웃, OAuth 등)이 정상 동작하는지 수동으로 검증합니다.

---

**Agent에게 전달할 최종 요약 지시:**

"Agent, `lib/auth-storage.ts` 파일을 리팩토링하고 테스트를 강화해줘. **단일 책임 원칙**과 **테스트 용이성 향상**이 중요 목표야.

1.  `store/auth.store.ts` 파일을 만들고 **Zustand 스토어**로 인증 상태(토큰, 유저 ID 등)를 관리하도록 해줘. **`persist` 미들웨어**를 사용해서 `localStorage`에 영속화해줘 (일시적인 `codeVerifier` 등은 제외).
2.  기존 `auth-storage.ts`의 **암호화 로직**은 `lib/crypto.utils.ts`로, **PKCE 로직**(`generate...` 함수들)은 `lib/pkce.utils.ts`로 분리해줘.
3.  `auth.ts` 파일에서 `auth-storage` 직접 호출 부분을 **Zustand 스토어 사용으로 변경**해줘. 분리된 유틸리티 함수를 import해서 사용하도록 수정해줘.
4.  `lib/cookie.ts` 파일은 **서버 세션용 쿠키 로직만 남기고 정리**해줘.
5.  `auth.ts` 등에서 사용하는 `fetch` API 호출(`signUp`, `getCurrentUser`, `exchangeCodeForSession`)을 모킹하기 위해 **MSW 핸들러**를 설정하고 테스트에서 사용해줘. 성공/실패 응답 시나리오 모두 포함해줘.
6.  **새로운 단위 테스트**를 작성해줘 (`store/auth.store.test.ts`, `lib/pkce.utils.test.ts`, `lib/crypto.utils.test.ts`).
7.  **기존 단위/통합 테스트**(`auth.test.ts`, `__tests__/auth-integration.test.ts`)를 **Zustand 스토어와 MSW를 사용**하도록 업데이트해줘. **"종합적인 코드 경로 및 예외 처리 테스트 규칙"**에 따라 모든 분기와 에러 throw 경로를 명시적으로 테스트해야 해. (브랜치 커버리지 90% 이상 목표)
8.  리팩토링 완료 후 `auth-storage.ts`와 `auth-storage.test.ts` 파일을 **삭제**해줘.
9.  모든 테스트 통과 및 **커버리지 90% 이상**을 확인해줘."