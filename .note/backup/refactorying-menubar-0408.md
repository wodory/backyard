**목표:** `MainToolbar.tsx` 컴포넌트의 로직을 Zustand 액션으로 이전하고, 컴포넌트는 액션 호출만 담당하도록 리팩토링합니다. `window.location.reload()` 사용을 제거하고 상태 기반 업데이트를 지향합니다. 모든 변경 사항은 단위 테스트로 검증합니다.

**Phase 1: Zustand 스토어 액션 정의 및 구현 (`useAppStore.ts`)**

*   **테스크 1.1: `applyLayout` 액션 시그니처 정의**
    *   **파일:** `src/store/useAppStore.ts`
    *   **작업:** `AppState` 인터페이스 (또는 `Actions` 타입) 내에 레이아웃 적용 액션 시그니처를 정의합니다. 레이아웃 방향 (`'horizontal' | 'vertical' | 'auto'`)을 인자로 받도록 합니다. React Flow 인스턴스는 `get()`을 통해 접근하거나, 상태에 저장된 것을 사용합니다. 반환 값은 `void` 또는 `Promise<void>` (필요시) 입니다.
        ```typescript
        // 예시 시그니처
        applyLayout: (direction: 'horizontal' | 'vertical' | 'auto') => void; // 또는 Promise<void>
        ```
    *   **규칙:** `[zustand-action-msw]`

*   **테스크 1.2: `saveBoardLayout` 액션 시그니처 정의**
    *   **파일:** `src/store/useAppStore.ts`
    *   **작업:** `AppState` 인터페이스 (또는 `Actions` 타입) 내에 보드 레이아웃 저장 액션 시그니처를 정의합니다. 반환 값은 성공 여부(`boolean` 또는 `Promise<boolean>`) 또는 `void`/`Promise<void>` 입니다.
        ```typescript
        // 예시 시그니처
        saveBoardLayout: () => Promise<boolean>; // API 호출 고려 시 비동기
        ```
    *   **규칙:** `[zustand-action-msw]`

*   **테스크 1.3: `applyLayout` 액션 구현**
    *   **파일:** `src/store/useAppStore.ts`
    *   **작업:**
        1.  `create` 함수 내부에서 `applyLayout` 액션 로직을 구현합니다.
        2.  `get()`을 사용하여 현재 `reactFlowInstance`, `nodes`, `edges` 상태를 가져옵니다.
        3.  `reactFlowInstance`가 없으면 오류 처리 (`toast.error` 또는 `console.error`) 후 종료합니다.
        4.  `direction` 값에 따라 `getLayoutedElements` 또는 `getGridLayout` (`layout-utils.ts` 활용)을 호출하여 새 노드/엣지 위치를 계산합니다.
        5.  계산된 `layoutedNodes`와 `layoutedEdges`를 `reactFlowInstance.setNodes` 및 `reactFlowInstance.setEdges`를 사용하여 적용합니다.
        6.  성공 `toast` 알림을 표시합니다.
        7.  필요시 `isLoading` 상태를 관리합니다.
    *   **규칙:** `[zustand-action-msw]`

*   **테스크 1.4: `saveBoardLayout` 액션 구현**
    *   **파일:** `src/store/useAppStore.ts`
    *   **작업:**
        1.  `create` 함수 내부에서 `saveBoardLayout` 액션 로직을 구현합니다. (필요시 `async`)
        2.  `get()`을 사용하여 현재 `reactFlowInstance`를 가져옵니다.
        3.  `reactFlowInstance`가 없으면 오류 처리 후 `false` 또는 에러를 반환합니다.
        4.  `reactFlowInstance.getNodes()` 및 `reactFlowInstance.getEdges()`를 호출하여 현재 노드/엣지 데이터를 가져옵니다.
        5.  **기존 로직 제거:** `localStorage.setItem` 직접 호출을 제거합니다.
        6.  **상태 저장 로직:** 노드 위치와 엣지 정보를 저장하는 책임을 가진 다른 액션(예: `internalSaveLayoutData`)을 호출하거나, 이 액션 내에서 저장 로직(향후 API 호출 포함 가능)을 직접 구현합니다. 초기에는 `graphUtils.ts`의 `saveAllLayoutData`를 호출하는 방식도 가능하나, 장기적으로는 API 호출을 고려하여 액션 내부에 로직을 두는 것이 좋습니다.
        7.  성공/실패 `toast` 알림을 표시합니다.
        8.  성공 시 `true`, 실패 시 `false`를 반환하거나 void/에러 throw 방식으로 처리합니다.
    *   **규칙:** `[zustand-action-msw]`

