Zustand 액션 기반 리팩토링과 MSW를 결합하여 앱 전체의 구조를 개선하는 계획.

**리팩토링 목표:**

1.  UI 컴포넌트의 역할을 인터랙션 감지 및 액션 호출로 제한.
2.  모든 상태 변경 로직을 Zustand 스토어의 액션으로 중앙화.
3.  API 호출 로직도 (가능하다면) Zustand 액션 내부로 이동시켜 비동기 처리 및 상태 업데이트를 일관되게 관리.
4.  MSW를 사용하여 액션 테스트 시 실제 API 의존성 제거.
5.  개발 편의성을 위한 브라우저 콘솔 커맨드 API 제공.

---

**리팩토링 계획: Zustand 액션 중심 아키텍처 전환 (feat. MSW & Console API)**

**Phase 0: 사전 준비 (Foundation Setup)**

*   **테스크 0.1: MSW 설정**
    *   **파일:** `src/tests/msw/handlers.ts`, `src/tests/msw/server.ts`, `src/tests/setup.ts` (또는 Vitest 설정 파일)
    *   **작업:**
        1.  `msw` 패키지가 설치되어 있는지 확인 (`yarn add -D msw` 또는 `npm install --save-dev msw`).
        2.  `src/tests/msw/handlers.ts`: 프로젝트에서 사용하는 주요 API 엔드포인트 (예: `GET /api/cards`, `POST /api/cards`, `PUT /api/cards/:id`, `DELETE /api/cards/:id`, `GET /api/tags`, `POST /api/tags`, `POST /api/board-settings`, `GET /api/board-settings`)에 대한 기본 목 핸들러를 정의합니다. 성공 및 실패 시나리오를 포함합니다. (기존 `src/tests/msw/handlers.ts` 활용 및 확장)
        3.  `src/tests/msw/server.ts`: `setupServer`를 사용하여 Node 환경용 MSW 서버를 설정합니다. (기존 `src/tests/msw/server.ts` 활용)
        4.  `src/tests/setup.ts` (또는 Vitest 설정): `beforeAll`, `afterEach`, `afterAll` 훅을 사용하여 테스트 실행 전/후 MSW 서버를 시작/리셋/종료하도록 설정합니다. (기존 `setupMSW` 함수 활용)
*   **테스크 0.2: 코어 타입 정의 강화**
    *   **파일:** `src/types/` 디렉토리 (예: `card.ts`, `flow.ts`, `app.ts`), `src/store/useAppStore.ts`
    *   **작업:**
        1.  Zustand 스토어에서 관리할 상태(`State`)와 액션(`Actions`)을 명확하게 정의하는 인터페이스를 `useAppStore.ts` 또는 별도 타입 파일에 작성합니다. (`type AppState = State & Actions`)
        2.  애플리케이션 전반에서 사용될 주요 데이터 타입(예: `CardWithTags`, `BoardNodeData`, `AppActionPayloads`)을 `src/types/` 아래에 명확히 정의하거나 개선합니다.

**Phase 1: Zustand 스토어 리팩토링 (Centralizing Logic)**

*   **테스크 1.1: 액션 식별 및 상태 구조 정의**
    *   **파일:** `src/store/useAppStore.ts`
    *   **작업:**
        1.  애플리케이션의 모든 주요 상태 변경 시나리오를 식별합니다. (예: 카드 선택, 카드 펼치기/접기, 카드 생성/수정/삭제, 레이아웃 변경, 설정 업데이트 등)
        2.  식별된 시나리오를 처리할 액션 함수 시그니처를 `AppState` 인터페이스에 정의합니다. (예: `selectCard(cardId: string | null): void`, `toggleExpandCard(cardId: string): void`, `updateBoardSettings(settings: Partial<BoardSettings>): Promise<void>`)
        3.  액션 실행에 필요한 상태(예: `selectedCardId`, `selectedCardIds`, `expandedCardId`, `boardSettings`, `isSidebarOpen`)가 스토어 상태(`State` 부분)에 정의되어 있는지 확인하고, 없다면 추가합니다. 특히, 카드 펼침/접힘 상태를 전역(`expandedCardId: string | null`)으로 관리하는 것을 고려합니다.
