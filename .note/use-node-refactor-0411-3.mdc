---
description: 
globs: 
alwaysApply: false
---
**목표:** `useNodes` 훅에서 직접 수행하던 노드 상태 관리(추가, 변경, 삭제), 로컬 스토리지 상호작용, 토스트 알림 로직을 `useBoardStore`의 액션으로 이전하여 관심사를 분리하고, 훅의 역할을 단순화하거나 제거합니다.

---

**리팩토링 계획: `useNodes.ts`**

**현재 상태 분석:**

*   `useNodes` 훅은 React Flow의 `useNodesState`를 사용하여 `nodes` 상태와 `setNodes` 함수를 관리합니다.
*   `handleNodesChange`: React Flow의 `applyNodeChanges`를 사용하여 노드 변경사항(위치, 크기, 삭제 등)을 `nodes` 상태에 적용합니다.
    *   노드 삭제 시(`type === 'remove'`) 로컬 스토리지(`STORAGE_KEY`, `EDGES_STORAGE_KEY`)에서 해당 노드 및 관련 엣지 정보를 직접 제거하는 Side Effect를 수행합니다.
*   `saveNodes`: 현재 `nodes` 상태의 위치 정보를 로컬 스토리지(`STORAGE_KEY`)에 직접 저장하는 Side Effect를 수행합니다.
*   `addNode`: 새로운 노드 객체를 생성하고 `setNodes`를 호출하여 상태를 직접 변경하며, `saveNodes`를 호출하여 저장합니다.
*   `deleteNode`: 특정 노드를 `nodes` 상태에서 제거하고 로컬 스토리지에서도 제거하며, 관련 엣지 정보도 로컬 스토리지에서 제거합니다. `toast` 알림을 직접 호출합니다.
*   `handleNodeClick`: 노드 클릭 시 `useAppStore`의 액션(`toggleSelectedCard`, `selectCard`)을 호출하고, 더블 클릭 시 콜백을 호출합니다. (이 부분은 UI 로직으로 훅에 남아있어도 괜찮을 수 있음)
*   `handlePaneClick`: 빈 공간 클릭 시 `useAppStore`의 `clearSelectedCards` 액션을 호출합니다. (UI 로직)

**리팩토링 원칙 위반 사항:**

*   `handleNodesChange` (삭제 시), `saveNodes`, `addNode`, `deleteNode` 함수 내에서 로컬 스토리지(Side Effect)를 직접 조작합니다.
*   `addNode`, `deleteNode` 함수에서 상태(`nodes`)를 직접 변경합니다.
*   `deleteNode` 함수에서 `toast` 알림을 직접 호출합니다.
*   노드 관련 상태(`nodes`, `setNodes`)와 액션 로직이 훅 내부에 혼재되어 있습니다.

**리팩토링 목표:**

1.  노드 추가(`addNode`), 삭제(`deleteNode`), 저장(`saveNodes`) 로직과 관련된 상태 업데이트 및 로컬 스토리지 조작을 `useBoardStore`의 액션으로 이전합니다.
2.  `handleNodesChange` 핸들러는 React Flow의 변경사항 적용 역할만 하도록 단순화하고, 삭제 시 발생하는 로컬 스토리지 조작 Side Effect는 별도의 액션(또는 삭제 액션 내부)으로 옮깁니다.
3.  `useNodes` 훅은 제거하거나, 클릭 이벤트 핸들러(`handleNodeClick`, `handlePaneClick`)와 같이 순수 UI 인터랙션 관련 로직만 남겨두는 형태로 단순화합니다. (상태 관리는 `useBoardStore`에서 직접 수행)
4.  `toast` 알림 호출은 해당 로직을 처리하는 액션 내부로 이동합니다.

**세부 리팩토링 태스크 (Cursor Agent 용):**

