**핵심 목표:**

*   상태 업데이트 무한 루프 제거 (`Maximum update depth exceeded` 해결)
*   엣지 데이터 로딩 및 UI 렌더링의 일관성 확보
*   `Three-Layer-Standard` 준수 강화 (특히 상태 업데이트 로직 분리)

---

## Tasklist: 엣지 렌더링 및 상태 업데이트 안정화

**규칙:** `Tasklist Micro-Compose` 및 `Three-Layer-Standard` 적용

**선행 작업:**

*   **[Safety Net]** 현재 코드 상태에서 주요 사용자 시나리오(앱 로딩, 아이디어맵 표시, 카드/엣지 생성/삭제)를 커버하는 테스트(통합/E2E)를 실행하여 현재 상태를 기록합니다.

**Phase 1: 상태 업데이트 루프 제거 및 역할 분리**

1.  **Task 1.1:** `useIdeaMapStore`의 `applyEdgeChangesAction` 역할 명확화
    *   **파일:** `src/store/useIdeaMapStore.ts`
    *   **지침:**
        *   `applyEdgeChangesAction` 함수의 목적을 **오직 `applyEdgeChanges` 유틸리티 함수를 사용하여 `edges` 상태를 업데이트하는 것**으로 제한합니다.
        *   함수 내부에 `applyEdgeChanges` 호출 외 다른 부수 효과(side effect)나 상태 업데이트 로직이 있다면 **제거**합니다. (예: 추가적인 `set(...)` 호출, 다른 액션 호출 등)
        *   로그를 추가하여 호출 시점과 적용 전/후 엣지 개수를 확인합니다.
    *   **함수 시그니처:** `applyEdgeChangesAction: (changes: EdgeChange[]) => void;`
    *   **코드 예시:**
        ```typescript
        // src/store/useIdeaMapStore.ts
        import { applyEdgeChanges, EdgeChange, Edge } from '@xyflow/react'; // 필요한 타입 import
        import { StateCreator } from 'zustand'; // StateCreator import
        import createLogger from '@/lib/logger';

        const logger = createLogger('useIdeaMapStore');

        // ... (IdeaMapState 인터페이스 정의) ...
        export interface IdeaMapState {
            // ... other state
            edges: Edge[];
            applyEdgeChangesAction: (changes: EdgeChange[]) => void;
            // ... other actions
        }

        export const createIdeaMapSlice: StateCreator<IdeaMapState /* & 다른 슬라이스들 */, [], [], IdeaMapState> = (set, get) => ({
            // ... other initial state and actions ...
            edges: [], // 초기값

            applyEdgeChangesAction: (changes: EdgeChange[]) => {
                // logger.info('[useIdeaMapStore] applyEdgeChangesAction 호출됨', { changesCount: changes.length }); // 디버깅 로그
                set((state) => {
                    const prevEdgeCount = state.edges.length;
                    const nextEdges = applyEdgeChanges(changes, state.edges); // 오직 applyEdgeChanges 만 사용
                    // logger.info('[useIdeaMapStore] applyEdgeChanges 적용 완료', { prevCount: prevEdgeCount, nextCount: nextEdges.length });
                    return { edges: nextEdges }; // 변경된 edges 상태만 반환
                });
                // 다른 set() 호출이나 액션 호출 금지
            },
            // ...
        });

        ```
    *   **규칙:** `[zustand-action-msw]` (액션 수정), `[store-pure-ui]`
    *   **예상 결과:** `applyEdgeChangesAction` 함수가 순수하게 `edges` 상태만 업데이트하여 루프 발생 가능성 감소.
    *   **테스트 시나리오:**
        1.  (단위 테스트) `useIdeaMapStore.getState().applyEdgeChangesAction(testChanges)`를 호출하고, 스토어의 `edges` 상태가 `applyEdgeChanges(testChanges, initialState)` 결과와 일치하는지 확인합니다. 다른 상태는 변경되지 않아야 합니다.
        2.  (앱 실행) 엣지를 선택하거나 이동할 때 `Maximum update depth exceeded` 에러가 발생하는지 확인합니다. (아직 해결되지 않을 수 있음)

