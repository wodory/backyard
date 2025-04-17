## **작업 목록: React Flow 노드 위치 초기화 문제 해결**

**목표:** 앱 새로고침 후에도 React Flow 노드의 위치가 localStorage에 저장된 값으로 올바르게 복원되도록 수정합니다.

**현재 관찰된 문제점:**

1.  노드 이동 시 `localStorage`의 `backyard-board-layout` 키 값은 업데이트됩니다.
2.  앱 새로고침 시, `backyard-board-layout`에 저장된 위치 값을 읽어오지 않고 노드가 기본 위치로 배열됩니다.
3.  *첫 번째* 노드를 이동하면, 이동된 노드의 새 위치와 *나머지 노드들의 기본 위치*가 함께 `backyard-board-layout`에 저장됩니다.
4.  *두 번째* 노드 이동부터는 이동된 노드의 위치만 정상적으로 `backyard-board-layout`에 반영됩니다.

**핵심 원인 추정:** 초기 로딩 시 저장된 위치가 적용된 후, 사용자의 첫 노드 이동으로 인한 저장이 발생하기 *전에* `useIdeaMapStore`의 `nodes` 상태가 부분적으로 또는 전체적으로 기본 위치 값으로 초기화되는 것으로 보입니다.

**수행할 작업:**

1.  **초기 로드 시 위치 적용 확인:**
    *   **파일:** `src/store/useIdeaMapStore.ts`
    *   **함수:** `loadIdeaMapData` 액션
    *   **작업:** `localStorage`에서 `loadedLayout`을 가져와 `initialNodes`에 적용한 후, `set({ nodes: nodesWithPositions, ... })`를 호출하여 상태를 업데이트하는 직후에 `console.log('[loadIdeaMapData] 최종 상태 설정 후 노드:', get().nodes);` 를 추가합니다.
    *   **검증:** 앱 로드 시 콘솔 로그를 확인하여, `nodes` 상태가 `loadedLayout`의 위치 값으로 올바르게 설정되었는지 확인합니다.

2.  **로드 후 상태 변경 추적:**
    *   **파일:** `src/components/ideamap/components/IdeaMap.tsx`, `src/components/ideamap/components/IdeaMapCanvas.tsx`, 관련 훅 (`useIdeaMapData.ts`, `useIdeaMapUtils.ts` 등)
    *   **작업:** `loadIdeaMapData` 액션 완료 *이후*에 실행될 수 있는 `useEffect` 훅들을 찾습니다. 특히 `setNodes`나 레이아웃 관련 함수(`applyLayout`, `getLayoutedElements`, `getGridLayout` 등)를 호출하는 `useEffect`가 있는지 확인하고, 있다면 해당 위치에 식별 가능한 `console.log`를 추가합니다. (예: `console.log('[ComponentName] useEffect 실행 - setNodes 호출');`)
    *   **검증:** 앱 로드 시 콘솔 로그 순서를 확인하여, `loadIdeaMapData` 완료 후 의도치 않게 `nodes` 상태를 변경하는 로직이 있는지 확인합니다.

3.  **첫 저장 시점 상태 검사:**
    *   **파일:** `src/store/useIdeaMapStore.ts`
    *   **함수:** `saveLayoutAction` 액션
    *   **작업:** `saveLayout(nodesToSave)` 유틸리티 함수를 호출하기 *직전*에 `console.log('[saveLayoutAction] 저장 직전 노드 상태:', nodesToSave);` 를 추가합니다.
    *   **검증:** 앱 로드 후 *첫 번째 노드를 이동*했을 때 콘솔 로그를 확인합니다. `nodesToSave` 배열에 있는 다른 노드들의 위치가 기본값으로 되어 있는지, 아니면 이전에 로드된 저장값이 유지되고 있는지 확인합니다. (기본값으로 나온다면, 1번과 2번 작업 사이에서 상태가 변경된 것입니다.)

4.  **구형 레이아웃 코드 비활성화 확인:**
    *   **파일:** 코드베이스 전체
    *   **작업:** `<DagreNodePositioning ... />` 컴포넌트 사용 부분을 검색합니다. 만약 존재한다면 해당 부분을 주석 처리하거나 삭제합니다.
    *   **검증:** 해당 컴포넌트가 문제의 원인이었는지 확인합니다. (변경 후 문제가 해결되는지 테스트)

5.  **초기 노드 생성 및 위치 로딩 순서 검토:**
    *   **파일:** `src/store/useIdeaMapStore.ts`
    *   **함수:** `loadIdeaMapData` 액션
    *   **작업:** `loadLayoutFromStorage()` 호출 및 저장된 위치를 `map`으로 적용하는 로직이, API로부터 카드 데이터를 받아 `initialNodes` 배열을 생성하는 로직 *이후*에 실행되는지 코드 순서를 확인합니다.
    *   **검증:** 코드 구조상 로직 순서가 올바른지 확인합니다. (순서가 잘못되었다면 수정 필요)

6.  **(조건부) 수정 적용:**
    *   **작업:** 위의 1-5번 작업 결과를 바탕으로 원인을 파악하고 코드를 수정합니다.
        *   만약 2번 작업에서 의도치 않은 `setNodes` 호출이나 레이아웃 적용이 발견되면 해당 로직을 수정하거나 제거합니다.
        *   만약 3번 작업에서 첫 저장 시 `nodesToSave` 상태가 이미 잘못되었다면, 1번과 2번 작업에서 발견된 문제점을 해결합니다.
        *   만약 5번 작업에서 순서가 잘못되었다면 수정합니다.
    *   **검증:** 수정 후 앱을 새로고침하고 노드를 이동시켜 문제가 해결되었는지 최종 확인합니다.