**Phase 2: Zustand 액션 단위 테스트 (`useAppStore.test.ts`)**

*   **테스크 2.1: `applyLayout` 액션 단위 테스트 작성**
    *   **파일:** `src/store/useAppStore.test.ts`
    *   **작업:**
        1.  `applyLayout` 액션을 테스트하는 `describe` 블록을 추가합니다.
        2.  `beforeEach`에서 스토어 상태를 초기화하고, `reactFlowInstance` (모킹된 버전)를 상태에 설정합니다. 모킹된 `setNodes`, `setEdges` 함수를 준비합니다.
        3.  각 방향(`horizontal`, `vertical`, `auto`)에 대한 `it` 테스트 케이스를 작성합니다.
        4.  `act(() => { useAppStore.getState().applyLayout('...'); })`를 사용하여 액션을 호출합니다.
        5.  `expect(mockReactFlowInstance.setNodes)`와 `expect(mockReactFlowInstance.setEdges)`가 올바른 계산된 데이터와 함께 호출되었는지 확인합니다. (`layout-utils` 함수 결과 모킹 또는 실제 결과 비교)
        6.  `expect(toast.success)`가 호출되었는지 확인합니다.
        7.  `reactFlowInstance`가 없을 때 오류 처리가 되는지 테스트합니다.
    *   **규칙:** `[package]`, `[zustand-action-msw]`, `[vitest-mocking]`, `[explicit-error-throw-testing]`

*   **테스크 2.2: `saveBoardLayout` 액션 단위 테스트 작성**
    *   **파일:** `src/store/useAppStore.test.ts`
    *   **작업:**
        1.  `saveBoardLayout` 액션을 테스트하는 `describe` 블록을 추가합니다.
        2.  `beforeEach`에서 스토어 상태 및 모킹된 `reactFlowInstance`를 설정합니다. 모킹된 `getNodes`, `getEdges` 함수를 준비합니다.
        3.  `vi.spyOn(localStorage, 'setItem')` 또는 액션 내 저장 로직 호출을 모킹/스파이합니다.
        4.  **성공 케이스:**
            *   `act(async () => { ... })` 내에서 액션을 호출하고 결과를 기다립니다.
            *   `expect(reactFlowInstance.getNodes)` 및 `getEdges`가 호출되었는지 확인합니다.
            *   저장 로직(예: `localStorage.setItem` 또는 내부 저장 함수 호출)이 올바른 데이터와 함께 호출되었는지 확인합니다.
            *   `expect(toast.success)` 호출을 확인합니다.
            *   액션의 반환값(예: `true`)을 확인합니다.
        5.  **실패 케이스:**
            *   `reactFlowInstance`가 없는 경우를 테스트합니다.
            *   저장 로직이 실패하도록 모킹하고 (`localStorage.setItem`이 에러 throw 등), `expect(toast.error)` 호출 및 액션 반환값(예: `false`)을 확인합니다.
    *   **규칙:** `[package]`, `[zustand-action-msw]`, `[vitest-mocking]`, `[async-test]`, `[explicit-error-throw-testing]`, `[global-env-mocking]` (localStorage)

**Phase 3: UI 컴포넌트 리팩토링 (`MainToolbar.tsx`)**

*   **테스크 3.1: 로컬 핸들러 및 로직 제거**
    *   **파일:** `src/components/layout/MainToolbar.tsx`
    *   **작업:**
        1.  컴포넌트 내부에 정의된 `applyHorizontalLayout`, `applyVerticalLayout`, `applyAutoLayout`, `handleSaveLayout` 함수들을 **제거**합니다.
        2.  `getLayoutedElements`, `getGridLayout`, `STORAGE_KEY`, `EDGES_STORAGE_KEY` 등의 import를 제거합니다 (더 이상 직접 사용하지 않으므로).
        3.  `handleCardCreated` 함수 내에서 `window.location.reload();` 호출을 **제거**합니다.
        4.  `useCallback`으로 래핑된 로직들이 제거되었는지 확인합니다.
    *   **규칙:** `[zustand-action-msw]`

