## **Backyard 애플리케이션 아키텍처 리팩토링 계획**

### 1. 목표

*   **AI 에이전트(Cursor) 작업 효율 개선:**
    *   명확하고 일관된 아키텍처 패턴 제공.
    *   파일당 코드 라인 수를 관리하여 (가이드라인: 500 LoC 이하) AI의 컨텍스트 이해 부담 감소.
*   **테스트 용이성 향상:**
    *   상태 관리 로직, API 호출 로직, UI 컴포넌트 분리.
    *   단위/통합 테스트 작성 기반 마련.
*   **아키텍처 개선:**
    *   서버 상태와 클라이언트 상태 분리 (TanStack Query + Zustand).
    *   기존 스토어 (`useAppStore`, `useIdeaMapStore` 등) 역할 재정의 및 단순화.
    *   인증 로직을 `@supabase/ssr` 중심으로 단일화.
    *   중복 액션 통합 및 코드 명확성 증대.
    *   향후 기능 확장 (프로젝트, 실시간 협업 등) 기반 마련.
    *   UI와 데이터 로직 분리로 UI 변경 용이성 확보.

### 2. 세부 개선 과제

*   Zustand 스토어를 클라이언트 UI 상태 및 전역 이벤트 관리에 집중하도록 재구성 (슬라이스 패턴 적용).
*   TanStack Query를 도입하여 모든 서버 데이터 (Cards, Tags, Projects, User 등)의 Fetching, Caching, Mutation 관리.
*   API 호출 로직을 `src/services` 계층으로 분리하고 Zod를 이용한 유효성 검사 및 표준 응답 형식 적용.
*   인증 상태 관리를 `@supabase/ssr`과 `useAuth` 훅 (커스텀 훅) 중심으로 통합하고, `useAuthStore` 역할 축소 (프로필 캐시, UI 로딩/에러 상태만 관리).
*   기존 `AuthContext` 제거.
*   중복된 카드 선택 관련 액션 (`selectCard`, `selectCards`, `toggleSelectedCard`)을 Zustand 슬라이스 내에서 효율적으로 통합.
*   `ThemeContext`를 Zustand `AppSettingSlice` (가칭)로 통합하여 전역 UI 설정 관리 일원화.
*   `useIdeaMapStore`를 React Flow 인스턴스 상태, 뷰포트, 로컬 레이아웃 설정 등 순수 IdeaMap UI 상태 관리에 집중하도록 재구성.
*   IdeaMap의 데이터(노드/엣지) 생성 로직은 `useIdeaMapSync` (가칭) 커스텀 훅으로 분리하여 TanStack Query/Zustand 상태를 구독하고 React Flow 형식으로 변환.
*   컴포넌트(예: `IdeaMap.tsx`, `Sidebar.tsx`)는 데이터 Fetching/Mutation 로직 대신 TanStack Query 훅과 Zustand 상태를 사용하도록 리팩토링.
*   `src/types` 디렉토리에서 타입 정의 일관성 강화.
*   순환 참조 문제 해결 (리팩토링 과정에서 자연스럽게 해소될 가능성 높음).
*   `/api/users/first` 등 불필요한 API 엔드포인트 및 로직 제거.

### 3. 작업 순서

#### **1단계: 기본 설정 및 인증 리팩토링**

