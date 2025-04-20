# **아키텍처 리펙토링 요구사항**

**목표**
*   **Cursor Agnet 작업 효율 개선**
    *   **Cursor Agent가 작업하기 쉽도록 파일 1개는 가능하면 500LoC**아래로 관리는
    *   **자동화 테스트 가능성 높힘**

*   **아키텍처 개선**
    *   **규모가 지나치게 큰 스토어 아키텍처 분리**
    *   **TanStack Query 도입**
    *   **여러 액션(selectCard와 selectCards, toggleSelectedCard 등)의 중복 개선**
    *   **모듈간 상호 순환 참조 제거**
    *   **비동기 에러 처리 일관성**
    *   **React flow 메모리 관리 강화**

# 수행할 작업

## Phase 1.스토어 아키텍처 분리**
1.  **useAppStore**
    *   **개선 방향**
        1. slice로 모듈화해서 관리
        2. DB CRUD 등 서버 상태 관리는 TanStack Query 사용. 
    *   **Slice 패턴 도입 이유** : Card, Node 등의 데이터는 물론, 앱 전역 상태/전역 등은 공통으로 관리해야 하지만, Store가 지나치게 비대해지기 때문.
        *   ref : https://zustand.docs.pmnd.rs/guides/slices-pattern
        *   ref : https://zustand.docs.pmnd.rs/guides/typescript#slices-pattern
    *   **Slice 게획**
        *   **AppCoreSlice**
            *   App 전체의 상태 관리
            *   App 전체의 상태 변경 이후의 UI 업데이트는 각 기능 Store에서 처리. 
        *   **projsecSlice**
            *   프로젝트 데이터(projects) 및 관련 CRUD 액션.
        *   **cardSlice**
            *   카드 데이터(cards) 및 관련 CRUD 액션.
        *   **edgeSlice**
            *   엣지 데이터(edges) 및 관련 CRUD 액션.
        *   **CardStateSlice**
            *   카드 선택/확장 상태 (selectedCardIds, expandedCardId) 및 관련 액션.
            *   **selectedCardIds**와 **selectedCardId**는 **selectedCardIds**로 통합. 인수 등으로 단수/복수 선택 판단할 것.
        *   **AppSettingSlice**
            *   애플리케이션 설정 (ideaMapSettings, layoutDirection) 및 업데이트 액션.
        *   **windowCommandSlice**
            *   window.appCoomand 등록/삭제 및 조회
            *   Production 빌드에서 제외하기. 
    *   **기능 이전**
        *   **ReactFlow 관리 및 자동 레이아웃 관련 기능**
            useIdeaMapStore로 이전. 


2.  **useIdeaMapStore**
    *   **아이디어 맵에 한정된 상태 스토어** (레이아웃 배치, 뷰포트 좌표, 줌, 노드 선택 등)
    *   React Flow 관리 및 상태 저장.
    *   자동 업데이트 관련 로직
    *   카드 내용 데이터, 엣지 데이터를 AppStore에서 구독 → CardNode 객체로 변환
    *   ***nodeStore** 및 ***egdeStore**는 통합하지만, Slice로 처리. 
    *   일부 로직은 커스텀 훅으로 분리:
        *   **useIdeaMapLayout:** 레이아웃 계산 및 적용 로직.
        *   **useIdeaMapPersistence:** 로컬 스토리지/API를 이용한 저장 및 로드 로직.
        *   **useIdeaMapInteractions:** 클릭, 드래그, 드롭 등 사용자 상호작용 핸들러 로직.
        *   **useNodeInspector:** (useNodeStore 통합 시) 인스펙터 관련 로직 및 상태 (이건 간단하다면 컴포넌트 레벨 useState로도 충분할 수 있습니다).
    *   **예제 흐름** : AppStore에 신규 카드 추가 혹은 카드 삭제
        *   useMemo를 활용해서 바뀐 데이터만 계산.
        *   IdeaMapStore는 좌표 등의 아이디어 맵 전용 메타와 결합한 CarNode 모델로 변환 → Edge 정보와 함께 IdeaMap에 표시
        *   SidebarStore는 카드 순서 등의 사이드마 전용 메타와 결합 → sidebar에 표시

3. **useAuthStore**
    *   전역 인증 상태 저장 
    *   인증 상태 관리 통합
        *   @supabase/ssr 중심으로 인증 상태 제거. (일부 버그 수정 단계에서 리펙토링되었으나 확인 필요)
        *   useAuthStore와 AuthContext의 역할을 재정의하거나 제거하는 것을 우선적으로 검토합니다
        *   **/api/users/first** 제거. 인증 개발시 만들었던 목 로직. 이제는 실제 로그인한 사용자 정보를 가져와야 함. 



## Phase 2.앱의 상호 의존성
1.  **앱의 UI 구조:** 크게 IdeaMap, Sideber, 그리고 Toolbar, LoginForm 등의 UI 구성 요소로 분리.
2.  **가장 중요하고 공유해야 할 데이터는 Card**야. Card는 아이디어를 적은 글 한 덩어리야. 이 Card를 연결한 Edge 정보는 IdeaMap에서 Tree를 만들때 사용.
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

## Phase 3.TanStack Query를 도입해서 낙관적 업데이트**
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

## Phase 4.타입 정의
스토어 슬라이스, API 응답 등에서 사용될 타입들을 src/types 디렉토리에서 일관되게 관리.

## Phase 4.표준 아키택처 및 개발 원칙 문서화
    *   **테스트 가능성**이 높도록 최대한 모듈화 + 가능하면 500Loc로 코드 길이를 제한하는 이유. 
    *   **Zustand action을** 사용한 커맨드 패턴 아키텍처
    *   TanStack Query로 서버 상태 관리. 
    *   Zustand 액션 명세
    *   useAppStore의 slice 설명
    *   커스텀 훅에 대한 설명
    *   카드를 제목과 일부 내용만 보여주는 뷰인 **bulletin board**를 개발할 때를 가정한 step by step 개발 문서.



