---
description: 
globs: 
alwaysApply: false
---
**목표:** `useEdges` 훅에서 직접 수행하던 엣지 상태 관리(추가, 변경, 삭제), 로컬 스토리지 상호작용, 토스트 알림 로직을 `useBoardStore`의 액션으로 이전하여 관심사를 분리하고, 훅의 역할을 단순화하거나 제거합니다.

---

**리팩토링 계획: `useEdges.ts`**

**현재 상태 분석:**

*   `useEdges` 훅은 React Flow의 `useEdgesState`를 사용하여 `edges` 상태와 `setEdges` 함수를 관리합니다.
*   `handleEdgesChange`: React Flow의 `applyEdgeChanges`를 사용하여 엣지 변경사항(삭제 등)을 `edges` 상태에 적용합니다. 변경 시 `hasUnsavedChanges` 플래그를 설정합니다.
*   `saveEdges`: 현재 `edges` 상태를 로컬 스토리지(`EDGES_STORAGE_KEY`)에 직접 저장하는 Side Effect를 수행합니다.
*   `onConnect`: 새로운 연결(엣지)이 생성될 때 호출됩니다.
    *   React Flow의 `addEdge` 유틸리티를 사용하여 새 엣지 객체를 생성합니다.
    *   생성된 엣지에 현재 `boardSettings` (스타일, 마커 등)를 적용합니다.
    *   `setEdges`를 호출하여 상태를 직접 변경합니다.
    *   `hasUnsavedChanges` 플래그를 설정합니다.
    *   `toast.success` 알림을 직접 호출합니다.
*   `createEdgeOnDrop`: (엣지 드롭으로 노드 생성 시 사용될 수 있음) 엣지 객체를 생성하고 스타일을 적용하여 반환합니다. 상태 변경은 직접 하지 않습니다. (이 함수는 유틸리티 성격이 강하므로 훅에 남아있어도 무방할 수 있음)
*   `updateEdgeStyles`: 모든 엣지에 새로운 `boardSettings`를 적용하고 `setEdges`를 호출하여 상태를 업데이트합니다. `hasUnsavedChanges` 플래그를 설정합니다.

**리팩토링 원칙 위반 사항:**

*   `saveEdges` 함수 내에서 로컬 스토리지(Side Effect)를 직접 조작합니다.
*   `onConnect`, `updateEdgeStyles` 함수에서 상태(`edges`)를 직접 변경합니다.
*   `onConnect` 함수에서 `toast` 알림을 직접 호출합니다.
*   엣지 관련 상태(`edges`, `setEdges`)와 액션 로직이 훅 내부에 혼재되어 있습니다.

**리팩토링 목표:**

1.  엣지 추가(`onConnect`), 삭제(부분적으로 `handleEdgesChange` 내 로직 포함), 저장(`saveEdges`), 스타일 업데이트(`updateEdgeStyles`) 로직과 관련된 상태 업데이트 및 로컬 스토리지 조작을 `useBoardStore`의 액션으로 이전합니다.
2.  `handleEdgesChange` 핸들러는 React Flow의 변경사항 적용 역할만 하도록 단순화하고, 삭제 시 발생하는 로컬 스토리지 조작 Side Effect는 별도의 액션(또는 삭제 액션 내부)으로 옮깁니다. (노드 리팩토링 계획의 `removeNodesAndRelatedEdgesFromStorage` 액션 재활용 가능)
3.  `useEdges` 훅은 제거하거나, `createEdgeOnDrop`과 같이 상태 변경과 직접 관련 없는 유틸리티 함수만 남겨두는 형태로 단순화합니다. (상태 관리는 `useBoardStore`에서 직접 수행)
4.  `toast` 알림 호출은 해당 로직을 처리하는 액션 내부로 이동합니다.

**세부 리팩토링 태스크 (Cursor Agent 용):**