*   **테스크 1.2: 액션 함수 구현 (상태 변경 로직 중앙화)**
    *   **파일:** `src/store/useAppStore.ts`
    *   **작업:**
        1.  `create` 함수의 `set`과 `get`을 사용하여 `AppState`에 정의된 액션 함수들의 로직을 구현합니다.
        2.  기존에 컴포넌트나 훅에 흩어져 있던 상태 변경 로직을 해당 액션 함수 내부로 이동시킵니다.
        3.  상태 전이 로직(예: 카드 선택 시 다른 카드 접기, 선택 해제 시 카드 접기)을 관련 액션 내부에 명확하게 구현합니다.
        4.  **비동기 액션 처리:** API 호출이 필요한 액션(예: `updateBoardSettings`, `createCard`)은 `async` 함수로 만들고, 내부에 `fetch` 호출 로직을 포함시킵니다. 로딩 상태(`isLoading`)와 오류 상태(`error`)를 스토어에 추가하여 관리하는 것을 고려합니다. (API 호출은 Phase 4에서 구체화)
*   **테스크 1.3: 스토어 액션 단위 테스트 작성**
    *   **파일:** `src/store/useAppStore.test.ts`
    *   **작업:**
        1.  `vitest`와 `@testing-library/react` (또는 `react-hooks`)를 사용하여 각 액션 함수에 대한 단위 테스트를 작성합니다.
        2.  `beforeEach`에서 스토어 상태를 초기화합니다.
        3.  `act()`를 사용하여 액션을 호출하고, `expect(useAppStore.getState().someState).toEqual(...)`을 사용하여 상태 변경 결과를 검증합니다.
        4.  비동기 액션 테스트 시, MSW 핸들러를 사용하여 API 호출을 모킹하고, `waitFor` 등을 사용하여 비동기 완료 후 상태를 검증합니다.

---

이렇게 Phase 2의 마지막에 테스트 테스크를 추가함으로써, UI 컴포넌트 리팩토링이 의도한 대로 Zustand 액션 시스템과 잘 연동되는지를 체계적으로 검증할 수 있습니다. 이는 리팩토링 과정의 안정성을 크게 높여줄 것입니다.

**Phase 2: UI 컴포넌트 리팩토링 (Calling Actions)**

오케이, 기존 Phase 2 계획에 컴포넌트/훅 분리 및 LoC 관리 지침을 통합하여 수정하겠습니다. AI Agent가 각 단계를 명확히 이해하고 실행할 수 있도록 구체적인 파일 경로와 작업을 명시합니다.

---

**리팩토링 계획: Phase 2 수정안 (UI 컴포넌트 리팩토링 및 LoC 관리)**

**목표:** UI 컴포넌트의 역할을 인터랙션 감지 및 Zustand 액션 호출로 제한하고, 코드베이스의 가독성 및 유지보수성 향상을 위해 파일 길이를 500 LoC 내외로 관리합니다.

