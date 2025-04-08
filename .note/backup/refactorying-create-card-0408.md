**리팩토링 목표:**

*   `CreateCardButton` 컴포넌트에서 API 호출 및 상태 관리 로직 제거.
*   `useAppStore`에 `createCard` 액션을 추가하여 API 호출, 상태 업데이트, 로딩/에러 처리, 알림 로직 통합.
*   이름이 변경될 `CreateCardModal` (기존 `CreateCardButton`)은 폼 상태 관리 및 `createCard` 액션 호출만 담당.
*   `Board.tsx`의 관련 핸들러는 단순화 (새로고침 대신 상태 기반 업데이트 지향).
*   MSW를 사용한 액션 단위 테스트 및 액션 호출 컴포넌트 단위 테스트 작성.

**Tasklist: 카드 생성 로직 리팩토링 (`createCard` 액션 중심) - 이름 변경 포함**

**Phase 0: 사전 준비 (Types & Input)**

*   **테스크 0.1: 입력 타입 정의**
    *   **파일:** `src/types/card.ts`
    *   **작업:** `CreateCardInput` 인터페이스가 이미 정의되어 있는지 확인하고, 없다면 아래와 같이 정의합니다. `tags` 필드를 명시적으로 추가합니다.
        ```typescript
        export interface CreateCardInput {
          title: string;
          content?: string;
          userId: string; // userId는 액션 내부에서 가져올 수도 있지만, 명시적으로 받는 것이 테스트 용이
          tags?: string[];
        }
        ```

**Phase 1: Zustand 스토어 리팩토링 (`createCard` 액션 구현)**

*   **테스크 1.1: 액션 시그니처 정의**
    *   **파일:** `src/store/useAppStore.ts`
    *   **작업:** `AppState` 인터페이스 (또는 `Actions` 타입) 내에 `createCard` 액션의 시그니처를 정의합니다. 사용자 ID를 인자로 받도록 합니다 (액션 내에서 `get()`으로 가져올 수도 있지만, 명시적 주입이 테스트에 용이할 수 있습니다). 성공 시 생성된 카드를 반환하고, 실패 시 null을 반환하도록 합니다.
        ```typescript
        // AppState 인터페이스 또는 Actions 타입 내부에 추가
        createCard: (input: CreateCardInput) => Promise<Card | null>;
        ```
*   **테스크 1.2: `createCard` 액션 구현**
    *   **파일:** `src/store/useAppStore.ts`
    *   **작업:** `create` 함수 내부에서 `createCard` 액션의 로직을 구현합니다.
        1.  `async` 함수로 정의합니다.
        2.  액션 시작 시 `set({ isLoading: true, error: null });` 호출하여 로딩 상태를 활성화하고 이전 에러를 초기화합니다.
        3.  `try...catch` 블록을 사용하여 전체 로직을 감쌉니다.
        4.  `try` 블록 내부:
            *   `fetch('/api/cards', { ... })`를 사용하여 카드 생성 API (`POST`)를 호출합니다. `input` 데이터를 `body`에 포함시킵니다.
            *   `response.ok`를 확인하여 API 호출 성공 여부를 판단합니다.
            *   **성공 시:**
                *   `response.json()`을 호출하여 생성된 카드 데이터(`newCard`)를 얻습니다.
                *   `set((state) => ({ cards: [...state.cards, newCard], isLoading: false }));`를 호출하여 스토어의 `cards` 배열에 새 카드를 추가하고 로딩 상태를 비활성화합니다.
                *   `toast.success('카드가 성공적으로 생성되었습니다.');`를 호출합니다.
                *   생성된 `newCard` 객체를 반환합니다 (`return newCard;`).
            *   **실패 시:**
                *   `response.json()`을 호출하여 에러 메시지를 얻습니다 (선택적).
                *   `throw new Error(errorData.error || '카드 생성에 실패했습니다.');` 와 같이 에러를 발생시킵니다.
        5.  `catch` 블록 내부:
            *   에러를 콘솔에 로깅합니다 (`console.error`).
            *   `set({ isLoading: false, error: err.message });`를 호출하여 로딩 상태를 비활성화하고 에러 상태를 설정합니다.
            *   `toast.error(err.message || '카드 생성 중 오류 발생');`를 호출합니다.
            *   `null`을 반환합니다 (`return null;`).
        ```typescript
        // 예시 구현 구조
        createCard: async (input) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/cards', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            });

            if (!response.ok) {
              let errorMsg = '카드 생성에 실패했습니다.';
              try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
              } catch (e) { /* JSON 파싱 실패 무시 */ }
              throw new Error(errorMsg);
            }

            const newCard = await response.json();
            set((state) => ({
              cards: [...state.cards, newCard],
              isLoading: false
            }));
            toast.success('카드가 성공적으로 생성되었습니다.');
            return newCard;

          } catch (err: any) {
            console.error("createCard 액션 오류:", err);
            set({ isLoading: false, error: err.message });
            toast.error(`카드 생성 오류: ${err.message}`);
            return null;
          }
        },
        ```