*   **목표:** TanStack Query 기본 설정, `@supabase/ssr` 중심의 인증 체계 확립, `useAuthStore` 역할 재정의.
*   **세부 단계:**
    1.  **TanStack Query 설치 및 Provider 설정:**
        *   `@tanstack/react-query`, `@tanstack/react-query-devtools` 설치.
        *   `src/app/layout.tsx` (또는 클라이언트 루트 컴포넌트)에 `QueryClientProvider` 설정.
        *   React Query DevTools 추가 (개발 환경 전용).
    2.  **인증 로직 정리 (`lib/auth.ts`, `lib/auth-server.ts`):**
        *   `lib/auth.ts`: 클라이언트 측 `localStorage`/`sessionStorage` 토큰/verifier 관리 로직 제거. `signInWith...`, `signOut` 함수는 유지하되, 내부에서 Supabase 클라이언트 직접 호출.
        *   `lib/auth-server.ts`: 변경 없을 수 있으나, 서버 측 Supabase 클라이언트 사용 확인.
    3.  **`useAuth` 훅 생성 (신규 또는 기존 리팩토링):**
        *   `useEffect` 내에서 `supabase.auth.onAuthStateChange` 구독.
        *   인증 상태 변경 시 사용자 정보(세션에서 추출)와 로딩 상태 관리.
        *   Supabase 세션이 유일한 진실 공급원임을 명확히 함.
    4.  **`useAuthStore` 리팩토링:**
        *   `accessToken`, `refreshToken`, `codeVerifier` 상태 제거.
        *   `profile` (사용자 정보 캐시용), `isLoading`, `error` 상태만 남기거나 추가.
        *   `useAuth` 훅의 콜백에서 `profile`, `isLoading`, `error` 상태를 업데이트하도록 연결.
        *   인증 관련 액션(setTokens, setUser 등) 제거 또는 역할 변경.
    5.  **`AuthContext` 제거:**
        *   `AuthProvider` 및 관련 Context 사용 코드 제거.
        *   `useAuth` 훅 또는 `useAuthStore`를 통해 인증 상태 접근하도록 수정.
    6.  **미들웨어 및 서버 클라이언트 (`supabase/middleware.ts`, `supabase/server.ts`) 확인:**
        *   PKCE `code_verifier` 쿠키 관련 로직이 Supabase 라이브러리 내에서 처리되는지 확인 (수동 로직 불필요). 쿠키 옵션 (secure, httpOnly 등)이 적절한지 확인.
    7.  **로그인/콜백 관련 컴포넌트/라우트 수정:**
        *   로그인 페이지 (`src/app/login/page.tsx`, `actions.ts` 등)에서 `lib/auth.ts`의 `signInWith...` 직접 호출하도록 수정.
        *   콜백 라우트 (`src/app/auth/callback/route.ts`)는 Supabase의 `exchangeCodeForSession` 사용 확인.
        *   오류 페이지 (`src/app/auth/error/page.tsx`)가 `useSearchParams`를 통해 오류를 올바르게 표시하는지 확인.
*   **검증 방법:**
    *   로그인 (Google, 이메일/비번) 및 로그아웃 기능이 정상 동작하는지 확인.
    *   페이지 새로고침 후에도 로그인 상태가 유지되는지 확인 (Supabase 쿠키 기반).
    *   `useAuthStore` 상태를 React DevTools 등으로 확인하여 `profile`, `isLoading`, `error` 외의 토큰/verifier 상태가 없는지 확인.
    *   기존 `AuthContext` 관련 코드가 모두 제거되었는지 확인.
    *   로그인/로그아웃 시 콘솔 에러가 없는지 확인.

#### **2단계: API 서비스 계층 구축 및 TanStack Query 기본 적용 (Card 기준)**

