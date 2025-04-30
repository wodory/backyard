**목표:** `IdeaMapCanvas.tsx`의 `useEffect` 훅으로 인해 발생하는 엣지 상태 업데이트 무한 루프 버그 수정 (`@three-layer-standard` 준수)

**핵심 문제:** `IdeaMapCanvas.tsx` 내의 `useEffect` 훅이 Zustand 스토어의 `edges` 상태에 의존하면서 동시에 React Flow 인스턴스의 `setEdges`를 호출하여 상태 업데이트 루프를 유발합니다. 이는 컴포넌트(UI) 계층에서 직접 상태를 조작하려 하여 `[layer-separation]` 규칙을 위반할 소지가 있습니다.

**해결 방향:**
1.  문제를 유발하는 `useEffect` 훅 제거 또는 수정.
2.  엣지 스타일링(`applyIdeaMapEdgeSettings` 관련)은 상태 업데이트 루프를 유발하지 않는 방식으로 적용합니다. React Flow의 선언적(declarative) 방식을 활용합니다.
    *   **옵션 A:** `CustomEdge.tsx` 컴포넌트 내부에서 `ideaMapSettings`를 읽어 스타일을 적용.
    *   **옵션 B:** `useIdeaMapStore.ts`에서 `edges` 상태를 업데이트할 때 스타일 정보까지 포함하여 저장.
    *   **옵션 C:** `IdeaMapCanvas.tsx`의 `ReactFlow` 컴포넌트에 `defaultEdgeOptions` prop을 활용 (설정이 동적이지 않은 경우).

**선행 테스트 강화 (Safety Net):** 이전 계획과 동일하게, 버그 수정 후 기능 회귀를 방지하기 위해 엣지 클릭 및 상태 변경을 검증하는 테스트 코드를 추가합니다.

---

**IMPLEMENTATION CHECKLIST:**

1.  **파일:** `src/components/ideamap/components/IdeaMapCanvas.tsx`
    *   **변경 지침:** `edges`를 의존성으로 가지며 `reactFlowInstance.current.setEdges()`를 호출하는 `useEffect` 훅을 **제거**합니다. 이 훅은 `applyEdgeChangesAction`을 통해 `edges` 상태가 변경될 때마다 불필요하게 실행되어 루프를 유발하는 주요 원인입니다.
    *   **함수 시그니처 (제거 대상):**
        ```typescript
        // 제거 대상 useEffect 훅
        useEffect(() => {
          if (edges.length > 0) {
            const updatedEdges = applyIdeaMapEdgeSettings(edges, ideaMapSettings);
            if (reactFlowInstance.current) {
              // 이 부분이 루프를 유발하므로 제거
              // reactFlowInstance.current.setEdges(updatedEdges);
              // logger.info('엣지 스타일 업데이트 완료 (ReactFlow 인스턴스에 직접 적용)');
            }
          }
        }, [
          // ... ideaMapSettings 관련 의존성 ...
          edges // <--- 이 의존성 때문에 루프 발생
        ]);
        ```
    *   **Import 경로 명시:** 변경 없음.
    *   **규칙 명시:** `[layer-separation]` (UI 컴포넌트가 상태 변경 후 직접 DOM/인스턴스를 조작하는 로직 제거).
    *   **예상 결과:** 무한 루프의 직접적인 원인인 `useEffect` 훅이 제거됨. 엣지 클릭 시 더 이상 무한 루프가 발생하지 않음. (단, 엣지 스타일링이 일시적으로 적용되지 않을 수 있음 - 다음 단계에서 해결).

2.  **파일:** `src/components/ideamap/components/CustomEdge/CustomEdge.tsx` 및 `src/store/useIdeaMapStore.ts`
    *   **변경 지침 (조사 및 결정):** 제거된 `useEffect`가 수행하던 엣지 스타일링(`applyIdeaMapEdgeSettings` 사용)을 대체할 방법을 결정합니다.
        *   **조사 1:** `applyIdeaMapEdgeSettings` 함수의 역할과 반환 값을 확인합니다. (엣지 객체에 `style`, `markerEnd` 등의 속성을 추가하는 역할로 추정)
        *   **조사 2:** `ideaMapSettings`가 `useIdeaMapStore`에서 관리되는지, 아니면 props로 전달되는지 확인합니다.
        *   **결정:** 조사 결과를 바탕으로 **옵션 A, B, C** 중 가장 적합한 스타일링 적용 방식을 선택합니다.
            *   `CustomEdge.tsx` 내에서 `ideaMapSettings`를 직접 읽어 스타일링하는 것이 가장 일반적인 React 방식일 수 있습니다 (`[layer-separation]` 준수).
    *   **관련 파일 읽기:** 이 단계에서는 코드 수정 없이, `applyIdeaMapEdgeSettings` 함수 정의, `CustomEdge.tsx` 컴포넌트 구조, `useIdeaMapStore.ts`의 `ideaMapSettings` 관련 상태/액션을 확인합니다.
    *   **규칙 명시:** `[store-pure-ui]` (Zustand는 UI 상태만), `[layer-separation]`
    *   **예상 결과:** 엣지 스타일을 적용하기 위한 최적의 위치와 방법을 결정함.

