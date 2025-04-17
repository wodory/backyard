# **아키텍처** 의견

# 전체 : 해결해야 할 문제
    *   초기화 중복 로직
    *   프로덕션 
        *   설정 저장 문제
        *   설정 업데이트 문제
    *   노드/엣지 데이터의 낙관적 업데이트 (지금은 로컬 스토리지에만 저장)

# Phase 1.스토어**
1.  **useAppStore**는 slice한 여러 Store로 전역 관리 
    *   **이유** : Card가 가장 중요한 공통 객체 + 앱의 여러 UI가 상태를 공유해야 함. 
    *   **slice 대상**
        *   **DataStore**
            *   글로벌 데이터 스토어
            *   Card 및 Edge 정보를 중앙 관리 : single source of truth
            *   Card Select 등 기존의 전역 상태 저장.
            *   ref : https://zustand.docs.pmnd.rs/guides/slices-pattern
            *   ref : https://zustand.docs.pmnd.rs/guides/typescript#slices-pattern
        *   *SettingStore*
            *   IdeaMap의 setting MainTooblar의 icon/action 등 앱 전체의 설정

2.  **useIdeaMapStore**
    *   **아이디어 맵에 한정된 상태 스토어** (레이아웃 배치, 뷰포트 좌표, 줌, 노드 선택 등)
    *   React Flow의 보드 랜더링(뷰)에 필요한 상태 저장.
    *   카드 내용 데이터, 엣지 데이터는 AppStore에서 구독 → CardNode 객체로 변환
    *   ***useNodeStore**도 통합. 
    *   로직을 커스텀 훅으로 분리:
        *   **useIdeaMapLayout:** 레이아웃 계산 및 적용 로직.
        *   **useIdeaMapPersistence:** 로컬 스토리지/API를 이용한 저장 및 로드 로직.
        *   **useIdeaMapInteractions:** 클릭, 드래그, 드롭 등 사용자 상호작용 핸들러 로직.
        *   **useNodeInspector:** (useNodeStore 통합 시) 인스펙터 관련 로직 및 상태 (이건 간단하다면 컴포넌트 레벨 useState로도 충분할 수 있습니다).
    *   변환 규칙은 Selector로 분리 할 수 있음. 
    *   **예제 흐름** : AppStore에 신규 카드 추가 혹은 카드 삭제
        *   useMemo를 활용해서 바뀐 데이터만 계산.
        *   IdeaMapStore는 좌표 등의 아이디어 맵 전용 메타와 결합한 CarNode 모델로 변환 → Edge 정보와 함께 IdeaMap에 표시
        *   SidebarStore는 카드 순서 등의 사이드마 전용 메타와 결합 → sidebar에 표시

3. **useAuthStore**
    *   전역 인증 상태 저장 
    *   인증 상태 관리 통합
        *   @supabase/ssr 중심으로 인증 상태 관리 단일화
        *   useAuthStore와 AuthContext의 역할을 재정의하거나 제거하는 것을 우선적으로 검토합니다.

4. **AppCommand**
    *   window.appCommand()에 zustand action을 추가
    *   store로 슬라이스하거나, 독립 컴포넌트로 분리. 

# Phase 2.앱의 상호 의존성
1.  **앱의 UI 구조:** 
    *   크게 IdeaMap, Sideber, 그리고 Toolbar, LoginForm 등의 UI 구성 요소로 분리.
    *   추가 가능한 요소 : fullsize card editor, card board (코르크판)
2.  **가장 중요하고 공유해야 할 데이터는 Card**. Card는 아이디어를 적은 글. 한 줄부터 한 문단, 하나의 문서도 가능. 이 Card를 연결한 Edge 정보는 IdeaMap에서 Tree를 만들때 사용.
3. Sidebar와 IdeaMap의 역할과 연동 시나리오
    *   Sidebar
        *   카드 목록 표시
        *   필터 (추가 예정)
        *   정렬 (추가 예정)
        *   검색 (추가 예정)
        *   카드 추가/삭제/수정
        *   Sidebar 접기/펴기
    *   IdeaMap
        *   IdeaMap 표시. Card = CardNode이지만, 모든 Card가 CardNode는 아님 (=카드로 만들었지만, IdeaMap에 추가하지 않을 수 있음)
        *   CardNode 추가 → Card 추가 → SideBar 목록에 업데이트
        *   CardNode 선택 → Sidebar의 해당 카드도 선택
        *   CardNode 위치 변경, Edge 연결, Zoom in/out

# Phase 3.TanStack Query를 도입해서 낙관적 업데이트**
    *   환경별 스토리지 정책
        *   개발 환경 : 로컬 스토리지 → sqlite 업데이트
        *   프로덕트 환경 : 로컬 스토리지 → supabase 업데이트
        *   TanStack Query는 API 호출 계층과 상호작용하므로, API 엔드포인트가 개발/프로덕션 환경에 따라 다른 DB를 바라보도록 구성 (TanStack Query 자체는 환경 분리에 직접 관여하지 않음.)
    *   Zustand와의 역할 분담
        *   TanStack Query: 서버로부터 가져오는 데이터(Cards, Tags, User 정보 등)의 캐싱, 동기화, 뮤테이션(생성/수정/삭제) 및 낙관적 업데이트
        *   Zustand: 순수한 클라이언트 UI 상태(사이드바 열림 여부, 선택된 카드 ID, IdeaMap 뷰포트 상태, 테마 설정 등) 관리
    *   API 서비스 계층
        *   API 호출 로직(fetch, Prisma 호출 등)을 컴포넌트나 스토어 액션에서 분리하여 별도의 서비스 함수(예: src/services/cardService.ts)로 리펙토링. 
        *   TanStack Query의 queryFn이나 mutationFn에서 이 서비스 함수들을 호출

# Phase 4.타입 정의
스토어 슬라이스, API 응답 등에서 사용될 타입들을 src/types 디렉토리에서 일관되게 관리.

# 원칙
    *   **Zustand action을** 사용한 커맨드 패턴 아키텍처
    *   **테스트 가능성**이 높도록 최대한 모듈화
    *   **Cursor Agent가 작업하기 쉽도록 파일 1개는 가능하면 500LoC**를 넘기지 않음. 