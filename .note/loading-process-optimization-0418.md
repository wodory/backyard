**중요 제약 조건:**

1.  **문제 해결 집중:** 아래 Tasklist에 명시된 로그 정리, 이중 실행 방지, 상태 업데이트 최적화 문제에만 집중하고, 관련 없는 코드 개선이나 리팩토링은 수행하지 마세요. (UI 깜빡임 문제는 이전 단계에서 해결된 것으로 간주합니다.)
2.  **기존 아키텍처 유지:** 현재 프로젝트는 Zustand 상태 관리와 액션 기반 커맨드 패턴, MSW 테스트 환경을 사용합니다. 이 구조를 반드시 유지해야 합니다. 제공된 `.cursor/.rules` 폴더의 규칙을 준수해 주세요.
3.  **단계별 작업 및 검증:** 각 Task는 작은 단위로 구성되어 있으며, 하나의 Task 완료 후에는 앱이 정상적으로 실행되고 버그가 없는 상태여야 합니다.

---

**Tasklist:**

**Task 1: 디버깅 로그 정리 및 조건부 로깅 적용**

*   **목표:** 앱 초기화 시 콘솔에 출력되는 로그 양을 대폭 줄여 가독성을 높이고, 개발 환경에서만 상세 로그가 보이도록 합니다.
*   **수정 대상 파일:**
    *   `src/lib/logger.ts`
    *   로그가 많은 주요 컴포넌트/훅: `src/components/ideamap/components/IdeaMap.tsx`, `src/components/ideamap/hooks/useIdeaMapData.ts`, `src/components/layout/ClientLayout.tsx`, `src/contexts/AuthContext.tsx`, `src/store/useAppStore.ts`, `src/store/useIdeaMapStore.ts`, `src/components/ideamap/components/IdeaMapCanvas.tsx` 등 (콘솔 로그에서 식별된 파일 중심)
*   **수행 작업:**
    1.  `src/lib/logger.ts` 파일을 열고, `createLogger` 함수 또는 각 로깅 메소드(`debug`, `info`, `warn`, `error`) 내부에 환경 변수(`process.env.NODE_ENV`)를 확인하는 로직을 추가합니다. `debug` 레벨 로그는 `process.env.NODE_ENV === 'development'`일 때만 콘솔에 출력되도록 수정합니다. (예: `debug` 메소드 시작 부분에 `if (process.env.NODE_ENV !== 'development') return;` 추가)
    2.  콘솔 로그에 자주 등장하는 파일들을 검토합니다.
    3.  반복적으로 출력되거나(특히 컴포넌트 렌더링 시 본문에서 호출되는 `console.log`), 상태 확인 등 상세 디버깅 목적의 `logger.info` 또는 `console.log` 호출을 찾아 `logger.debug()`로 변경합니다.
        *   예시: `IdeaMap.tsx`의 `[IdeaMap] 인증 상태`, `[IdeaMap] IdeaMapStore 상태` 로그 등.
        *   예시: `useIdeaMapData.ts`의 `[useIdeaMapData] 훅 초기화`, `[useIdeaMapData] 데이터 로드 완료` 등.
        *   예시: `ClientLayout.tsx`의 `localStorage 접근 가능`, `사용자 ID` 로그 등.
    4.  컴포넌트 렌더링 함수 본문(`return` 이전)에 직접 사용된 `console.log`는 `useEffect(..., [])` 내부로 옮기거나 `logger.debug`로 변경/제거하여 렌더링마다 실행되지 않도록 합니다.
    5.  중요한 이벤트(예: 초기화 완료, 사용자 로그인/로그아웃, 심각한 오류 발생)는 `logger.info` 또는 `logger.error`로 유지합니다.
*   **변경 범위 제한:** 로깅 관련 코드만 수정합니다. 함수의 핵심 로직이나 상태 변경 로직은 건드리지 마세요.
*   **사용자 확인 사항:**
    1.  코드 변경 후 앱을 다시 빌드하고 실행합니다 (`yarn dev`).
    2.  브라우저 개발자 도구 콘솔을 엽니다.
    3.  **결과 확인:** 앱 초기 로드 시 콘솔 로그가 이전보다 현저히 줄어들었는지 확인합니다. 반복적이거나 상세한 상태 로그 대신, 주요 단계(예: Hydration 완료, AuthContext 초기화 완료, 주요 오류) 위주로 간결하게 출력되어야 합니다. `debug` 레벨 로그는 보이지 않아야 정상입니다. (필요 시 logger 구현에 따라 개발자 도구 필터 조정)

**Task 2: 개발 환경 `useEffect` 이중 실행 방지 적용**