1.  **`src/store/useBoardStore.ts` 파일 수정:**
    *   **액션 정의 및 구현:** `BoardState` 인터페이스에 다음 액션들을 추가하고 구현합니다.
        *   **`applyNodeChangesAction(changes: NodeChange[]): void`**:
            *   `applyNodeChanges` 유틸리티를 사용하여 `nodes` 상태를 업데이트합니다 (`set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }))`).
            *   `changes` 배열에서 `type === 'remove'` 인 변경사항을 찾습니다.
            *   삭제된 노드가 있다면, `removeNodesAndRelatedEdgesFromStorage` 액션(아래 정의)을 호출하여 로컬 스토리지에서도 제거합니다.
            *   변경사항 발생 시 `hasUnsavedChanges`를 true로 설정합니다.
        *   **`removeNodesAndRelatedEdgesFromStorage(deletedNodeIds: string[]): void`**: (새로운 내부 액션 또는 `deleteNodeAction`의 일부)
            *   `STORAGE_KEY`에서 `deletedNodeIds`에 해당하는 노드 위치 정보를 제거합니다.
            *   `EDGES_STORAGE_KEY`에서 `deletedNodeIds`를 `source` 또는 `target`으로 가지는 엣지를 제거합니다.
            *   `localStorage.setItem`을 사용하여 업데이트된 데이터를 저장합니다.
            *   오류 발생 시 `console.error`로 기록합니다.
        *   **`addNodeAction(newNodeData: Omit<Node<CardData>, 'id' | 'position'> & { position?: XYPosition }): Promise<Node<CardData> | null>`**:
            *   `useBoardHandlers`에서 리팩토링한 `addNodeAtPosition`과 유사하게 구현합니다. 새 노드를 `nodes` 상태에 추가하고, `hasUnsavedChanges`를 true로 설정합니다.
            *   성공 시 `toast.success` 호출, 실패 시 `toast.error` 호출 로직을 포함합니다.
            *   (옵션) 추가 후 즉시 저장이 필요하면 `saveNodesAction` 호출 로직을 포함할 수 있습니다.
            *   생성된 노드 객체 또는 null을 반환합니다.
        *   **`deleteNodeAction(nodeId: string): void`**:
            *   `nodes` 상태에서 `nodeId`에 해당하는 노드를 제거합니다 (`set((state) => ({ nodes: state.nodes.filter(n => n.id !== nodeId) }))`).
            *   `edges` 상태에서 해당 노드와 연결된 엣지를 제거합니다 (`set((state) => ({ edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId) }))`).
            *   `removeNodesAndRelatedEdgesFromStorage([nodeId])` 액션을 호출하여 로컬 스토리지 데이터를 정리합니다.
            *   `hasUnsavedChanges`를 true로 설정합니다.
            *   `toast.success`로 삭제 완료 알림을 호출합니다. (실패 처리는 `removeNodesAndRelatedEdgesFromStorage` 내부에 있을 수 있음)
        *   **`saveNodesAction(): boolean`**:
            *   `getState()`로 현재 `nodes` 상태를 가져옵니다.
            *   `saveLayout` 유틸리티 함수 (이제 `graphUtils`에 있을 수 있음)를 호출하여 노드 위치를 로컬 스토리지(`STORAGE_KEY`)에 저장합니다.
            *   성공 시 `hasUnsavedChanges`를 false로 설정하고 `toast.success` 호출, 실패 시 `toast.error`를 호출합니다.
            *   성공 여부를 반환합니다. (기존 `saveNodes` 로직 이전)

