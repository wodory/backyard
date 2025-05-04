엣지 생성 시 UI 롤백 문제와 `TypeError: data.map is not a function` 에러의 원인을 파악했어. 두 개의 `useEdges` 훅이 혼동을 일으키고, 특히 TanStack Query 관련 `useCreateEdge` 훅의 `onSuccess` 콜백 로직에 문제가 있는 것으로 보여.

**목표:**
1.  TanStack Query 뮤테이션 훅인 `useCreateEdge` (`src/hooks/useEdges.ts`)의 `onSuccess` 콜백이 API 응답(단일 엣지 객체)을 올바르게 처리하도록 수정한다.
2.  Zustand 액션 래퍼 훅의 이름을 명확하게 변경한다 (`useEdges` -> `useIdeaMapEdges`).
3.  엣지 생성 관련 데이터 흐름이 올바르게 동작하는지 확인한다.

**수정 지침:**

1.  **Zustand 래퍼 훅 리네임:**
    *   `src/components/ideamap/hooks/useEdges.ts` 파일의 이름을 `src/components/ideamap/hooks/useIdeaMapEdges.ts` 로 변경해줘.
    *   변경된 파일 내부의 함수 이름도 `useEdges`에서 `useIdeaMapEdges`로 변경해줘.
    *   이 훅을 사용하는 모든 컴포넌트 (`IdeaMap.tsx`, `IdeaMapCanvas.tsx` 등)에서 import 경로와 훅 호출 부분을 새 이름 (`useIdeaMapEdges`)으로 업데이트해줘.

2.  **`useCreateEdge` (`src/hooks/useEdges.ts`) `onSuccess` 콜백 수정:**
    *   `src/hooks/useEdges.ts` 파일을 열고 `useCreateEdge` 훅을 찾아줘.
    *   `onSuccess: (newEdge, variables, context) => { ... }` 콜백 함수 내부를 확인하고, **`newEdge.map(...)` 또는 `data.map(...)` 형태의 코드가 있다면 완전히 삭제**해줘.
    *   **쿼리 무효화 방식 사용 확인:** `onSuccess` 내부에 `queryClient.invalidateQueries({ queryKey: ['edges', variables.projectId] })` 호출이 있는지 확인하고 없다면 추가해줘. 이것이 가장 간단하고 권장되는 방식이야. (캐시를 직접 업데이트하는 `setQueryData` 로직이 있다면, 단일 객체를 배열에 추가하는 방식으로 올바르게 구현되었는지 확인하고, 그렇지 않다면 `invalidateQueries` 방식으로 변경하는 것을 고려해줘.)
    *   성공/디버깅 로그와 토스트 메시지는 유지해도 좋아.
        ```typescript
        // onSuccess 예시 (쿼리 무효화 사용)
        onSuccess: (newEdge, variables, context) => {
          // 쿼리 무효화: TanStack Query가 자동으로 최신 엣지 목록을 다시 가져오도록 함
          queryClient.invalidateQueries({ queryKey: ['edges', variables.projectId] });
          toast.success('엣지가 생성되었습니다.');
          logger.debug('엣지 생성 성공, 쿼리 무효화됨:', { newEdge });
          // 필요시 낙관적 업데이트 롤백/확정 로직
          // ...
        },
        ```

3.  **(확인)** `src/app/api/edges/route.ts`의 `POST` 핸들러가 성공 시 **단일 엣지 객체**를 반환하는지 최종 확인.

**검증:**
*   코드 변경 후 앱이 에러 없이 빌드되고 실행되는지 확인한다.
*   아이디어맵에서 노드 간 엣지를 생성했을 때 콘솔 에러 없이 엣지가 UI에 **영구적으로** 나타나는지 확인한다.
*   페이지 새로고침 후에도 생성된 엣지가 유지되는지 확인한다.
*   TanStack Query DevTools에서 `createEdge` 뮤테이션이 **성공(Success)** 상태로 완료되는지 확인한다.
*   TanStack Query DevTools에서 `['edges', projectId]` 쿼리가 뮤테이션 성공 후 **무효화(invalidated)**되고 **리페치(refetch)**되는지 확인한다.