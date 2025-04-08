알겠습니다. 제공해주신 리팩토링 계획(`refactorying_zustand.md`, `refactorying-create-card-0408.md`)과 현재 코드베이스(`codebase.md`)를 바탕으로 분석하고 답변드리겠습니다.

**1. 리팩토링 방향성의 타당성**

네, 제시된 리팩토링 방향성은 **매우 타당하고 현대적인 프론트엔드 아키텍처 패턴** 중 하나입니다.

*   **관심사 분리 (Separation of Concerns):** UI 컴포넌트는 사용자 인터랙션 감지와 액션 호출에만 집중하고, 실제 상태 변경 로직과 비동기 처리(API 호출)는 Zustand 스토어의 액션으로 중앙화하는 것은 코드의 가독성, 유지보수성, 테스트 용이성을 크게 향상시킵니다.
*   **중앙화된 상태 관리:** Zustand를 사용하여 상태 로직을 한 곳에 모으면 상태 변화를 추적하고 디버깅하기 쉬워집니다.
*   **예측 가능한 상태 전이:** 액션을 통해서만 상태가 변경되도록 강제함으로써, 애플리케이션의 동작을 더 예측 가능하게 만듭니다.
*   **테스트 용이성:** 액션 함수는 UI와 분리되어 단위 테스트하기 용이하며, MSW를 사용하여 API 의존성을 제거하면 더욱 견고하고 빠른 테스트가 가능해집니다. UI 컴포넌트 테스트는 액션 호출 여부만 검증하면 되므로 단순해집니다.
*   **개발 편의성:** 콘솔 API는 개발 중 상태를 직접 조작하거나 특정 로직을 트리거하는 데 유용합니다.

전반적으로 Zustand 액션을 커맨드 패턴처럼 활용하여 UI와 로직을 분리하는 것은 복잡도가 증가하는 애플리케이션에서 매우 효과적인 전략입니다.

**2. 리팩토링이 잘 적용된 곳과 그렇지 않은 곳**

**잘 적용된 부분:**

*   **카드 생성 로직 (`createCard`):**
    *   `useAppStore`에 `createCard` 액션이 성공적으로 구현되었습니다. API 호출, 로딩/에러 상태 관리, `cards` 상태 업데이트, `toast` 알림 로직이 액션 내부에 잘 통합되었습니다. (`src/store/useAppStore.ts`)
    *   `CreateCardModal` (이전 `CreateCardButton`) 컴포넌트가 `useAppStore`의 `createCard` 액션을 호출하도록 리팩토링되었고, 내부의 `fetch` 및 관련 상태 관리 로직이 제거되었습니다. (`src/components/cards/CreateCardModal.tsx`)
    *   이름 변경 (`CreateCardButton` -> `CreateCardModal`)이 계획대로 반영된 것으로 보입니다.
*   **일부 UI 컴포넌트의 액션 호출:**
    *   `CardNode`에서 선택(`selectCard`) 및 펼치기/접기(`toggleExpandCard`) 관련 로직이 Zustand 액션을 호출하도록 수정되었습니다. (`src/components/board/nodes/CardNode.tsx`)
    *   `ShortcutToolbar`에서 사이드바 토글(`toggleSidebar`) 액션을 호출합니다. (`src/components/layout/ShortcutToolbar.tsx`)
    *   `Sidebar`에서 카드 선택 시 `selectCard` 액션을 호출하는 것으로 보입니다. (`src/components/layout/Sidebar.tsx`)
*   **테스트 설정:** MSW 설정 및 액션/컴포넌트 테스트 계획이 존재하며, 일부 테스트 파일 (`CreateCardModal.test.tsx`, 액션 테스트 파일 - 제공되진 않았지만 계획상 존재)에서 이 방향성을 따르고 있을 가능성이 높습니다.

**미흡하거나 개선이 필요한 부분:**

*   [x] MainToolbar
*   [ ] ProjectToolbar
    *   **레이아웃 저장 로직:** `handleSaveLayout`에서 `localStorage`를 직접 사용합니다. Zustand 액션으로 이동해야 합니다. (`src/components/layout/ProjectToolbar.tsx`)
    *   **설정 업데이트:** `handleUpdateBoardSettings`는 스토어 액션(`updateBoardSettings`)을 호출하는 것으로 보이지만, 스토어 내 해당 액션의 구현이 비동기 로직(API 호출)을 완전히 포함하고 있는지 확인이 필요합니다. (`useBoardStore`에 관련 로직 일부 존재)
