**태스크 리스트: 'Board' -> 'IdeaMap' 네이밍 리팩토링**

**목표:** 프로젝트 전체에서 'Board' 관련 네이밍을 'IdeaMap'으로 일관되게 변경합니다. 여기에는 디렉토리, 파일명, 컴포넌트, 스토어, 훅, 변수, 상수, API 경로, 테스트 코드 등이 포함됩니다.

**주의사항:** 
- 테스크 안정성을 위해 각 단계별 Task의 범위를 철저히 준수합니다.
- 내가 확인하면서 진행할 수 있도록, Task에 없지만 반드시 필요한 일이라고 생각하면 작업을 멈추고 나에게 do rev 합니다. 
- 작업 시간을 절약하고, 파일 정리를 위해 폴더/파일 이름을 변경할 때는 mv를 사용한다. 

**단계 1: 디렉토리 및 주요 파일 이름 변경**

1.  **Task:** `board` 컴포넌트 디렉토리 이름 변경
    *   **Action:** `src/components/board` 디렉토리 이름을 `src/components/ideamap`으로 변경합니다.
    *   **Follow-up:** 프로젝트 전체에서 이 디렉토리 내 파일을 참조하는 모든 `import` 경로를 업데이트합니다. (Agent가 자동으로 수행할 가능성이 높음)
2.  **Task:** `Board.tsx` 컴포넌트 파일 이름 변경
    *   **Action:** `src/components/ideamap/components/Board.tsx` 파일 이름을 `src/components/ideamap/components/IdeaMap.tsx`으로 변경합니다.
    *   **Follow-up:** 이 파일을 import하는 모든 경로를 업데이트합니다.
3.  **Task:** `BoardCanvas.tsx` 컴포넌트 파일 이름 변경
    *   **Action:** `src/components/ideamap/components/BoardCanvas.tsx` 파일 이름을 `src/components/ideamap/components/IdeaMapCanvas.tsx`으로 변경합니다.
    *   **Follow-up:** 이 파일을 import하는 모든 경로를 업데이트합니다.
4.  **Task:** `useBoardStore.ts` 스토어 파일 이름 변경
    *   **Action:** `src/store/useBoardStore.ts` 파일 이름을 `src/store/useIdeaMapStore.ts`으로 변경합니다.
    *   **Follow-up:** 이 파일을 import하는 모든 경로를 업데이트합니다.
5.  **Task:** 보드 관련 훅 파일 이름 변경
    *   **Action:** `src/components/ideamap/hooks/` 디렉토리 내의 `useBoardData.ts`, `useBoardHandlers.ts`, `useBoardUtils.ts` 파일 이름을 각각 `useIdeaMapData.ts`, `useIdeaMapHandlers.ts`, `useIdeaMapUtils.ts`으로 변경합니다.
    *   **Follow-up:** 이 파일들을 import하는 모든 경로를 업데이트합니다.
6.  **Task:** 보드 관련 유틸리티/상수 파일 이름 변경
    *   **Action:** `src/lib/board-utils.ts`, `src/lib/board-constants.ts`, `src/components/ideamap/utils/constants.ts`, `src/components/ideamap/utils/graphUtils.ts` 파일 이름을 각각 `src/lib/ideamap-utils.ts`, `src/lib/ideamap-constants.ts`, `src/components/ideamap/utils/ideamap-constants.ts`, `src/components/ideamap/utils/ideamap-graphUtils.ts`으로 변경합니다. (필요시 경로 조정 포함)
    *   **Follow-up:** 이 파일들을 import하는 모든 경로를 업데이트합니다.
7.  **Task:** 보드 설정 API 라우트 파일 경로 변경
    *   **Action:** `src/app/api/board-settings/route.ts` 파일 경로를 `src/app/api/ideamap-settings/route.ts`으로 변경합니다.
    *   **Follow-up:** API 클라이언트 코드에서 호출 경로를 업데이트합니다. (단계 4에서 수행)

**(단계 1 완료 후)**
*   Agent의 변경 사항을 검토합니다.
*   애플리케이션을 실행하여 기본적인 렌더링 및 import 오류가 없는지 확인합니다.
*   Git에 변경 사항을 커밋합니다.

