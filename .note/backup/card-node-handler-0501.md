**목표:** `Edge` 모델의 `sourceHandle`과 `targetHandle` 필드에 실제 핸들 ID 값을 저장하고 불러오는 로직을 구현

**구현 원칙:**

1.  **핸들 ID 생성 주체:** React Flow는 사용자가 엣지 연결을 완료할 때 `onConnect` 콜백의 `connection` 객체에 `sourceHandle`과 `targetHandle` 속성으로 해당 핸들의 `id` 값을 제공합니다. (이 `id`는 우리가 `<Handle id="...">` prop으로 지정한 값입니다.)
2.  **저장 주체:** 엣지 생성 시(`useCreateEdge` 뮤테이션), `connection` 객체에서 받은 `sourceHandle`과 `targetHandle` 값을 **`Edge` 레코드의 해당 컬럼에 저장**합니다.
3.  **로드 및 적용 주체:** 엣지 목록을 불러올 때(`useEdges` 쿼리), DB에서 `sourceHandle`과 `targetHandle` 값을 함께 가져옵니다. 이 정보가 포함된 엣지 배열을 `<ReactFlow>` 컴포넌트의 `edges` prop으로 전달하면, React Flow가 **자동으로** 해당 핸들 ID를 사용하여 올바른 위치에 엣지를 연결해 줍니다.

**구현을 위한 Tasklist:**

*   **Phase 1: `<Handle>` 컴포넌트에 ID 부여 (선행 작업 확인)**
    *   **Task 1.1: `CardNode.tsx` 검토**
        *   **파일:** `src/components/ideamap/nodes/CardNode.tsx`
        *   **Action:** 컴포넌트 내부에 렌더링되는 모든 `<Handle>` 컴포넌트에 **고유하고 의미 있는 `id` prop이 부여되어 있는지 확인**합니다. 핸들이 여러 개라면 각 핸들마다 다른 `id`가 있어야 합니다.
        *   **예시:**
            ```jsx
            // CardNode.tsx 내부 예시
            <Handle type="source" position={Position.Right} id="right-source" />
            <Handle type="target" position={Position.Left} id="left-target" />
            <Handle type="source" position={Position.Bottom} id="bottom-source" />
            <Handle type="target" position={Position.Top} id="top-target" />
            ```
        *   **수정:** 만약 `id` prop이 없거나 중복된다면, 각 핸들을 구분할 수 있도록 고유한 ID를 추가/수정합니다.

*   **Phase 2: 엣지 생성 시 핸들 ID 저장 로직 추가**
    *   **Task 2.1: `onConnect` 핸들러 수정**
        *   **파일:** `src/components/ideamap/components/IdeaMap.tsx` (또는 `onConnect` 핸들러가 정의된 곳)
        *   **Action:** `onConnect` 콜백 함수 내부에서 `useCreateEdge().mutate()` 를 호출할 때, 전달하는 `edgeInput` 객체에 `connection.sourceHandle`과 `connection.targetHandle` 값을 **포함**하도록 수정합니다.
            ```typescript
            // onConnect 내부 예시
            const edgeInput = {
              sourceNodeId: connection.source, // CardNode ID
              targetNodeId: connection.target, // CardNode ID
              projectId: activeProjectId,
              sourceHandle: connection.sourceHandle, // 핸들 ID 추가
              targetHandle: connection.targetHandle, // 핸들 ID 추가
              // ... 기타 필요한 정보 (type, animated 등) ...
            };
            createEdgeMutation.mutate(edgeInput);
            ```

    *   **Task 2.2: `useCreateEdge` 훅 수정**
        *   **파일:** `src/hooks/useEdges.ts` (또는 관련 훅 파일)
        *   **Action:** `useCreateEdge` 뮤테이션 훅의 입력 타입 (예: `CreateEdgeInput`)에 `sourceHandle?: string;` 과 `targetHandle?: string;` 필드가 포함되어 있는지 확인하고, 없다면 추가합니다.
        *   **Action:** `mutationFn` 내부에서 `edgeService.createEdgeAPI`를 호출할 때 전달하는 `apiInput` 객체에 `sourceHandle`과 `targetHandle` 값이 포함되도록 수정합니다.
        *   **Action:** **낙관적 업데이트(`onMutate`) 수정:** 캐시에 임시 엣지를 추가할 때 생성하는 `optimisticEdge` 객체에도 `sourceHandle`과 `targetHandle` 값을 포함시킵니다. 이것이 UI에 즉시 올바른 핸들로 연결된 것처럼 보이게 하는 데 중요합니다.
            ```typescript
            // onMutate 내부 예시 (낙관적 업데이트)
            const optimisticEdge: FlowEdge = { // FlowEdge 타입 사용
              id: tempId,
              source: newEdgeData.sourceNodeId, // CardNode ID 사용
              target: newEdgeData.targetNodeId, // CardNode ID 사용
              sourceHandle: newEdgeData.sourceHandle, // 핸들 ID 포함
              targetHandle: newEdgeData.targetHandle, // 핸들 ID 포함
              // ... 기타 속성 ...
            };
            queryClient.setQueryData<FlowEdge[]>(queryKey, (old = []) => [...old, optimisticEdge]);
            ```

    *   **Task 2.3: `edgeService.createEdgeAPI` 수정**
        *   **파일:** `src/services/edgeService.ts`
        *   **Action:** `createEdgeAPI` 함수가 API 요청 본문(body)에 `sourceHandle`과 `targetHandle` 필드를 (값이 있을 경우) 포함하여 전송하도록 수정합니다.

    *   **Task 2.4: `POST /api/cardnodes` API 핸들러 수정**
        *   **파일:** `/api/cardnodes/route.ts` (또는 관련 API 파일)
        *   **Action:** `POST` 핸들러 함수가 요청 본문에서 `sourceHandle`과 `targetHandle` 값을 받아서 `prisma.edge.create` 호출 시 `data` 객체에 포함시키도록 수정합니다. Prisma는 이를 자동으로 DB의 `source_handle`, `target_handle` 컬럼에 매핑합니다.

