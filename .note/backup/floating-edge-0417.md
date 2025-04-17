## **작업 목록: React Flow Floating Edges 기능 구현**

**목표:** 노드의 상대적 위치에 따라 엣지의 연결 지점(핸들)이 동적으로 변경되는 Floating Edges 기능을 구현합니다. 모든 상태 변경은 `useIdeaMapStore`의 액션을 통해 이루어져야 합니다.

**참고 자료:** [React Flow Floating Edges 예제](https://reactflow.dev/examples/edges/floating-edges)

**수행할 작업:**

1.  **핸들 ID 정의 및 `CardNode`에 핸들 추가:**
    *   **파일:** `src/components/ideamap/nodes/CardNode.tsx` (및 필요시 관련 상수 파일)
    *   **작업:**
        *   노드의 상, 하, 좌, 우 중앙에 연결될 수 있는 핸들의 고유 ID를 정의합니다. (예: `handle-top`, `handle-bottom`, `handle-left`, `handle-right`)
        *   `CardNode` 컴포넌트 내부에 이 4개의 핸들(`Handle` 컴포넌트)을 각각의 `id`와 `position` (Top, Bottom, Left, Right)을 지정하여 렌더링합니다.
        *   핸들의 스타일은 기존 테마(`useTheme`)를 따르거나 필요시 조정합니다.
    *   **검증:** 각 카드 노드에 4방향의 핸들이 시각적으로 표시되는지 확인합니다.

2.  **최적 핸들 계산 로직 구현:**
    *   **파일:** 새 유틸리티 파일 생성 (예: `src/components/ideamap/utils/floating-edge-utils.ts`) 또는 기존 유틸리티 파일 (`src/lib/layout-utils.ts` 등)에 추가.
    *   **작업:**
        *   두 노드(`sourceNode`, `targetNode`)를 입력받아, 두 노드 사이의 엣지가 연결될 최적의 핸들 ID (`sourceHandleId`, `targetHandleId`)를 계산하는 함수를 구현합니다.
        *   React Flow 예제의 계산 로직(노드 중심점 간의 각도, 교차점 계산 등)을 참고하여 구현합니다. 함수 이름 예: `getFloatingEdgeHandles(sourceNode: Node, targetNode: Node): { sourceHandle: string | null; targetHandle: string | null; }`.
        *   이 함수는 순수 함수(입력값만으로 결과를 결정)여야 합니다.
    *   **검증:** (선택 사항) 유닛 테스트를 작성하여 다양한 노드 위치에 대해 함수가 올바른 핸들 ID를 반환하는지 검증합니다.

3.  **Zustand 스토어 액션 추가 (`useIdeaMapStore`):**
    *   **파일:** `src/store/useIdeaMapStore.ts`
    *   **작업:**
        *   이동된 노드 ID 배열(`movedNodeIds: string[]`) 또는 모든 노드/엣지를 인자로 받아, 관련된 엣지들의 `sourceHandle` 및 `targetHandle`을 업데이트하는 새로운 액션을 추가합니다. 액션 이름 예: `updateFloatingEdgeHandles`.
        *   이 액션 내부 로직:
            *   현재 `nodes`와 `edges` 상태를 가져옵니다 (`get()`).
            *   `movedNodeIds`에 연결된 모든 `edges`를 찾습니다.
            *   각 관련 엣지에 대해 `getFloatingEdgeHandles` 유틸리티 함수를 호출하여 새로운 `sourceHandle`과 `targetHandle` 값을 얻습니다.
            *   새 핸들 ID로 업데이트된 새로운 `edges` 배열을 생성합니다.
            *   `set({ edges: updatedEdges })`를 호출하여 상태를 업데이트합니다.
    *   **검증:** 스토어 액션이 정의되고 타입 에러가 없는지 확인합니다.

4.  **노드 변경 시 엣지 핸들 업데이트 트리거:**
    *   **파일:** `src/store/useIdeaMapStore.ts`
    *   **함수:** `applyNodeChangesAction` 액션 (또는 노드 위치를 변경하는 다른 관련 액션)
    *   **작업:**
        *   `applyNodeChanges`로 `nodes` 상태를 업데이트한 *후*, 변경된 노드(`changes` 배열 분석)에 연결된 엣지들의 핸들을 업데이트하기 위해 새로 추가한 `updateFloatingEdgeHandles` 액션을 호출합니다.
        *   변경 사항(`changes`)에서 위치가 변경된 노드들의 ID를 추출하여 `updateFloatingEdgeHandles`에 전달합니다.
        *   **성능 고려:** 노드 드래그 중에는 매번 호출하지 않고, 드래그가 끝났을 때(`change.dragging === false`)만 호출하거나, 디바운스(debounce)를 적용하는 것을 고려합니다.
    *   **검증