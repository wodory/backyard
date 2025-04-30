**목표:** React Flow 엣지 생성/삭제 시 UI, TanStack Query 캐시, DB 간의 동기화 문제를 해결하고, 낙관적 업데이트 로직을 안정화하며 코드 구조를 개선한다.

---

**Tasklist for Cursor Agent: React Flow Edge Synchronization and Optimistic Updates**

**Phase 1: 엣지 생성 경로 분석 및 수정 (`onConnect` -> `useCreateEdge`)**

1.  **`onConnect` 핸들러 분석 및 수정:**
    *   **파일:** `src/components/ideamap/components/IdeaMapCanvas.tsx` 또는 관련 핸들러 훅 (`useIdeaMapHandlers.ts`, `useEdges.ts` 등)
    *   **Action:** `onConnect` 콜백 함수를 찾습니다.
    *   **Action:** `onConnect` 내부에서 Zustand 스토어의 `edges` 상태를 직접 업데이트하는 코드(`setEdges((eds) => addEdge(connection, eds))` 등)를 **찾아서 제거**합니다. 엣지 상태는 TanStack Query가 관리하도록 위임합니다.
    *   **Action:** `useCreateEdge` 훅 (또는 `useEdges`에서 export된 생성 뮤테이션)의 `mutate` 함수가 호출되는지 확인합니다.
    *   **Action:** `mutate` 함수에 전달되는 인자 (`source`, `target`, `projectId`, `sourceHandle`, `targetHandle` 등)가 정확한지 확인하고, 누락된 `projectId` 등이 있다면 `useAppStore` 등에서 가져와 전달하도록 수정합니다.
    *   **Action:** `onConnect` 내부에 불필요한 `try...catch` 블록이 있다면, 뮤테이션 훅의 `onError`에서 처리하도록 로직을 옮기고 제거하는 것을 고려합니다.

2.  **`useCreateEdge` 훅 검토 및 낙관적 업데이트 구현:**
    *   **파일:** `src/hooks/useCreateEdge.ts` (또는 엣지 뮤테이션이 정의된 파일, e.g., `src/hooks/useEdges.ts`)
    *   **Action:** `mutationFn`이 `src/services/edgeService.ts`의 `createEdgeAPI`를 올바르게 호출하는지 확인합니다.
    *   **Action:** **낙관적 업데이트 로직 구현/검증:**
        *   `onMutate` 콜백 추가/수정:
            *   `queryClient.cancelQueries`로 관련 엣지 쿼리 취소.
            *   `queryClient.getQueryData`로 현재 엣지 캐시 스냅샷 가져오기.
            *   `queryClient.setQueryData`로 *임시 ID*를 가진 새 엣지를 캐시에 추가 (UI 즉시 업데이트).
            *   스냅샷과 `queryKey`를 컨텍스트로 반환.
        *   `onError` 콜백 추가/수정:
            *   `onMutate`에서 받은 컨텍스트(스냅샷)를 사용하여 `queryClient.setQueryData`로 캐시 롤백.
            *   `toast.error` 등으로 사용자에게 실패 알림.
        *   `onSettled` 콜백 추가/수정:
            *   성공/실패 여부와 관계없이 `queryClient.invalidateQueries`를 호출하여 서버 상태와 최종 동기화. (이때 `queryKey`가 `useEdges`와 일치하는지 확인!)
    *   **Action:** `onSuccess` 콜백에서는 `toast.success` 표시 등 부가적인 작업만 남기고, 쿼리 무효화는 `onSettled`에서 처리하도록 합니다.

**Phase 2: 데이터 흐름 및 API 검증**

***목표:*** src/hooks/useEdges.ts 파일의 useCreateEdge 훅에 이미 구현된 낙관적 업데이트 로직을 검토하고, 특히 TanStack Query의 queryKey가 useEdges 훅과 일치하는지 확인하여 불일치 문제를 수정하고, 로직이 UI 지연 없이 즉각적인 업데이트를 보장하도록 개선.

3.  **`useEdges` 훅 검증:**
    *   **파일:** `src/hooks/useEdges.ts`
    *   **Action:** `useQuery`에 사용된 `queryKey`를 확인합니다. 이 키는 `useCreateEdge` 및 `useDeleteEdge`의 `onMutate`/`onError`/`onSettled`에서 사용되는 `queryKey`와 **반드시 일치해야 합니다** (특히 `projectId` 포함 여부).
    *   **Action:** `queryFn`이 `edgeService.fetchEdges`를 올바른 `projectId`와 함께 호출하는지 확인합니다.