**Phase 2: UI 컴포넌트 리팩토링 (액션 호출 및 이름 변경)**

*   **테스크 2.1: `CreateCardButton` 컴포넌트 내부 로직 수정**
    *   **파일:** `src/components/cards/CreateCardButton.tsx`
    *   **작업:**
        1.  `useAppStore` 훅을 사용하여 `createCard` 액션과 `isLoading` 상태를 가져옵니다. (`const { createCard, isLoading } = useAppStore();`)
        2.  컴포넌트 내부의 `handleSubmit` 함수 수정:
            *   `setIsSubmitting(true)` 및 `setIsSubmitting(false)` 호출을 제거합니다. (로딩 상태는 전역 `isLoading` 사용)
            *   `fetch('/api/cards', ...)` 호출 및 관련 `try...catch` 로직 전체를 제거합니다.
            *   `toast` 호출 로직을 제거합니다 (액션 내부에서 처리).
            *   `window.location.reload()` 호출을 제거합니다.
            *   `createCard` 액션을 호출합니다. `userId`는 `DEFAULT_USER_ID` 또는 인증된 사용자 ID (만약 스토어/컨텍스트에 있다면)를 사용합니다.
                ```typescript
                const cardInput: CreateCardInput = {
                  title: title.trim(),
                  content: content, // 에디터 내용을 content 상태로 관리 가정
                  userId: firstUserId || DEFAULT_USER_ID, // 사용자 ID 가져오는 로직 필요
                  tags: tags,
                };
                const createdCard = await createCard(cardInput); // 액션 호출

                if (createdCard) {
                  // 성공 시 추가 작업 (예: 모달 닫기, 폼 초기화)
                  setOpen(false); // 모달 닫기
                  setTitle('');
                  setContent('');
                  setTags([]);
                  setTagInput('');
                  if (onCardCreated) {
                    onCardCreated(createdCard); // 생성된 카드 데이터 콜백 전달
                  }
                } else {
                  // 실패 시 (에러 토스트는 액션에서 처리됨)
                  // 필요한 경우 추가적인 UI 피드백
                }
                ```
        3.  폼 제출 버튼의 `disabled` 속성을 전역 `isLoading` 상태와 연결합니다. (`<Button type="submit" disabled={isLoading} ...>`)
        4.  버튼 텍스트도 `isLoading` 상태에 따라 변경합니다. (`{isLoading ? "생성 중..." : "카드 생성"}`)
        5.  `firstUserId`를 가져오는 `useEffect` 로직은 유지하거나, 사용자 ID를 스토어에서 관리하는 방식으로 변경하는 것을 고려합니다. (현재는 유지)
        6.  **검증:** `fetch`, `setIsSubmitting`, 관련 `toast`, `window.location.reload` 코드가 완전히 제거되었는지 확인합니다.

