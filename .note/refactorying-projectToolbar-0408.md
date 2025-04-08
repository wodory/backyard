```markdown
[MODE: PLAN]

## Tasklist: `src/components/layout/ProjectToolbar.tsx` 리팩토링 (Zustand 액션 기반)

**목표:** `ProjectToolbar.tsx` 컴포넌트의 로직(레이아웃 저장, 설정 업데이트, 로그아웃 등)을 Zustand 액션으로 이전하고, 컴포넌트는 상태 표시에 필요한 상태 구독 및 액션 호출만 담당하도록 리팩토링합니다. 모든 변경 사항은 단위 테스트로 검증합니다.

**Phase 1: Zustand 스토어 액션 정의 및 구현 (`useAppStore.ts` 또는 관련 스토어)**

*   **테스크 1.1: `saveBoardLayout` 액션 확인/개선**
    *   **파일:** `src/store/useAppStore.ts` (또는 `useBoardStore.ts` - 역할 분담에 따라)
    *   **작업:** 이전 단계(`MainToolbar` 리팩토링)에서 정의/구현된 `saveBoardLayout` 액션이 `ProjectToolbar`의 요구사항(노드/엣지 가져와서 저장 로직 호출)을 만족하는지 확인합니다. 필요시, 저장 로직(향후 API 호출 포함)을 포함하도록 개선합니다. `localStorage` 직접 접근은 액션 내부에 캡슐화되거나 제거되어야 합니다.
    *   **규칙:** `[zustand-action-msw]`

*   **테스크 1.2: `updateBoardSettings` 액션 확인/개선**
    *   **파일:** `src/store/useAppStore.ts` (또는 `useBoardStore.ts`)
    *   **작업:**
        1.  기존 `updateBoardSettings` 액션 시그니처가 `Partial<BoardSettings>`를 받는지 확인합니다.
        2.  액션 구현 내부를 확인/개선합니다:
            *   `async` 함수여야 합니다 (API 호출 고려).
            *   `set({ isLoading: true, error: null })`으로 로딩/에러 상태를 관리해야 합니다.
            *   `try...catch` 블록 사용:
                *   `try`: 스토어 상태 업데이트 (필요시 낙관적 업데이트), `fetch('/api/board-settings', ...)` 호출 (POST 또는 PUT), 성공 시 `isLoading: false` 및 `toast.success` 호출.
                *   `catch`: 에러 로깅, `set({ isLoading: false, error: err.message })`, `toast.error` 호출.
            *   **중요:** 서버와 동기화가 필요한 설정이므로, 액션 내에서 **반드시** API 호출 로직을 포함해야 합니다. (`[zustand-action-msw]` 규칙)
    *   **규칙:** `[zustand-action-msw]`, `[explicit-error-throw-testing]`

*   **테스크 1.3: `logoutAction` 정의 및 구현 (신규 또는 개선)**
    *   **파일:** `src/store/useAppStore.ts`
    *   **작업:**
        1.  로그아웃 관련 로직을 처리할 `logoutAction` 시그니처를 정의합니다 (`() => Promise<void>`).
        2.  액션 구현:
            *   `async` 함수로 정의합니다.
            *   `set({ isLoading: true, error: null });` 호출.
            *   `try...catch` 사용:
                *   `try`: `signOut()` 함수 (from `@/lib/auth` 또는 `@/contexts/AuthContext`) 호출, 성공 시 필요한 애플리케이션 상태 초기화(예: `clearSelectedCards()`, `resetBoardState()` 등), `toast.success`, 리디렉션 트리거 (예: 상태 플래그 설정 또는 이벤트 발생).
                *   `catch`: 에러 로깅, `set({ isLoading: false, error: err.message })`, `toast.error`.
    *   **규칙:** `[zustand-action-msw]`

**Phase 2: Zustand 액션 단위 테스트 (`useAppStore.test.ts` 또는 관련 스토어 테스트 파일)**

*   **테스크 2.1: `saveBoardLayout` 액션 테스트 확인/개선**
    *   **파일:** `src/store/useAppStore.test.ts` (또는 `useBoardStore.test.ts`)
    *   **작업:** 이전 단계 테스트가 `ProjectToolbar`에서 필요한 시나리오(단순 저장 호출)를 커버하는지 확인합니다. 저장 로직(API 호출 등)이 액션 내부에 있다면, MSW 핸들러를 사용하여 API 성공/실패 케이스를 테스트해야 합니다. `localStorage` 직접 접근 대신 내부 저장 메커니즘(모킹된 함수 등) 호출을 검증합니다.
    *   **규칙:** `[package]`, `[zustand-action-msw]`, `[vitest-mocking]`, `[async-test]`, `[explicit-error-throw-testing]`

*   **테스크 2.2: `updateBoardSettings` 액션 단위 테스트 작성/개선**
    *   **파일:** `src/store/useAppStore.test.ts` (또는 `useBoardStore.test.ts`)
    *   **작업:**
        1.  `updateBoardSettings` 액션을 테스트하는 `describe` 블록을 추가합니다.
        2.  `beforeEach`에서 스토어 초기 상태 설정 및 모킹 초기화.
        3.  **MSW 핸들러 설정:** `server.use(http.post('/api/board-settings', ...))` 또는 `http.put(...)` 등을 사용하여 API 성공/실패 응답을 모킹합니다.
        4.  **성공 케이스:**
            *   `act(async () => { ... })` 내에서 `updateBoardSettings({ snapToGrid: true })` 와 같이 액션을 호출합니다.
            *   `await`으로 완료를 기다립니다.
            *   `expect(fetch).toHaveBeenCalledWith(...)` 또는 MSW 요청 검증.
            *   `expect(useAppStore.getState().boardSettings.snapToGrid).toBe(true)` 등 상태 변경 확인.
            *   `isLoading`, `error` 상태 확인.
            *   `expect(toast.success)` 호출 확인.
        5.  **실패 케이스:**
            *   MSW가 에러(4xx, 5xx)를 반환하도록 설정합니다.
            *   액션 호출 후, 스토어 상태가 롤백되었거나 변경되지 않았는지 확인합니다.
            *   `error` 상태가 설정되었는지 확인합니다.
            *   `expect(toast.error)` 호출 확인.
    *   **규칙:** `[package]`, `[zustand-action-msw]`, `[vitest-mocking]`, `[async-test]`, `[explicit-error-throw-testing]`

*   **테스크 2.3: `logoutAction` 단위 테스트 작성**
    *   **파일:** `src/store/useAppStore.test.ts`
    *   **작업:**
        1.  `logoutAction`을 테스트하는 `describe` 블록을 추가합니다.
        2.  `beforeEach` 설정.
        3.  **의존성 모킹:** `signOut` 함수를 모킹합니다 (`vi.mock('@/lib/auth', ...)` 등). 성공/실패 케이스를 준비합니다.
        4.  **성공 케이스:**
            *   `signOut`이 성공하도록 모킹합니다.
            *   `act(async () => { ... })` 내에서 액션을 호출합니다.
            *   `expect(signOut).toHaveBeenCalled()` 확인.
            *   로그아웃 후 초기화되어야 할 스토어 상태(예: `selectedCardIds`가 비어 있음)를 검증합니다.
            *   `expect(toast.success)` 호출 확인.
        5.  **실패 케이스:**
            *   `signOut`이 실패(reject 또는 throw)하도록 모킹합니다.
            *   액션 호출 후, `error` 상태가 설정되었는지 확인합니다.
            *   `expect(toast.error)` 호출 확인.
    *   **규칙:** `[package]`, `[zustand-action-msw]`, `[vitest-mocking]`, `[async-test]`, `[explicit-error-throw-testing]`

**Phase 3: UI 컴포넌트 리팩토링 (`ProjectToolbar.tsx`)**

*   **테스크 3.1: 로컬 핸들러 및 로직 제거**
    *   **파일:** `src/components/layout/ProjectToolbar.tsx`
    *   **작업:**
        1.  컴포넌트 내부에 정의된 `handleSaveLayout` 함수 및 그 내부의 `localStorage` 접근 로직을 **제거**합니다.
        2.  설정 변경 핸들러(`handleSnapGridChange`, `handleConnectionTypeChange` 등) 내부의 `updateBoardSettings(...)` 호출 외 다른 로직(예: `localStorage` 직접 접근)이 있다면 **제거**합니다.
        3.  `handleSignOut` 함수 내부의 `signOut()` 직접 호출 로직을 **제거**합니다.
    *   **규칙:** `[zustand-action-msw]`

*   **테스크 3.2: Zustand 액션 import 및 연결**
    *   **파일:** `src/components/layout/ProjectToolbar.tsx`
    *   **작업:**
        1.  `useAppStore` 훅을 사용하여 필요한 액션(`saveBoardLayout`, `updateBoardSettings`, `logoutAction`)과 상태(`boardSettings`, `isLoading` 등)를 가져옵니다.
            ```typescript
            const { saveBoardLayout, updateBoardSettings, logoutAction, boardSettings, isLoading } = useAppStore(); // 또는 useBoardStore
            ```
        2.  레이아웃 저장 메뉴 아이템의 `onSelect` (또는 `onClick`) 핸들러에서 `saveBoardLayout()` 액션을 호출하도록 변경합니다.
        3.  각 설정 변경 메뉴 아이템(`DropdownMenuRadioItem`, `DropdownMenuCheckboxItem`)의 `onSelect` (또는 `onCheckedChange`, `onValueChange`) 핸들러에서 `updateBoardSettings({ settingKey: newValue })` 액션을 호출하도록 변경합니다.
            ```typescript
            // 예시: 스냅 그리드 변경
            onValueChange={(value) => {
              const gridValue = parseInt(value, 10);
              const newGrid: [number, number] = [gridValue, gridValue];
              updateBoardSettings({ snapToGrid: gridValue > 0, snapGrid: newGrid });
            }}
            // 예시: 애니메이션 토글
            onCheckedChange={(checked) => updateBoardSettings({ animated: checked })}
            ```
        4.  로그아웃 버튼의 `onClick` 핸들러에서 `logoutAction()`을 호출하도록 변경합니다.
    *   **규칙:** `[zustand-action-msw]`

*   **테스크 3.3: 코드 검증**
    *   **파일:** `src/components/layout/ProjectToolbar.tsx`
    *   **작업:** 리팩토링 후 컴포넌트 내에 상태 변경 로직, API 호출, `localStorage` 직접 접근 등이 남아있지 않은지 최종 확인합니다. UI 렌더링과 액션 호출 역할만 수행해야 합니다.

**Phase 4: UI 컴포넌트 단위 테스트 (`ProjectToolbar.test.tsx`)**

*   **테스크 4.1: 테스트 파일 업데이트 또는 생성**
    *   **파일:** `src/components/layout/ProjectToolbar.test.tsx`
    *   **작업:** 기존 테스트 파일을 업데이트하거나 새로 생성합니다.
    *   **규칙:** `[package]`

*   **테스크 4.2: Zustand 스토어 및 의존성 모킹**
    *   **파일:** `src/components/layout/ProjectToolbar.test.tsx`
    *   **작업:**
        1.  `vi.mock('@/store/useAppStore', ...)`을 사용하여 `useAppStore`를 모킹합니다. 테스트하려는 액션(`saveBoardLayout`, `updateBoardSettings`, `logoutAction`)을 `vi.fn()`으로 대체합니다. `boardSettings` 등 필요한 상태도 모킹합니다.
        2.  `useAuth` 훅을 모킹하여 `signOut` 함수가 `logoutAction` 내부에서 호출될 때의 시나리오를 테스트할 수 있도록 합니다 (액션 테스트에서 이미 커버되었다면 생략 가능).
    *   **규칙:** `[vitest-mocking]`

*   **테스크 4.3: 액션 호출 검증 테스트**
    *   **파일:** `src/components/layout/ProjectToolbar.test.tsx`
    *   **작업:**
        1.  컴포넌트를 렌더링합니다.
        2.  드롭다운 메뉴를 열고 각 설정 변경 메뉴 아이템 클릭을 시뮬레이션합니다 (`userEvent` 사용).
        3.  클릭 후 `expect(mockUpdateBoardSettingsAction).toHaveBeenCalledWith({ settingKey: expectedValue })` 와 같이, **올바른 `updateBoardSettings` 액션이 올바른 인자와 함께 호출되었는지 검증**합니다.
        4.  레이아웃 저장 메뉴 아이템 클릭 시뮬레이션 후 `expect(mockSaveBoardLayoutAction).toHaveBeenCalled()`를 검증합니다.
        5.  로그아웃 버튼 클릭 시뮬레이션 후 `expect(mockLogoutAction).toHaveBeenCalled()`를 검증합니다.
    *   **규칙:** `[react-test-failure]` (Rule #1), `[zustand-action-msw]`

**Phase 5: 최종 검토 및 정리**

*   **테스크 5.1: 코드 정리**
    *   **파일:** `src/store/useAppStore.ts` (또는 관련 스토어), `src/components/layout/ProjectToolbar.tsx`, `src/components/layout/ProjectToolbar.test.tsx`
    *   **작업:** 사용되지 않는 코드 제거 및 코드 스타일 정리.
*   **테스크 5.2: 커버리지 확인**
    *   **작업:** `yarn test run --coverage src/components/layout/ProjectToolbar.tsx src/store/useAppStore.ts` (또는 관련 스토어 파일)를 실행하여 커버리지를 확인하고 필요시 테스트 보강.
    *   **규칙:** `[increase-coverage]`

```