**🎯 목표:** MainToolbar에서 카드 생성 시, 아이디어맵 중앙에 새 카드 노드가 안정적으로 추가되도록 타이밍 이슈 해결.

**⚠️ 사전 준비:** 시작하기 전에 현재 코드 상태를 Git에 커밋하세요.

---

**✨ 최종 Tasklist / Prompt for Cursor Agent ✨**

**📌 단계 1: (가장 중요) `IdeaMapCanvas`에서 React Flow 인스턴스 저장 확인 및 구현**

*   **1-1. 파일 열기:** `src/components/ideamap/components/IdeaMapCanvas.tsx` 파일을 엽니다.
*   **1-2. `<ReactFlow>` 컴포넌트 찾기:** JSX 코드 내에서 `<ReactFlow ... />` 부분을 찾습니다.
*   **1-3. `onInit` Prop 확인:** `<ReactFlow>` 컴포넌트에 `onInit` prop이 있는지 확인합니다.
    *   **Case A: `onInit`이 이미 있고 `setReactFlowInstance`를 호출하는 경우:**
        *   호출 형태가 `onInit={setReactFlowInstance}` 또는 `onInit={(instance) => setReactFlowInstance(instance)}` 와 유사한지 확인합니다. (`setReactFlowInstance`는 `useIdeaMapStore`에서 가져와야 함). 이상 없다면 **단계 2**로 넘어갑니다.
    *   **Case B: `onInit`이 없거나 `setReactFlowInstance`를 호출하지 않는 경우:**
        *   파일 상단에 `import { useIdeaMapStore } from '@/store/useIdeaMapStore';` 를 추가합니다.
        *   컴포넌트 본문 상단에 `const setReactFlowInstance = useIdeaMapStore(state => state.setReactFlowInstance);` 를 추가합니다.
        *   `<ReactFlow>` 컴포넌트에 `onInit={setReactFlowInstance}` prop을 **추가**합니다. 예: `<ReactFlow ... onInit={setReactFlowInstance} ... />`
*   **1-4. 파일 저장:** 변경 사항을 저장합니다.

*   **✅ 개발자 확인:**
    *   `IdeaMapCanvas.tsx` 파일에 `onInit={setReactFlowInstance}` (또는 유사한 호출) 코드가 있는지 확인합니다.
    *   앱을 실행하고 개발자 콘솔에서 `[IdeaMap] ReactFlow 인스턴스 저장`과 같은 로그가 (해당 로그가 `useIdeaMapStore`의 `setReactFlowInstance` 액션 내에 있다면) 뜨는지 확인합니다. 또는 React DevTools로 `useIdeaMapStore`의 `reactFlowInstance` 상태가 `null`에서 실제 인스턴스 객체로 변경되는지 확인합니다.

**📌 단계 2: `IdeaMap` 컴포넌트의 노드 배치 로직 수정**

*   **2-1. 파일 열기:** `src/components/ideamap/components/IdeaMap.tsx` 파일을 엽니다.
*   **2-2. 필요한 상태/훅 가져오기:**
    *   파일 상단에 필요한 import 문이 있는지 확인하고 없다면 추가합니다:
        ```typescript
        import { useEffect, useRef } from 'react';
        import { useReactFlow, Node, Edge, XYPosition, ReactFlowInstance } from '@xyflow/react'; // ReactFlowInstance 추가
        import { useQueryClient } from '@tanstack/react-query';
        import { useIdeaMapStore } from '@/store/useIdeaMapStore';
        import { useCreateCardNode } from '@/hooks/useCardNodes';
        import { toast } from 'sonner';
        import createLogger from '@/lib/logger'; // 로거 임포트
        ```
    *   컴포넌트 본문 상단에서 다음 상태와 훅을 가져옵니다:
        ```typescript
        const logger = createLogger('IdeaMap'); // 로거 생성
        const queryClient = useQueryClient();
        const nodePlacementRequest = useIdeaMapStore(state => state.nodePlacementRequest);
        const clearNodePlacementRequest = useIdeaMapStore(state => state.clearNodePlacementRequest);
        const storedReactFlowInstance = useIdeaMapStore(state => state.reactFlowInstance); // 스토어 인스턴스 가져오기
        const { mutate: createCardNode } = useCreateCardNode();
        const reactFlowWrapper = useRef<HTMLDivElement>(null);
        // const reactFlowInstance = useReactFlow(); // 이 줄은 필요 없으면 제거 가능
        ```