*   **목표:** 카드 데이터 관련 API 호출 로직을 서비스 함수로 분리하고, TanStack Query를 사용하여 카드 목록 조회 구현.
*   **세부 단계:**
    1.  **API 서비스 디렉토리 생성:** `src/services` 디렉토리 생성.
    2.  **Card 서비스 함수 생성 (`src/services/cardService.ts`):**
        *   `fetchCards(params)`: 카드 목록 조회 API (`/api/cards`) 호출.
        *   `fetchCardById(id)`: 특정 카드 조회 API (`/api/cards/[id]`) 호출.
        *   `createCardAPI(data)`: 카드 생성 API (`/api/cards`, POST) 호출.
        *   `updateCardAPI(id, data)`: 카드 수정 API (`/api/cards/[id]`, PUT) 호출.
        *   `deleteCardAPI(id)`: 카드 삭제 API (`/api/cards/[id]`, DELETE) 호출.
        *   (Optional) 각 함수 내부에 Zod를 이용한 요청/응답 데이터 유효성 검사 추가.
        *   (Optional) 표준 응답 형식 (예: `{ success: boolean, data: T | null, error: string | null }`) 반환 고려.
    3.  **`useCards` 훅 생성:**
        *   `useQuery` 훅 사용 (`queryKey: ['cards', { filters... }]`).
        *   `queryFn`으로 `cardService.fetchCards` 사용.
        *   기본적인 staleTime, gcTime 설정 고려.
    4.  **`useCard` 훅 생성 (개별 카드 조회용):**
        *   `useQuery` 훅 사용 (`queryKey: ['card', cardId]`).
        *   `queryFn`으로 `cardService.fetchCardById` 사용.
        *   `enabled` 옵션을 사용하여 ID가 있을 때만 쿼리 실행.
    5.  **`CardList` 컴포넌트 리팩토링:**
        *   기존 `useEffect` 기반 데이터 Fetching 로직 제거.
        *   `useCards` 훅을 사용하여 카드 데이터, 로딩 상태, 에러 상태 가져오기.
        *   컴포넌트 내 로딩/에러 상태 처리 로직 업데이트.
*   **검증 방법:**
    *   `CardList` 컴포넌트가 `useCards` 훅을 통해 카드 목록을 성공적으로 불러와 표시하는지 확인.
    *   React Query DevTools를 사용하여 `['cards']` 쿼리 상태(fetching, success, error, data) 확인.
    *   API 요청/응답이 `cardService.ts`를 통해 이루어지는지 네트워크 탭 또는 서버 로그 확인.
    *   카드 목록 로딩 및 에러 상태가 UI에 올바르게 반영되는지 확인.

#### **3단계: Card 뮤테이션 (Create, Update, Delete) 적용**

*   **목표:** 카드 생성, 수정, 삭제 기능을 TanStack Query `useMutation`으로 구현하고 관련 컴포넌트 리팩토링.
*   **세부 단계:**
    1.  **`useCreateCard` 뮤테이션 훅 생성:**
        *   `useMutation` 훅 사용.
        *   `mutationFn`으로 `cardService.createCardAPI` 사용.
        *   `onSuccess` 콜백에서 `queryClient.invalidateQueries(['cards'])`를 호출하여 카드 목록 캐시 무효화.
        *   (Optional) 낙관적 업데이트 구현 (초기 단계에서는 생략 가능).
    2.  **`useUpdateCard` 뮤테이션 훅 생성:**
        *   `useMutation` 훅 사용.
        *   `mutationFn`으로 `cardService.updateCardAPI` 사용.
        *   `onSuccess` 콜백에서 `queryClient.invalidateQueries(['cards'])` 및 `queryClient.invalidateQueries(['card', cardId])` 호출.
        *   (Optional) 낙관적 업데이트 구현.
    3.  **`useDeleteCard` 뮤테이션 훅 생성:**
        *   `useMutation` 훅 사용.
        *   `mutationFn`으로 `cardService.deleteCardAPI` 사용.
        *   `onSuccess` 콜백에서 `queryClient.invalidateQueries(['cards'])` 및 `queryClient.removeQueries(['card', cardId])` 호출.
        *   (Optional) 낙관적 업데이트 구현.
    4.  **관련 컴포넌트 리팩토링:**
        *   `CreateCardModal`: `useCreateCard` 훅 사용하도록 수정. 로컬 상태 관리 단순화 (TanStack Query가 로딩/에러 처리).
        *   `EditCardForm` (또는 `EditCardModal`): `useUpdateCard` 훅 사용하도록 수정.
        *   `DeleteButton`: `useDeleteCard` 훅 사용하도록 수정.
        *   `CardList`: (만약 삭제 버튼이 리스트에 있다면) `useDeleteCard` 훅 사용하도록 수정.
    5.  **`useAppStore`에서 Card CRUD 액션 제거:** `createCard`, `updateCard`, `deleteCard` 등 서버 상태 변경 관련 액션 제거.
