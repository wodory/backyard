**목표:** 스토리지 API 모의 객체를 개선하고 집중적인 단위 테스트를 생성하여 `src/lib/auth-storage.ts`의 테스트 커버리지와 신뢰성을 향상시킵니다.

**작업 목록:**

1.  **IndexedDB 모킹 개선:**
    *   **작업:** `src/tests/setup.ts` (또는 정의된 곳) 내의 현재 `indexedDB` 모의 구현을 검토합니다.
    *   **목표:** `indexedDB`에 대해 더 견고하고 신뢰성 있는 모의 객체를 구현합니다. `fake-indexeddb` 라이브러리 (`npm install --save-dev fake-indexeddb`) 사용을 고려하거나, 비동기적이고 트랜잭션적인 특성(open, transaction, objectStore, put, get, delete, onsuccess, onerror)을 정확하게 시뮬레이션하는 커스텀 모의 객체를 생성합니다.
    *   **참조:** `src/lib/auth-storage.ts` (라인 40-44, 121, 211-236), `src/tests/setup.ts`.

2.  **다른 스토리지 모의 객체 검증:**
    *   **작업:** `src/tests/setup.ts`에 있는 `localStorage`, `sessionStorage`, `cookie` 모의 객체(`vi.stubGlobal` 사용)가 올바르게 그리고 독립적으로 작동하는지 확인합니다.
    *   **목표:** `localStorage` 및 `sessionStorage`에 대해 `getItem`, `setItem`, `removeItem`, `clear`가 예상대로 작동하는지 확인합니다. 쿠키 상호작용(모킹된 `cookie.ts` 또는 해당되는 경우 직접적인 `document.cookie` 조작을 통해)이 캡처되는지 검증합니다.

3.  **전용 `auth-storage.test.ts` 생성:**
    *   **작업:** 새 테스트 파일 `src/lib/auth-storage.test.ts`를 생성합니다.
    *   **목표:** 컴포넌트 수준 테스트에서 `auth-storage.ts` 함수의 테스트를 분리합니다. `setAuthData`, `getAuthData`, `removeAuthData`, `getAuthDataAsync`, `clearAllAuthData`, `STORAGE_KEYS`와 같은 함수를 가져옵니다.

4.  **`setAuthData` 단위 테스트 구현:**
    *   **작업:** `auth-storage.test.ts`에서 `setAuthData`에 대한 단위 테스트를 작성합니다.
    *   **시나리오:**
        *   `localStorage`, `sessionStorage`, `cookie`, `indexedDB` 각각에 성공적으로 저장되는지 테스트합니다(모의 호출 확인).
        *   특정 키(토큰, code_verifier)에 대해 `encryptValue`가 호출되는지 테스트합니다.
        *   `null` 또는 `undefined`를 저장하면 `removeAuthData`가 호출되는지 테스트합니다.
        *   스토리지 오류 처리(예: `localStorage.setItem`이 오류를 발생시키도록 모킹하고 폴백/로깅 검증)를 테스트합니다.
    *   **목표:** 데이터가 올바르게 처리되고 모든 관련 위치에 저장을 시도하는지 검증합니다.

5.  **`getAuthData` 단위 테스트 구현:**
    *   **작업:** `auth-storage.test.ts`에서 `getAuthData`에 대한 단위 테스트를 작성합니다.
    *   **시나리오:**
        *   검색 우선순위(예: 데이터가 `localStorage`에만 있음, `cookie`에만 있음, `sessionStorage`에만 있음 등)를 테스트합니다.
        *   데이터가 여러 위치에 있을 때 검색(가장 높은 우선순위 반환해야 함)을 테스트합니다.
        *   데이터가 어디에도 없을 때 검색( `null` 반환해야 함)을 테스트합니다.
        *   특정 키에 대해 `decryptValue`가 호출되는지 테스트합니다.
        *   검색 중 스토리지 오류 처리를 테스트합니다.
    *   **목표:** 올바른 검색 순서와 폴백 로직을 검증합니다.

6.  **`getAuthDataAsync` 단위 테스트 구현:**
    *   **작업:** `getAuthDataAsync` (IndexedDB 대상)에 대한 단위 테스트를 구체적으로 작성합니다.
    *   **시나리오:**
        *   모킹된 `indexedDB`에서 성공적으로 검색되는지 테스트합니다.
        *   `indexedDB`에서 데이터가 발견되지 않을 때 검색을 테스트합니다.
        *   `indexedDB` 오류 처리(예: `get` 요청이 `onerror`를 트리거하도록 모킹)를 테스트합니다.
    *   **목표:** IndexedDB에서의 비동기 검색이 모의 객체와 함께 올바르게 작동하는지 검증합니다. 테스트에서 `async/await` 및 잠재적으로 `waitFor`를 사용합니다.

7.  **`removeAuthData` 및 `clearAllAuthData` 단위 테스트 구현:**
    *   **작업:** `removeAuthData` 및 `clearAllAuthData`에 대한 단위 테스트를 작성합니다.
    *   **시나리오:**
        *   모든 모킹된 스토리지 위치(`localStorage`, `sessionStorage`, `cookie`, `indexedDB`)에서 데이터가 제거되는지 검증합니다.
        *   `clearAllAuthData`가 `STORAGE_KEYS`에 정의된 모든 키를 제거하는지 테스트합니다.
    *   **목표:** 데이터 제거 함수가 모든 스토리지 유형에서 데이터를 올바르게 지우는지 확인합니다.

8.  **`src/tests/setup.ts` 검토 및 정리:**
    *   **작업:** `src/tests/setup.ts`를 검사합니다.
    *   **목표:** 실제로 사용되지 않는 경우 `@react-native-async-storage/async-storage` 모의 객체를 제거합니다. 직접적인 스토리지 테스트와 충돌하는 경우 Supabase 모의 객체를 단순화합니다(컴포넌트에 대해 더 높은 수준에서 Supabase 상호작용을 모킹하는 것이 더 나을 수 있음). 충돌하는 전역 모의 객체가 없는지 확인합니다.

9.  **`AuthContext.test.tsx` 업데이트:**
    *   **작업:** `src/contexts/AuthContext.test.tsx`를 검토합니다.
    *   **목표:** 개선된 스토리지 모의 객체를 효과적으로 사용하고, 컨텍스트 자체의 로직에 초점을 맞춰 테스트가 통과하는지 확인합니다(`auth-storage`의 복잡성은 이제 단위 테스트에서 다루어짐).

10. **커버리지 실행:**
    *   **작업:** `npm run test -- --coverage` (또는 프로젝트의 해당 명령어)를 실행합니다.
    *   **목표:** `auth-storage.ts`에서 테스트되지 않은 분기나 라인을 식별하고 이를 커버하는 테스트를 추가합니다.