*   **테스크 2.2: `Board` 컴포넌트 핸들러 검토/수정**
    *   **파일:** `src/components/board/components/Board.tsx`
    *   **작업:**
        1.  `handleCardCreated` 및 `handleEdgeDropCardCreated` 함수를 검토합니다.
        2.  이 함수들은 수정된 `CreateCardButton`(곧 `CreateCardModal`이 될)의 `onCardCreated` 콜백에서 생성된 카드 데이터를 받습니다.
        3.  **중요:** `window.location.reload()` 호출을 제거합니다. 상태 업데이트는 `createCard` 액션이 `cards` 상태를 변경함으로써 자동으로 반영되어야 합니다. 만약 즉각적인 노드 추가가 필요하다면 아래 예시처럼 `reactFlowInstance.addNodes()`를 사용합니다.
        4.  `handleEdgeDropCardCreated`에서 새 카드의 위치를 계산하고, 생성된 카드 데이터와 함께 `reactFlowInstance.addNodes()`를 호출하여 엣지 드롭 위치에 새 노드를 추가하는 로직을 구현합니다.
        ```typescript
        // handleEdgeDropCardCreated 예시 (수정 후)
        const handleEdgeDropCardCreated = useCallback(async (
          cardData: Card, // createCard 액션이 반환한 카드 데이터
          position: XYPosition,
          connectingNodeId: string,
          handleType: 'source' | 'target'
        ) => {
          setIsEdgeDropModalOpen(false); // 모달 닫기

          if (!reactFlowInstance) return;

          const newNode = {
            id: cardData.id, // API 응답에서 받은 ID 사용
            type: NODE_TYPES_KEYS.card,
            position,
            data: { ...cardData, type: NODE_TYPES_KEYS.card }, // 데이터에 타입 명시
            origin: [0.5, 0.0],
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
          };

          // 새 노드 추가
          reactFlowInstance.addNodes(newNode);

          // 연결 생성 (예시)
          const newEdge: Edge = {
            id: `e-${connectingNodeId}-${cardData.id}`,
            source: handleType === 'target' ? connectingNodeId : cardData.id,
            target: handleType === 'target' ? cardData.id : connectingNodeId,
            type: EDGE_TYPES_KEYS.custom, // 커스텀 엣지 타입 사용
            // ... 기타 엣지 속성 (스타일 등)
          };
          reactFlowInstance.addEdges(newEdge);

          // 레이아웃 저장 (선택적)
          saveLayout(reactFlowInstance.getNodes());
          saveEdges(reactFlowInstance.getEdges());

        }, [reactFlowInstance, saveLayout, saveEdges]); // 의존성 배열 확인
        ```
*   **테스크 2.3: Modal 컴포넌트 확인**
    *   **파일:** `src/components/cards/CreateCardModal.tsx`, `src/components/cards/SimpleCreateCardModal.tsx`
    *   **작업:** `CreateCardButton`에 전달하는 `onCardCreated` 콜백이 새로운 시그니처(생성된 카드 데이터를 인자로 받음)와 호환되는지 확인하고, 상위 컴포넌트(`Board`)로 콜백을 올바르게 전달하는지 확인합니다.

*   **테스크 2.4: 컴포넌트 이름 변경 (`CreateCardButton` -> `CreateCardModal`)**
    *   **파일:**
        *   `src/components/cards/CreateCardButton.tsx` -> `src/components/cards/CreateCardModal.tsx` (파일 이름 변경)
        *   이 컴포넌트를 import하는 모든 파일 (예: `src/components/board/components/Board.tsx`, `src/components/cards/SimpleCreateCardModal.tsx`, 관련 테스트 파일 등)
    *   **작업:**
        1.  `src/components/cards/CreateCardButton.tsx` 파일의 이름을 `CreateCardModal.tsx`로 변경합니다.
        2.  변경된 파일 내부의 컴포넌트 함수 이름을 `CreateCardButton`에서 `CreateCardModal`로 변경합니다. (`export default function CreateCardModal(...)`)
        3.  이 컴포넌트를 사용(import)하는 모든 다른 파일에서 import 경로와 컴포넌트 이름을 새 이름(`CreateCardModal`)으로 업데이트합니다.
        4.  관련 테스트 파일(`CreateCardButton.test.tsx`)의 이름도 `CreateCardModal.test.tsx`로 변경하고, 테스트 코드 내의 컴포넌트 이름도 수정합니다.
        5.  **검증:** 이름 변경 후 애플리케이션 빌드 및 테스트가 정상적으로 통과하는지 확인합니다.

**Phase 3: MSW 및 단위 테스트**