*   **테스크 2.1: `CardNode` 리팩토링 (Zustand 액션 호출 + LoC 관리)**
    *   **대상 파일:**
        *   `src/components/board/nodes/CardNode.tsx` (수정)
        *   (신규) `src/components/board/nodes/CardHeader.tsx`
        *   (신규) `src/components/board/nodes/CardContent.tsx`
        *   (신규) `src/components/board/hooks/useCardNodeInteraction.ts`
    *   **작업:**
        1.  `CardNode.tsx`에서 `useAppStore` 훅을 사용하여 필요한 상태(`selectedCardIds`, `expandedCardId` 등)와 액션(`selectCard`, `toggleExpandCard`)을 가져옵니다.
        2.  **[컴포넌트 분리]** `CardNode.tsx` 내부의 UI 렌더링 로직을 논리적 단위(Header, Content 등)로 나누어 각각 `CardHeader.tsx`, `CardContent.tsx`와 같은 별도의 하위 컴포넌트로 분리합니다. `CardNode.tsx`는 이 하위 컴포넌트들을 조합하고 필요한 props를 전달하는 역할을 합니다.
        3.  **[훅 추출]** 카드 전체 클릭, 펼침/접힘 버튼 클릭 등의 사용자 인터랙션 처리 로직(이벤트 핸들러)을 `useCardNodeInteraction.ts` 커스텀 훅으로 추출합니다. 이 훅은 내부적으로 `selectCard`, `toggleExpandCard` 등의 Zustand 액션을 호출합니다.
        4.  `CardNode.tsx` 내에서 직접 상태를 변경하거나 복잡한 로직을 처리하는 부분을 제거하고, 추출된 훅과 Zustand 액션 호출로 대체합니다.
        5.  펼침/접힘 버튼 클릭 핸들러에서는 `event.stopPropagation()`을 유지합니다.
        6.  카드의 시각적 상태(선택, 펼침)는 `useAppStore`에서 가져온 전역 상태를 기반으로 결정되도록 합니다.
        7.  **[LoC 관리]** 리팩토링 후 `CardNode.tsx` 및 새로 생성된 관련 파일들의 라인 수가 가급적 500 라인을 넘지 않도록 합니다. 만약 여전히 길다면 추가적인 분리(더 작은 컴포넌트, 추가 훅)를 고려합니다.
        8.  수정된 모든 코드는 `[zustand-action-msw]` 및 `[general]` 룰을 준수해야 합니다.

*   **테스크 2.2: `Board` 및 관련 Hooks 리팩토링 (Zustand 액션 호출 + LoC 관리)**
    *   **대상 파일:**
        *   `src/components/board/components/Board.tsx` (수정)
        *   `src/components/board/hooks/useBoardHandlers.ts` (수정 또는 분리)
        *   `src/components/board/hooks/useNodes.ts`, `useEdges.ts`, `useBoardUtils.ts`, `useBoardData.ts` (검토 및 필요시 수정/분리)
    *   **작업:**
        1.  `Board.tsx` 또는 관련 훅(`useBoardHandlers.ts` 등)에서 `useAppStore` 훅을 사용하여 필요한 액션(`clearSelection`, `selectCards` 등)을 가져옵니다.
        2.  `onPaneClick` 핸들러 로직을 검토하고, 상태 변경이 필요하면 `clearSelection()`과 같은 Zustand 액션을 호출하도록 수정합니다. (현재 `useBoardHandlers` 훅에서 처리될 수 있음)
        3.  React Flow의 `onSelectionChange` 콜백에서 Zustand의 `selectCards` 액션을 호출하여 선택 상태를 동기화하는 로직을 확인하고 필요시 개선합니다. (현재 `useBoardHandlers` 훅에서 처리될 수 있음)
        4.  **[훅 검토 및 분리]** 기존 커스텀 훅들(`useNodes`, `useEdges`, `useBoardHandlers`, `useBoardUtils`, `useBoardData`)의 역할과 크기를 검토합니다. 특정 훅이 너무 많은 책임을 지거나 LoC가 500을 초과할 경우, 논리적인 단위로 더 작은 훅으로 분리하는 것을 고려합니다. (예: `useBoardHandlers` -> `useBoardSelectionHandler`, `useBoardDragHandler`)
        5.  **[LoC 관리]** 각 훅 파일 및 `Board.tsx`의 LoC가 가급적 500 라인을 넘지 않도록 유지합니다.
        6.  수정된 모든 코드는 `[zustand-action-msw]` 및 `[general]` 룰을 준수해야 합니다.