*   **Phase 3: 엣지 로드 시 핸들 ID 사용 확인**
    *   **Task 3.1: `GET /api/cardnodes` API 핸들러 확인**
        *   **파일:** `/api/cardnodes/route.ts` (또는 관련 API 파일)
        *   **Action:** `GET` 핸들러가 `prisma.edge.findMany` 호출 시 `sourceHandle` 및 `targetHandle` 필드를 **포함하여** 조회하고 응답하는지 확인합니다. (기본적으로 Prisma는 모든 스칼라 필드를 가져오므로 별도 수정이 필요 없을 수 있습니다.)
    *   **Task 3.2: `useEdges` 훅 확인**
        *   **파일:** `src/hooks/useEdges.ts`
        *   **Action:** `useEdges` 훅의 `queryFn` 내부에서 API로부터 받은 엣지 데이터에 `sourceHandle`과 `targetHandle`이 포함되어 있는지 확인합니다. `transformDbEdgeToFlowEdge` 함수가 필요하다면 해당 필드도 변환 결과에 포함하는지 확인합니다 (단, 필드 이름이 같다면 보통 자동 매핑됨). 최종적으로 반환되는 `Edge[]` 배열의 각 엣지 객체에 해당 속성이 있는지 확인합니다.
    *   **Task 3.3: React Flow 렌더링 확인 (간접적)**
        *   **파일:** `src/components/ideamap/components/IdeaMapCanvas.tsx`
        *   **Action:** `<ReactFlow>` 컴포넌트에 전달되는 `edges` prop 배열에 `sourceHandle`과 `targetHandle` 정보가 포함되어 있으면, React Flow는 **자동으로** 해당 핸들을 사용하여 엣지를 그립니다. 별도의 설정은 필요 없습니다.

**결과 보고:**

*   각 Task별 코드 변경 사항 (특히 `<Handle>` ID 확인, `onConnect`, `useCreateEdge`, 서비스, API 수정 내용)을 요약하여 보고해 주세요.
*   이제 엣지를 생성하면 `sourceHandle`과 `targetHandle` ID가 DB에 저장되고, 맵을 다시 로드할 때 이 정보를 사용하여 엣지가 정확한 핸들 위치에 연결될 것임을 확인해 주세요.

---

이 Tasklist를 통해 엣지의 핸들 연결 정보를 DB에 안정적으로 저장하고 로드 시 활용하여 시각적 일관성을 확보할 수 있을 것입니다. 특히 Phase 1의 `<Handle>` ID 확인이 선행되어야 Phase 2의 데이터 저장이 의미가 있습니다.