2.  **`src/components/board/hooks/useNodes.ts` 파일 리팩토링:**
    *   `useNodesState` 훅 사용 부분을 **제거**합니다. (`nodes`와 `setNodes`는 `useBoardStore`에서 관리)
    *   `handleNodesChange` 함수 내부 로직을 `useBoardStore.applyNodeChangesAction` 호출로 대체합니다.
    *   `saveNodes`, `addNode`, `deleteNode` 함수를 **제거**합니다.
    *   로컬 스토리지 관련 코드 (`localStorage.getItem`, `setItem`, `removeItem`)를 모두 **제거**합니다.
    *   `toast` 호출 부분을 **제거**합니다.
    *   `handleNodeClick`, `handlePaneClick` 함수는 유지하되, `useAppStore` 액션 호출 부분은 그대로 둡니다. (이들은 UI 상호작용 핸들러 역할)
    *   훅의 반환 값에서 `nodes`, `setNodes`, `handleNodesChange`, `saveNodes`, `addNode`, `deleteNode`를 제거하고, `handleNodeClick`, `handlePaneClick`만 남기거나, 이 핸들러들도 `Board` 컴포넌트로 옮기고 훅 자체를 제거하는 것을 고려합니다.
        ```typescript
        // 리팩토링 후 useNodes 훅 예시 (클릭 핸들러만 남김)
        import { useCallback } from 'react';
        import { NodeMouseHandler, Node } from '@xyflow/react'; // 또는 board-types 에서 가져오기
        import { useAppStore } from '@/store/useAppStore';
        import { CardData } from '../types/board-types';

        export function useNodeClickHandlers({ onNodeDoubleClick }: { onNodeDoubleClick?: (node: Node<CardData>) => void }) {
          const { toggleSelectedCard, selectCard, clearSelectedCards } = useAppStore();

          const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
            if (event.detail === 2 && onNodeDoubleClick) { // 더블 클릭
              onNodeDoubleClick(node as Node<CardData>);
            } else { // 단일 클릭
              if (event.ctrlKey || event.metaKey) {
                toggleSelectedCard(node.data.id); // 다중 선택 (토글)
              } else {
                selectCard(node.data.id); // 단일 선택
              }
            }
          }, [onNodeDoubleClick, toggleSelectedCard, selectCard]);

          const handlePaneClick = useCallback(() => {
            clearSelectedCards(); // 빈 공간 클릭 시 선택 해제
          }, [clearSelectedCards]);

          return { handleNodeClick, handlePaneClick };
        }
        ```

3.  **`src/components/board/components/Board.tsx` (또는 관련 컴포넌트) 파일 수정:**
    *   `useNodes` 훅 사용 부분을 제거하거나 `useNodeClickHandlers` (위 예시처럼 변경했다면) 호출로 수정합니다.
    *   `useBoardStore`에서 `nodes`, `edges`, `applyNodeChangesAction`, `addNodeAction`, `deleteNodeAction`, `saveNodesAction` 등 필요한 상태와 액션을 가져옵니다.
    *   React Flow 컴포넌트의 `onNodesChange` prop에 `applyNodeChangesAction`을 전달합니다.
    *   노드 추가/삭제가 필요한 UI (예: 툴바 버튼, 컨텍스트 메뉴)에서 해당 액션(`addNodeAction`, `deleteNodeAction`)을 호출합니다.
    *   레이아웃 저장 버튼 등에서 `saveNodesAction` (또는 `saveBoardState`) 액션을 호출합니다.

4.  **테스트 코드 업데이트 (`useNodes.test.ts` 또는 관련 테스트):**
    *   `useNodes` 훅 테스트는 `useNodeClickHandlers` 테스트로 변경하거나 제거합니다. 클릭 핸들러 테스트에서는 `useAppStore`의 액션(`toggleSelectedCard`, `selectCard`, `clearSelectedCards`)이 올바르게 호출되는지 검증합니다.
    *   `useBoardStore.test.ts`에 새로 추가/변경된 노드 관련 액션들(`applyNodeChangesAction`, `addNodeAction`, `deleteNodeAction`, `saveNodesAction`, `removeNodesAndRelatedEdgesFromStorage`)에 대한 단위 테스트를 작성합니다.
        *   `applyNodeChangesAction`: `applyNodeChanges` 호출 및 상태 업데이트, 삭제 시 `removeNodes...` 호출 검증.
        *   `addNodeAction`: 상태 업데이트, 토스트 호출 검증.
        *   `deleteNodeAction`: 상태 업데이트, `removeNodes...` 호출, 토스트 호출 검증.
        *   `saveNodesAction`: `localStorage.setItem` 호출, 상태 업데이트, 토스트 호출 검증.
        *   `removeNodes...`: `localStorage.getItem`, `setItem` 호출 및 데이터 정확성 검증.
    *   `Board.tsx` 컴포넌트 테스트에서 `useBoardStore`를 모킹하고, React Flow의 `onNodesChange` prop에 올바른 액션이 연결되었는지, UI 인터랙션 시 관련 액션들이 호출되는지 검증합니다.