*   **테스크 2.3: `Sidebar` 리팩토링 (Zustand 액션 호출 + LoC 관리)**
    *   **대상 파일:** `src/components/layout/Sidebar.tsx` (수정)
    *   **작업:**
        1.  `useAppStore` 훅을 사용하여 필요한 상태(`selectedCardId` 등)와 액션(`selectCard`)을 가져옵니다.
        2.  사이드바 내 카드 목록 아이템 클릭 핸들러에서 직접 상태를 변경하는 대신 `selectCard(clickedCardId)` 액션을 호출하도록 수정합니다.
        3.  선택된 카드 강조 등 UI 표시는 `useAppStore`의 상태를 기반으로 하도록 합니다.
        4.  **[LoC 관리]** `Sidebar.tsx` 파일의 LoC를 검토하고, 500 라인을 초과하거나 로직이 과도하게 복잡할 경우 하위 컴포넌트 또는 커스텀 훅으로 분리하는 것을 고려합니다. (예: `SidebarCardList`, `useSidebarInteractions`)
        5.  수정된 모든 코드는 `[zustand-action-msw]` 및 `[general]` 룰을 준수해야 합니다.

*   **테스크 2.4: `Toolbars` (Main, Project, Shortcut) 리팩토링 (Zustand 액션 호출 + LoC 관리)**
    *   **대상 파일:** `src/components/layout/MainToolbar.tsx`, `src/components/layout/ProjectToolbar.tsx`, `src/components/layout/ShortcutToolbar.tsx` (수정)
    *   **작업:**
        1.  각 툴바 컴포넌트에서 `useAppStore` 훅을 사용하여 필요한 액션(`applyLayout`, `toggleSidebar`, `createCard`, `updateBoardSettings`, `signOut` 등)을 가져옵니다.
        2.  툴바 내 버튼들의 클릭 핸들러에서 해당 Zustand 액션을 직접 호출하도록 수정합니다. (예: 수평 레이아웃 버튼 클릭 -> `applyLayout('horizontal')`)
        3.  **(LoC 관리)** 각 툴바 컴포넌트의 LoC를 검토하고, 복잡성이 높거나 길이가 길 경우 하위 컴포넌트로 분리하는 것을 고려합니다. (일반적으로 툴바는 복잡하지 않을 수 있음)
        4.  수정된 모든 코드는 `[zustand-action-msw]` 및 `[general]` 룰을 준수해야 합니다.

*   **테스크 2.5: UI 컴포넌트 테스트 작성/업데이트 (액션 호출 검증)**
    *   **대상 파일:**
        *   `src/components/board/nodes/CardNode.test.tsx` (또는 신규 생성)
        *   `src/components/board/components/Board.test.tsx` (또는 신규 생성, 핸들러 로직 테스트 포함)
        *   `src/components/layout/Sidebar.test.tsx` (또는 신규 생성)
        *   `src/components/layout/MainToolbar.test.tsx`, `ProjectToolbar.test.tsx`, `ShortcutToolbar.test.tsx` (또는 신규 생성)
        *   Phase 2에서 리팩토링된 다른 UI 컴포넌트의 테스트 파일
    *   **작업:**
        1.  `@testing-library/react`와 `vitest` (또는 Jest)를 사용하여 각 리팩토링된 UI 컴포넌트에 대한 테스트를 작성하거나 업데이트합니다.
        2.  **[Zustand 모킹]** 각 테스트 케이스에서 `vi.mock`을 사용하여 `useAppStore` 훅을 모킹합니다. 모킹된 스토어는 다음을 수행해야 합니다:
            *   테스트 시나리오에 필요한 **초기 상태**를 제공합니다. (예: 특정 카드가 선택된 상태, 사이드바가 열린 상태 등)
            *   검증하려는 **액션 함수**들을 `vi.fn()`으로 대체하여 스파이(spy) 역할을 하도록 합니다.
        3.  **[사용자 인터랙션 시뮬레이션]** `@testing-library/user-event` 또는 `fireEvent`를 사용하여 사용자의 클릭, 입력 등 UI 인터랙션을 시뮬레이션합니다.
        4.  **[액션 호출 검증]** 인터랙션 발생 후, 모킹된 Zustand 액션 함수가 **예상된 인자**와 함께 **정확히 호출되었는지** `expect(...).toHaveBeenCalledWith(...)` 등을 사용하여 검증합니다.
        5.  **[렌더링 검증]** 모킹된 Zustand 스토어의 상태에 따라 컴포넌트가 **올바르게 렌더링**되는지(예: 선택 시 강조 표시, 상태에 따른 텍스트 변화 등) `expect(screen.getBy...)` 등을 사용하여 검증합니다.
        6.  **[MSW (필요시)]** 만약 UI 인터랙션이 호출하는 Zustand 액션이 내부적으로 API를 호출하고, 그 결과에 따라 UI가 변경되어야 하는 로직이 *컴포넌트 레벨에서 중요하게 검증되어야 한다면* (일반적으로는 액션 단위 테스트에서 충분함), 해당 테스트 케이스에서 MSW 핸들러를 설정하여 API 응답을 모킹합니다. 하지만 주된 초점은 액션 호출 자체를 검증하는 데 둡니다.
        7.  작성된 모든 테스트는 `[package]` 룰의 테스트 관련 지침(파일 위치 등)을 준수해야 합니다.

