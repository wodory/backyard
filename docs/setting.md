# 목표
이 문서는 backyard의 "설정 구현 방식"을 설명합니다.

# 용어 설명
1. 기본값 : uiOptions.json에 정의한 앱 실행에 필요한 속성값
2. 사용자 설정값 : UI로 설정할 수 있는 속성값. 지금은 엣지 관련 속성을 Project Toolbar에서 설정. 
3. 전체 설정값 : 기본값에 사용자 설정값을 머지한 앱의 전체 설정값
4. 개별값 : 각 노드/엣지 등에 개별적으로 설정한 속성값. 설정값 안에서 선택할 수 있음. (지금은 구현하지 않았음)

# 우선 순위 
개별값 > 사용자 설정값/전체 설정값 > 기본값

# 앱 최초 실행
1. **기본값을 로드:** 앱을 시작하면 /Users/wodory/Development/apps/backyard/src/config/uiOptions.json 파일에서 기본값 로드.
    - 내부에서 쓰이는 다른 default setting도 모두 이 파일로 통합 필요함. 
2. **초기 랜더링:** 기본값 중 아이디어맵의 엣지, 노드 및 기능 초기화에 필요한 값=아이디어맵 UI 랜더링에 필요한 값을 사용해서 아이디어맵 랜더링 
3. **사용자 설정 레코드 생성:** 
    - 사용자가 처음 로그인하거나 앱을 사용하는 시점에 **기본값 중에서 사용자 설정값 변경 가능한 항목들(즉, 설정값의 기본 상태)**을 추출하여
    - DB settings 테이블에 해당 사용자의 레코드를 **생성 및 저장**합니다.
    - 이후 설정을 수정(UPDATE) 할 때 대상 레코드가 항상 존재하도록 보장합니다.
    ```Project Toolbar에서 사용자가 UI로 정의할 수 있는 옵션
        "style": {
            "stroke": "#C1C1C1",
            "strokeWidth": 2
            "edgeType": "default",
            "animated": true,
            "edgeColor": "#000000",
            "strokeWidth": 1,
            "selectedEdgeColor": "#FF0072",
            "connectionLineType": "default"
        }
    ```
4. **개별값 필드 초기화:** 아이디어맵에 노드나 엣지가 최초로 생성될 때, 해당 DB 레코드(card_nodes, edges)의 style 컬럼은 {} (빈 객체)로 초기화합니다.

# 앱 실행 후 로드 (최초 실행 제외)

1.  **엣지, 노드, 카드 정보 로드:** `useCards`, `useCardNodes`, `useEdges` (React Query 훅)를 통해 DB에서 현재 프로젝트의 카드, 노드, 엣지 데이터를 가져옵니다.
2.  **전체 설정값 로드 (Base Query):**
    *   `useUserSettingsQuery` (가칭, 기본 React Query 훅)를 사용하여 `queryKey: ['userSettings', userId]`로 `GET /api/settings` API를 호출, **사용자 설정값** (`settingsData` JSON 객체)을 DB에서 가져와 React Query 캐시에 저장합니다.
3.  **기능별 설정 구성 및 제공 (Feature Hooks with `select`):**
    *   **`useIdeaMapSettings`** 훅:
        *   내부적으로 `queryKey: ['userSettings', userId]`를 구독합니다.
        *   **`select` 옵션**을 사용하여 캐시된 전체 설정값(`fullSettings`)에서 `ideamap` 부분 (`fullSettings?.settingsData?.ideamap`)을 **추출**합니다.
        *   추출된 `ideamap` 설정값과 `uiOptions.json`에서 가져온 `DEFAULT_SETTINGS.ideamap` (기본값)을 **병합**합니다 (`{ ...DEFAULT_SETTINGS.ideamap, ...(extractedIdeamapSettings || {}) }`).
        *   최종적으로 조합된 **아이디어맵 전용 설정 객체**를 `data`로 반환합니다.
    *   **`useThemeSettings`, `useGeneralSettings`** 등 다른 기능별 훅도 동일한 방식으로 `select` 옵션을 사용하여 필요한 부분을 추출하고 해당 기본값과 병합하여 반환합니다.
4.  **아이디어맵 초기화 및 렌더링:**
    *   `IdeaMapCanvas`, `CustomEdge`, `CardNode` 등 아이디어맵 관련 UI 컴포넌트들은 **`useIdeaMapSettings` 훅**에서 제공하는 최종 렌더링 설정 객체를 사용합니다.
    *   다른 UI 컴포넌트(예: `ThemeSwitcher`)는 **`useThemeSettings` 훅**을 사용합니다.
    *   컴포넌트는 DB에서 로드된 노드/엣지 데이터와 조합하여 아이디어맵을 렌더링합니다.

# 앱에서 setting 변경

1.  **UI 변경 및 Mutation 호출:** 사용자가 UI(예: `ProjectToolbar`)에서 설정을 변경하면, 해당 변경 핸들러는:
    *   즉각적인 UI 피드백을 위한 로컬/Zustand 상태 업데이트.
    *   **`useUpdateSettingsMutation`** (가칭, React Query Mutation 훅)의 `mutate` 함수를 호출하여, **변경된 설정 부분만 포함하는 객체**(예: `{ "ideamap": { "strokeWidth": 3 } }`)를 DB에 저장하도록 요청합니다. (PATCH 방식)
2.  **DB 저장 및 **기본 쿼리** 캐시 무효화:**
    *   Mutation 훅은 `/api/settings` (PATCH) API를 호출하여 DB `settings` 테이블의 사용자 레코드를 업데이트합니다.
    *   **Mutation 성공 시 (`onSuccess`):** `queryClient.invalidateQueries({ queryKey: **['userSettings', userId]** })`를 호출하여 **기본 사용자 설정 쿼리 캐시**를 **무효화**합니다.
3.  **데이터 Refetch 및 자동 재조합/업데이트:**
    *   무효화된 `['userSettings', userId]` 쿼리는 자동으로 다시 실행(refetch)되어 최신 전체 설정값을 가져옵니다.
    *   **`useIdeaMapSettings`, `useThemeSettings`** 등 이 쿼리 키를 구독하는 모든 기능별 훅들은 새로운 전체 설정값을 받아 **`select` 함수를 다시 실행**하여, 업데이트된 최종 렌더링 설정 객체를 생성하고 캐시를 업데이트합니다.
4.  **UI 리렌더링:** 기능별 훅(`useIdeaMapSettings` 등)을 구독하고 있는 UI 컴포넌트들은 업데이트된 최종 설정 객체를 받아 리렌더링됩니다.


# (TODO) 개별 엣지/노드 설정 적용
1.  **개별값 설정 UI:** 사용자가 특정 노드나 엣지를 선택하고 스타일(색상, 두께 등)을 변경할 수 있는 UI를 제공합니다.
2.  **DB 저장:** 변경된 스타일 정보는 해당 노드/엣지의 DB 레코드(`card_nodes`, `edges`)의 `style` 컬럼(JSON)에 저장됩니다.
3.  **렌더링 시 우선순위 적용:**
    *   `CardNode`, `CustomEdge` 등 렌더링 컴포넌트는 props로 전달받은 개별 `style` 객체와, **`useIdeaMapSettings`** 훅을 통해 얻은 **최종 렌더링 설정**(전역 설정 + 기본값 조합)을 비교/병합합니다.
    *   **우선순위(`개별값 > 설정값 > 기본값`)**에 따라 최종 스타일을 결정합니다.
    *   이 병합 로직은 재사용 가능한 유틸리티 함수로 만드는 것이 좋습니다.