*   **검증 방법:**
    *   카드 생성 모달에서 새 카드 생성 시 `useCreateCard` 뮤테이션이 호출되고, 성공 후 카드 목록이 자동으로 업데이트되는지 확인.
    *   카드 편집 폼/모달에서 카드 수정 시 `useUpdateCard` 뮤테이션이 호출되고, 성공 후 카드 목록 및 상세 정보(필요시)가 업데이트되는지 확인.
    *   삭제 버튼 클릭 시 `useDeleteCard` 뮤테이션이 호출되고, 성공 후 카드 목록에서 해당 카드가 제거되는지 확인.
    *   React Query DevTools에서 각 뮤테이션 상태(loading, success, error) 및 캐시 무효화 동작 확인.
    *   `useAppStore`에서 카드 CRUD 관련 액션이 완전히 제거되었는지 확인.

#### **4단계: Tag 관리 리팩토링 (2, 3단계 반복)**

*   **목표:** 태그 데이터 관리 로직을 TanStack Query 패턴으로 리팩토링.
*   **세부 단계:**
    1.  **Tag 서비스 함수 생성 (`src/services/tagService.ts`):** `fetchTags`, `createTagAPI`, `deleteTagAPI` 등 구현.
    2.  **TanStack Query 훅 생성:** `useTags`, `useCreateTag`, `useDeleteTag` 구현.
    3.  **관련 컴포넌트 리팩토링:** `TagList`, `TagForm`, `TagFilter` 등에서 새로운 훅 사용하도록 수정.
    4.  **`useAppStore`에서 Tag 관련 액션 제거** (만약 있었다면).
*   **검증 방법:**
    *   태그 목록 조회, 생성, 삭제 기능이 TanStack Query 훅을 통해 정상 동작하고 UI가 자동으로 업데이트되는지 확인.
    *   React Query DevTools에서 태그 관련 쿼리/뮤테이션 상태 확인.

#### **5단계: Zustand 스토어 리팩토링 (슬라이스 적용 및 UI 상태 집중)**

*   **목표:** `useAppStore`를 슬라이스 패턴으로 재구성하고, 순수 클라이언트 UI 상태 관리에 집중.
*   **세부 단계:**
    1.  **`useAppStore` 슬라이스 정의 및 구현:**
        *   `createUiSlice`: 사이드바 열림/닫힘 (`isSidebarOpen`, `setSidebarOpen`, `toggleSidebar`), 사이드바 너비 (`sidebarWidth`, `setSidebarWidth`) 등.
        *   `createCardStateSlice`: 카드 선택/확장 상태 (`selectedCardIds`, `expandedCardId`), 관련 액션 (`selectCards`, `toggleExpandCard`, `clearSelectedCards` 등 - 중복 로직 통합). `selectedCardId`는 제거하고 `selectedCardIds`로 통일 (필요시 getter 함수 제공).
        *   `createThemeSlice`: 기존 `ThemeContext` 로직 이전 (`theme`, `updateTheme`, `updateNodeSize`).
        *   (Optional) `createWindowCommandSlice`: `window.appCommand` 관리 로직 (개발 환경 전용).
    2.  **루트 스토어 파일 (`src/store/useAppStore.ts`) 업데이트:** 각 슬라이스를 결합하여 루트 스토어 생성.
    3.  **`ThemeContext` 제거:** `ThemeProvider` 및 관련 Context 사용 코드 제거. `useAppStore`의 `themeSlice` 상태 사용하도록 수정.
    4.  **기존 `useAppStore` 사용 부분 업데이트:** 컴포넌트에서 새로운 슬라이스 기반의 상태와 액션을 사용하도록 수정 (예: `useAppStore(state => state.isSidebarOpen)`).
*   **검증 방법:**
    *   사이드바 열기/닫기, 너비 조절 등 기존 UI 상태 관련 기능이 정상 동작하는지 확인.
    *   카드 선택/확장 기능이 `cardStateSlice`를 통해 정상 동작하는지 확인.
    *   테마 관련 기능(노드 크기 변경 등)이 `themeSlice`를 통해 정상 동작하는지 확인.
    *   React DevTools 또는 Zustand DevTools를 사용하여 스토어 상태 구조가 슬라이스 패턴으로 변경되었는지 확인.
    *   `ThemeContext` 관련 코드가 모두 제거되었는지 확인.