**단계 2: 스토어 및 컨텍스트 내부 이름 변경**

8.  **Task:** `useIdeaMapStore` 내부 이름 변경
    *   **규칙:** 앱 안정성과 점진적 개선을 위해 아래에 명시된 작업만 진행합니다.
    *   **File:** `src/store/useIdeaMapStore.ts`
    *   **Action:**
        *   스토어 이름 `useBoardStore`를 `useIdeaMapStore`로 변경합니다.
        *   상태 인터페이스 이름 `BoardState`를 `IdeaMapState`로 변경합니다.
        *   상태 필드 이름 `boardSettings`를 `ideaMapSettings`로 변경합니다.
        *   상태 필드 이름 `isBoardLoading`를 `isIdeaMapLoading`로 변경합니다.
        *   상태 필드 이름 `boardError`를 `ideaMapError`로 변경합니다.
        *   액션 이름 `loadBoardData`를 `loadIdeaMapData`로 변경합니다.
        *   액션 이름 `updateBoardSettings`를 `updateIdeaMapSettings`로 변경합니다.
        *   액션 이름 `saveBoardLayout`을 `saveIdeaMapLayout`로 변경합니다. (또는 `saveIdeaMapState` 등으로 통합 고려)
        *   기타 `board` 또는 `Board`가 포함된 내부 변수, 타입, 함수 이름을 `ideaMap` 또는 `IdeaMap`으로 적절히 변경합니다. (예: `DEFAULT_BOARD_SETTINGS` -> `DEFAULT_IDEAMAP_SETTINGS` import 경로 포함)
    *   **Follow-up:** 이 스토어를 사용하는 모든 컴포넌트 및 훅에서 변경된 이름(스토어, 상태, 액션)을 사용하도록 업데이트합니다.
9.  **Task:** `ThemeContext` 내부 이름 변경
    *   **규칙:** 앱 안정성과 점진적 개선을 위해 아래에 명시된 작업만 진행합니다.
    *   **File:** `src/contexts/ThemeContext.tsx`
    *   **Action:** `NodeTheme` 내부 필드나 `LayoutTheme` 관련 필드 중 'Board'의 의미로 사용된 것이 있다면 'IdeaMap' 관련 이름으로 변경하는 것을 고려합니다. (현재 코드에서는 직접적인 'Board' 네이밍은 없어 보임)

**(단계 2 완료 후)**
*   Agent의 변경 사항을 검토합니다.
*   애플리케이션을 실행하고 상태 관리 관련 기능이 정상 동작하는지 확인합니다.
*   Git에 변경 사항을 커밋합니다.

**단계 3: 컴포넌트 및 훅 내부 이름 변경**
    *   **규칙:** 앱 안정성과 점진적 개선을 위해 각 테스크에서 아래에 명시된 작업만 진행합니다. 만약, 추가 개선이 필요한 부분이 있다면 나에게 말해주고 검토합니다.
    

10. **Task:** `IdeaMap.tsx` 컴포넌트 내부 이름 변경
    *   **File:** `src/components/ideamap/components/IdeaMap.tsx`
    *   **Action:**
        *   컴포넌트 함수 이름 `Board`를 `IdeaMap`으로 변경합니다.
        *   Props 인터페이스 이름 `BoardComponentProps`를 `IdeaMapComponentProps`로 변경합니다. (관련 타입 파일 `src/components/ideamap/types/board-types.ts`도 함께 수정 필요)
        *   내부 변수나 상태 이름에 'board'가 포함된 경우 'ideaMap'으로 변경합니다. (예: `boardSettings` -> `ideaMapSettings` 사용)
11. **Task:** `IdeaMapCanvas.tsx` 컴포넌트 내부 이름 변경
    *   **File:** `src/components/ideamap/components/IdeaMapCanvas.tsx`
    *   **Action:**
        *   컴포넌트 함수 이름 `BoardCanvas`를 `IdeaMapCanvas`로 변경합니다.
        *   Props 인터페이스 이름 `BoardCanvasProps`를 `IdeaMapCanvasProps`로 변경합니다.
        *   내부 변수나 상태 이름에 'board'가 포함된 경우 'ideaMap'으로 변경합니다. (예: `boardSettings` -> `ideaMapSettings` 사용)