2.  **Task 1.2:** `IdeaMapCanvas`의 `onEdgesChange` 핸들러 단순화
    *   **파일:** `src/components/ideamap/components/IdeaMapCanvas.tsx`
    *   **지침:**
        *   `onEdgesChange` prop으로 전달되는 `handleEdgesChange` 콜백 함수를 찾습니다.
        *   이 함수가 **오직 Task 1.1에서 수정한 `applyEdgeChangesAction`만 호출**하도록 수정합니다. 다른 로직(예: `console.log`, 추가 상태 업데이트 등)이 있다면 제거하거나 주석 처리합니다.
        *   `useCallback`의 의존성 배열이 비어 있거나, `applyEdgeChangesAction`만 포함하도록 합니다 (스토어 액션은 일반적으로 참조가 안정적이므로 빈 배열도 가능).
    *   **함수 시그니처:** `const handleEdgesChange = useCallback((changes: EdgeChange[]) => { ... }, []);`
    *   **코드 예시:**
        ```typescript
        // src/components/ideamap/components/IdeaMapCanvas.tsx
        import { useIdeaMapStore } from '@/store/useIdeaMapStore';
        import { useCallback } from 'react';
        import { EdgeChange } from '@xyflow/react';
        // ...

        function IdeaMapCanvas({ /* ... props ... */ onEdgesChange }: IdeaMapCanvasProps) {
          // ...

          // onEdgesChange prop으로 전달되는 함수 (이름은 다를 수 있음)
          const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
              // logger.info('[IdeaMapCanvas] onEdgesChange 발생', { changesCount: changes.length });
              // 오직 스토어 액션만 호출
              useIdeaMapStore.getState().applyEdgeChangesAction(changes);
              // 다른 로직 없음
          }, []); // 의존성 없음 (또는 applyEdgeChangesAction 추가 가능)

          return (
              <ReactFlow
                  // ... other props
                  onEdgesChange={handleEdgesChange} // 수정된 핸들러 전달
              >
                  {/* ... */}
              </ReactFlow>
          );
        }
        ```
    *   **규칙:** `[layer-separation]` (UI 이벤트 핸들러는 액션 호출만 수행)
    *   **예상 결과:** React Flow의 엣지 변경 이벤트가 발생했을 때 불필요한 로직 없이 Zustand 스토어 상태만 업데이트됨. 무한 루프 문제 해결 가능성 증가.
    *   **테스트 시나리오:**
        1.  앱을 실행하고 엣지를 선택하거나 이동합니다.
        2.  `Maximum update depth exceeded` 에러가 발생하는지 다시 확인합니다. (이 단계에서 해결될 가능성 높음)
        3.  콘솔 로그에서 `handleEdgesChange` 내부의 추가 로직이 실행되지 않는지 확인합니다.

3.  **Task 1.3:** `onConnect` 핸들러에서 낙관적 업데이트 제거 (옵션 A 적용)
    *   **파일:** `src/components/ideamap/components/IdeaMap.tsx` (또는 `useIdeaMapHandlers.ts`)
    *   **지침:**
        *   `onConnect` 콜백 함수를 찾습니다.
        *   함수 내부에서 `setEdges((eds) => addEdge(...))` 또는 `connectNodesAction(...)` 등 **UI에 엣지를 즉시 추가하는 코드 라인을 제거하거나 주석 처리**합니다.
        *   `createEdgeMutation.mutate()` 호출은 유지합니다.
        *   `createEdgeMutation`의 `onError` 콜백에서 롤백 로직이 있다면 제거합니다 (낙관적 업데이트가 없으므로 롤백 불필요).
    *   **코드 예시:** (이전 답변의 "수정 제안" 중 옵션 A 참고)
    *   **규칙:** `[layer-separation]` (UI 이벤트는 뮤테이션 트리거, UI 업데이트는 쿼리 결과 동기화에 의존)
    *   **예상 결과:** 엣지 연결 시 UI에 즉시 엣지가 나타나지 않음. `createEdgeMutation` 성공 후 `useEdges` 쿼리가 리페치되고, 그 결과가 `useEffect` 등을 통해 `IdeaMapStore`의 `edges` 상태에 반영될 때 비로소 UI에 엣지가 그려짐. 무한 루프 문제 해결에 기여.
    *   **테스트 시나리오:**
        1.  두 노드를 연결합니다.
        2.  UI에 엣지가 **바로 나타나지 않는 것**을 확인합니다.
        3.  Network 탭에서 `/api/edges` POST 요청이 성공(201)하는 것을 확인합니다.
        4.  잠시 후 (React Query 리페치 및 상태 업데이트 후) UI에 엣지가 **나타나는 것**을 확인합니다.
        5.  `Maximum update depth exceeded` 에러가 발생하지 않는지 확인합니다.

