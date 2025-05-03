**목표:** 아이디어맵(`IdeaMap`) 관련 데이터 흐름 안정화 및 코드 완결성 개선

**참고:** `project-card-node-edge.md` 문서 원칙 준수 - TanStack Query는 서버 상태 관리, Zustand는 UI 상태 및 React Flow용 파생 상태(`nodes`, `edges`) 관리.

---

**TASK 1: `useIdeaMapData` 훅 - 데이터 로딩 및 상태 동기화 로직 검증 및 수정**

*   **목적:** TanStack Query로 가져온 최신 DB 데이터 (`CardNode`, `Card`, `Edge`)가 Zustand 스토어 (`nodes`, `edges`)에 안정적으로 반영되도록 한다.
*   **파일:** `src/components/ideamap/hooks/useIdeaMapData.ts`
*   **세부 작업:**
    1.  `useCards`와 `useCardNodes` 훅을 통해 `cardsData`와 `cardNodesData`를 가져오는 부분을 확인한다.
    2.  `useEffect` 훅을 사용하여 `cardsData` 또는 `cardNodesData`가 **성공적으로 로드되거나 변경될 때마다** 다음 작업이 수행되는지 확인하고, 그렇지 않다면 수정한다:
        *   두 데이터가 모두 로딩 완료 (`isSuccess`) 되었고 유효한지 확인한다.
        *   `mergeCardsWithNodes(cardNodesData, cardsData)` 함수를 호출하여 `reactFlowNodes` 배열을 생성한다.
        *   `useIdeaMapStore`의 `setNodes` 액션을 **직접 호출**하여 Zustand 스토어의 `nodes` 상태를 `reactFlowNodes`로 업데이트한다. (이전의 `updateNodesSelectively` 호출 로직 제거 확인)
        *   해당 `useEffect`의 의존성 배열에 `cardsData`, `cardNodesData`, `cardsIsSuccess`, `cardNodesIsSuccess`, `setNodes`가 올바르게 포함되어 있는지 확인한다.
    3.  `useEdges` 훅을 통해 `edgesData`를 가져오는 부분을 확인한다.
    4.  별도의 `useEffect` 훅 또는 위 2번 `useEffect` 내에서 `edgesData`가 **성공적으로 로드되거나 변경될 때마다** 다음 작업이 수행되는지 확인하고, 그렇지 않다면 수정한다:
        *   `edgesData`가 유효한지 확인한다.
        *   `useIdeaMapStore`의 `setEdges` 액션을 호출하여 Zustand 스토어의 `edges` 상태를 `edgesData` (필요시 `transformDbEdgeToFlowEdge` 적용 후)로 업데이트한다.
        *   해당 `useEffect`의 의존성 배열에 `edgesData`, `edgesIsSuccess`, `setEdges`가 올바르게 포함되어 있는지 확인한다.
    5.  관련 로직 전후에 디버깅 로그를 추가하여 데이터 병합 결과와 `setNodes`, `setEdges` 호출 시점을 명확히 확인한다.

---

**TASK 2: `useIdeaMapStore` 스토어 액션 검증**

*   **목적:** 아이디어맵 기능에 필요한 모든 Zustand 액션 함수가 올바르게 정의되고 구현되었는지 확인한다.
*   **파일:** `src/store/useIdeaMapStore.ts`
*   **세부 작업:**
    1.  `create<IdeaMapState>` 함수 내부를 검토하여 다음 액션 함수들이 존재하는지, 그리고 올바른 로직 (주로 `set` 함수를 사용하여 상태 업데이트)을 포함하는지 확인한다:
        *   `setNodes` (Task 1에서 사용)
        *   `setEdges` (Task 1에서 사용)
        *   `setReactFlowInstance`
        *   `applyNodeChangesAction` (`applyNodeChanges` 유틸리티 사용)
        *   `applyEdgeChangesAction` (`applyEdgeChanges` 유틸리티 사용)
        *   `connectNodesAction` (`addEdge` 유틸리티 사용)
        *   `addNodeAtPosition` (새 노드 생성 로직)
        *   `updateNodePositionAction` (노드 위치 업데이트 로직 - 필요시 추가)
        *   기타 UI 상호작용에 필요한 액션들
    2.  누락된 액션이 있다면 적절한 로직으로 구현하여 추가한다. 함수의 파라미터 타입이 호출하는 측과 일치하는지 확인한다.

---

**TASK 3: `Sidebar` 컴포넌트 데이터 조회 방식 최적화**

*   **목적:** `Sidebar`에서 불필요한 개별 카드 조회 API 호출을 제거하고 TanStack Query 캐시를 활용하도록 한다.
*   **파일:** `src/components/layout/Sidebar.tsx`
*   **세부 작업:**
    1.  `fetchCardDetails` 함수와 관련 `fetch` 호출 로직을 **삭제**한다.
    2.  `selectedCardIds` 변경 시 `fetchCardDetails`를 호출하던 `useEffect` 훅을 **삭제**한다.
    3.  컴포넌트 상단에서 `useCards` 훅을 호출하여 `allCardsData` (전체 카드 목록)와 로딩/에러 상태를 가져온다. (필요시 `activeProjectId`로 필터링)
    4.  `useAppStore`에서 `selectedCardIds` 상태를 가져온다.
    5.  `useMemo` 훅을 사용하여 `selectedCardIds`와 `allCardsData`를 기반으로 `DocumentViewer`에 전달할 `selectedCardsForViewer` 배열을 생성한다. 로직 예시:
        ```typescript
        const selectedCardsForViewer = useMemo(() => {
          if (!allCardsData || selectedCardIds.length === 0) return [];
          return allCardsData.filter(card => selectedCardIds.includes(card.id));
        }, [selectedCardIds, allCardsData]);
        ```
    6.  `DocumentViewer` 컴포넌트의 `cards` prop에는 `selectedCardsForViewer`를, `loading` prop에는 `useCards`의 로딩 상태를 전달한다.
    7.  기존의 `detailedCards`, `loading`, `error` 관련 `useState` 훅을 제거한다.

---

**최종 검증:**

*   앱 초기 로드 시 콘솔 에러가 없는지 확인한다.
*   노드가 없는 상태에서 아이디어맵이 정상적으로 표시되고 "카드 추가" 안내 문구가 보이는지 확인한다.
*   사이드바에서 카드를 드래그하여 아이디어맵에 추가했을 때 즉시 노드가 렌더링되는지 확인한다.
*   아이디어맵에서 노드를 드래그하거나 클릭(선택)했을 때 에러 없이 정상 동작하고, 사이드바의 `DocumentViewer` 내용이 올바르게 업데이트되는지 확인한다.
*   앱 새로고침 시 DB에 저장된 노드와 엣지가 아이디어맵에 올바르게 복원되는지 확인한다.

---

이 Tasklist를 Cursor에게 전달하면, 현재 겪고 있는 주요 문제들을 체계적으로 해결하고 코드의 안정성을 크게 높일 수 있을 거야. 너무 걱정 말고, 하나씩 해결해 나가자고! 💪