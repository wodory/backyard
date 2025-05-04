**✨ 최종 Tasklist for Cursor Agent ✨**

**📌 단계 1: `useCreateCard` 훅 수정 (의존성 주입 적용)**

1.  **파일 열기:** `src/hooks/useCreateCard.ts` (만약 파일명이 `useCardMutations.ts` 등 다르다면 해당 파일명 명시)
2.  **임포트 제거:** 파일 상단에서 `import { useIdeaMapStore } ...` 라인 **삭제**.
3.  **인터페이스 정의:** 아래 인터페이스들을 파일 내 (export 전 또는 적절한 위치)에 **추가**하거나, 이미 유사한 인터페이스가 있다면 **수정**. (Card 타입은 프로젝트의 실제 Card 타입에 맞게 조정 필요)
    ```typescript
    import { Card, CreateCardInput as CardInput } from '../types/card'; // 실제 Card 타입 경로 확인

    interface CreateCardVariables {
      cardData: CardInput;
    }

    interface UseCreateCardOptions {
      onSuccess?: (data: Card[] | Card, variables: CreateCardVariables, context: unknown) => void | Promise<unknown>;
      onError?: (error: Error, variables: CreateCardVariables, context: unknown) => void | Promise<unknown>;
      // 노드 배치 요청 콜백 (핵심)
      onPlaceNodeRequest?: (cardId: string, projectId: string) => void;
    }
    ```
4.  **훅 시그니처 수정:** `useCreateCard` 함수의 정의를 찾아, `options?: UseCreateCardOptions`를 인자로 받도록 **수정**. 반환 타입의 제네릭(`UseMutationResult<...>`)도 API 응답 형식(배열 또는 단일 객체)에 맞게 조정.
    ```typescript
    // 수정 전 예시: export function useCreateCard(): UseMutationResult<...> { ... }
    // 수정 후 예시:
    export function useCreateCard(
      options?: UseCreateCardOptions
    ): UseMutationResult<Card[] | Card, Error, CreateCardVariables> {
      // ... (함수 본문)
    }
    ```
5.  **Zustand 액션 제거:** `useCreateCard` 함수 본문 내에서 `useIdeaMapStore`를 사용하던 부분 (`const requestNodePlacement = useIdeaMapStore(...)`) **삭제**.
6.  **`onSuccess` 콜백 수정:** `useMutation` 옵션 객체 내의 `onSuccess` 함수를 찾아 아래와 같이 **수정**.
    *   `variables` 인자를 받아 `options` 객체를 추출.
    *   `requestNodePlacement(...)` 직접 호출 부분을 `options?.onPlaceNodeRequest?.(newCard.id, newCard.projectId)` 호출로 **대체**.
    *   `queryClient.invalidateQueries({ queryKey: ['cards'] })`는 **유지**.
    *   필요시, `options?.onSuccess?.(...)` 호출 **추가**.
    ```typescript
    onSuccess: (newCards, variables, context) => {
      const newCard = Array.isArray(newCards) ? newCards[0] : newCards; // API 응답 따라 조정

      // 1. 카드 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      console.log('[useCreateCard onSuccess] Invalidated cards query.');

      // 2. 주입된 노드 배치 요청 콜백 호출
      if (options?.onPlaceNodeRequest && newCard?.id && newCard.projectId) {
        console.log('[useCreateCard onSuccess] Calling injected onPlaceNodeRequest:', { cardId: newCard.id, projectId: newCard.projectId });
        try {
          options.onPlaceNodeRequest(newCard.id, newCard.projectId);
        } catch (callbackError) {
          console.error('[useCreateCard onSuccess] Error calling onPlaceNodeRequest:', callbackError);
        }
      } else {
        console.log('[useCreateCard onSuccess] No onPlaceNodeRequest callback provided or missing data for node placement.');
      }

      // 3. 원래 onSuccess 콜백 실행 (선택적)
      if (options?.onSuccess) {
          console.log('[useCreateCard onSuccess] Calling original onSuccess callback.');
          options.onSuccess(newCards, variables, context);
      }
    },
    ```
7.  **`onError` 콜백 수정 (선택적이지만 권장):** `onError` 콜백 내에서 주입된 `options?.onError?.(...)`를 호출하도록 **수정**하여, 훅 사용자가 에러 처리를 커스텀할 수 있게 함.
8.  **파일 저장:** 변경 사항 저장.

