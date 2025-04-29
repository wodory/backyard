**목표:** 새 카드 추가 시 사이드바에는 표시되지만 아이디어맵(React Flow)에는 노드가 표시되지 않는 버그를 수정한다.

**주요 의심 원인:** `useAppStore` (전역 카드 목록)와 `useIdeaMapStore` (아이디어맵 노드/엣지) 간의 데이터 동기화 부재. 특히, 아이디어맵 데이터 로딩 시 API 호출 및 카드->노드 변환 로직 누락 가능성.

**대상 파일:** (필요시 Agent가 다른 파일도 참고할 수 있음)
*   `src/store/useIdeaMapStore.ts` (핵심 수정 대상)
*   `src/store/useAppStore.ts`
*   `src/components/ideamap/components/IdeaMap.tsx`
*   `src/components/ideamap/hooks/useIdeaMapData.ts`
*   `src/app/api/cards/route.ts`
*   `src/components/ideamap/types/ideamap-types.ts`
*   `src/lib/ideamap-constants.ts`

---

**Tasklist:**

**Phase 1: 현상 확인 및 진단**

1.  **`useIdeaMapStore.loadIdeaMapData` 분석:**
    *   `src/store/useIdeaMapStore.ts` 파일을 열고 `loadIdeaMapData` 액션의 **실제 구현**을 상세히 분석한다.
    *   **확인 항목:**
        *   이 함수가 `/api/cards` 엔드포인트를 호출하여 카드 목록을 가져오는가?
        *   가져온 `Card[]` 데이터를 `Node<CardData>[]` 형태로 변환하는 로직이 있는가?
        *   주로 로컬 스토리지(`IDEAMAP_LAYOUT_STORAGE_KEY`, `IDEAMAP_EDGES_STORAGE_KEY`)에서 데이터를 로드하는 역할만 수행하는가?
    *   분석 결과를 주석이나 로그로 명확히 기록한다.

2.  **데이터 흐름 추적 (새 카드 생성 시):**
    *   사용자가 `CreateCardModal`에서 새 카드를 생성했을 때의 데이터 흐름을 따라간다.
    *   `useAppStore.createCard` 액션이 성공적으로 `/api/cards`를 호출하고, `useAppStore`의 `cards` 상태를 업데이트하는지 확인한다.
    *   `useAppStore.cards` 상태가 변경되었을 때, 이 변경 사항이 `useIdeaMapStore.nodes` 상태에 반영되는 로직(Effect, 리스너 등)이 `IdeaMap.tsx` 또는 관련 훅에 **존재하는지** 확인한다. (존재하지 않을 가능성이 높음)

**Phase 2: 문제 해결 구현**

3.  **`useIdeaMapStore.loadIdeaMapData` 수정:**
    *   (Task 1의 분석 결과에 따라) `loadIdeaMapData` 함수를 다음과 같이 수정한다:
        *   **[추가]** `/api/cards` API를 호출하여 최신 `Card[]` 목록을 가져온다.
        *   **[추가]** 가져온 `Card[]` 데이터를 `Node<CardData>[]` 형태로 변환한다.
            *   각 노드의 `id`는 카드 `id`와 동일하게 설정한다.
            *   노드 `type`을 `'card'`로 명시적으로 설정한다 (`src/lib/flow-constants.ts` 참조).
            *   노드 `data` 필드에 카드 정보(`id`, `title`, `content`, `tags` 등 `CardNode`가 필요로 하는 정보)를 `CardData` 타입에 맞게 매핑한다 (`src/components/ideamap/types/ideamap-types.ts` 참조).
        *   **[유지/개선]** 로컬 스토리지(`IDEAMAP_LAYOUT_STORAGE_KEY`)에서 저장된 노드 위치 정보를 로드한다.
        *   **[개선]** 변환된 노드 배열과 저장된 위치 정보를 **병합**한다. (ID가 일치하는 노드에 저장된 위치 적용, 없는 노드는 기본 위치 할당 또는 자동 배치 로직 적용).
        *   **[유지]** 로컬 스토리지(`IDEAMAP_EDGES_STORAGE_KEY`)에서 엣지 정보를 로드한다.
        *   최종적으로 생성/병합된 `nodes`와 로드된 `edges`로 Zustand 상태를 업데이트한다 (`set({ nodes: ..., edges: ... })`).
        *   데이터 로딩 시작/종료 시 `isIdeaMapLoading`, 오류 발생 시 `ideaMapError` 상태를 업데이트한다.

4.  **새 카드 생성 시 노드 동기화 로직 구현:**
    *   `useAppStore.createCard` 액션이 성공적으로 완료되었을 때, 생성된 새 카드 정보(`newCard`)를 사용하여 `useIdeaMapStore`의 `nodes` 상태에도 해당 노드를 추가하는 로직을 구현한다.
    *   **구현 방법 선택 (택 1):**
        *   **방법 A (권장될 수 있음):** `useAppStore.createCard` 액션 내에서 API 호출 성공 후, `useIdeaMapStore.getState().addNode(newCard)` 와 같은 방식으로 직접 `useIdeaMapStore` 액션을 호출하여 노드를 추가한다. (상태 관리 패턴에 따라 다를 수 있음)
        *   **방법 B:** `IdeaMap.tsx` 또는 관련 컴포넌트에서 `useEffect`를 사용하여 `useAppStore.cards` 배열의 변경(특히 길이 증가)을 감지하고, 새 카드가 발견되면 `useIdeaMapStore.addNode` 액션을 호출한다. (구현이 더 복잡할 수 있음)
    *   새 노드를 추가할 때도 Task 3과 마찬가지로 올바른 `id`, `type`, `data`, 기본 `position`을 설정해야 한다.

**Phase 3: 검증 및 마무리**

5.  **타입 호환성 검증:**
    *   `useAppStore`의 `Card` 타입과 `useIdeaMapStore`의 `Node<CardData>` 내부 `data` 필드 간의 타입이 호환되는지, 필요한 모든 속성이 올바르게 매핑되었는지 확인하고 필요시 `CardData` 인터페이스(`src/components/ideamap/types/ideamap-types.ts`)를 수정한다.

6.  **로컬 스토리지 상호작용 검토:**
    *   수정된 `loadIdeaMapData`가 로컬 스토리지의 노드 위치/엣지 정보를 올바르게 로드하고, API에서 가져온 데이터와 병합하는 로직을 다시 검토한다.

7.  **(선택 사항) 디버깅 로그 추가:**
    *   수정된 `loadIdeaMapData` 및 새 카드 동기화 로직 내부에 임시 `console.log`를 추가하여 데이터 흐름과 상태 변화를 쉽게 추적할 수 있도록 한다.

**최종 목표:** 앱 실행 시 아이디어맵에 API로부터 로드된 카드들이 노드로 표시되고, 새 카드를 추가하면 아이디어맵에도 즉시 해당 노드가 나타나야 한다.