**Phase 2: 데이터 로딩 및 상태 동기화 시점 명확화**

1.  **Task 2.1:** `useIdeaMapData` 훅에서 데이터 로딩 완료 후 상태 일괄 업데이트
    *   **파일:** `src/hooks/useIdeaMapData.ts`
    *   **지침:**
        *   `useCards`, `useEdges`, `useLayouts`(미구현이지만 추후 추가 가정) 훅을 호출합니다.
        *   세 훅의 로딩 상태(`isCardsLoading`, `isEdgesLoading`, `isLayoutsLoading`)를 모두 추적하여 **전체 로딩 상태(`isLoading`)**를 관리합니다.
        *   세 훅의 데이터 로드가 **모두 성공(`isSuccess`)** 했을 때만 실행되는 `useEffect`를 작성합니다.
        *   이 `useEffect` 내부에서 다음을 수행합니다:
            *   카드 데이터(`cardsData`)와 레이아웃 데이터(`layoutsData` - 현재는 localStorage에서 가져오거나 임시 처리)를 조합하여 최종 `nodes` 배열을 만듭니다.
            *   엣지 데이터(`edgesData`)를 사용합니다 (이미 Flow 형식).
            *   `useIdeaMapStore.getState().setNodes(finalNodes)` 와 `useIdeaMapStore.getState().setEdges(flowEdgesData)`를 **함께 호출**하여 상태를 한 번에 업데이트합니다. (또는 `initializeMap(finalNodes, flowEdgesData)` 같은 통합 액션 생성)
        *   기존에 `useIdeaMapSync`나 다른 `useEffect`에서 개별적으로 `setNodes`/`setEdges`를 호출하던 로직을 **제거하거나 비활성화**합니다.
    *   **함수 시그니처:** `useIdeaMapData` 훅 내부 로직 수정.
    *   **코드 예시:**
        ```typescript
        // src/hooks/useIdeaMapData.ts
        import { useCards } from '@/hooks/useCards';
        import { useEdges } from '@/hooks/useEdges';
        // import { useLayouts } from '@/hooks/useLayouts'; // 추후 추가
        import { useAppStore, selectActiveProjectId } from '@/store/useAppStore';
        import { useAuthStore, selectUserId } from '@/store/useAuthStore';
        import { useIdeaMapStore } from '@/store/useIdeaMapStore';
        import { useEffect, useState } from 'react';
        import { Node, Edge } from '@xyflow/react';
        import { CardData } from '@/components/ideamap/types/ideamap-types';
        import { loadLayoutData } from '@/components/ideamap/utils/ideamap-storage'; // localStorage 로딩 함수 (임시)

        export function useIdeaMapData(/* ... */) {
            const userId = useAuthStore(selectUserId);
            const activeProjectId = useAppStore(selectActiveProjectId);
            const { setNodes, setEdges, syncCardsWithNodes } = useIdeaMapStore(state => ({
                 setNodes: state.setNodes,
                 setEdges: state.setEdges,
                 syncCardsWithNodes: state.syncCardsWithNodes, // sync 함수 가져오기
            }));

            // 각 데이터 훅 호출
            const { data: cardsData, isLoading: isCardsLoading, isSuccess: isCardsSuccess, error: cardsError } = useCards({ projectId: activeProjectId });
            const { data: edgesData, isLoading: isEdgesLoading, isSuccess: isEdgesSuccess, error: edgesError } = useEdges(userId, activeProjectId);
            // const { data: layoutsData, isLoading: isLayoutsLoading, isSuccess: isLayoutsSuccess, error: layoutsError } = useLayouts(userId, activeProjectId); // 추후 레이아웃 훅

            // 전체 로딩 상태 계산
            const isLoading = isCardsLoading || isEdgesLoading /* || isLayoutsLoading */;
            const isSuccess = isCardsSuccess && isEdgesSuccess /* && isLayoutsSuccess */;
            const error = cardsError || edgesError /* || layoutsError */;

            // 데이터 로딩 완료 시 상태 일괄 업데이트
            useEffect(() => {
                if (isSuccess && cardsData && edgesData /* && layoutsData */) {
                    logger.info('[useIdeaMapData] All data fetched successfully. Updating Zustand store.');

                    // 1. 레이아웃 데이터 가져오기 (현재는 localStorage, 추후 layoutsData 사용)
                    const nodeLayouts = loadLayoutData(); // 임시 로컬 스토리지 로딩 함수

                    // 2. 노드 생성 (카드 + 레이아웃)
                    const finalNodes = syncCardsWithNodes(cardsData, nodeLayouts); // sync 함수 사용

                    // 3. 스토어 상태 일괄 업데이트
                    // setNodes/setEdges 를 동시에 호출하거나 통합 액션 사용
                    useIdeaMapStore.setState({ nodes: finalNodes, edges: edgesData });
                    logger.info('[useIdeaMapData] Nodes and Edges state updated in Zustand store.', { nodeCount: finalNodes.length, edgeCount: edgesData.length});

                } else if (error) {
                     logger.error('[useIdeaMapData] Error fetching data:', error);
                     // 에러 처리 (예: 스토어 초기화, 에러 상태 설정)
                     useIdeaMapStore.setState({ nodes: [], edges: [] });
                }
            // cardsData, edgesData 등의 참조 안정성 주의 (useMemo 등 활용 고려)
            }, [isSuccess, cardsData, edgesData, /* layoutsData, */ setNodes, setEdges, syncCardsWithNodes, error]);

            return { isLoading, error }; // 이 훅은 로딩/에러 상태만 반환해도 됨
        }
        ```
    *   **규칙:** `[layer-separation]`, `[tanstack-query-msw]`
    *   **예상 결과:** 카드와 엣지 데이터 로딩이 완료된 후 한 번에 Zustand 스토어가 업데이트되어 React Flow에 반영됨. 엣지가 간헐적으로 보이지 않는 문제 해결.
    *   **테스트 시나리오:**
        1.  앱 로드 시 Network 탭에서 카드와 엣지 API 호출이 모두 성공하는지 확인합니다.
        2.  React Query DevTools에서 관련 쿼리가 `success` 상태가 되는 것을 확인합니다.
        3.  Zustand DevTools에서 `nodes`와 `edges` 상태가 거의 동시에 업데이트되는지 확인합니다.
        4.  UI에 노드와 엣지가 항상 함께, 일관되게 표시되는지 확인합니다.

**Phase 4: 최종 테스트 및 검증**

1.  **Task 4.1:** E2E 시나리오 테스트 및 회귀 검증
    *   **파일:** 통합/E2E 테스트 코드
    *   **지침:** 앱 로딩, 엣지 생성, 엣지 삭제, (가능하면) 프로젝트 전환 등 주요 기능을 테스트하고, 이전에 발생했던 에러(무한 루프, 엣지 미표시)가 해결되었는지 확인합니다. 선행 작업의 Safety Net 테스트를 실행합니다.
    *   **예상 결과:** 모든 기능이 정상 작동하고 에러가 발생하지 않음.

---

이 Tasklist는 문제의 근본 원인으로 추정되는 상태 업데이트 루프와 데이터 동기화 시점 문제를 해결하는 데 초점을 맞춥니다. 특히 Phase 1에서 상태 업데이트 로직을 단순화하고 역할을 분리하는 것이 중요하며, Phase 2에서 데이터 로딩 완료 후 상태를 일괄 업데이트하여 UI 일관성을 확보하는 것을 목표로 합니다.