#### **6단계: IdeaMap 상태 관리 및 로직 분리**

*   **목표:** `useIdeaMapStore` 역할을 명확히 하고, 데이터 동기화 및 상호작용 로직을 커스텀 훅으로 분리.
*   **세부 단계:**
    1.  **`useIdeaMapStore` 리팩토링:**
        *   React Flow 인스턴스 (`reactFlowInstance`), 뷰포트 상태 (`viewport`), 줌 레벨, 노드/엣지 배열 (`nodes`, `edges` - React Flow에 직접 전달될 상태) 및 관련 액션 (`setNodes`, `setEdges`, `onNodesChange`, `onEdgesChange`, `setViewport`) 등 React Flow UI 상태 관리에 집중.
        *   **노드/엣지 데이터 로딩, 저장, 변환 로직 제거.**
    2.  **`useIdeaMapSync` 훅 생성 (신규):**
        *   `useCards` (TanStack Query) 및 `useEdges` (만약 서버 상태라면 TanStack Query, 아니라면 로컬/Zustand 상태) 구독.
        *   서버 데이터(카드 등)와 로컬 레이아웃 정보(예: Zustand나 localStorage에서 로드)를 결합하여 React Flow가 사용할 `nodes` 및 `edges` 배열 생성 및 반환.
        *   카드 데이터 변경 시 `nodes` 배열 업데이트 로직 포함.
        *   `cardsToCardNodes` 유틸리티 함수 활용.
    3.  **`useIdeaMapInteractions` 훅 생성 (신규 또는 기존 리팩토링):**
        *   노드/패널 클릭, 드래그, 드롭, 연결(connect) 핸들러 로직 포함.
        *   클릭 시 `useAppStore`의 `cardStateSlice` 액션 호출 (카드 선택).
        *   드롭 시 `useCreateCard` 뮤테이션 호출 (새 카드 생성).
        *   연결 시 엣지 상태 업데이트 로직 (만약 엣지가 서버 상태라면 `useCreateEdge` 뮤테이션 호출).
    4.  **`useIdeaMapLayout` 훅 생성 (기존 로직 이전):**
        *   자동 레이아웃 계산 (`getLayoutedElements`, `getGridLayout`) 및 적용 로직 포함.
        *   레이아웃 저장/로드 로직 (예: Zustand persist나 localStorage 사용).
    5.  **`IdeaMap.tsx` 컴포넌트 리팩토링:**
        *   상태 관리 로직 대부분을 위에서 만든 훅으로 위임.
        *   `useIdeaMapSync` 훅에서 `nodes`, `edges` 데이터 받기.
        *   `useIdeaMapStore` 훅에서 React Flow 관련 상태 및 `onNodesChange`, `onEdgesChange` 등 받기.
        *   `useIdeaMapInteractions` 훅에서 이벤트 핸들러 받아서 React Flow 컴포넌트에 바인딩.
        *   UI 렌더링과 훅 연결에 집중.
    6.  **`useNodeStore` 제거:** 노드 인스펙터 로직은 `useIdeaMapInteractions` 또는 필요시 별도 `useNodeInspector` 훅으로 통합. (간단하면 `IdeaMap.tsx` 내 `useState`로도 가능)
*   **검증 방법:**
    *   IdeaMap이 카드 데이터를 기반으로 노드를 올바르게 렌더링하는지 확인.
    *   노드 클릭 시 `useAppStore`의 `selectedCardIds` 상태가 업데이트되고, 사이드바 등 다른 UI에도 반영되는지 확인.
    *   노드 드래그 앤 드롭, 엣지 연결 등 상호작용이 정상 동작하는지 확인.
    *   자동 레이아웃 기능이 `useIdeaMapLayout` 훅을 통해 정상 동작하는지 확인.
    *   `useIdeaMapStore`가 React Flow UI 상태에 집중하고, 데이터 로딩/변환 로직이 제거되었는지 코드 확인.
    *   기존 `useNodeStore` 관련 코드가 제거 또는 통합되었는지 확인.