*   **2-3. 노드 배치 `useEffect` 찾기 및 수정:** `nodePlacementRequest`를 의존성으로 가지는 `useEffect`를 찾거나 새로 **추가/수정** 합니다. 전체 구조는 아래와 같아야 합니다.
    ```typescript
    useEffect(() => {
      // 1. 요청 존재 여부 확인
      if (!nodePlacementRequest) {
        return; // 요청 없으면 아무것도 안 함
      }

      // 2. 스토어의 React Flow 인스턴스 준비 여부 확인 (핵심)
      if (!storedReactFlowInstance) {
         logger.warn('[IdeaMap Node Placement] ReactFlow 인스턴스가 아직 준비되지 않았습니다. 다음 렌더링 시 재시도합니다.');
         return; // 인스턴스 없으면 중단
      }

      // 3. 래퍼 요소 준비 여부 확인
      if (!reactFlowWrapper.current) {
        logger.warn('[IdeaMap Node Placement] ReactFlow 래퍼 요소를 찾을 수 없습니다.');
        clearNodePlacementRequest(); // 계속 실패할 수 있으므로 요청 초기화
        return;
      }

      // 4. 모든 준비 완료: 노드 배치 로직 실행
      const { cardId, projectId } = nodePlacementRequest;
      logger.debug('[IdeaMap] Processing node placement request:', { cardId, projectId });

      try {
          // 5. 위치 계산 (getViewport, screenToFlowPosition은 storedReactFlowInstance 사용)
          const { x: viewX, y: viewY, zoom } = storedReactFlowInstance.getViewport();
          const wrapperBounds = reactFlowWrapper.current.getBoundingClientRect();
          const centerX = wrapperBounds.width / 2;
          const centerY = wrapperBounds.height / 2;
          const flowCenterPosition = storedReactFlowInstance.screenToFlowPosition({ x: centerX, y: centerY });

          let finalPosition = { ...flowCenterPosition };
          const nodes = storedReactFlowInstance.getNodes(); // 스토어 인스턴스 사용
          const collisionThreshold = 10; // 충돌 감지 반경 조정 가능
          const offset = 10;

          const isColliding = nodes.some(node =>
              Math.abs(node.position.x - flowCenterPosition.x) < collisionThreshold &&
              Math.abs(node.position.y - flowCenterPosition.y) < collisionThreshold
          );

          if (isColliding) {
              logger.debug('[IdeaMap] Center collision detected, offsetting position.');
              finalPosition = { x: flowCenterPosition.x + offset, y: flowCenterPosition.y + offset };
          }
          logger.debug('[IdeaMap] Calculated final position:', finalPosition);

          // 6. CardNode 생성 API 호출 (createCardNode 뮤테이션 사용)
          createCardNode(
              { cardId, projectId, positionX: finalPosition.x, positionY: finalPosition.y },
              {
                  onSuccess: (newCardNode) => {
                      logger.info('[IdeaMap] CardNode created successfully:', newCardNode);
                      toast.success('노드가 보드에 추가되었습니다.');
                      // CardNodes 쿼리 무효화하여 새 노드 반영
                      queryClient.invalidateQueries({ queryKey: ['cardNodes', projectId] });
                      clearNodePlacementRequest(); // 성공 시 요청 초기화
                  },
                  onError: (error) => {
                      logger.error('[IdeaMap] Failed to create CardNode:', error);
                      toast.error(`보드에 노드를 추가하는 중 오류 발생: ${error.message}`);
                      clearNodePlacementRequest(); // 실패 시에도 요청 초기화
                  },
              }
          );
      } catch (instanceError) {
           logger.error('[IdeaMap Node Placement] ReactFlow 인스턴스 사용 중 오류:', instanceError);
           clearNodePlacementRequest(); // 오류 발생 시 요청 초기화
      }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
         nodePlacementRequest,       // 요청 상태 감지
         storedReactFlowInstance,    // 스토어 인스턴스 감지 (중요!)
         createCardNode,             // 뮤테이션 함수
         clearNodePlacementRequest,  // 상태 초기화 함수
         queryClient                 // 쿼리 클라이언트
    ]); // 의존성 배열 확인
    ```
*   **2-4. Wrapper `ref` 연결:** 컴포넌트의 JSX 반환 부분에서 최상위 `div`에 `ref={reactFlowWrapper}`가 설정되어 있는지 확인하고, 없다면 **추가**.
    ```jsx
     return (
       <div ref={reactFlowWrapper} className={cn("w-full h-full", className)}> {/* ref 연결 확인/추가 */}
         <IdeaMapCanvas
           // ... 기존 props ...
           reactFlowWrapper={reactFlowWrapper} // ref 전달
         />
         {/* ... */}
       </div>
     );
    ```
*   **2-5. 파일 저장:** 변경 사항 저장.

*   **✅ 개발자 확인:**
    *   타입 에러가 없는지 확인.
    *   Git diff를 통해 `useEffect`가 추가/수정되었고, `storedReactFlowInstance` 체크 로직과 의존성 배열이 올바르게 적용되었는지 확인합니다.
    *   앱 실행 후 MainToolbar에서 '+' 버튼으로 카드를 생성합니다.
    *   Sidebar 목록 업데이트와 **IdeaMap 중앙에 새 노드가 **안정적으로**(타이밍 이슈 없이) 나타나는지** 확인합니다.
    *   콘솔 로그에서 `[WARN] ReactFlow 인스턴스가 아직 준비되지 않았습니다` 경고가 더 이상 발생하지 않거나, 발생하더라도 이후 노드 배치 로직이 정상적으로 실행되는지 확인합니다. `[IdeaMap] Processing node placement request:` 로그 이후 `CardNode created successfully:` 로그가 뜨는지 확인합니다.
    *   TanStack Query DevTools에서 `cardNodes` 쿼리가 무효화되고 새 노드 데이터가 포함되어 리페치되는지 확인합니다.