4.  **`edgeService` 검증:**
    *   **파일:** `src/services/edgeService.ts`
    *   **Action:** `createEdgeAPI` 함수가 `/api/edges` 엔드포인트로 `POST` 요청을 올바르게 보내는지 확인합니다. 요청 본문에 필요한 데이터(source, target, projectId 등)가 포함되는지 확인합니다.
    *   **Action:** `fetchEdges` 함수가 `/api/edges?projectId=...` 엔드포인트로 `GET` 요청을 올바르게 보내는지 확인합니다.
    *   **Action:** `deleteEdgeAPI` 함수가 `/api/edges/:id` 엔드포인트로 `DELETE` 요청을 올바르게 보내는지 확인합니다.
    *   **Action:** 각 서비스 함수 내 오류 처리 및 로깅이 적절한지 확인합니다.

5.  **API 라우트 (`/api/edges`) 검증 및 로깅 추가:**
    *   **파일:** `src/app/api/edges/route.ts`
    *   **Action:** `POST` 핸들러에 상세 로깅 추가: 요청 수신, 요청 본문 파싱 결과, Prisma `create` 호출 전 데이터, Prisma 호출 결과(성공/실패), 최종 응답 내용.
    *   **Action:** `POST` 핸들러가 요청 본문에서 `source`, `target`, `projectId` 등을 올바르게 추출하고, Prisma `create` 작업을 수행한 후, 생성된 엣지 데이터를 포함한 **성공 응답 (Status 201)**을 반환하는지 확인합니다. 오류 발생 시 적절한 **에러 응답 (Status 4xx/5xx)**을 반환하는지 확인합니다.
    *   **Action:** `GET` 핸들러에 상세 로깅 추가: 요청 수신, `projectId` 파라미터 확인, Prisma `findMany` 호출 전 조건, Prisma 호출 결과, 최종 응답 내용.
    *   **Action:** `GET` 핸들러가 `projectId`로 엣지를 올바르게 필터링하고 결과를 반환하는지 확인합니다.
    *   **Action:** `DELETE` 핸들러 (만약 있다면)에 상세 로깅 추가 및 동작 검증.

**Phase 3: 상태 관리 재정비 및 테스트**

6.  **Zustand 스토어 리팩토링 (신중하게 진행):**
    *   **파일:** `src/store/useIdeaMapStore.ts`
    *   **Action:** `edges` 상태 변수가 **서버에서 로드된 엣지 데이터**를 직접 관리하고 있다면, 이를 제거하는 것을 고려합니다. TanStack Query 캐시가 서버 상태의 주 소스(source of truth)가 되도록 합니다.
    *   **Action:** `setEdges`, `applyEdgeChangesAction`, `connectNodesAction` 등 `edges` 상태를 직접 조작하는 액션 함수들이 서버 상태 관리와 중복된다면 제거하거나, 순수 UI 상태 관리용으로만 남깁니다. (낙관적 업데이트는 TanStack Query 내에서 처리)
    *   **Action:** `useIdeaMapStore`에서 `edges`를 읽던 컴포넌트(e.g., `IdeaMapCanvas`)가 TanStack Query의 `useEdges` 훅을 사용하도록 수정합니다.

7.  **통합 테스트 및 검증:**
    *   **Action:** 로컬 개발 서버를 실행합니다.
    *   **Action:** 브라우저 개발자 도구(콘솔 및 네트워크 탭)와 TanStack Query DevTools를 엽니다.
    *   **Action:** 아이디어맵에서 엣지를 그려봅니다.
    *   **Action:** **관찰:**
        *   브라우저 콘솔에 Phase 1~5에서 추가한 로그가 순서대로 출력되는지 확인합니다.
        *   네트워크 탭에서 `POST /api/edges` 요청이 성공적으로 전송되고, 서버로부터 201 응답 및 생성된 엣지 데이터가 오는지 확인합니다.
        *   TanStack Query DevTools에서 `createEdge` 뮤테이션 상태 변화(pending -> success)와 `edges` 쿼리 데이터 업데이트(낙관적 업데이트 -> 최종 업데이트)를 확인합니다.
        *   React Flow 캔버스에 엣지가 즉시 (낙관적으로) 나타나고, 페이지 새로고침 후에도 유지되는지 확인합니다.
    *   **Action:** 엣지 삭제 기능에도 유사한 방식으로 로그 및 상태 변화를 검증합니다.
    *   **Action:** 잠재적인 무한 루프나 상태 불일치 문제가 없는지 확인합니다.

---

이 Tasklist를 통해 Cursor Agent가 체계적으로 문제를 진단하고 코드를 수정하여 엣지 관련 기능을 안정화할 수 있기를 바랍니다. 각 단계를 진행하면서 예상대로 동작하는지 꼼꼼히 확인하는 것이 중요합니다.