#### **7단계: 공통 타입 정의 통합 및 최종 정리**

*   **목표:** 타입 정의 일원화, 불필요한 코드 제거.
*   **세부 단계:**
    1.  **타입 정의 관리 (`src/types`):** 주요 도메인 타입 정의 (Prisma 타입 연동 고려).
    2.  **API 응답/요청 타입 정의:** 서비스 함수 입출력 타입 정의 (Zod 타입 추론 활용).
    3.  **타입 일관성 검증:** 앱 빌드/타입체크 통과 확인.
    4.  **불필요한 파일/코드 제거:** 미사용 스토어, 컨텍스트, 훅, API 등 삭제.
    5.  **설정 파일 통합 검토:** `constants`, `config` 파일 정리.
*   **검증 방법:**
    *   타입 에러 없이 앱 빌드 성공 확인.
    *   기본 기능 정상 동작 확인.
    *   제거된 코드가 실제로 사용되지 않는지 확인.

#### **8단계: 아키텍처 가이드 문서 작성**

*   **목표:** 개선된 구조와 원칙을 AI 에이전트 및 팀원이 참고할 수 있도록 문서화.
*   **세부 단계:** (시니어 계획의 상세 내용 참고)
    1.  **개요:** "서버 상태는 TanStack Query, 클라이언트 상태는 Zustand" 원칙 설명.
    2.  **상태 관리:** TanStack Query 역할 (쿼리 키 전략), Zustand 역할 (슬라이스 설명) 명시.
    3.  **API 서비스 계층:** 역할, 함수 구조, Zod, 표준 응답 형식 설명.
    4.  **인증:** `@supabase/ssr`, `useAuth`, `useAuthStore` 역할 설명.
    5.  **주요 데이터 흐름:** 카드 CRUD, IdeaMap 동기화 예시 설명.
    6.  **컴포넌트 책임:** UI 컴포넌트 역할 정의.
    7.  **테스트 전략:** 단위/통합 테스트 가이드라인.
    8.  **AI 협업 가이드:** 코드 스타일, 파일 구조, 500 LoC 가이드라인 등.
    9.  **신규 기능 추가 예시 (Bulletin Board):** 개발 절차 설명.
*   **검증 방법:**
    *   문서 내용의 명확성, 일관성, 실제 코드와의 부합 여부 검토.
    *   Junior 개발자/AI 에이전트가 문서를 보고 개발 진행 가능 여부 판단.

### 4. 리팩토링 이후의 작업

*   **데이터베이스 초기화 로직 개선:** Prisma 마이그레이션 및 시딩 기능 활용 검토 (`db-init.ts` 대체).
*   **"프로젝트" 기능 구현:** 새로운 데이터 모델 추가, 관련 API, 서비스, TanStack Query 훅, UI 컴포넌트 개발 (리팩토링된 아키텍처 기반).
*   **로깅 전략 재정의 및 구현:** 중앙 집중식 로깅 서비스(예: Sentry, Logtail) 도입 검토, 클라이언트/서버 로그 레벨 및 포맷 표준화.
*   **에러 핸들링 강화:** API 응답 에러, 비동기 처리 에러 등에 대한 일관된 처리 및 사용자 피드백 메커니즘 구현.
*   **React Flow 성능 최적화:** 대규모 노드/엣지 환경에서의 성능 개선 (가상화, 커스텀 노드 최적화 등).
*   **Undo/Redo 기능 구현:** Zustand 또는 별도 상태 라이브러리를 이용한 실행 취소/다시 실행 기능 추가.
*   **Read-Only/뷰 모드 구현:** URL 파라미터나 별도 라우트를 통해 읽기 전용 모드 제공.
*   **테스트 커버리지 확대:** 리팩토링된 코드 기반으로 단위/통합 테스트 추가 작성.
