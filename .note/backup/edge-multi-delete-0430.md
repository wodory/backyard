**Cursor Agent를 위한 Tasklist: 엣지 동시/다중 삭제 처리**

**목표:** 사용자가 React Flow 캔버스에서 여러 엣지를 동시에 선택하고 삭제할 때 (예: Delete 키 누름), 모든 선택된 엣지가 UI와 DB에서 정상적으로 삭제되도록 기능을 구현하고 관련 로직(낙관적 업데이트 포함)을 수정합니다.

**Task 1: `onEdgesChange` 핸들러 분석 및 수정**

1.  **파일 찾기:** `onEdgesChange` prop을 `<ReactFlow>` 컴포넌트에 전달하는 핸들러 함수를 찾습니다. (주요 예상 파일: `src/components/ideamap/components/IdeaMapCanvas.tsx` 또는 관련 커스텀 훅)
2.  **로직 분석:** 현재 이 핸들러가 `EdgeChange` 배열을 어떻게 처리하는지 분석합니다. 특히 `type === 'remove'`인 변경 사항을 어떻게 다루는지 확인합니다.
3.  **수정:**
    *   핸들러 로직을 수정하여, 전달된 `changes` 배열에서 `type === 'remove'`인 **모든** `EdgeChange` 객체를 식별하고, 해당 엣지들의 ID를 **하나의 배열** (`deletedEdgeIds`)로 수집하도록 변경합니다.
    *   수집된 `deletedEdgeIds` 배열이 비어있지 않은 경우, **이 배열을 사용하여 다음 단계(Task 2)에서 정의할 새로운 삭제 함수/뮤테이션을 호출**하도록 수정합니다. (기존에 단일 ID로 `useDeleteEdge().mutate`를 호출했다면 이 부분을 변경해야 합니다.)

**Task 2: 다중 엣지 삭제를 위한 뮤테이션 훅 설계 및 구현 (기존 `useDeleteEdge` 확장 또는 신규 생성)**

1.  **파일:** `src/hooks/useEdges.ts` (또는 엣지 뮤테이션이 정의된 파일)
2.  **설계 결정:**
    *   **옵션 A (비권장):** Task 1에서 수집한 `deletedEdgeIds` 배열을 반복하며 기존 `useDeleteEdge().mutate`를 여러 번 호출합니다. (구현은 간단하지만 비효율적이고 낙관적 업데이트/롤백이 복잡해짐)
    *   **옵션 B (권장):** `useDeleteEdge` 훅 (또는 새로운 `useDeleteMultipleEdges` 훅)을 수정/생성하여, **`edgeIds: string[]` 배열**을 인자로 받도록 변경합니다.
3.  **구현 (옵션 B 기준):**
    *   `useDeleteEdge` (또는 신규 훅)의 `mutate` 함수 파라미터를 `{ ids: string[]; projectId: string }` 형태로 받도록 수정합니다.
    *   `mutationFn` 내부에서 `edgeService.deleteMultipleEdgesAPI(ids)` (새로운 서비스 함수 필요 - Task 3)를 호출하도록 변경합니다.
    *   **낙관적 업데이트 수정 (`onMutate`):**
        *   `queryClient.getQueryData`로 이전 엣지 스냅샷을 가져옵니다.
        *   `queryClient.setQueryData`를 사용하여 캐시에서 `ids` 배열에 포함된 **모든 엣지를 제거**합니다.
        *   이전 스냅샷과 쿼리 키를 컨텍스트로 반환합니다.
    *   **롤백 수정 (`onError`):**
        *   `onMutate` 컨텍스트의 `previousEdges`를 사용하여 캐시를 **원래 상태로 복원**합니다.
    *   `onSuccess` / `onSettled`: 여러 엣지가 삭제되었음을 알리는 토스트 메시지 등을 처리하고, 쿼리를 무효화합니다.

**Task 3: (선택적이지만 권장) 서비스 함수 및 API 수정 제안**

1.  **서비스 함수:** `src/services/edgeService.ts`에 `deleteMultipleEdgesAPI(ids: string[]): Promise<void>` 함수를 새로 정의합니다. 이 함수는 백엔드에 여러 ID를 전달하여 삭제를 요청합니다 (예: `DELETE /api/edges?ids=id1,id2...`).
2.  **API 라우트:** 백엔드 API (`src/app/api/edges/route.ts` 또는 신규 라우트)에서 여러 ID를 받아 `prisma.edge.deleteMany({ where: { id: { in: ids } } })` 와 같이 일괄 삭제를 처리하는 로직을 **구현해야 함을 제안합니다.** (Agent가 직접 백엔드를 수정할 수 없다면, 필요한 변경 사항을 명시).

**Task 4: 연결 및 테스트**

1.  Task 1에서 수정한 `onEdgesChange` 핸들러가 Task 2에서 수정/생성된 다중 삭제 뮤테이션 훅의 `mutate` 함수를 `deletedEdgeIds` 배열과 함께 호출하도록 연결합니다.
2.  Agent는 수정한 코드를 바탕으로, 여러 엣지를 선택하고 삭제했을 때 UI에서 즉시 사라지고 (낙관적 업데이트), API 호출이 한 번(또는 예상대로) 발생하며, DB에서도 해당 엣지들이 삭제되는지 (가상 시나리오 또는 로그 확인) 검증해야 함을 인지합니다.

**결과 보고:**

*   각 Task별 코드 변경 사항을 보고해 주세요.
*   특히 Task 2에서 어떤 설계 옵션(A 또는 B)을 선택했는지, 그리고 옵션 B를 선택했다면 Task 3의 서비스/API 변경이 필요함을 명시해 주세요.
*   수정된 다중 삭제 흐름을 설명해 주세요.

---

이렇게 Task List를 제공하면 Agent가 단계적으로 작업을 수행하고, 더 효율적이고 안정적인 다중 엣지 삭제 기능을 구현하는 데 도움이 될 것입니다. 특히 옵션 B를 권장하여 장기적인 효율성을 고려하도록 유도하는 것이 좋습니다.