*   **✅ 확인 방법:**
    *   파일 저장 후 타입 에러가 없는지 확인 (IDE 또는 `yarn tsc` 실행).
    *   `useCreateCard` 훅을 사용하는 다른 파일들(특히 `CreateCardModal.tsx`)에서 아직 에러가 발생할 수 있음 (다음 단계에서 수정 예정).
    *   Git diff를 통해 의도한 대로 `useIdeaMapStore` 의존성이 제거되고 옵션 처리가 추가되었는지 확인.

**📌 단계 2: `CreateCardModal` 컴포넌트 수정 (옵션 전달)**

1.  **파일 열기:** `src/components/cards/CreateCardModal.tsx`
2.  **Prop 추가:** `CreateCardModalProps` 인터페이스에 `placeNodeOnMap?: boolean;` **추가**.
3.  **Prop 받기:** 컴포넌트 함수 시그니처에서 `placeNodeOnMap = false` prop을 받도록 **수정**.
4.  **Zustand 액션 가져오기:** `useIdeaMapStore`에서 `requestNodePlacementForCard` 액션을 가져오는 코드 **추가**.
    ```typescript
    const requestNodePlacement = useIdeaMapStore(state => state.requestNodePlacementForCard);
    ```
5.  **훅 호출 수정:** `useCreateCard()` 훅 호출 부분을 찾아, `options` 객체를 전달하도록 **수정**. `onPlaceNodeRequest`에는 `placeNodeOnMap` 값에 따라 `requestNodePlacementForCard` 함수를 조건부로 **주입**.
    ```typescript
    // 수정 전 예시: const { mutate: createCard } = useCreateCard();
    // 수정 후 예시:
    const { mutate: createCard, isPending } = useCreateCard({
      // placeNodeOnMap prop 값에 따라 콜백 주입 결정
      onPlaceNodeRequest: placeNodeOnMap ? requestNodePlacement : undefined,
      // 이 컴포넌트 특화 성공 로직 (예: 모달 닫기, 폼 리셋)
      onSuccess: (newCards) => {
         const newCard = Array.isArray(newCards) ? newCards[0] : newCards;
         toast.success('카드가 성공적으로 생성되었습니다.');
         setOpen(false);
         resetForm();
         if (onCardCreated && newCard) {
           // newCard 타입이 Card[] 또는 Card 인지에 따라 onCardCreated 호출 조정
           onCardCreated(newCard);
         }
      },
      onError: (err) => {
         console.error('카드 생성 오류 (Modal):', err);
         toast.error(err.message || '카드 생성에 실패했습니다.');
      }
    });
    ```
6.  **`handleSave` 함수 수정:** `createCard` 뮤테이션 호출 시 두 번째 인자로 전달하던 `onSuccess`, `onError` 콜백 **제거** (훅 초기화 시 옵션으로 전달했으므로). `{ cardData }` 객체만 전달하도록 **수정**.
    ```typescript
    // 수정 전 예시: createCard({ cardData, options: { placeNodeOnMap } }, { onSuccess: ..., onError: ... });
    // 수정 후 예시:
    createCard({ cardData });
    ```
7.  **파일 저장:** 변경 사항 저장.

*   **✅ 확인 방법:**
    *   타입 에러가 없는지 확인.
    *   `useCreateCard` 호출 시 `onPlaceNodeRequest` 옵션이 조건부로 잘 전달되는지 코드 확인.
    *   Git diff를 통해 `handleSave` 내 `createCard` 호출 방식이 변경되었는지 확인.
    *   앱 실행 후 **(아직 아이디어맵 업데이트는 안 됨)**, 메인 툴바에서 카드 생성 시 Sidebar 목록이 업데이트되는지 확인 (TanStack Query 캐시 무효화 작동 확인). 콘솔에 `[useCreateCard onSuccess] Calling injected onPlaceNodeRequest:` 로그가 찍히는지 확인.

**📌 단계 3: `MainToolbar`에서 `placeNodeOnMap` prop 전달**