---

이 수정된 Phase 2 계획은 각 컴포넌트의 리팩토링 작업과 함께 코드 길이 관리를 명시적으로 포함하여, LLM Agent가 더 구조적이고 유지보수하기 좋은 코드를 생성하도록 유도할 것입니다.

**Phase 3: 비동기 로직 통합 (API Calls in Actions)**

*   **테스크 3.1: API 호출 로직을 Zustand 액션으로 이동**
    *   **파일:** `src/store/useAppStore.ts`, 관련 Hooks 또는 컴포넌트
    *   **작업:**
        1.  기존에 컴포넌트나 훅에서 직접 수행하던 `fetch` API 호출(카드 생성/수정/삭제, 설정 저장/로드 등) 로직을 해당 Zustand 액션 함수 내부로 이동시킵니다.
        2.  액션 함수를 `async`로 만들고, `try...catch` 블록을 사용하여 API 호출 오류를 처리합니다.
        3.  API 호출 전후로 `isLoading` 상태를 업데이트하고, 성공/실패 시 `error` 상태 및 관련 데이터 상태(`cards`, `boardSettings` 등)를 업데이트합니다. `toast` 알림도 액션 내부에서 호출하는 것을 고려합니다.
        ```typescript
        // 예시: updateBoardSettings 액션
        updateBoardSettings: async (settingsUpdate) => {
          const currentSettings = get().boardSettings;
          const newSettings = { ...currentSettings, ...settingsUpdate };
          set({ isLoading: true, error: null }); // 로딩 시작
          try {
            // 상태 먼저 낙관적 업데이트 (선택적)
            set({ boardSettings: newSettings });

            // API 호출 (MSW로 모킹 가능)
            const response = await fetch('/api/board-settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: get().userId, settings: newSettings }) // userId는 스토어에 있어야 함
            });

            if (!response.ok) {
              throw new Error('설정 저장 실패');
            }

            // 성공 시 (이미 낙관적 업데이트 되었다면 추가 작업 불필요)
            set({ isLoading: false });
            toast.success('설정이 저장되었습니다.');
          } catch (err) {
            // 실패 시 롤백 및 에러 처리
            set({ boardSettings: currentSettings, isLoading: false, error: err.message });
            toast.error(`설정 저장 실패: ${err.message}`);
          }
        },
        ```
*   **테스크 3.2: 비동기 액션 테스트 (MSW 활용)**
    *   **파일:** `src/store/useAppStore.test.ts`
    *   **작업:**
        1.  비동기 액션(API 호출 포함)을 테스트하는 케이스를 추가합니다.
        2.  `msw`의 `server.use()`를 사용하여 특정 테스트 케이스에 맞는 API 응답(성공 또는 실패)을 모킹합니다.
        3.  `act()`와 `waitFor` 등을 사용하여 액션 호출 후 비동기 작업이 완료되고 상태가 올바르게 업데이트되었는지 검증합니다. 로딩 및 오류 상태 변화도 확인합니다.

**Phase 4: 콘솔 API 구현 (Developer Convenience)**