12. **Task:** `useIdeaMapData.ts` 훅 내부 이름 변경
    *   **File:** `src/components/ideamap/hooks/useIdeaMapData.ts`
    *   **Action:**
        *   훅 이름 `useBoardData`를 `useIdeaMapData`로 변경합니다.
        *   내부 변수, 반환값 이름 등을 'IdeaMap'에 맞게 변경합니다. (예: `isBoardLoading` -> `isIdeaMapLoading`, `boardError` -> `ideaMapError`)
        *   `useBoardStore` 대신 `useIdeaMapStore`를 사용하도록 수정합니다.
13. **Task:** `useIdeaMapHandlers.ts` 훅 내부 이름 변경
    *   **File:** `src/components/ideamap/hooks/useIdeaMapHandlers.ts`
    *   **Action:**
        *   훅 이름 `useBoardHandlers`를 `useIdeaMapHandlers`로 변경합니다.
        *   `useBoardStore` 대신 `useIdeaMapStore`를 사용하도록 수정합니다.
14. **Task:** `useIdeaMapUtils.ts` 훅 내부 이름 변경
    *   **File:** `src/components/ideamap/hooks/useIdeaMapUtils.ts`
    *   **Action:**
        *   훅 이름 `useBoardUtils`를 `useIdeaMapUtils`로 변경합니다.
        *   내부 변수, 함수 이름 등을 'IdeaMap'에 맞게 변경합니다. (예: `loadBoardSettings...` -> `loadIdeaMapSettings...`)
        *   `useBoardStore` 대신 `useIdeaMapStore`를 사용하도록 수정합니다.
15. **Task:** `ProjectToolbar.tsx` 및 `MainToolbar.tsx` 내부 이름 변경
    *   **Files:** `src/components/layout/ProjectToolbar.tsx`, `src/components/layout/MainToolbar.tsx`
    *   **Action:**
        *   `useBoardStore` 대신 `useIdeaMapStore`를 사용하도록 수정합니다.
        *   `boardSettings` 대신 `ideaMapSettings` 상태를 사용하도록 수정합니다.
        *   `updateBoardSettings`, `saveBoardLayout` 등 관련 액션 호출 부분을 변경된 액션 이름(`updateIdeaMapSettings`, `saveIdeaMapLayout`)으로 수정합니다.
16. **Task:** `Sidebar.tsx` 내부 이름 변경
    *   **File:** `src/components/layout/Sidebar.tsx`
    *   **Action:**
        *   `useBoardStore` 대신 `useIdeaMapStore`를 사용하여 `nodes` 데이터를 가져오도록 수정합니다. (`useAppStore.cards` 사용 부분 제거)

**(단계 3 완료 후)**
*   Agent의 변경 사항을 검토합니다.
*   애플리케이션을 실행하여 UI가 정상적으로 렌더링되고 상호작용이 문제 없는지 확인합니다.
*   Git에 변경 사항을 커밋합니다.

**단계 4: 유틸리티, 상수, API 경로 이름 변경**
*   **규칙:** 앱 안정성과 점진적 개선을 위해 각 테스크에서 아래에 명시된 작업만 진행합니다. 만약, 추가 개선이 필요한 부분이 있다면 나에게 말해주고 검토합니다.

17. **Task:** 보드 관련 상수 파일 내용 변경
    *   **File:** `src/lib/ideamap-constants.ts` (이전 `board-constants.ts`)
    *   **Action:** 상수 이름 `BOARD_SETTINGS_KEY`를 `IDEAMAP_SETTINGS_KEY`로, `EDGES_STORAGE_KEY`를 `IDEAMAP_EDGES_KEY` 등으로 변경합니다. (필요에 따라 `STORAGE_KEY`도 `IDEAMAP_LAYOUT_KEY` 등으로 변경 고려)
    *   **Follow-up:** 변경된 상수 이름을 사용하는 모든 파일을 업데이트합니다.
