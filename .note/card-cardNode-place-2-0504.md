**목표:** 메인 툴바의 "+" 버튼으로 카드를 생성했을 때, 사이드바에 카드가 추가됨과 **동시에** 아이디어맵에도 해당 카드의 노드가 정상적으로 나타나도록 수정한다.

---

**Tasklist: 메인 툴바 카드 생성 시 노드 미표시 문제 해결**

**Phase 1: 원인 진단 (Logging 및 검증)**

1.  **[진단] `CreateCardModal` -> `useCreateCard` -> `requestNodePlacement` 호출 확인:**
    *   **파일:** `src/components/cards/CreateCardModal.tsx`
    *   **작업:** `handlePlaceNodeRequest` 함수 내부에 `logger.debug`를 추가하여, 카드 생성 성공 후 `useIdeaMapStore`의 `requestNodePlacement` 액션이 올바른 `cardId`와 `projectId`로 호출되는지 확인한다.
    *   **예상 결과:** 모달에서 카드 저장 시 해당 로그가 콘솔에 출력되어야 한다.

2.  **[진단] `useIdeaMapStore` 상태 업데이트 확인:**
    *   **파일:** `src/store/useIdeaMapStore.ts`
    *   **작업:** `requestNodePlacement` 액션 내부에 `logger.debug`를 추가하여, `nodePlacementRequest` 상태가 실제로 업데이트되는지 확인한다.
    *   **예상 결과:** Task 1의 로그 직후, 스토어 상태 업데이트 로그가 콘솔에 출력되어야 한다.

3.  **[진단] `IdeaMap` 컴포넌트의 `useEffect` 트리거 확인:**
    *   **파일:** `src/components/ideamap/components/IdeaMap.tsx`
    *   **작업:** `nodePlacementRequest`를 의존성으로 가지는 `useEffect` 훅의 *가장 첫 줄*에 `logger.debug`를 추가한다. `nodePlacementRequest` 값과 `reactFlowInstance`의 존재 여부를 함께 로깅한다.
    *   **예상 결과:** 스토어 상태가 업데이트된 후, 이 `useEffect`가 실행되고, `nodePlacementRequest`에 값이 들어있는지 확인한다. `reactFlowInstance`가 `null`인지도 확인한다.

4.  **[진단] `useEffect` 내부 로직 실행 확인:**
    *   **파일:** `src/components/ideamap/components/IdeaMap.tsx`
    *   **작업:** `useEffect` 훅 내부의 `if (nodePlacementRequest && reactFlowInstance && ...)` 블록 *안쪽*에 단계별 `logger.debug`를 추가한다.
        *   위치 계산 직후 (`targetPosition` 값 로깅)
        *   `createCardNodeMutation.mutate` 호출 직전
        *   `mutate`의 `onSuccess`, `onError` 콜백 내부
        *   `clearNodePlacementRequest` 호출 직전
    *   **작업:** `try...catch` 블록으로 핵심 로직을 감싸고 `catch` 블록에서 에러를 로깅한다.
    *   **예상 결과:** 각 단계 로그가 순서대로 출력되는지, 특정 단계에서 멈추거나 에러 로그가 출력되는지 확인한다.

5.  **[진단] `POST /api/cardnodes` API 호출 확인:**
    *   **도구:** 브라우저 개발자 도구 (Network 탭)
    *   **작업:** 메인 툴바에서 카드를 생성할 때, `/api/cardnodes`로의 POST 요청이 발생하는지 확인한다. 요청 상태 코드(200 또는 201이어야 함), 요청 본문(payload), 서버 응답을 확인한다.
    *   **예상 결과:** `/api/cards` 요청 성공 후, `/api/cardnodes` 요청이 성공적으로 보내져야 한다.

6.  **[진단] 서버 API 로그 확인:**
    *   **환경:** 로컬 개발 환경 터미널 또는 배포 환경 로그
    *   **작업:** `/api/cardnodes/route.ts`에서 요청 수신 및 처리 과정 중 오류가 발생하는지 서버 로그를 확인한다. (DB 오류 등)
    *   **예상 결과:** API 요청 처리 중 서버 측 에러가 없어야 한다.

**Phase 2: 코드 수정 및 검증**

7.  **[수정] 진단 결과 기반 코드 수정:**
    *   **파일:** Phase 1에서 문제가 발견된 파일 (예: `IdeaMap.tsx`, `useIdeaMapStore.ts`, `/api/cardnodes/route.ts` 등)
    *   **작업:** 진단 단계에서 파악된 원인에 따라 코드를 수정한다.
        *   `useEffect` 로직 오류 수정 (조건문, 의존성 배열, `null` 체크 등)
        *   위치 계산 로직 수정
        *   API 요청/응답 처리 로직 수정
        *   Zustand 상태 관리 로직 수정
        *   쿼리 무효화 로직 확인 (`useCreateCardNode` 내부)

8.  **[검증] 기능 재테스트:**
    *   **작업:** 코드를 수정한 후, 메인 툴바에서 카드를 추가하는 시나리오를 다시 실행한다.
    *   **예상 결과:** 사이드바에 카드가 추가됨과 동시에 아이디어맵에도 해당 카드의 노드가 정상적으로 표시되어야 한다.

9.  **[검증] 사이드바 Drag & Drop 기능 회귀 테스트:**
    *   **작업:** 기존의 사이드바에서 카드를 드래그 앤 드롭하여 노드를 추가하는 기능이 여전히 잘 작동하는지 확인한다.
    *   **예상 결과:** 기존 기능에 문제가 없어야 한다.

10. **[정리] 디버깅 로그 제거:**
    *   **파일:** Phase 1에서 로그를 추가했던 모든 파일
    *   **작업:** 문제 해결 및 검증이 완료되면, 추가했던 디버깅용 `console.log` 또는 `logger.debug` 구문을 제거하거나 주석 처리한다.