*   **테스크 4.1: 전역 커맨드 객체 설정**
    *   **파일:** 앱 진입점 근처 (예: `src/app/layout.tsx` 내 `ClientLayout`의 `useEffect` 또는 별도 초기화 파일)
    *   **작업:**
        1.  `process.env.NODE_ENV === 'development'` 조건 하에서, `window.appCommands` 객체를 생성합니다.
        2.  `useAppStore.getState()`를 사용하여 스토어의 주요 액션 함수들을 `window.appCommands` 객체의 속성으로 할당합니다.
        3.  콘솔에 사용법 안내 메시지를 출력합니다.
*   **테스크 4.2: 콘솔 API 문서 생성**
    *   **파일:** `docs/console-api.md` (신규 생성)
    *   **작업:**
        1.  콘솔에서 사용할 수 있는 커맨드(액션) 목록을 작성합니다.
        2.  각 커맨드의 역할과 사용 예제를 명확하게 설명합니다. (아래 예시 참고)

**Phase 5: 최종 검토 및 정리 (Cleanup)**

*   **테스크 5.1: 통합 테스트 및 리그레션 확인**
    *   **파일:** 전체 테스트 파일
    *   **작업:** 모든 단위 테스트 및 (가능하다면) 통합 테스트를 실행하여 리팩토링으로 인한 새로운 버그가 발생하지 않았는지 확인합니다. 주요 사용자 시나리오를 수동으로 테스트합니다.
*   **테스크 5.2: 코드 정리**
    *   **파일:** 리팩토링된 모든 파일
    *   **작업:** 사용되지 않는 `useState`, `useEffect`, `useCallback` 로직, 오래된 상태 변경 코드, 주석 처리된 코드 등을 제거합니다. 코드 스타일과 일관성을 검토합니다.

---

**콘솔 API 문서 (docs/console-api.md 예시)**

```markdown
# Backyard 애플리케이션 콘솔 API

이 문서는 개발 환경에서 브라우저 개발자 콘솔을 통해 사용할 수 있는 명령어를 설명합니다.
`window.appCommands` 객체를 통해 접근할 수 있습니다.

**주의:** 이 기능은 개발 환경에서만 활성화됩니다.

## 사용 가능한 커맨드

### 카드 선택

*   **`appCommands.selectCard(cardId: string | null)`**
    *   지정된 ID의 카드를 선택합니다. `null`을 전달하면 선택을 해제합니다.
    *   *예시:* `appCommands.selectCard('abc-123-xyz')`
    *   *예시:* `appCommands.selectCard(null)`

*   **`appCommands.clearSelection()`**
    *   현재 선택된 모든 카드를 해제합니다.
    *   *예시:* `appCommands.clearSelection()`

### 카드 상태 (펼침/접힘)

*   **`appCommands.toggleExpandCard(cardId: string)`**
    *   지정된 ID의 카드의 펼침/접힘 상태를 토글합니다. 카드를 펼치면 자동으로 선택됩니다.
    *   *예시:* `appCommands.toggleExpandCard('abc-123-xyz')`

### 사이드바

*   **`appCommands.toggleSidebar()`**
    *   사이드바의 열림/닫힘 상태를 토글합니다.
    *   *예시:* `appCommands.toggleSidebar()`

### (추가 가능) 카드 조작

*   **`appCommands.createCard(cardData: { title: string; content?: string; tags?: string[] })`**
    *   새로운 카드를 생성합니다. (API 호출 포함, 스토어에 userId 필요)
    *   *예시:* `appCommands.createCard({ title: '새 콘솔 카드', content: '콘솔에서 생성됨' })`

### (추가 가능) 보드 설정

*   **`appCommands.updateBoardSettings(settings: Partial<BoardSettings>)`**
    *   보드 설정을 업데이트합니다. (API 호출 포함)
    *   *예시:* `appCommands.updateBoardSettings({ snapToGrid: true, snapGrid: [20, 20] })`

### 상태 조회 (참고용)

*   `useAppStore.getState()`
    *   현재 Zustand 스토어의 전체 상태를 볼 수 있습니다.
    *   *예시:* `console.log(useAppStore.getState())`
    *   *예시:* `useAppStore.getState().selectedCardId`

---