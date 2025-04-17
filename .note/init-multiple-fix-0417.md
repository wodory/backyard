## **작업 목록: React Flow/IdeaMap 중복 초기화 문제 해결**

**목표:** `IdeaMap` 컴포넌트 및 관련 훅/스토어의 불필요한 반복 렌더링 및 초기화 로직 호출을 제거하여 성능을 개선하고 상태 관리의 안정성을 높입니다.

**현재 문제:** 로그 분석 결과, `IdeaMap` 컴포넌트, 관련 훅(`useIdeaMapData`), 스토어 액션(`loadIdeaMapData`, `syncCardsWithNodes` 등)이 여러 번 불필요하게 호출되어 초기화 로직이 중복 실행되는 것으로 보입니다.

**제약 조건:**

1.  현재의 Zustand 스토어 액션 기반 구조(커맨드 패턴 유사)를 유지합니다.
2.  리팩토링보다는 기능 오류 수정에 집중합니다.

**수행할 작업:**

1.  **`IdeaMap` 컴포넌트 렌더링 최적화:**
    *   **파일:** `src/components/ideamap/components/IdeaMap.tsx`
    *   **작업 1:** 컴포넌트 상단에서 `useAppStore`, `useIdeaMapStore` 등을 통해 가져오는 상태 값 중, 불필요하게 전체 객체를 구독하는 대신 필요한 특정 상태 값만 `selector` 함수를 이용해 구독하도록 수정합니다. (예: `const nodes = useIdeaMapStore(state => state.nodes);`) 이렇게 하면 관련 없는 상태 변경으로 인한 불필요한 재렌더링을 줄일 수 있습니다.
    *   **작업 2:** `IdeaMap` 컴포넌트 내부에 정의된 콜백 함수들(예: 핸들러 함수)을 `useCallback`으로 감싸 의존성 배열을 정확히 명시하여, 불필요한 함수 재생성을 막습니다. 이는 하위 컴포넌트(예: `IdeaMapCanvas`)의 재렌더링도 방지할 수 있습니다.
    *   **작업 3:** `IdeaMap` 컴포넌트 자체를 `React.memo`로 감싸는 것을 고려합니다. 전달되는 `props`가 실제로 변경될 때만 재렌더링되도록 합니다. (단, `props`로 함수가 전달되는 경우 `useCallback`이 필수적입니다.)
    *   **검증:** 수정 후 앱 실행 시, `[IdeaMap] 컴포넌트 렌더링 시작` 로그의 호출 횟수가 줄어들었는지 확인합니다.

2.  **`useIdeaMapData` 훅 최적화:**
    *   **파일:** `src/components/ideamap/hooks/useIdeaMapData.ts`
    *   **작업 1:** `fetchLogs` 함수 (로그 뷰어 관련으로 보이나, 만약 해당 파일에 유사한 데이터 로딩 함수가 있다면) 또는 `loadNodesAndEdges` 함수를 `useCallback`으로 감싸고 있는지 확인하고, 의존성 배열(`[]`)이 올바르게 설정되어 컴포넌트 마운트 시 한 번만 실행되도록 합니다. (현재 로그 상으로는 `useCallback` 처리가 되어 있는 것으로 보이지만 재확인)
    *   **작업 2:** `useEffect` 훅들의 의존성 배열을 면밀히 검토합니다. 불필요하게 자주 변경되는 값(예: 매번 새로 생성되는 객체나 함수)이 의존성 배열에 포함되어 이펙트가 반복 실행되는지 확인하고 수정합니다.
    *   **검증:** 수정 후 앱 실행 시, 해당 훅 내부의 `console.log` 호출 횟수가 현저히 줄어들었는지 확인합니다.



3.  **`useEffect` 중복 실행 방지:**
    *   **파일:** `src/components/ideamap/components/IdeaMap.tsx` 및 관련 훅
    *   **작업 1:** 데이터 로딩, 동기화 등 초기화 관련 로직을 수행하는 `useEffect` 훅 내부에 실행 조건을 명확히 합니다. 예를 들어, 로딩 상태 플래그(`isLoading`)나 초기 로드 완료 플래그(`initialLoadCompleteRef`)를 사용하여 해당 로직이 **단 한 번만** 실행되도록 보장합니다. `useRef`를 사용하여 마운트 여부나 초기 로드 완료 여부를 추적하는 것이 효과적입니다.
        ```typescript
        const isMounted = useRef(false);
        const initialLoadCompleted = useRef(false);

        useEffect(() => {
          if (!isMounted.current) {
            isMounted.current = true;
            // 마운트 시 1회만 실행할 작업
          }
        }, []);

        useEffect(() => {
          if (!initialLoadCompleted.current && !isLoading && nodes.length > 0) {
             // 데이터 로드 완료 후 1회만 실행할 작업
             console.log("초기 데이터 로드 완료 후 작업 실행");
             // 예: fitView(), 뷰포트 복원 등
             initialLoadCompleted.current = true;
          }
        }, [isLoading, nodes]); // isLoading, nodes 등 관련 상태 변경 시 체크
        ```
    *   **작업 2:** `loadIdeaMapData` 액션 호출 부분을 검토합니다. `IdeaMap.tsx`의 `useEffect`나 `useIdeaMapData.ts` 내부에서 중복 호출되지 않도록, 호출 전에 로딩 상태(`isIdeaMapLoading`)를 확인하는 로직이 있는지 확인하고 강화합니다. (로그상 `이미 데이터 로딩 중` 메시지가 뜨는 것으로 보아 일부 방어 로직은 있으나, 호출 시도 자체를 줄여야 합니다.)
    *   **검증:** 수정 후 앱 실행 시, 초기화 관련 로그(`데이터 로드 시작`, `syncCardsWithNodes 시작` 등)가 불필요하게 여러 번 나타나지 않고 예상된 횟수만큼만 실행되는지 확인합니다.

4.  **상태 동기화 로직 검토:**
    *   **파일:** `src/store/useIdeaMapStore.ts` (`syncCardsWithNodes` 액션), `src/components/ideamap/components/IdeaMap.tsx` (동기화 Effect)
    *   **작업:** `syncCardsWithNodes` 액션이 호출되는 조건을 명확히 합니다. 카드 목록(`useAppStore`의 `cards`)이나 노드 목록(`useIdeaMapStore`의 `nodes`)이 실제로 변경되었을 때만 호출되도록 `IdeaMap.tsx`의 관련 `useEffect` 의존성 배열을 정확하게 설정합니다. 현재 로그에서 동기화 시작 시점의 노드 수가 0이었다가 6으로 바뀌는 등 불안정한 모습이 보이므로, 이 Effect의 실행 시점과 조건을 재검토합니다.
    *   **검증:** 카드 데이터가 로드되고 노드 상태가 안정화된 후 동기화 로직이 필요한 시점에 한 번만 실행되는지 확인합니다.

5.  **종합 테스트:**
    *   **작업:** 위의 수정 사항들을 적용한 후, 앱을 새로고침하고 개발자 도구의 콘솔 로그를 전체적으로 확인합니다. `[IdeaMap] 컴포넌트 렌더링 시작`, `[useIdeaMapData] 훅 초기화`, `loadIdeaMapData`, `syncCardsWithNodes` 관련 로그들의 호출 횟수가 초기 로드 시 예상되는 수준(대부분 1~2회)으로 줄었는지 확인합니다.
    *   **검증:** 중복 초기화 문제가 해결되었는지 최종 확인합니다.