*   **테스크 3.1: MSW 핸들러 추가/확인**
    *   **파일:** `src/tests/msw/handlers.ts`
    *   **작업:** `POST /api/cards` 엔드포인트에 대한 MSW 핸들러가 정의되어 있는지 확인하고, 없다면 추가합니다. 성공 시 생성된 카드 객체(ID 포함)를 반환하고, 실패 시 에러 객체를 반환하도록 구현합니다.
        ```typescript
        // 예시 핸들러
        http.post('/api/cards', async ({ request }) => {
          const newCardData = await request.json() as any;
          // 실패 시뮬레이션 (예: 제목 누락)
          if (!newCardData.title) {
            return HttpResponse.json({ error: '제목은 필수입니다.' }, { status: 400 });
          }
          // 성공 시뮬레이션
          const createdCard = {
            id: `mock-card-${Date.now()}`, // 동적 ID 생성
            title: newCardData.title,
            content: newCardData.content || '',
            userId: newCardData.userId,
            tags: newCardData.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // 필요하다면 cardTags 등 추가 필드 모킹
          };
          return HttpResponse.json(createdCard, { status: 201 });
        }),
        ```
*   **테스크 3.2: `createCard` 액션 단위 테스트 작성**
    *   **파일:** `src/store/useAppStore.test.ts`
    *   **작업:** `createCard` 액션에 대한 단위 테스트를 작성합니다.
        1.  `beforeEach`에서 `useAppStore.setState`를 사용하여 스토어 상태를 초기화합니다.
        2.  `msw` `server.use()`를 사용하여 각 테스트 케이스(성공, 실패)에 맞는 API 응답을 모킹합니다.
        3.  `act(async () => { ... })` 내에서 `createCard` 액션을 호출합니다.
        4.  **성공 케이스:**
            *   `await`으로 액션 완료를 기다립니다.
            *   `expect(useAppStore.getState().cards)`를 사용하여 새 카드가 스토어에 추가되었는지 확인합니다.
            *   `expect(useAppStore.getState().isLoading).toBe(false)` 및 `expect(useAppStore.getState().error).toBeNull()`을 확인합니다.
            *   `expect(toast.success)`가 호출되었는지 확인합니다.
            *   액션이 생성된 카드 데이터를 반환하는지 확인합니다.
        5.  **실패 케이스:**
            *   `await`으로 액션 완료를 기다립니다.
            *   `expect(useAppStore.getState().cards)`가 변경되지 않았는지 확인합니다.
            *   `expect(useAppStore.getState().isLoading).toBe(false)` 및 `expect(useAppStore.getState().error)`에 에러 메시지가 설정되었는지 확인합니다.
            *   `expect(toast.error)`가 호출되었는지 확인합니다.
            *   액션이 `null`을 반환하는지 확인합니다.
        6.  `async-test` 룰 준수: `async`/`await` 및 `waitFor` (필요시) 사용.
        7.  `explicit-error-throw-testing` 룰 준수: 실패 케이스에서 에러 상태 검증.
*   **테스크 3.3: `CreateCardModal` 컴포넌트 단위 테스트 업데이트 (이름 변경 반영)**
    *   **파일:** `src/components/cards/CreateCardModal.test.tsx` (기존 `CreateCardButton.test.tsx`에서 이름 변경)
    *   **작업:** 기존 테스트를 수정하거나 새로 작성합니다.
        1.  `vi.mock('@/store/useAppStore', ...)`을 사용하여 `useAppStore`를 모킹하고, `createCard` 액션을 `vi.fn()`으로 대체합니다. (성공/실패 시나리오 모킹)
        2.  사용자가 폼을 채우고 제출 버튼을 클릭하는 인터랙션을 시뮬레이션합니다 (`userEvent` 사용).
        3.  `expect(mockCreateCardAction)`이 올바른 `CreateCardInput` 데이터와 함께 호출되었는지 확인합니다.
        4.  `createCard` 액션의 반환값(성공/실패)에 따라 모달이 닫히거나 적절한 UI 피드백이 발생하는지 확인합니다.
        5.  버튼의 `disabled` 상태가 전역 `isLoading` 상태에 따라 올바르게 변경되는지 확인합니다.
        6.  `global-env-mocking` 룰 준수: 필요한 전역 객체(localStorage 등) 모킹 확인 (기존 setup 활용).
        7.  `vitest-mocking` 룰 준수: `vi.mock` 사용 확인.