3.  **파일:** (Task 2 결정에 따라) `src/components/ideamap/components/CustomEdge/CustomEdge.tsx` **또는** `src/store/useIdeaMapStore.ts` **또는** `src/components/ideamap/components/IdeaMapCanvas.tsx`
    *   **변경 지침:** Task 2에서 결정된 방식에 따라 엣지 스타일링 로직을 구현합니다.
        *   **옵션 A 선택 시:** `CustomEdge.tsx` 내에서 `useIdeaMapStore` 훅 등을 사용하여 `ideaMapSettings`를 가져오고, 이를 기반으로 `BaseEdge` 또는 `EdgeLabelRenderer` 등에 필요한 `style`, `markerEnd` 등을 계산하여 적용합니다. `applyIdeaMapEdgeSettings` 유틸리티를 재사용할 수 있습니다.
        *   **옵션 B 선택 시:** `useIdeaMapStore.ts`의 엣지 관련 액션(`setEdgesAction` 또는 `applyEdgeChangesAction` 등) 내부에서 `applyIdeaMapEdgeSettings`를 호출하여 스타일 정보가 포함된 엣지 데이터를 저장하도록 수정합니다.
        *   **옵션 C 선택 시:** `IdeaMapCanvas.tsx`의 `<ReactFlow>` 컴포넌트에 `defaultEdgeOptions` prop을 설정합니다. (이 옵션은 `ideaMapSettings`가 거의 변경되지 않을 때 적합)
    *   **함수 시그니처 (수정 대상):** Task 2 결정에 따라 해당 파일의 관련 함수/컴포넌트.
    *   **Import 경로 명시:** 필요시 `useIdeaMapStore`, `applyIdeaMapEdgeSettings` 등 import 추가.
    *   **규칙 명시:** `[layer-separation]`, `[store-pure-ui]`
    *   **예상 결과:** 제거된 `useEffect`의 기능을 대체하여 엣지 스타일이 정상적으로 적용됨. 상태 업데이트 루프 없이 스타일링이 반영됨.

4.  **파일:** `src/components/ideamap/components/__tests__/IdeaMapCanvas.interactions.test.tsx` (신규 생성 또는 기존 파일 수정)
    *   **변경 지침:** 이전 계획과 동일. 엣지 클릭 시 무한 루프가 발생하지 않고, 엣지 스타일도 (Task 3 완료 후) 정상적으로 적용되는지 검증하는 통합 테스트 추가.
    *   **함수 시그니처 (신규 테스트 케이스):**
        ```typescript
        it('엣지를 클릭해도 무한 업데이트 루프가 발생하지 않고 스타일이 유지된다', async () => {
          // 1. 테스트 환경 설정 (React Flow Provider, Store Provider 등)
          // 2. 초기 노드 및 엣지 렌더링 (특정 ideaMapSettings 적용 상태)
          // 3. 렌더링된 엣지의 초기 스타일 확인 (예: 색상, 두께)
          // 4. userEvent.click()을 사용하여 엣지 클릭
          // 5. await waitFor() 등을 사용하여 상태 안정화 확인 (예: applyEdgeChangesAction 호출 횟수)
          // 6. 클릭 후에도 엣지 스타일이 유지되는지 다시 확인
          // 7. 콘솔 에러 로그(Maximum update depth exceeded) 없는지 확인
        });
        ```
    *   **Import 경로 명시:** `@testing-library/react`, `user-event`, `vitest`, 관련 컴포넌트, 스토어, 유틸리티.
    *   **규칙 명시:** `package.json` 테스트 규칙 준수.
    *   **예상 결과:** 엣지 클릭 관련 버그 수정 및 스타일링 적용을 검증하는 테스트 케이스 추가. 기능 회귀 방지.

---

이제 이 수정된 Tasklist에 따라 진행하시겠습니까? 첫 번째 태스크부터 시작합니다. (Task 1: `useEffect` 훅 제거)