*   [ ] 커스텀 Hooks
    *   **`useBoardData`:** `fetchBoardData` 함수 내에서 직접 `fetch('/api/cards')`를 호출하고 `localStorage`(뷰포트)를 사용합니다. 초기 데이터 로딩 로직은 Zustand 액션(`loadInitialBoardData` 등)으로 이동해야 합니다. (`src/components/board/hooks/useBoardData.ts`)
    *   **`useBoardUtils`:** `saveViewport`, `loadViewport` 등에서 `localStorage`를 직접 사용합니다. 이 또한 액션으로 관리하는 것이 일관성에 좋습니다. `applyLayout`, `applyGridLayout` 등의 함수도 상태 변경 로직이 복잡하다면 액션으로 고려할 수 있습니다. (`src/components/board/hooks/useBoardUtils.ts`)
    *   **`useBoardHandlers`:** `onDrop` 핸들러 내부에 여전히 복잡한 로직과 `fetch`(사용자 ID 조회)가 포함되어 있을 수 있습니다. 이 로직도 액션 또는 별도 서비스로 분리하는 것을 고려할 수 있습니다. (`src/components/board/hooks/useBoardHandlers.ts`)
    *   **`useNodes`, `useEdges`:** `localStorage`와 직접 상호작용하는 부분이 남아있습니다. 이것을 액션으로 옮길지 여부는 아키텍처 결정사항이지만, 완전한 중앙화를 위해서는 액션으로 옮기는 것이 좋습니다.
*   [ ] Zustand 스토어 구조
    *   `useAppStore`와 `useBoardStore` 간의 책임 분담이 여전히 모호할 수 있습니다. 특히 `boardSettings`, `reactFlowInstance`와 같은 상태가 두 스토어 중 어디에서 관리되는 것이 최적인지 명확히 정의하고 일관되게 적용해야 합니다.

**3. 추가 리팩토링 우선순위**

1.  **`MainToolbar`의 `window.location.reload()` 제거:** 가장 시급합니다. 카드 생성 후 상태 기반으로 UI가 업데이트되도록 수정해야 합니다. `createCard` 액션이 스토어의 `cards` 상태를 업데이트하면, `Board` 컴포넌트(또는 관련 훅)가 이 변경을 감지하고 React Flow 노드를 업데이트해야 합니다.
2.  **데이터 로딩 로직 액션으로 이동 (`useBoardData`):** 초기 데이터 로딩은 애플리케이션 상태의 핵심 부분이므로, `fetchBoardData` 로직을 `useAppStore` 또는 `useBoardStore`의 액션(예: `loadBoard`)으로 이동시켜야 합니다. 이 액션은 API 호출, 로딩/에러 상태 관리, 스토어 상태(`cards`, `nodes`, `edges`) 업데이트를 모두 담당해야 합니다.
3.  **툴바의 레이아웃/저장 로직 액션으로 이동 (`MainToolbar`, `ProjectToolbar`):** 레이아웃 적용 및 저장 로직을 Zustand 액션으로 중앙화하여 일관성을 확보하고 컴포넌트를 단순화합니다. 특히 API 호출(설정 저장 등)이 포함된다면 더욱 중요합니다.
4.  **`useBoardUtils`, `useBoardHandlers` 리팩토링:** `localStorage` 직접 접근 제거, `onDrop` 로직 분리 등을 통해 훅의 역할을 명확히 하고 액션 패턴과의 일관성을 높입니다.
5.  **스토어 책임 분담 명확화:** `useAppStore`와 `useBoardStore`의 역할을 명확히 정의하고, 중복되거나 애매한 상태(예: `boardSettings`)의 관리 주체를 결정합니다. 필요하다면 스토어를 추가로 분리하거나 통합하는 것을 고려합니다.
6.  **`useNodes`, `useEdges`의 `localStorage` 직접 접근 제거 (선택적):** 더 엄격한 중앙화를 원한다면 이 부분도 액션으로 옮길 수 있습니다.