*   **목표:** React 18 Strict Mode로 인해 개발 환경에서 초기 데이터 로딩 등 `useEffect`가 두 번 실행되는 것을 방지합니다.
*   **수정 대상 파일:** 초기 데이터 로딩 로직이 포함된 `useEffect` (주로 `src/components/ideamap/hooks/useIdeaMapData.ts`, 필요시 `IdeaMap.tsx` 등 다른 파일도 확인)
*   **수행 작업:**
    1.  `src/components/ideamap/hooks/useIdeaMapData.ts` 파일을 엽니다.
    2.  `loadNodesAndEdges` 함수를 호출하는 `useEffect` (대략 95라인 근처)를 찾습니다.
    3.  해당 훅 컴포넌트 최상단에 `useRef`를 import하고 ref를 선언합니다.
        ```javascript
        import { ..., useRef } from 'react';
        // ...
        const didFetch = useRef(false);
        ```
    4.  `useEffect` 내부 로직 시작 부분에 아래 코드를 추가하여 개발 환경에서 두 번째 실행을 건너뜁니다.
        ```diff
        useEffect(() => {
        + // Strict Mode 이중 실행 방지 (개발 환경에서만)
        + if (process.env.NODE_ENV === 'development' && didFetch.current) {
        +   console.log('[useIdeaMapData] Strict Mode 이중 실행 방지됨'); // 확인용 임시 로그
        +   return;
        + }
        + didFetch.current = true;

          // 기존 effect 로직 시작 (예: loadNodesAndEdges())
          // ...
        }, [loadNodesAndEdges]); // 의존성 배열 확인 및 유지
        ```
    5.  앱 내 다른 컴포넌트나 훅에서도 초기화 목적으로 마운트 시 한 번만 실행되어야 하는 `useEffect`가 있다면 동일한 패턴을 적용합니다. (로그 분석 결과 `useIdeaMapData`가 주요 대상임)
*   **변경 범위 제한:** `useEffect` 내부에 `useRef`와 조건부 반환 로직만 추가합니다. 기존 `useEffect`의 핵심 로직이나 의존성 배열은 변경하지 마세요.
*   **사용자 확인 사항:**
    1.  코드 변경 후 앱을 다시 빌드하고 실행합니다 (`yarn dev`).
    2.  브라우저 개발자 도구 콘솔 및 네트워크 탭을 엽니다.
    3.  **결과 확인:**
        *   앱 초기 로드 시, 이전에 두 번 호출되던 API(예: `/api/cards`)가 **한 번만** 호출되는지 네트워크 탭에서 확인합니다.
        *   관련 로그(예: `[useIdeaMapData] 아이디어맵 데이터 로드 시작`)가 콘솔에 **한 번만** 출력되는지 확인합니다. (만약 방지 로그를 추가했다면 "Strict Mode 이중 실행 방지됨" 로그가 한 번 보일 수 있습니다.)

**Task 3: Zustand 상태 업데이트 최적화 (배칭)**

*   **목표:** 여러 Zustand 상태 조각을 연속적으로 업데이트하는 로직을 찾아, 단일 업데이트로 묶어 잠재적인 다중 리렌더링을 줄입니다.
*   **수정 대상 파일:** `src/store/useIdeaMapStore.ts` (특히 `loadIdeaMapData`, `syncCardsWithNodes` 액션 내부)
*   **수행 작업:**
    1.  `src/store/useIdeaMapStore.ts` 파일을 엽니다.
    2.  `loadIdeaMapData` 또는 `syncCardsWithNodes` 같이 비동기 작업 후 여러 상태를 업데이트하는 액션을 찾습니다.
    3.  해당 액션 내에서 `set({ nodes: ... }); set({ edges: ... }); set({ isLoading: ... });` 와 같이 여러 번의 `set` 호출이 연속적으로 사용되는 부분을 찾습니다.
    4.  이를 하나의 `set` 호출로 통합합니다.
        ```diff
        // 예시: syncCardsWithNodes 액션 내부
        // ... 로직 ...
        const updatedNodes = ...;
        const updatedEdges = ...; // 필요하다면 엣지도 업데이트

        - set({ nodes: updatedNodes });
        - set({ hasUnsavedChanges: true }); // 예시: 다른 상태 업데이트
        - set({ isSyncing: false }); // 예시: 로딩 상태 업데이트
        + set({
        +   nodes: updatedNodes,
        +   hasUnsavedChanges: true, // 관련된 모든 상태를 한 번에 업데이트
        +   isSyncing: false,
        +   // 필요하다면 edges 등 다른 상태도 함께 업데이트
        + });
        ```
    5.  `loadIdeaMapData` 액션에서도 유사하게, 데이터 로딩 완료 후 `nodes`, `edges`, `isIdeaMapLoading`, `ideaMapError` 등을 업데이트할 때 단일 `set` 호출을 사용하도록 수정합니다.
*   **변경 범위 제한:** Zustand 스토어 액션 내부의 `set` 함수 호출 방식만 수정합니다. 상태 값을 계산하는 로직은 변경하지 마세요.
*   **사용자 확인 사항:**
    1.  코드 변경 후 앱을 다시 빌드하고 실행합니다 (`yarn dev`).
    2.  앱 초기 로드 과정을 관찰합니다. React DevTools Profiler가 있다면 사용하여 `IdeaMap` 관련 컴포넌트의 리렌더링 횟수를 이전과 비교해봅니다.
    3.  **결과 확인:** (시각적으로 큰 차이가 없을 수 있음)
        *   Profiler 사용 시, 초기 데이터 로드 완료 후 관련 컴포넌트의 리렌더링 횟수가 이전보다 줄었는지 확인합니다.
        *   콘솔 로그(Task 1에서 정리되지 않은 로그가 있다면)에서 상태 업데이트 관련 로그나 컴포넌트 렌더링 로그가 이전보다 더 묶여서 나타나는지 확인합니다. 앱의 전반적인 초기 로딩이 약간 더 부드러워졌는지 체감적으로 확인합니다.

---

**작업 완료 후:**

위 Task 1, 2, 3을 순서대로 완료하면, 앱 초기화 시 콘솔 로그가 훨씬 간결해지고, 개발 환경에서의 불필요한 작업이 줄어들며, 상태 업데이트로 인한 잠재적 리렌더링 오버헤드가 감소할 것입니다. Agent는 각 Task 완료 후 코드가 컴파일되고 실행 가능한 상태인지 확인해 주세요.