18. **Task:** 보드 관련 유틸리티 파일 내용 변경
    *   **File:** `src/lib/ideamap-utils.ts` (이전 `board-utils.ts`)
    *   **Action:** 타입 이름 `BoardSettings`를 `IdeaMapSettings`로 변경합니다. 함수 이름 `loadBoardSettings`, `saveBoardSettings`, `applyEdgeSettings` 등을 `loadIdeaMapSettings`, `saveIdeaMapSettings`, `applyIdeaMapEdgeSettings` 등으로 변경합니다. `DEFAULT_BOARD_SETTINGS`를 `DEFAULT_IDEAMAP_SETTINGS`로 변경합니다.
    *   **Follow-up:** 변경된 타입/함수/상수 이름을 사용하는 모든 파일을 업데이트합니다.
19. **Task:** 보드 설정 API 라우트 핸들러 내용 변경
    *   **File:** `src/app/api/ideamap-settings/route.ts` (이전 `board-settings/route.ts`)
    *   **Action:** 내부 로직에서 `boardSettingsSchema` 대신 `ideaMapSettingsSchema` (새로 정의하거나 이름 변경)를 사용하고, Prisma 모델 이름(`boardSettings`)도 변경했다면 해당 부분을 업데이트합니다. (Prisma 스키마 변경은 별도 작업 필요)
20. **Task:** 보드 설정 API 호출 코드 변경
    *   **Action:** 프로젝트 내에서 `/api/board-settings`를 호출하는 코드를 찾아 `/api/ideamap-settings`로 변경합니다. (주로 `useIdeaMapStore` 액션 내부에 있을 것임)

**(단계 4 완료 후)**
*   Agent의 변경 사항을 검토합니다.
*   API 관련 기능 (설정 저장/로드)이 정상 동작하는지 확인합니다.
*   Git에 변경 사항을 커밋합니다.

**단계 5: 테스트 코드 이름 변경**
*   **규칙:** 앱 안정성과 점진적 개선을 위해 각 테스크에서 아래에 명시된 작업만 진행합니다. 만약, 추가 개선이 필요한 부분이 있다면 나에게 말해주고 검토합니다.

21. **Task:** 테스트 코드 내부 이름 변경
    *   **Action:** 모든 테스트 파일(`*.test.tsx`)을 검사하여 다음을 변경합니다:
        *   `describe` 블록 이름 (예: `describe('Board 컴포넌트')` -> `describe('IdeaMap 컴포넌트')`)
        *   모킹 대상 이름 (`vi.mock('@/components/board/...'`) -> `vi.mock('@/components/ideamap/...'`)
        *   테스트 내 변수/상수 이름 (`mockBoardSettings` -> `mockIdeaMapSettings`)
        *   컴포넌트/훅/스토어 참조 이름 (`useBoardStore` -> `useIdeaMapStore`)
        *   API 호출 경로 모킹 (`/api/board-settings` -> `/api/ideamap-settings`)
22. **Task:** 테스트 파일 이름 변경
    *   **Action:** `*Board*.test.tsx` 패턴의 테스트 파일 이름을 `*IdeaMap*.test.tsx` 패턴으로 변경합니다. (예: `Board.test.tsx` -> `IdeaMap.test.tsx`, `useBoardStore.test.tsx` -> `useIdeaMapStore.test.tsx`)

**(단계 5 완료 후)**
*   Agent의 변경 사항을 검토합니다.
*   `yarn test` 또는 `npm run test`를 실행하여 모든 테스트가 통과하는지 확인합니다. 실패하는 테스트는 수정합니다.
*   Git에 변경 사항을 커밋합니다.

**단계 6: 주석 및 문자열 변경 (선택적)**

23. **Task:** 코드 내 주석 및 문자열 변경
    *   **Action:** 프로젝트 전체에서 주석(`//`, `/* */`)이나 로그 메시지, 사용자에게 표시되는 문자열 등에서 'Board' 또는 '보드'라는 단어가 'IdeaMap' 또는 '아이디어맵'의 의미로 사용된 경우, 적절하게 변경합니다. (Agent에게 "주석과 로그 메시지의 'Board'를 'IdeaMap'으로 바꿔줘" 와 같이 요청)

**(단계 6 완료 후)**
*   Agent의 변경 사항을 검토합니다.
*   Git에 변경 사항을 커밋합니다.