1.  **파일 열기:** `src/components/layout/MainToolbar.tsx`
2.  **Prop 추가:** `<CreateCardModal ... />` 컴포넌트 렌더링 부분에 `placeNodeOnMap={true}` prop **추가**.
3.  **파일 저장:** 변경 사항 저장.

*   **✅ 확인 방법:**
    *   코드를 직접 확인하여 prop이 추가되었는지 확인.
    *   (이 단계 자체만으로는 실행 가능한 큰 변화 없음)

**📌 단계 4: `IdeaMap` 컴포넌트에 노드 배치 로직 구현**

1.  **파일 열기:** `src/components/ideamap/components/IdeaMap.tsx`
2.  **필요한 훅/상태 임포트 및 가져오기:**
    *   `useEffect`, `useRef` 임포트 확인.
    *   `useReactFlow`, `XYPosition`, `Node` 등 `@xyflow/react` 관련 임포트 확인.
    *   `useQueryClient` 임포트.
    *   `useIdeaMapStore`에서 `nodePlacementRequest`, `clearNodePlacementRequest` 가져오기.
    *   `useCreateCardNode` 훅 임포트 및 사용 (`const { mutate: createCardNode } = useCreateCardNode();`).
    *   `toast` 임포트.
    *   `reactFlowWrapper` ref 생성 (`useRef<HTMLDivElement>(null);`).
3.  **`useEffect` 추가:** `nodePlacementRequest`를 감지하고 처리하는 `useEffect` **추가**. (이전 답변의 코드 블록 참고)
    *   의존성 배열: `[nodePlacementRequest, reactFlowInstance, createCardNode, clearNodePlacementRequest, queryClient]` (reactFlowInstance 포함 확인)
    *   내부 로직:
        *   `nodePlacementRequest` null 체크.
        *   `reactFlowInstance` 및 `reactFlowWrapper.current` null 체크.
        *   중앙 좌표 계산 (`screenToFlowPosition`).
        *   충돌 감지 및 `finalPosition` 계산 (오프셋 적용).
        *   `createCardNode` 뮤테이션 호출 (`cardId`, `projectId`, `positionX`, `positionY` 전달).
        *   `onSuccess`: `cardNodes` 쿼리 무효화, `clearNodePlacementRequest` 호출, 토스트 메시지.
        *   `onError`: 에러 로깅, 토스트 메시지, `clearNodePlacementRequest` 호출.
4.  **Wrapper `ref` 연결:** 컴포넌트의 최상위 `div`에 `ref={reactFlowWrapper}` **추가**.
5.  **파일 저장:** 변경 사항 저장.

*   **✅ 확인 방법:**
    *   타입 에러가 없는지 확인.
    *   앱 실행 후 MainToolbar에서 '+' 버튼으로 카드 생성.
    *   Sidebar 목록 업데이트 확인.
    *   **IdeaMap 캔버스 중앙(또는 약간 오프셋된 위치)에 새 노드가 나타나는지 확인.**
    *   브라우저 콘솔 로그 확인:
        *   `[CreateCardModal] Requesting node placement for card:`
        *   `[useCreateCard onSuccess] Calling injected onPlaceNodeRequest:`
        *   `[IdeaMap] Processing node placement request:`
        *   `[IdeaMap] Calculated final position:`
        *   `[IdeaMap] CardNode created successfully:` (성공 시) 또는 `[IdeaMap] Failed to create CardNode:` (실패 시)
    *   TanStack Query DevTools에서 `cards` 및 `cardNodes` 쿼리가 무효화되고 리페치되는지 확인.

**📌 단계 5: (필수 확인) 백엔드 API 재확인**

1.  **파일 열기:** `src/app/api/cards/route.ts`
2.  **재확인:** `POST` 핸들러가 여전히 `CardNode`를 자동으로 생성하지 않는지 **코드 검토**.

*   **✅ 확인 방법:** 코드 상에 `prisma.cardNode.create` 호출이 없는지 확인.

---

이 Tasklist는 각 단계를 더 명확히 하고, Agent가 수행해야 할 구체적인 코드 변경 사항을 제시하며, 각 단계 후 검증 방법을 포함하여 전체 프로세스를 더 안전하게 진행하는 데 도움이 될 것입니다. 각 단계별로 Agent의 작업을 검토하고 필요하면 수정하는 것을 잊지 마세요!