1.  **`src/store/useBoardStore.ts` 파일 수정:**
    *   **액션 정의 및 구현:** `BoardState` 인터페이스에 다음 액션들을 추가하고 구현합니다.
        *   **`applyEdgeChangesAction(changes: EdgeChange[]): void`**:
            *   `applyEdgeChanges` 유틸리티를 사용하여 `edges` 상태를 업데이트합니다 (`set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }))`).
            *   `changes` 배열에서 `type === 'remove'` 인 변경사항을 찾습니다.
            *   삭제된 엣지가 있다면, 해당 엣지 정보를 로컬 스토리지(`EDGES_STORAGE_KEY`)에서 제거하는 로직을 수행합니다. (별도 액션 `removeEdgesFromStorage` 또는 `handleNodesChange`에서 호출된 `removeNodesAndRelatedEdgesFromStorage` 활용 고려)
            *   변경사항 발생 시 `hasUnsavedChanges`를 true로 설정합니다.
        *   **`removeEdgesFromStorage(deletedEdgeIds: string[]): void`**: (새로운 내부 액션 또는 `removeNodes...` 확장)
            *   `EDGES_STORAGE_KEY`에서 `deletedEdgeIds`에 해당하는 엣지 정보를 제거합니다.
            *   `localStorage.setItem`을 사용하여 업데이트된 데이터를 저장합니다.
            *   오류 발생 시 `console.error`로 기록합니다.
        *   **`connectNodesAction(connection: Connection): void`**:
            *   `getState()`로 현재 `edges` 상태와 `boardSettings`를 가져옵니다.
            *   `addEdge` 유틸리티 함수를 사용하여 새 엣지 객체를 생성합니다.
            *   `applyEdgeSettings` 유틸리티 함수를 사용하여 생성된 엣지에 현재 `boardSettings` (스타일, 마커 등)를 적용합니다.
            *   `set((state) => ({ edges: addEdge(styledEdge, state.edges) }))`를 사용하여 `edges` 상태를 업데이트합니다.
            *   `hasUnsavedChanges`를 true로 설정합니다.
            *   `toast.success`로 연결 성공 알림을 호출합니다.
            *   (옵션) 연결 후 즉시 저장이 필요하면 `saveEdgesAction` 호출 로직을 포함할 수 있습니다.
        *   **`saveEdgesAction(): boolean`**:
            *   `getState()`로 현재 `edges` 상태를 가져옵니다.
            *   `saveEdges` 유틸리티 함수 (이제 `graphUtils`에 있을 수 있음)를 호출하여 엣지 정보를 로컬 스토리지(`EDGES_STORAGE_KEY`)에 저장합니다.
            *   성공 시 `hasUnsavedChanges`를 false로 설정하고 `toast.success` 호출, 실패 시 `toast.error`를 호출합니다.
            *   성공 여부를 반환합니다. (기존 `saveEdges` 로직 이전)
        *   **`updateAllEdgeStylesAction(): void`**: (기존 `updateEdgeStyles` 로직 이전)
            *   `getState()`로 현재 `edges` 상태와 `boardSettings`를 가져옵니다.
            *   `applyEdgeSettings` 유틸리티 함수를 사용하여 모든 엣지에 현재 `boardSettings`를 적용한 `updatedEdges` 배열을 생성합니다.
            *   `set({ edges: updatedEdges })`를 호출하여 `edges` 상태를 업데이트합니다.
            *   `hasUnsavedChanges`를 true로 설정합니다.
            *   `toast.info`로 스타일 업데이트 알림을 호출합니다.