*   **테스크 3.2: Zustand 액션 import 및 연결**
    *   **파일:** `src/components/layout/MainToolbar.tsx`
    *   **작업:**
        1.  `useAppStore` 훅을 사용하여 필요한 액션(`applyLayout`, `saveBoardLayout`)과 상태(`isLoading` - 필요하다면)를 가져옵니다.
            ```typescript
            const { applyLayout, saveBoardLayout, isLoading } = useAppStore();
            ```
        2.  각 버튼(`Button` 컴포넌트)의 `onClick` 핸들러를 수정하여 가져온 Zustand 액션을 직접 호출하도록 변경합니다.
            *   수평 정렬 버튼: `onClick={() => applyLayout('horizontal')}`
            *   수직 정렬 버튼: `onClick={() => applyLayout('vertical')}`
            *   자동 배치 버튼: `onClick={() => applyLayout('auto')}`
            *   레이아웃 저장 버튼: `onClick={saveBoardLayout}`
        3.  `handleCardCreated` 함수는 그대로 두되, 내부의 `reload` 호출만 제거합니다. (카드 생성 자체는 `SimpleCreateCardModal`에서 `createCard` 액션을 호출하여 처리될 것으로 예상)
    *   **규칙:** `[zustand-action-msw]`

*   **테스크 3.3: 코드 검증**
    *   **파일:** `src/components/layout/MainToolbar.tsx`
    *   **작업:** 리팩토링 후 컴포넌트 내에 상태 변경 로직, API 호출, `localStorage` 직접 접근, `window.location.reload` 등이 남아있지 않은지 최종 확인합니다. 컴포넌트는 UI 렌더링과 Zustand 액션 호출 역할만 수행해야 합니다.

**Phase 4: UI 컴포넌트 단위 테스트 (`MainToolbar.test.tsx`)**

*   **테스크 4.1: 테스트 파일 업데이트 또는 생성**
    *   **파일:** `src/components/layout/MainToolbar.test.tsx`
    *   **작업:** 기존 테스트 파일을 업데이트하거나 새로 생성합니다.
    *   **규칙:** `[package]`

*   **테스크 4.2: Zustand 스토어 모킹**
    *   **파일:** `src/components/layout/MainToolbar.test.tsx`
    *   **작업:** `vi.mock('@/store/useAppStore', ...)`를 사용하여 `useAppStore` 훅을 모킹합니다. 테스트하려는 액션(`applyLayout`, `saveBoardLayout`)을 `vi.fn()`으로 대체합니다. 필요하다면 `isLoading` 같은 상태도 모킹합니다.
    *   **규칙:** `[vitest-mocking]`

*   **테스크 4.3: 액션 호출 검증 테스트**
    *   **파일:** `src/components/layout/MainToolbar.test.tsx`
    *   **작업:**
        1.  컴포넌트를 렌더링합니다.
        2.  각 버튼(수평 정렬, 수직 정렬, 자동 배치, 레이아웃 저장)을 찾습니다 (`screen.getByTitle` 또는 `getByRole`).
        3.  `userEvent.click` (또는 `fireEvent.click`)을 사용하여 각 버튼 클릭을 시뮬레이션합니다.
        4.  `expect(mockApplyLayoutAction).toHaveBeenCalledWith('horizontal')` 와 같이, 각 버튼 클릭 후 **올바른 Zustand 액션이 올바른 인자와 함께 호출되었는지 검증**합니다.
        5.  `handleCardCreated` 로직 테스트: `SimpleCreateCardModal` 모킹이 필요할 수 있습니다. 모달을 열고 카드 생성 버튼 클릭 시뮬레이션 후, `window.location.reload`가 **호출되지 않았는지** 확인하는 테스트를 추가하거나 기존 테스트를 수정합니다.
    *   **규칙:** `[react-test-failure]` (Rule #1), `[zustand-action-msw]`

**Phase 5: 최종 검토 및 정리**

*   **테스크 5.1: 코드 정리**
    *   **파일:** `src/store/useAppStore.ts`, `src/components/layout/MainToolbar.tsx`, `src/components/layout/MainToolbar.test.tsx`
    *   **작업:** 사용되지 않는 변수, import, 주석 처리된 코드 등을 제거하고 코드 스타일을 정리합니다.
*   **테스크 5.2: 커버리지 확인**
    *   **작업:** `yarn test run --coverage src/components/layout/MainToolbar.tsx src/store/useAppStore.ts` 를 실행하여 관련 파일의 커버리지가 목표치(예: 90%)를 만족하는지 확인합니다. 미달 시 테스트 케이스를 보강합니다.
    *   **규칙:** `[increase-coverage]`