2.  **`src/components/board/hooks/useEdges.ts` 파일 리팩토링:**
    *   `useEdgesState` 훅 사용 부분을 **제거**합니다. (`edges`와 `setEdges`는 `useBoardStore`에서 관리)
    *   `handleEdgesChange` 함수 내부 로직을 `useBoardStore.applyEdgeChangesAction` 호출로 대체합니다. 삭제 시 로컬 스토리지 조작 로직은 액션으로 이동했으므로 제거합니다.
    *   `saveEdges`, `onConnect`, `updateEdgeStyles` 함수를 **제거**합니다.
    *   로컬 스토리지 관련 코드 (`localStorage.setItem`)를 모두 **제거**합니다.
    *   `toast` 호출 부분을 **제거**합니다.
    *   `createEdgeOnDrop` 함수는 상태 변경과 직접 관련이 없으므로 유지하거나, 별도 유틸리티 파일로 옮기는 것을 고려합니다.
    *   훅의 반환 값에서 `edges`, `setEdges`, `handleEdgesChange`, `saveEdges`, `onConnect`, `updateEdgeStyles`를 제거하고, 필요하다면 `createEdgeOnDrop`만 남깁니다. (이 훅 자체가 불필요해질 가능성이 높음)
        ```typescript
        // 리팩토링 후 useEdges 훅 예시 (거의 비어있거나 createEdgeOnDrop만 남음)
        import { /* ... 필요한 타입만 ... */ } from '@xyflow/react';
        // ... 다른 import ...

        export function useEdges(/* ... 필요한 props가 있다면 ... */) {
          // 이 훅은 대부분의 로직이 useBoardStore로 이전되어
          // 더 이상 필요하지 않을 수 있습니다.
          // 만약 createEdgeOnDrop 같은 순수 유틸리티 함수가 필요하다면 남겨둘 수 있습니다.

          const createEdgeOnDrop = useCallback((sourceId: string, targetId: string, boardSettings: BoardSettings): Edge => {
             // 기존 로직 유지 (스타일 적용 등)
             // ...
             const newEdge = { /* ... */ };
             const styledEdge = applyEdgeSettings([newEdge], boardSettings)[0];
             return styledEdge;
          }, []);

          return { createEdgeOnDrop }; // 또는 빈 객체 반환 {}
        }
        ```

3.  **`src/components/board/components/Board.tsx` (또는 관련 컴포넌트) 파일 수정:**
    *   `useEdges` 훅 사용 부분을 제거합니다.
    *   `useBoardStore`에서 `edges`, `applyEdgeChangesAction`, `connectNodesAction`, `saveEdgesAction` 등 필요한 상태와 액션을 가져옵니다.
    *   React Flow 컴포넌트의 `onEdgesChange` prop에 `applyEdgeChangesAction`을 전달합니다.
    *   React Flow 컴포넌트의 `onConnect` prop에 `connectNodesAction`을 전달합니다.
    *   엣지 스타일 업데이트가 필요한 시점 (예: 설정 변경 후)에 `updateAllEdgeStylesAction`을 호출합니다.
    *   레이아웃 저장 버튼 등에서 `saveEdgesAction` (또는 `saveBoardState`) 액션을 호출합니다.

4.  **테스트 코드 업데이트 (`useEdges.test.ts` 또는 관련 테스트):**
    *   `useEdges` 훅 테스트는 제거하거나, `createEdgeOnDrop` 함수 테스트만 남깁니다.
    *   `useBoardStore.test.ts`에 새로 추가/변경된 엣지 관련 액션들(`applyEdgeChangesAction`, `connectNodesAction`, `saveEdgesAction`, `updateAllEdgeStylesAction`, `removeEdgesFromStorage`)에 대한 단위 테스트를 작성합니다.
        *   `applyEdgeChangesAction`: `applyEdgeChanges` 호출 및 상태 업데이트, 삭제 시 관련 로컬 스토리지 정리 로직 호출 검증.
        *   `connectNodesAction`: `addEdge` 호출 및 상태 업데이트, 스타일 적용(`applyEdgeSettings` 호출), 토스트 호출 검증.
        *   `saveEdgesAction`: `localStorage.setItem` 호출, 상태 업데이트, 토스트 호출 검증.
        *   `updateAllEdgeStylesAction`: 상태 업데이트, `applyEdgeSettings` 호출, 토스트 호출 검증.
        *   `removeEdgesFromStorage`: `localStorage.getItem`, `setItem` 호출 및 데이터 정확성 검증.
    *   `Board.tsx` 컴포넌트 테스트에서 `useBoardStore`를 모킹하고, React Flow의 `onEdgesChange`, `onConnect` prop에 올바른 액션이 연결되었는지, UI 인터랙션 시 관련 액션들이 호출되는지 검증합니다.